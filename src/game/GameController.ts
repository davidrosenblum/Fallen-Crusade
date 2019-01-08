import * as websocket from "websocket";
import { OpCode, Status } from "./Comm";
import { GameClient } from "./GameClient";
import { DatabaseController } from '../database/DatabaseController';
import { Settings } from '../utils/SettingsUtils';
import { GameAccounts } from './GameAccounts';
import { GameCharacters } from './GameCharacters';
import { GameMaps } from './GameMaps';
import { GameChat } from './GameChat';
import { GameAbilities } from './GameAbilities';
import { GameInvites } from './GameInvites';

export class GameController{
    private _clients:{[id:string]: GameClient};
    private _accounts:GameAccounts;
    private _characters:GameCharacters;
    private _maps:GameMaps;
    private _chat:GameChat;
    private _abilities:GameAbilities;
    private _invites:GameInvites;
    private _database:DatabaseController;

    constructor(database:DatabaseController, settings?:Settings){
        this._clients = {};
        this._database = database;
        this._accounts = new GameAccounts(this._database);
        this._characters = new GameCharacters(this._database);
        this._maps = new GameMaps(this._database);
        this._chat = new GameChat();
        this._abilities = new GameAbilities();
        this._invites = new GameInvites();
    }

    // create a client for the given connection 
    public handleConnection(conn:websocket.connection):void{
        // create a client 
        let client:GameClient = new GameClient(conn);
        
        // store client
        this._clients[client.clientID] = client;

        // websocket request...
        conn.on("message", data => {
            GameClient.parseResponse(data, (opCode, data) => {
                this.handleClientRequest(client, opCode, data)
            });
        });

        // websocket error... (leads to close)
        conn.on("error", () => {
            // (this listener prevents error throwing)
            // handle?
        });

        // websocket closed...
        conn.on("close", () => {
            // forget client
            delete this._clients[client.clientID];

            // safe logout & remove from map 
            this._accounts.forceLogout(client);

            client = null;
        });
    }

    // handles a websocket message, responds accordingly 
    private handleClientRequest(client:GameClient, opCode:OpCode, data:any):void{
        switch(opCode){
            // log in requested
            case OpCode.ACCOUNT_LOGIN:
                this._accounts.handleLogin(client, data);
                break;
            // log out requested
            case OpCode.ACCOUNT_LOGOUT:
                this._accounts.handleLogout(client);
                break;
            // get all characters requested
            case OpCode.CHARACTER_LIST:
                this._characters.handleCharacterList(client);
                break;
            // character create requested
            case OpCode.CHARACTER_CREATE:
                this._characters.handleCharacterCreate(client, data);
                break;
            // character delete requested
            case OpCode.CHARACTER_DELETE:
                this._characters.handleCharacterDelete(client, data);
                break;
            // enter game as character requested
            case OpCode.CHARACTER_SELECT:
                // special case - auto enter last map! 
                this._characters.handleCharacterSelect(client, data, save => {
                    // fake the enter map request
                    this._maps.handleEnterMap(client, {mapName: save.last_map});
                })
                break;
            // enter public map requested
            case OpCode.ENTER_MAP:
                this._maps.handleEnterMap(client, data);
                break;
            // enter private instance requested 
            case OpCode.ENTER_INSTANCE:
                this._maps.handleEnterInstance(client, data);
                break;
            // player has changed on the client side 
            case OpCode.OBJECT_UPDATE:
                this._maps.handleObjectUpdate(client, data);
                break;
            // object stats requested
            case OpCode.OBJECT_STATS:
                this._maps.handeObjectStats(client, data);
                break;
            // chat message posted 
            case OpCode.CHAT_MESSAGE:
                this._chat.handleChatMessage(client, data);
                break;
            // player requests all abilities 
            case OpCode.ABILITY_LIST:
                this._abilities.handleAbilityList(client);
                break;
            // player requests ability upgrade/learn
            case OpCode.ABILITY_UPGRADE:
                this._abilities.handleAbilityUpgrade(client, data);
                break;
            // player requests ability cast
            case OpCode.ABILITY_CAST:
                this._abilities.handleAbilityCast(client, data);
                break;
            // player wants to send an invite to something
            case OpCode.INVITE_SEND:
                this._invites.handleInviteSend(client, data);
                break;
            // player replies to an invite
            case OpCode.INVITE_REPLY:
                this._invites.handleReplyInvite(client, data);
                break;
            // player is creating a new instance 
            case OpCode.CREATE_INSTANCE:
                this._maps.handleCreateInstance(client, data);
                break;
            // player requests all players in current map
            case OpCode.MAP_PLAYERS:
                this._maps.handleMapPlayers(client);
                break;
            // opcode not recognized 
            default:
                client.send(OpCode.BAD_REQUEST, "Bad request opcode.", Status.BAD);
                break;
        }
    }

    public get invites():GameInvites{
        return this._invites;
    }
}