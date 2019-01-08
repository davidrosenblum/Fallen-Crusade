import React from "react";
import Client from "../game/Client";
import Game from "../game/Game";

export class GameViewPlayer extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            stats: null
        };

        // handler for when the client gets object stats
        // (this component is the view for player object stats)
        this.onObjectStats = evt => {
            // game must have a player and the response be successful 
            if(evt.status === "ok" && Game.player){
                // extract the stats
                let {stats} = evt;

                // update the UI if the stats match up with the game player 
                if(Game.player.objectID === stats.objectID){
                    this.setState({stats});
                }
            }
        };
    }

    componentDidMount(){
        // listen for the client to receive object stats 
        Client.on("object-stats", this.onObjectStats);
    }

    componentWillUnmount(){
        // stop listening for object stats (prevents leak)
        Client.removeListener("object-stats", this.onObjectStats);
    }

    // renders the stats table (note: different from target stats)
    renderStats(){
        // extract the player stats, return nothing if no stats
        let stats = this.state.stats;
        if(!stats) return null;

        // extract player stats 
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
        return this.state.stats ? (
            <div className="hud-player">
                {this.renderStats()}
            </div>
        ) : null;
    }
}