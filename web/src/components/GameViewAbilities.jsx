import React from "react";
import { ABILITY_ICON_SIZE } from "../data/Data";
import { ABILITY_ICONS, MISSING_ABILITY_ICON, EMPTY_ABILITY_ICON } from "../data/AbilityIcons";
import Client from "../game/Client";
import Game from "../game/Game";

export class GameViewAbilities extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            abilityList:    null,   // list of abilities to render 
            abilityPoints:  0,      // amount of upgrade points left
            disabledList:   {}      // list of pending abilities
        };

        // handler for when the client receives an ability list update
        this.onAbilityList = evt => {
            // must be a successful response
            if(evt.status === "ok"){
                // update the UI 
                this.setState({abilityList: evt.abilityList});
            }
        };

        // when an ability is casted...
        this.onAbilityCast = evt => {
            // if it fails - enable the icon
            if(evt.status === "bad"){
                this.removeFromDisabledList(evt.abilityName);
            }
        };

        // when an ability is ready... remove from disabled list 
        this.onAbilityReady = evt => this.removeFromDisabledList(evt.abilityName);
    }

    // when the component mounts... append listeners
    componentDidMount(){
        // listen for the client to receive ability list
        Client.on("ability-list", this.onAbilityList);
        // listen for the client to receive ability ready notification
        Client.on("ability-ready", this.onAbilityList);
    }

    // when the component unmounts... stop listeners
    componentWillUnmount(){
        // stop listening for the client to receive ability list (prevents leak)
        Client.removeListener("ability-list", this.onAbilityList);
        // stop listening for the client to receive ability ready notification
        Client.removeListener("ability-ready", this.onAbilityList);
    }

    // removes an ability by name from the disabled icons list 
    removeFromDisabledList(abilityName){
        // get the disabled list
        let disabledList = this.state.disabledList || {};

        // remove ability from disabled list
        delete disabledList[abilityName];

        // update disabled list
        this.setState({disabledList});
    }

    // sends the cast request to the server and locks the icon 
    requestCast(abilityName){
        // get currently disabled abilities
        let disabledList = this.state.disabledList || {};

        // disable the requested ability
        disabledList[abilityName] = true;

        // update the view
        this.setState({disabledList});

        // send the cast request 
        Game.castAbility(abilityName);
    }

    // renders the ability icons 
    renderAbilityList(){
        // current abilities 
        let abilityList = this.state.abilityList || [];

        // sort by display name
        abilityList = abilityList.sort((a, b) => a.name > b.name ? 1 : -1);

        // list of icons to render (there will always be 10 abilities)
        let icons = new Array(10);
        
        // for each icon slot...
        for(let i = 0; i < icons.length; i++){
            // find the corresponding ability
            let ability = abilityList[i] || null;

            // if an ability exists at that position (and is unlocked)
            if(ability && ability.level > 0){
                let {abilityName, level, name} = ability;

                // create an image that can be clicked
                icons[i] = (
                    <img
                        key={i}
                        src={ABILITY_ICONS[abilityName] || MISSING_ABILITY_ICON}
                        width={ABILITY_ICON_SIZE}
                        height={ABILITY_ICON_SIZE}
                        disabled={abilityName in this.state.disabledList}
                        title={`${name} (Level ${level})`}
                        alt={`${name} (Level ${level})`}
                        onClick={() => this.requestCast(abilityName)}
                    />
                );
            }
            else{
                // create an empty slot image (not interactable)
                icons[i] = (
                    <img
                        key={i}
                        src={EMPTY_ABILITY_ICON}
                        width={ABILITY_ICON_SIZE}
                        height={ABILITY_ICON_SIZE}
                        disabled={true}
                        title={`(${ability ? ability.name : "Ability"} is not unlocked yet)`}
                        alt={`(${ability ? ability.name : "Ability"} is not unlocked yet)`}
                    />
                );
            }
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