import React from "react";
import Client from "../game/Client";
import Game from "../game/Game";

export class GameViewTarget extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            stats: null
        };

        // handler for when the client gets object stats
        // (this component is the view for target object stats)
        this.onObjectStats = evt => {
            // must still have a selected target and successful response
            if(evt.status === "ok" && Game.selectedTarget){
                // extract stats
                let {stats} = evt;

                // if the stats match up with select target - update the UI 
                if(Game.selectedTarget.objectID === stats.objectID){
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

    // renders the stats table (note: different from player stats)
    renderStats(){
        // extract the stats, return nothing if no stats
        let stats = this.state.stats;
        if(!stats) return null;

        // extract stats values 
        // note: base and current are objects, the rest are strings or numbers 
        let {base, current, name, team, level=null} = stats;

        return (
            <table>
                <tbody>
                    <tr className="text-center">
                        <td colSpan={2}>
                            {name} {level ? `(${level})` : null}
                        </td>
                    </tr>
                    <tr className="text-center">
                        <td colSpan={2}>
                            &lt;{team}&gt;
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
                            DEF
                        </td>
                        <td>
                            {(base.defense * 100).toFixed(0)}%
                        </td>
                    </tr>
                    <tr>
                        <td>
                            RES
                        </td>
                        <td>
                            {(base.resistance * 100).toFixed(0)}%
                        </td>
                    </tr>
                </tbody>
            </table>
        );
    }

    render(){
        return this.state.stats ? (
            <div className="hud-target">
                {this.renderStats()}
            </div>
        ) : null;
    }
}