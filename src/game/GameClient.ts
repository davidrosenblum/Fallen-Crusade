import * as websocket from "websocket";
import { Status, OpCode, MSG_DELIM } from './Comm';
import { AccountData } from '../database/AccountData';
import { Player } from '../characters/Player';
import { TokenGenerator } from '../utils/TokenGenerator';
import { MapState, PlayerListItem, MapInstance } from '../maps/MapInstance';
import { CharacterPreviewDocument } from '../database/CharactersCollection';
import { CharacterSpawnState, CharacterUpdateState } from '../characters/Character';
import { PendingInvite } from "./invites/PendingInvite";
import { CharacterStats } from '../characters/CombatCharacter';
import { AbilityListItem } from '../abilities/Ability';

export interface GameClientRequest{
    opCode:OpCode,
    data?:any
}

export interface GameClientResponse{
    opCode:OpCode;
    data:any;
    status:Status;
}

export class GameClient{
    private static tokenGen:TokenGenerator = new TokenGenerator(16);

    private _clientID:string;
    private _conn:websocket.connection;
    private _accountData:AccountData;
    private _selectedPlayer:string;
    private _player:Player;
    private _map:MapInstance;
    private _pendingInvite:PendingInvite;

    constructor(conn:websocket.connection){
        this._clientID = GameClient.tokenGen.nextToken();
        this._conn = conn;
        this._accountData = null;
        this._selectedPlayer = null;
        this._player = null;
        this._map = null;
        this._pendingInvite = null;
    }

    public static parseResponse(data:websocket.IMessage, onRequest:(opCode:OpCode, data:any)=>void):void{
        data.utf8Data.split(MSG_DELIM).forEach(msg => {
            let opCode:number, data:any;

            try{
                let json:any = JSON.parse(msg);

                opCode = json.opCode || OpCode.BAD_REQUEST;
                data = json.data || {};
            }
            catch(err){
                return;
            }

            onRequest(opCode, data);
        });
    }

    public static createResponse(opCode:OpCode, data:any=null, status:Status=Status.GOOD):GameClientResponse{
        return {
            opCode,
            data: (typeof data === "string") ? {message: data} : data,
            status
        };
    }

    public static createChatResponse(chat:string, from?:string):GameClientResponse{
        return this.createResponse(OpCode.CHAT_MESSAGE, {chat, from}, Status.GOOD);
    }

    public static createStatsResponse(stats:CharacterStats):GameClientResponse{
        return this.createResponse(OpCode.OBJECT_STATS, {stats}, Status.GOOD);
    }

    public setMap(map:MapInstance):boolean{
        // in a map - must leave
        if(this.map){
            if(this.map.hasClient(this) && !this.map.removeClient(this)){
                return false;
            }
        }

        // if joinining - must join
        if(map){
            if(!map.hasClient(this) && !map.addClient(this)){
                return false;
            }
        }

        // set new map (can be null)
        this._map = map;
        return true;
    }

    public setPendingInvite(invite:PendingInvite):void{
        this._pendingInvite = invite;
    }

    public setAccountData(accountData:AccountData):void{
        this._accountData = accountData;
    }

    public setSelectedPlayer(name:string):void{
        this._selectedPlayer = name;
    }

    public setPlayer(player:Player):void{
        if(player && this.player !== player){
            if(this.player){
                this.player.map.removeClient(this);
                this._player = null;
            }
        }

        else if(!player && this.player){
            this.player.removeAllListeners();
        }

        this._player = player;
    }

    public send(opCode:OpCode, data:any=null, status:Status=Status.GOOD):void{
        let message:GameClientResponse = GameClient.createResponse(opCode, data, status);

        this._conn.send(JSON.stringify(message) + MSG_DELIM);
    }

    public sendString(str:string):void{
        this._conn.send(str + MSG_DELIM);
    }

    public respondLogin(clientID:string, accessLevel:number, errMsg:string):void{
        this.send(OpCode.ACCOUNT_LOGIN, errMsg || {clientID, accessLevel}, errMsg ? Status.BAD : Status.GOOD);
    }

    public respondLogout(message:string, errMsg:string):void{
        this.send(OpCode.ACCOUNT_LOGOUT, errMsg || message, errMsg ? Status.BAD : Status.GOOD);
    }

    public respondCharacterList(characterList:CharacterPreviewDocument[], errMsg:string):void{
        this.send(OpCode.CHARACTER_LIST, characterList ? {characterList}: errMsg, errMsg ? Status.BAD : Status.GOOD);
    }

    public respondCharacterCreate(message:string, errMsg:string):void{
        this.send(OpCode.CHARACTER_CREATE, errMsg || message, errMsg ? Status.BAD : Status.GOOD);
    }

