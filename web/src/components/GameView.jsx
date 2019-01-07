import React from "react";
import Game from "../game/Game";
import Client from "../game/Client";
import "./GameView.css";
import { GameViewChat } from "./GameViewChat";
import { GameViewTarget } from "./GameViewTarget";
import { GameViewPlayer } from "./GameViewPlayer";
import { GameViewAbilities } from "./GameViewAbilities";

export class GameView extends React.Component{
    constructor(props){
        super(props);

        this.containerRef = React.createRef();

        this.onObjectCreate = evt => Game.createObject(evt);
        this.onObjectDelete = evt => Game.removeObject(evt.objectID);
        this.onObjectUpdate = evt => Game.updateObject(evt);
    }

    componentDidMount(){
        Client.on("object-create", this.onObjectCreate);
        Client.on("object-delete", this.onObjectDelete);
        Client.on("object-update", this.onObjectUpdate);

        Game.injectInto(this.containerRef.current);
    }

    componentWillUnmount(){
        Client.removeListener("object-create", this.onObjectCreate);
        Client.removeListener("object-delete", this.onObjectDelete);
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
            </div>
        );
    }
}