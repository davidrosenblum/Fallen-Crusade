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

        // handler for when the client receives an ability list update
        this.onAbilityList = evt => {
            // must be a successful response
            if(evt.status === "ok"){
                // update the UI 
                this.setState({abilityList: evt.abilityList});
            }
        };
    }

    componentDidMount(){
        // listen for the client to receive ability list
        Client.on("ability-list", this.onAbilityList);
    }

    componentWillUnmount(){
        // stop listening for the client to receive ability list (prevents leak)
        Client.removeListener("ability-list", this.onAbilityList);
    }

    // renders the ability icons 
    renderAbilityList(){
        // current abilities 
        let abilityList = this.state.abilityList || [];
        // list of icons to render (there will always be 10 abilities)
        let icons = new Array(10);

        // for each icon slot...
        for(let i = 0; i < icons.length; i++){
            // find the corresponding ability
            let ability = abilityList[i] || null;
            // prepare the icon <img>
            let icon = null;

            // if an ability exists at that position 
            if(ability){
                // create an image that can be clicked
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
                // create an empty slot image (not interactable)
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

            // put the <img> in the current slot
            icons[i] = icon;
        }

        // split the list into 5x2 tray 
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