    public respondCharacterDelete(message:string, errMsg:string):void{
        this.send(OpCode.CHARACTER_DELETE, errMsg || message, errMsg ? Status.BAD : Status.GOOD);
    }

    public respondCharacterSelect(message:string, errMsg:string):void{
        this.send(OpCode.CHARACTER_SELECT, errMsg || message, errMsg ? Status.BAD : Status.GOOD);
    }

    public respondEnterMap(mapState:MapState, errMsg:string):void{
        this.send(OpCode.ENTER_MAP, errMsg || {mapState}, errMsg ? Status.BAD : Status.GOOD);
    } 

    public respondEnterInstance(mapState:MapState, errMsg:string,):void{
        this.send(OpCode.ENTER_INSTANCE, errMsg || {mapState}, errMsg ? Status.BAD : Status.GOOD);
    } 

    public sendChatMessage(chat:string, from?:string, errMsg?:string):void{
        this.send(OpCode.CHAT_MESSAGE, errMsg || {chat, from}, errMsg ? Status.BAD : Status.GOOD);
    }

    public respondObjectStats(stats:CharacterStats, errMsg:string):void{
        this.send(OpCode.OBJECT_STATS, errMsg || {stats}, errMsg ? Status.BAD : Status.GOOD);
    }

    public respondAbilityList(abilityList:AbilityListItem[], abilityPoints:number, errMsg:string):void{
        this.send(OpCode.ABILITY_LIST, errMsg || {abilityList, abilityPoints}, errMsg ? Status.BAD : Status.GOOD);
    }

    public respondAbilityUpgrade(abilityList:AbilityListItem[], errMsg:string):void{
        this.send(OpCode.ABILITY_UPGRADE, errMsg || {abilityList}, errMsg ? Status.BAD : Status.GOOD);
    }

    public respondAbilityCast(message:string, errMsg:string):void{
        this.send(OpCode.ABILITY_CAST, errMsg || message, errMsg ? Status.BAD : Status.GOOD);
    }

    public notifyAbilityReady(abilityName:string):void{
        this.send(OpCode.ABILITY_READY, {abilityName}, Status.GOOD);
    }

    public respondInviteSend(message:string, errMsg:string):void{
        this.send(OpCode.INVITE_SEND, errMsg || message, errMsg ? Status.BAD : Status.GOOD);
    }

    public respondInviteReply(message:string, errMsg:string):void{
        this.send(OpCode.INVITE_REPLY, errMsg || message, errMsg ? Status.BAD : Status.GOOD);
    }

    public respondCreateInstance(message:string, errMsg:string):void{
        this.send(OpCode.CREATE_INSTANCE, errMsg || message, errMsg ? Status.BAD : Status.GOOD);   
    }

    public respondMapPlayers(players:PlayerListItem[], errMsg:string):void{
        this.send(OpCode.MAP_PLAYERS, errMsg || {players}, errMsg ? Status.BAD : Status.GOOD);
    }

    public respondAvailablePlayers(players:PlayerListItem[], errMsg:string):void{
        this.send(OpCode.AVAILABLE_PLAYERS, errMsg || {players}, errMsg ? Status.BAD : Status.GOOD);
    }

    public notifyObjectCreate(spawnState:CharacterSpawnState):void{
        this.send(OpCode.OBJECT_CREATE, {spawnState}, Status.GOOD);
    }

    public notifyObjectDelete(objectID:string):void{
        this.send(OpCode.OBJECT_DELETE, {objectID}, Status.GOOD);
    }

    public notifyObjectUpdate(updateState:CharacterUpdateState):void{
        this.send(OpCode.OBJECT_UPDATE, {updateState}, Status.GOOD);
    }

    public notifyInvite(message:string):void{
        this.send(OpCode.INVITE_RECEIVE, {message}, Status.GOOD);
    }

    public notifyInviteResponse(accepted:boolean):void{
        this.send(OpCode.INVITE_RESPONSE, {accepted}, Status.GOOD);
    }

    public get accountID():string{
        return this.hasAccountData ? this._accountData.accountID : null;
    }

    public get username():string{
        return this.hasAccountData ? this._accountData.username : null;
    }

    public get accessLevel():number{
        return this.hasAccountData ? this._accountData.accessLevel : -1;
    }

    public get hasAccountData():boolean{
        return this._accountData !== null;
    }

    public get hasPendingInvite():boolean{
        return this._pendingInvite !== null;
    }

    public get clientID():string{
        return this._clientID;
    }

    public get selectedPlayer():string{
        return this._selectedPlayer;
    }

    public get player():Player{
        return this._player;
    }

    public get map():MapInstance{
        return this._map;
    }

    public get pendingInvite():PendingInvite{
        return this._pendingInvite;
    }
}