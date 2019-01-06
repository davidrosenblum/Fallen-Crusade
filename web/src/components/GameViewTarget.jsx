import React from "react";
import Client from "../game/Client";
import Game from "../game/Game";

export class GameViewTarget extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            stats: null
        };

        this.onObjectStats = evt => {
            if(evt.status === "ok" && Game.selectedTarget){
                let {stats} = evt;

                if(Game.selectedTarget.objectID === stats.objectID){
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

        let {base, current, name, team, level=null} = stats;

        return (
            <table>
                <tbody>
                    <tr>
                        <td colSpan={3}>
                            {name}
                        </td>
                        <td colSpan={1}>
                            {level ? `(${level})` : null}
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={4}>
                            &lt;{team}&gt;
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={2}>
                            Health
                        </td>
                        <td colSpan={2}>
                            {current.health.toFixed(0)} / {base.health.toFixed(0)}
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={2}>
                            Mana
                        </td>
                        <td colSpan={2}>
                            {current.mana.toFixed(0)} / {base.mana.toFixed(0)}
                        </td>
                    </tr>
                    <tr>
                        <td>
                            Def
                        </td>
                        <td>
                            {(base.defense * 100).toFixed(0)}%
                        </td>
                        <td>
                            Res
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
        return (
            <div className="hud-target">
                {this.renderStats()}
            </div>
        );
    }
}