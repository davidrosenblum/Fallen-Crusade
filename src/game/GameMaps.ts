import { GameClient } from "./GameClient";
import { OpCode, Status } from "./Comm";
import { DatabaseController } from "../database/DatabaseController";
import { Player } from '../characters/Player';
import { MapInstance, MapState, PlayerListItem, MapStats } from '../maps/MapInstance';
import { CharacterUpdateState, SpawnLocation } from '../characters/Character';
import { Unit } from '../characters/Unit';
import { CharacterStats } from '../characters/CombatCharacter';
import { MapInstanceFactory } from "../maps/MapInstanceFactory";

export interface WorldMapStats{
    maps:{[name:string]: MapStats};
    instances:{[id:string]: MapStats};
}

export class GameMaps{
    private _maps:{[mapName:string]: MapInstance};
    private _instances:{[instanceID:string]: MapInstance};
    private _database:DatabaseController;

    constructor(database:DatabaseController){
        this._maps = MapInstanceFactory.createDefaultMaps();
        this._instances = {};
        this._database = database;
    }

    private loadPlayer(client:GameClient, spawnLocation?:SpawnLocation):Promise<{player:Player, lastMap:string}>{
        return new Promise((resolve, reject) => {
            this._database.getCharacter(client.accountID, client.selectedPlayer)
                .then(save => {
                    let player:Player = new Player(save, client.clientID, spawnLocation);

                    this.setPlayerListeners(client, player);
                    
                    resolve({player, lastMap: save.last_map});
                })
                .catch(err => reject(err));
        });
    }

