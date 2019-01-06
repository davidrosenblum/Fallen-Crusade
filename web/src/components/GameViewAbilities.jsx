import React from "react";
import { ABILITY_ICON_SIZE } from "../data/Data";
import Client from "../game/Client";
import Game from "../game/Game";

export class GameViewAbilities extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            abilityList: null
        };

        this.onAbilityList = evt => {
            if(evt.status === "ok"){
                this.setState({abilityList: evt.abilityList});
            }
        };
    }

    componentDidMount(){
        Client.on("ability-list", this.onAbilityList);
    }

    componentWillUnmount(){
        Client.removeListener("ability-list", this.onAbilityList);
    }

    renderAbilityList(){
        let abilityList = this.state.abilityList || [];
        let icons = new Array(10);

        for(let i = 0; i < 10; i++){
            let ability = abilityList[i] || null;
            let icon = null;

            if(ability){
                icon = (
                    <img
                        key={i}
                        src={null}
                        width={ABILITY_ICON_SIZE}
                        height={ABILITY_ICON_SIZE}
                        disabled={false}
                        onClick={() => Game.castAbility(ability.abilityName)}
                    />
                );
            }
            else{
                icon = (
                    <img
                        key={i}
                        src={null}
                        width={ABILITY_ICON_SIZE}
                        height={ABILITY_ICON_SIZE}
                        disabled={true}
                    />
                );
            }

            icons[i] = icon;
        }

        return (
            <div>
                {icons.slice(0, 5)}
                <br/>
                {icons.slice(5, 10)}
            </div>
        );
    }

    render(){
        return (
            <div className="hud-abilities">
                {this.renderAbilityList()}
            </div>
        );
    }
}