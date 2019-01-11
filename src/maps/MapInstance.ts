import { TokenGenerator } from "../utils/TokenGenerator";
import { Unit } from '../characters/Unit';
import { Ability } from '../abilities/Ability';
import { TransportNode, TransportNodeState } from './TransportNode';
import { GameClient, GameClientResponse } from '../game/GameClient';
import { CharacterUpdateState, CharacterSpawnState, SpawnLocation } from '../characters/Character';
import { Player } from '../characters/Player';
import { NPC, NPCTier } from '../characters/NPC';
import { NPCFactory, NPCOptions } from '../characters/NPCFactory';
import { EventEmitter } from "events";
import { CharacterStats } from '../characters/CombatCharacter';

export interface MapState{
    name:string;
    units:CharacterSpawnState[];
    transportNodes:TransportNodeState[];
    mapData:MapData;
}

export interface MapData{
    background:number[][];
    midground:number[][];
    foreground:number[][];
}

export interface PlayerListItem{
    name:string;
    level:number;
    objectID:string;
}

export interface MapStats{
    name:string;
    players:{name:string, level:number}[];
    npcs:{name:string, team:string, xpValue:number, goldValue:number, tier:string}[];
}

export class MapInstance extends EventEmitter{
    private static tokenGen:TokenGenerator = new TokenGenerator(16);

    private _instanceID:string;
    private _name:string;
    private _mapData:MapData;
    private _playerSpawn:SpawnLocation;
    private _tileSize:number;
    private _units:{[id:string]: Unit};
    private _transportNodes;
    private _clients;
    private _numClients:number;

    constructor(name:string, mapData:MapData, tileSize:number=64, playerSpawn?:SpawnLocation){
        super();
        
        this._instanceID = MapInstance.tokenGen.nextToken();
        this._name = name;
        this._mapData = mapData;
        this._tileSize = tileSize;
        this._playerSpawn = playerSpawn ? {col: playerSpawn.col, row: playerSpawn.row} : {col: 1, row: 1};
        this._units = {};
        this._transportNodes = {};
        this._clients = {};
        this._numClients = 0;
    }

    public broadcastChat(chat:string, from?:string, ignoreClient?:GameClient):void{
        this.bulkUpdate(GameClient.createChatResponse(chat, from), ignoreClient);
    }

    private broadcastUnitStats(unit:Unit):void{
        let stats:CharacterStats = unit.getCharacterStats();
        this.bulkUpdate(GameClient.createStatsResponse(stats));
    }

    public bulkUpdate(update:GameClientResponse, ignoreClient?:GameClient):void{
        // don't keep re-stringifying the same thing each iteration 
        let json:string = JSON.stringify(update);

        this.forEachClientIgnoring(ignoreClient, client => {
            if(client !== ignoreClient){
                client.sendString(json);
            }
        })
    }

    public addClient(client:GameClient):boolean{
        if(!this.hasClient(client)){
            this._clients[client.clientID] = client;

            this.broadcastChat(`${client.selectedPlayer} connected.`, null, client);

            this.addUnit(client.player);

            if(this._playerSpawn){
                client.player.x = this._playerSpawn.col * this._tileSize;
                client.player.y = this._playerSpawn.col * this._tileSize;
            }

            return true;
        }
        return false;
    }

    public removeClient(client:GameClient):boolean{
        if(this.hasClient(client)){
            delete this._clients[client.clientID];

            this.removeUnit(client.player);

            this.broadcastChat(`${client.selectedPlayer} disconnected.`, null, client);

            if(this.isEmpty) this.emit("empty");

            return true;
        }
        return false;
    }
    
    public addUnit(unit:Unit):boolean{
        if(!this.hasUnit(unit)){
            this._units[unit.objectID] = unit;
            unit.setMap(this);

            let data:CharacterSpawnState = unit.getSpawnState();

            this.forEachClient(client => client.notifyObjectCreate(data));

            return true;
        }
        return false;
    }

    public removeUnit(unit:Unit):boolean{
        if(this.hasUnit(unit)){
            delete this._units[unit.objectID];
            unit.setMap(null);

            this.forEachClient(client => client.notifyObjectDelete(unit.objectID));

            return true;
        }
        return false;
    }

    public updateUnit(data:CharacterUpdateState):void{
        let unit:Unit = data.objectID ? this.getUnit(data.objectID) : null;
        if(unit){
            unit.setState(data);

            let ignore:GameClient = this._clients[unit.ownerID];
            this.forEachClientIgnoring(ignore, client => client.notifyObjectUpdate(data));
        }
    }

