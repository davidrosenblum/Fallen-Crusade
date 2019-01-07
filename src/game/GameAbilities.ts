import { GameClient } from "./GameClient";
import { OpCode, Status } from "./Comm";
import { Unit } from '../characters/Unit';

export class GameAbilities{
    public handleAbilityList(client:GameClient):void{
        if(!client.player){
            client.respondAbilityList(null, "You do not have a player.");
            return;
        }

        //let abilityList:{[abilityName:string]: number} = client.player.getAbilities();
        let abilityList:{abilityName:string, level:number}[] = client.player.getAbilityList();

        client.respondAbilityList(abilityList, null);
    }

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

        client.player.castAbility(abilityName, target, err => {
            if(!err){
                client.respondAbilityCast("Success.", null);
            }
            else{
                client.respondAbilityCast(null, err.message);
            }
        });
    }

    public handleAbilityUpgrade(client:GameClient, data:{abilityName?:string}):void{
        if(!client.player){
            client.respondAbilityUpgrade(null, "You do not have a player.")
            return;
        }

        // extract request parameters
        let {abilityName=null} = data;

        // enforce request parameters
        if(!abilityName){
            client.send(OpCode.ABILITY_UPGRADE, "Bad request json.", Status.BAD);
            return;
        }
        
        // learn or upgrade?
        if(client.player.hasAbility(abilityName)){
            // upgrade
            if(client.player.upgradeAbility(abilityName)){
                client.send(OpCode.ABILITY_UPGRADE, "Ability upgraded.", Status.GOOD);
            }
            else{
                client.send(OpCode.ABILITY_UPGRADE, "Unable to upgade ability.", Status.BAD);
            }
        }
        else{
            // learn
            if(client.player.upgradeAbility(abilityName)){
                client.send(OpCode.ABILITY_UPGRADE, "Ability learned.", Status.GOOD);
            }
            else{
                client.send(OpCode.ABILITY_UPGRADE, "Unable to learn ability.", Status.BAD);
            }
        }
    }
}