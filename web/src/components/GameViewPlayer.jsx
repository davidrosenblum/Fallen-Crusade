import React from "react";
import Client from "../game/Client";
import Game from "../game/Game";

export class GameViewPlayer extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            stats: null
        };

        this.onObjectStats = evt => {
            if(evt.status === "ok" && Game.player){
                let {stats} = evt;

                if(Game.player.objectID === stats.objectID){
                    this.setState({stats});
                }
            }
        };
    }

    componentDidMount(){
        Client.on("object-stats", this.onObjectStats);
    }

    componentWillUnmount(){
        Client.removeListener("object-stats", this.onObjectStats);
    }

    renderStats(){
        let stats = this.state.stats;
        if(!stats) return null;

        let {base, current, level, xp, xpNeeded, name} = stats;

        return (
            <table>
                <tbody>
                    <tr className="text-center">
                        <td colSpan={2}>
                            {name} - Level {level}
                        </td>
                    </tr>
                    <tr>
                        <td>
                            HP
                        </td>
                        <td>
                            {current.health.toFixed(0)} / {base.health.toFixed(0)}
                        </td>
                        
                    </tr>
                    <tr>
                        <td>
                            MP
                        </td>
                        <td>
                            {current.mana.toFixed(0)} / {base.mana.toFixed(0)}
                        </td>
                    </tr>
                    <tr>
                        <td>
                            XP
                        </td>
                        <td>
                            {xp.toFixed(0)} / {xpNeeded.toFixed(0)}
                        </td>
                    </tr>
                </tbody>
            </table>
        );
    }

    render(){
        return (
            <div className="hud-player">
                {this.renderStats()}
            </div>
        );
    }
}