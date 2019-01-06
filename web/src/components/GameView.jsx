import React from "react";
import Game from "../game/Game";

export class GameView extends React.Component{
    constructor(props){
        super(props);

        this.containerRef = React.createRef();
    }

    componentDidMount(){
        Game.injectInto(this.containerRef.current);
    }

    render(){
        return (
            <div>
                <div ref={this.containerRef} className="canvas-container"></div>
            </div>
        );
    }
}