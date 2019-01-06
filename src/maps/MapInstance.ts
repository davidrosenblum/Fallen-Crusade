import { TokenGenerator } from "../utils/TokenGenerator";
import { Unit } from '../characters/Unit';
import { Ability } from '../abilities/Ability';
import { TransportNode, TransportNodeState } from './TransportNode';
import { GameClient, GameClientResponse } from '../game/GameClient';
import { OpCode, Status } from "../game/Comm";
import { CharacterUpdateState, CharacterSpawnState } from '../characters/Character';
import { PlayerState, Player } from '../characters/Player';
import { NPC, NPCTier } from '../characters/NPC';
import { NPCFactory, NPCOptions } from '../characters/NPCFactory';
import { EventEmitter } from "events";

export interface MapState{
    name:string;
    units:CharacterSpawnState[];
    transportNodes:TransportNodeState[];
    mapData:MapData;
}

export interface RelativeMapState{
    mapState:MapState;
    playerState:PlayerState
}

export interface MapData{
    background:number[][];
    midground:number[][];
    foreground:number[][];
}

export class MapInstance extends EventEmitter{
    private static tokenGen:TokenGenerator = new TokenGenerator(16);

    private _instanceID:string;
    private _name:string;
    private _mapData:MapData;
    private _units:{[id:string]: Unit};
    private _transportNodes;
    private _clients;
    private _numClients:number;

    constructor(name:string, mapData:MapData){
        super();
        
        this._instanceID = MapInstance.tokenGen.nextToken();
        this._name = name;
        this._mapData = mapData;
        this._units = {};
        this._transportNodes = {};
        this._clients = {};
        this._numClients = 0;
    }

    public broadcastChat(chat:string, from?:string):void{
        this.forEachClient(client => {
            client.respondChatMessage(chat, from);
        });
    }

    public addClient(client:GameClient):boolean{
        if(!this.hasClient(client)){
            this._clients[client.clientID] = client;

            this.broadcastChat(`${client.selectedPlayer} connected.`);

            this.addUnit(client.player);

            return true;
        }
        return false;
    }

    public removeClient(client:GameClient):boolean{
        if(this.hasClient(client)){
            delete this._clients[client.clientID];

            this.removeUnit(client.player);

            this.broadcastChat(`${client.selectedPlayer} disconneced.`);

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

            this.forEachClient(client => client.notifyObjectUpdate(data));
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

    public getRelativeMapState(client:GameClient):RelativeMapState{
        let units:CharacterSpawnState[] = [];
        this.forEachUnit(unit => {
            units.push(unit.getSpawnState());
        });

        let transportNodes:TransportNodeState[] = [];
        this.forEachTransportNode(tnode => {
            transportNodes.push(tnode.getTransportNodeState());
        });

        return {
            mapState: {
                name:   this.name,
                mapData: this._mapData, // dangerous
                transportNodes,
                units
            },
            playerState: client.player.getPlayerState()
        };
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

    public get numClients():number{
        return this._numClients;
    }
}