import { GameClient } from "./GameClient";
import { Unit } from '../characters/Unit';
import { AbilityFactory } from '../abilities/AbilityFactory';
import { Ability, AbilityListItem } from '../abilities/Ability';

export class GameAbilities{
    // ability list requested
    public handleAbilityList(client:GameClient):void{
        if(!client.player){
            client.respondAbilityList(null, 0, "You do not have a player.");
            return;
        }

        //let abilityList:{[abilityName:string]: number} = client.player.getAbilities();
        let abilityList:AbilityListItem[] = client.player.getAbilityList();

        client.respondAbilityList(abilityList, client.player.abilityPoints, null);
    }

    // abiltiy cast requested
    public handleAbilityCast(client:GameClient, data:{abilityName?:string, objectID?:string}):void{
        if(!client.player || !client.player.map){
            client.respondAbilityCast(null, "You are not in a room.");
            return;
        }

        // extract request parameters
        let {abilityName=null, objectID=null} = data;

        // enforce request parameters
        if(!abilityName || !objectID){
            client.respondAbilityCast(null, "Bad request json.");
            return;
        }

        // get and enforce target
        let target:Unit = client.player.map.getUnit(objectID);
        if(!target){
            client.respondAbilityCast(null, "Target does not exist.");
            return;
        }

        // attempt cast 
        // err = error message (such as invalid target, not enough mana, etc)
        client.player.castAbility(abilityName, target, err => {
            if(!err){
                client.respondAbilityCast("Success.", null);
            }
            else{
                client.respondAbilityCast(null, err.message);

                // also send chat message
                client.sendChatMessage(err.message);
            }
        });
    }

    // ability upgrade requested
    public handleAbilityUpgrade(client:GameClient, data:{abilityName?:string}):void{
        if(!client.player){
            client.respondAbilityUpgrade(null, "You do not have a player.");
            return;
        }

        // extract request parameters
        let {abilityName=null} = data;

        // enforce request parameters
        if(!abilityName){
            client.respondAbilityUpgrade(null, "Bad request json.");
            return;
        }
        
        // learn or upgrade?
        if(client.player.hasAbility(abilityName)){
            // upgrade
            if(client.player.upgradeAbility(abilityName)){
                client.respondAbilityUpgrade(client.player.getAbilityList(), null);
            }
            else{
                client.respondAbilityUpgrade(null, "Unable to upgrade ability.");
            }
        }
        else{
            // learn
            let ability:Ability = AbilityFactory.create(abilityName, 1);
            if(ability){
                if(client.player.learnAbility(ability)){
                    client.respondAbilityUpgrade(client.player.getAbilityList(), null);
                }
                else{
                    client.respondAbilityUpgrade(null, "Unable to learn ability." + abilityName + " " + JSON.stringify(client.player.getAbilities()));
                }
            }
            else{
                client.respondAbilityUpgrade(null, "Invalid ability name.");
            }
        }
    }
}