    // attaches event handlers to the player (observes events like leveling up, earning xp, etc)
    private setPlayerListeners(client:GameClient, player:Player):void{
        let accountID:string = client.accountID;
        let name:string = player.name;

        // when the player levels up...
        player.on("level", evt => {
            // inform the player with a chat message
            client.sendChatMessage(`You have reached level ${evt.level}.`);

            // update client state
            client.respondObjectStats(player.getPlayerStats(), null);

            // update the database 
            this._database.updateCharacter(accountID, name, player.getDatabaseUpdate("level"));
        });

        // when the player earns xp...
        player.on("xp", evt => {
            // inform the player with a chat message
            client.sendChatMessage(`You gained ${evt.xp} XP.`);

            // update client state
            client.respondObjectStats(player.getPlayerStats(), null);

            // update the database
            this._database.updateCharacter(accountID, name, player.getDatabaseUpdate("xp"));
        });

        // when the player earns gold...
        player.on("gold", evt => {
            // inform the player with a chat message
            client.sendChatMessage(`You earned ${evt.gold} gold.`);

            // update client state
            client.respondObjectStats(player.getPlayerStats(), null);

            // update the database with actual amount of gold 
            this._database.updateCharacter(accountID, name, player.getDatabaseUpdate("gold"));
        });

        // when the player gains ability point(s)...
        player.on("ability-points", evt => {
            // get the amount of ability points added
            // (note: doesn't mean you actual get them all as limit is enforced)
            let points:number = evt.abilityPoints;
            // create the text based on ability points 
            let message:string = points > 1 ? `You gained ${points} ability points` : `You gained an ability point.`;

            // send the message to the player only 
            client.sendChatMessage(message);

            // update client state
            client.respondObjectStats(player.getPlayerStats(), null);

            // update the database with the actual amount of ability points 
            this._database.updateCharacter(accountID, name, player.getDatabaseUpdate("ability_points"));
        });

        // when the player learns a new ability...
        player.on("ability-learn", evt => {
            // inform the player with a chat message
            client.sendChatMessage(`You have acquired the ability "${evt.abilityName}".`);

            // update the database
            this._database.updateCharacter(accountID, name, player.getDatabaseUpdate("abilities"));
        });

        // when the player upgades an existing ability...
        player.on("ability-upgrade", evt => {
            // inform the player with a chat message
            client.sendChatMessage(`${evt.abilityName} upgraded to level ${evt.level}.`);

            // update the database
            this._database.updateCharacter(accountID, name, player.getDatabaseUpdate("abilities"));
        });

        // when the player's skin changes...
        player.on("skin-change", evt => {
            // create update json for the map
            let data:any = {skin: evt.skin, objectID: player.objectID};

            // update the map
            player.map.bulkUpdate(GameClient.createResponse(OpCode.SKIN_CHANGE, data));

            // save the skin change 
            this._database.updateCharacter(accountID, name, player.getDatabaseUpdate("skin"));
        });

        // when a player ability recharges... notify the player 
        player.on("ability-ready", evt => client.notifyAbilityReady(evt.abilityName));
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
        this.loadPlayer(client, map.getPlayerSpawn())
            .then(result => {
                // auto leaves room 
                client.setPlayer(result.player);
                map.addClient(client);

                // update 'last_map' location if the map changed
                // (if statement prevents updating db if spawning for the first time)
                if(result.lastMap !== map.name){
                    this._database.updateCharacter(client.accountID, client.player.name, client.player.getDatabaseUpdate("last_map"));
                }

                let mapState:MapState = map.getMapState();
                client.respondEnterMap(mapState, null);
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
        this.loadPlayer(client, map.getPlayerSpawn())
            .then(result => {
                // auto leaves room 
                client.setPlayer(result.player);
                map.addClient(client);

                let mapState:MapState = map.getMapState();
                client.respondEnterInstance(mapState, null);
            })
            .catch(err => {
                client.respondEnterInstance(null, err.message);
            });  
    }

    public handleObjectUpdate(client:GameClient, data:CharacterUpdateState):void{
        // player must be in a room
        if(!client.player || !client.player.map){
            //client.send(OpCode.OBJECT_UPDATE, "You are not in a map.", Status.BAD);
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

    public handleCreateInstance(client:GameClient, data:{instanceName?:string, difficulty?:number, objectIDs?:string[]}):void{
        // must be in a room
        if(!client.player || !client.player.map){
            client.respondCreateInstance(null, "You are not in a map.");
            return;
        }

        // extract request parameters
        let {instanceName=null, difficulty=1, objectIDs=null} = data;

        // enforce request parameters (note: difficulty is optional)
        if(!instanceName){
            client.respondCreateInstance(null, "Bad request json.");
            return;
        }

        // create the instance
        let instance:MapInstance = null;
        try{
            // attempt to create
            instance = MapInstanceFactory.create(instanceName);
        }
        catch(err){
            // invalid instance type 
            client.respondCreateInstance(null, `Invalid instance name "${instanceName}".`);
            return;
        }
        
        // successfully created - store instance by id 
        this._instances[instance.instanceID] = instance;
        // destroy when empty
        instance.on("empty", () => {
            delete this._instances[instance.instanceID];
            instance = null;
        });

        // inform success
        client.respondCreateInstance("Success.", null);

        // auto join creator 
        this.handleEnterInstance(client, {instanceID: instance.instanceID});

        // invite players
        if(objectIDs && objectIDs.length){
            client.sendChatMessage(`${objectIDs.length} invites to join were just sent.`);

            this.forEachMap(map => {

            });
        }
    }

    public handleMapPlayers(client:GameClient):void{
        // must be in a room
        if(!client.player || !client.player.map){
            client.respondMapPlayers(null, "You are not in a map.")
            return;
        }

        let players:PlayerListItem[] = client.player.map.getPlayers();

        client.respondMapPlayers(players, null);
    }

    public handleAvailablePlayers(client:GameClient):void{
        // must have a player
        if(!client.player){
            client.respondAvailablePlayers(null, "You do not have a player.")
            return;
        }

        // store players=level
        let players:PlayerListItem[] = [];

        // get each player in each room 
        this.forEachMap(map => players.concat(map.getPlayers()));

        // remove requesting client's player
        delete players[client.player.name];

        // send
        client.respondAvailablePlayers(players, null);
    }

    public getMapStats():WorldMapStats{
        let stats:WorldMapStats = {
            maps: {}, instances: {}
        };

        this.forEachMap(map => stats.maps[map.name] = map.getMapStats());
        this.forEachInstance(instance => stats.instances[instance.instanceID] = instance.getMapStats());

        return stats;
    }

    private forEachMap(fn:(map:MapInstance)=>void):void{
        for(let mapName in this._maps){
            fn(this._maps[mapName]);
        }
    }

    private forEachInstance(fn:(instanceMap:MapInstance)=>void):void{
        for(let instanceID in this._instances){
            fn(this._instances[instanceID]);
        }
    }
}