    public createNPC(options:{type:string, row:number, col:number, tier?:NPCTier, name?:string, team?:string, anim?:string}):void{
        let {type, row, col, name, team, anim, tier} = options;

        let npcOpts:NPCOptions = {
            ownerID:    "server",
            spawnLocation: {col, row},
            tier,
            type,
            name,
            team,
            anim
        };

        let npc:NPC = NPCFactory.create(npcOpts);
        if(npc){
            npc.on("health", () => this.broadcastUnitStats(npc));
            npc.on("mana", () => this.broadcastUnitStats(npc));
            
            npc.on("death", () => {
                this.giveBounty(npc.xpValue, npc.goldValue);
                this.removeUnit(npc);
                npc.removeAllListeners();
            });
            
            this.addUnit(npc);
        }
    }

    public createTransportNode(options:{type:string, text:string, col:number, row:number, outMapName:string, outCol:number, outRow:number}):void{
        // node parameters
        let {type, text, col, row, outMapName, outCol, outRow} = options;
        // create node
        let tnode:TransportNode = new TransportNode(type, text, col, row, outMapName, outCol, outRow);
        // store node
        this._transportNodes[tnode.nodeID] = tnode;
    }

    public handleAoEAbility(caster:Unit, target:Unit, ability:Ability):void{
        // how many more targets can possibly be hit
        // (-1 for initial target already hit)
        let targetsToGo:number = ability.maxTargets - 1;

        // attempt to effect every unit in the map
        for(let id in this._units){
            let unit:Unit = this._units[id];

            // each target must be validated (in range and other conditions)
            // can't re-hit initial target
            if(ability.validateTarget(caster, unit) && unit !== target){
                // success - 'hit' the target
                ability.effect(caster, target);
                // stop iterating if enough targets 'hit'
                if(--targetsToGo === 0) break;
            }
        }
    }

    public giveBounty(xp:number=0, gold:number=0, filter?:(player:Player)=>boolean):void{
        this.forEachClient(client => {
            if(!filter || filter(client.player)){
                client.player.addXP(xp);
                client.player.addGold(gold);
            }
        }); 
    }

    public hasClient(client:GameClient):boolean{
        return client.clientID in this._clients;
    }

    public hasUnit(unit:Unit):boolean{
        return unit.objectID in this._units;
    }

    public getClient(clientID:string):GameClient{
        return this._clients[clientID] || null;
    }

    public getUnit(objectID:string):Unit{
        return this._units[objectID] || null;
    }

    public getPlayers():PlayerListItem[]{
        let players:PlayerListItem[] = [];

        this.forEachClient(client => {
            if(client.player){
                players.push({
                    name:       client.player.name,
                    level:      client.player.level,
                    objectID:   client.player.objectID
                });
            }
        });

        return players;
    }

    public getMapStats():MapStats{
        let players:{name:string, level:number}[] = [];
        let npcs:{name:string, team:string, xpValue:number, goldValue:number, tier:string}[] = [];

        this.forEachUnit(unit => {
            if(unit instanceof Player){
                players.push({
                    name:   unit.name,
                    level:  unit.level
                })
            }
            else if(unit instanceof NPC){
                npcs.push({
                    name:       unit.name,
                    team:       unit.team,
                    xpValue:    unit.xpValue,
                    goldValue:  unit.goldValue,
                    tier:       unit.tier
                });
            }
        })

        return {name: this.name, players, npcs};
    }

    public getMapState():MapState{
        let units:CharacterSpawnState[] = [];
        this.forEachUnit(unit => {
            units.push(unit.getSpawnState());
        });

        let transportNodes:TransportNodeState[] = [];
        this.forEachTransportNode(tnode => {
            transportNodes.push(tnode.getTransportNodeState());
        });

        return {
            name:       this.name,
            mapData:    this._mapData, // dangerous
            transportNodes,
            units
        };
    }

    public getPlayerSpawn():SpawnLocation{
        return {
            col: this._playerSpawn.col,
            row: this._playerSpawn.row
        };
    }

    private forEachUnit(fn:(unit:Unit, id?:string)=>void):void{
        for(let id in this._units){
            fn(this._units[id], id);
        }
    }

    private forEachTransportNode(fn:(node:TransportNode, id?:string)=>void):void{
        for(let id in this._transportNodes){
            fn(this._transportNodes[id], id);
        }
    }

    private forEachClient(fn:(client:GameClient, id?:string)=>void):void{
        for(let id in this._clients){
            fn(this._clients[id], id);
        }
    }

    private forEachClientIgnoring(ignore:GameClient, fn:(client:GameClient, id?:string)=>void):void{
        this.forEachClient(client => {
            if(client !== ignore){
                fn(client);
            }
        });
    }

    public get isEmpty():boolean{
        return this._numClients === 0;
    }

    public get instanceID():string{
        return this._instanceID;
    }

    public get name():string{
        return this._name;
    }

    public get tileSize():number{
        return this._tileSize;
    }

    public get numClients():number{
        return this._numClients;
    }
}