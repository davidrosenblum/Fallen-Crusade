import { GameClient } from "./GameClient";
import { OpCode, Status } from "./Comm";
import { DatabaseController } from "../database/DatabaseController";
import { Player } from '../characters/Player';
import { MapInstance } from '../maps/MapInstance';
import { CharacterUpdateState } from '../characters/Character';
import { Unit } from '../characters/Unit';
import { CharacterStats } from '../characters/CombatCharacter';
import { MapInstanceFactory } from "../maps/MapInstanceFactory";

export class GameMaps{
    private _maps:{[mapName:string]: MapInstance};
    private _instances:{[instanceID:string]: MapInstance};
    private _database:DatabaseController;

    constructor(database:DatabaseController){
        this._maps = MapInstanceFactory.createDefaultMaps();
        this._instances = {};
        this._database = database;
    }

    private loadPlayer(client:GameClient):Promise<Player>{
        return new Promise((resolve, reject) => {
            this._database.getCharacter(client.accountID, client.selectedPlayer)
                .then(save => resolve(new Player(save, client.clientID)))
                .catch(err => reject(err));
        });
    }

    public handleEnterMap(client:GameClient, data:{mapName?:string}):void{
        // must have a selected player
        if(!client.selectedPlayer){
            client.respondEnterMap(null, "You must have a selected character.");
            return;
        }

        // extract request parameters
        let {mapName=null} = data;

        // enforce parameters
        if(!mapName){
            client.respondEnterMap(null, "Bad request json.");
            return;
        }

        // get map
        let map:MapInstance = this._maps[mapName];
        if(!map){
            client.respondEnterMap(null, "Map not found.");
            return;
        }

        // reload player data
        this.loadPlayer(client)
            .then(player => {
                // auto leaves room 
                client.setPlayer(player);
                map.addClient(client);

                client.respondEnterMap(map.getRelativeMapState(client), null);
            })
            .catch(err => {
                client.respondEnterMap(null, err.message);
            });
    }

    public handleEnterInstance(client:GameClient, data:{instanceID:string}):void{
        // must have a selected player
        if(!client.selectedPlayer){
            client.respondEnterInstance(null, "You must have a selected character.");
            return;
        }

        // extract request paramters
        let {instanceID=null} = data;

        // enforce request parameters
        if(!instanceID){
            client.respondEnterInstance(null, "Bad request json.");
            return;
        }

        // find the instance, it must exist
        let map:MapInstance = this._instances[instanceID];
        if(!map){
            client.respondEnterInstance(null, "Instance not found.");
            return;
        }

        // reload player data
        this.loadPlayer(client)
            .then(player => {
                // auto leaves room 
                client.setPlayer(player);
                map.addClient(client);

                client.respondEnterInstance(map.getRelativeMapState(client), null);
            })
            .catch(err => {
                client.respondEnterInstance(null, err.message);
            });  
    }

    public handleObjectUpdate(client:GameClient, data:CharacterUpdateState):void{
        // player must be in a room
        if(!client.player || !client.player.map){
            client.send(OpCode.OBJECT_UPDATE, "You are not in a room.", Status.BAD);
            return;
        }

        // send the update to the room
        client.player.map.updateUnit(data); // handles notification (does not 'respond')
    }

    public handeObjectStats(client:GameClient, data:{objectID?:string}):void{
        if(!client.player || !client.player.map){
            client.respondObjectStats(null, "You are not in a map.");
            return;
        }

        // extract request parameters
        let {objectID=null} = data;

        // enforce request  parameters
        if(!objectID){
            client.respondObjectStats(null, "Bad request json.");
            return;
        }

        // find the unit, it must exist 
        let unit:Unit = client.player.map.getUnit(objectID);
        if(!unit){
            client.respondObjectStats(null, "Target does not exist.");
            return;
        }

        // find and send the stats
        let stats:CharacterStats;

        if(unit.type === "player"){
            stats = (unit as Player).getPlayerStats();
        }
        else{
            stats = unit.getCharacterStats();
        }
         
        client.respondObjectStats(stats, null);
    }
}
