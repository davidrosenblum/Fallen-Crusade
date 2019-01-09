import React from "react";
import "./GameView.css";
import Game from "../game/Game";
import Client from "../game/Client";
import { GameViewChat } from "./GameViewChat";
import { GameViewTarget } from "./GameViewTarget";
import { GameViewPlayer } from "./GameViewPlayer";
import { GameViewAbilities } from "./GameViewAbilities";
import { GameViewDropdown } from "./GameViewDropdown";

export class GameView extends React.Component{
    constructor(props){
        super(props);

        // ref for the <div> to inject the <canvas> into 
        this.containerRef = React.createRef();

        // handler for when the client receives a create object notification
        this.onObjectCreate = evt => Game.createObject(evt.spawnState);
        // handler for when the client receives a delete object notification
        this.onObjectDelete = evt => Game.removeObject(evt.objectID);
        // handler for when the client receives an update object notification
        this.onObjectUpdate = evt => Game.updateObject(evt.updateState);
    }

    componentDidMount(){
        // listen for when the client receives an object create notification
        Client.on("object-create", this.onObjectCreate);
        // listen for when the client receives an object delete notification
        Client.on("object-delete", this.onObjectDelete);
        // listen for when the client receives an object update notification
        Client.on("object-update", this.onObjectUpdate);

        // insert the game <canvas> element into the DOM
        // (not very reactful - but whatever)
        Game.injectInto(this.containerRef.current);
    }

    componentWillUnmount(){
        // stop listening for client receives an object create notification (prevents leak)
        Client.removeListener("object-create", this.onObjectCreate);
        // stop listening for client receives an object delete notification (prevents leak)
        Client.removeListener("object-delete", this.onObjectDelete);
        // stop listening for client receives an object update notification (prevents leak)
        Client.removeListener("object-update", this.onObjectUpdate);
    }

    render(){
        return (
            <div>
                <div ref={this.containerRef} className="canvas-container"></div>
                <GameViewChat/>
                <GameViewTarget/>
                <GameViewPlayer/>
                <GameViewAbilities/>
                <GameViewDropdown/>
            </div>
        );
    }
}