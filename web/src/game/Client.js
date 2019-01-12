import { EventEmitter } from "events";
import { MSG_DELIM, OpCode, Status } from "./Comm";

export const CLIENT_VERSION = "0.1.0";

class Client extends EventEmitter{
    constructor(){
        super();

        this.socket = null;         // the websocket
        this.clientID = null;       // server-assigned ID 
        this.accessLevel = 0;       // server-assigned acccess level (commands UI)
    }

    // creates and connects the weboscket to the game server
    connect(){
        // can only connect if not connected
        if(!this.isConnected){
            // determine game server endpoint
            // connects to current origin but with websocket protocols 
            // http=ws and https=wss
            // switch to port 8080 from 3000 (3000 = react server, 8080 = test server)
            let url = window.location.origin
                .replace(":3000", ":8080")
                .replace("https://", "wss://")
                .replace("http://", "ws://");

            // create the websocket
            this.socket = new WebSocket(url);

            // handle websocket connection 
            this.socket.addEventListener("open", () => {
                this.emit("connect");
            });

            // handle websocket error
            this.socket.addEventListener("error", err => {
                this.emit("error", err);
            });

            // handle websocket data
            this.socket.addEventListener("message", evt => {
                this.handleData(evt.data.toString());
            });

            // handle websocket close
            this.socket.addEventListener("close", () => {
                this.emit("close");
            });
        }
    }

    // handles server data by parsing it then processing it (plain text at this point)
    handleData(data){
        // responses can be concatenated - split using delimiter
        data.split(MSG_DELIM).forEach(msg => {
            // each individual response... pepare to extract response parameters
            let opCode, data, status;

            // attempt to parse json 
            try{
                // parse
                let json = JSON.parse(msg);

                // extract resposne parameters
                // assign defaults if neccessary, but they should always be provided
                opCode =    json.opCode ||  -1;
                data =      json.data   ||  {};
                status =    json.status ||  Status.BAD;

                // print response (ignore object updates becase those are very frequent)
                if(opCode !== OpCode.OBJECT_UPDATE) console.log(json);
            }
            catch(err){
                // json parse error - skip this update (should never happen)
                return;
            }

            // server data is now parsed, time to process the response
            this.processResponse(opCode, data, status);
        });
    }

    // processes the parsed server response data
    processResponse(opCode, data, status){
        // invoke handler based on opCode 
        switch(opCode){
            case OpCode.ACCOUNT_LOGIN:
                this.handleLogin(data, status);
                break;
            case OpCode.ACCOUNT_LOGOUT:
                this.handleLogout(data, status);
                break;
            case OpCode.CHARACTER_LIST:
                this.handleCharacterList(data, status);
                break;
            case OpCode.CHARACTER_CREATE:
                this.handleCharacterCreate(data, status);
                break;
            case OpCode.ENTER_MAP:
                this.handleMapEnter(data, status);
                break;
            case OpCode.ENTER_INSTANCE:
                this.handleInstanceEnter(data, status);
                break;
            case OpCode.CHAT_MESSAGE:
                this.handleChatMessage(data, status);
                break;
            case OpCode.OBJECT_CREATE:
                this.handleObjectCreate(data, status);
                break;
            case OpCode.OBJECT_DELETE:
                this.handleObjectDelete(data, status);
                break;
            case OpCode.OBJECT_UPDATE:
                this.handleObjectUpdate(data, status);
                break;
            case OpCode.OBJECT_STATS:
                this.handleObjectStats(data, status);
                break;
            case OpCode.ABILITY_LIST:
                this.handleAbilityList(data, status);
                break;
            case OpCode.ABILITY_UPGRADE:
                this.handleAbilityUpgrade(data, status);
                break;
            case OpCode.ABILITY_CAST:
                this.handleAbilityCast(data, status);
                break;
            case OpCode.CREATE_INSTANCE:
                this.handleCreateInstance(data, status);
                break;
            case OpCode.MAP_PLAYERS:
                this.handleMapPlayers(data, status);
                break;
            case OpCode.AVAILABLE_PLAYERS:
                this.handleAvailablePlayers(data, status);
                break;
            case OpCode.ABILITY_READY:
                this.handleAbilityReady(data, status);
                break;
            case OpCode.INVITE_RECEIVE:
                this.handleInviteReceive(data);
                break;
            default:
                break;
        }
    }

    // handles a login response 
    handleLogin(data, status){
        // extract response properties
        let {message=null, clientID=null, accessLevel=1} = data;

        // store clientID and access level if there was a successful login 
        if(status === Status.GOOD){
            this.clientID =     clientID;
            this.accessLevel =  accessLevel;
        }

        // trigger login listeners
        this.emit("login", {message, status})
    }

    // handles a logout acknowledgement 
    handleLogout(data, status){
        // extract response properties
        let {message=null} = data;

        // trigger logout listeners
        this.emit("logout", {message, status});
    }

    // handles a character list response 
    handleCharacterList(data, status){
        // extract response properties
        let {message=null, characterList=null} = data;

        // trigger character list listeners
        this.emit("character-list", {message, characterList, status});
    }

    // handles character create response 
    handleCharacterCreate(data, status){
        // extract response properties
        let {message=null} = data;

        // trigger character create listeners
        this.emit("character-create", {message, status});
    }

    // handles entering a map response
    handleMapEnter(data, status){
        // extract response properties 
        let {message=null, mapState=null} = data;

        // trigger entering map listeners 
        this.emit("enter-map", {message, mapState, status});
    }

    // handles enter an instance repsonse 
    handleInstanceEnter(data, status){
        // extract response properties 
        let {message=null, mapState=null} = data;

        // trigger entering instance listeners
        this.emit("enter-instance", {message, mapState, status});
    }

    // handles a chat message
    handleChatMessage(data, status){
        // extract response properties 
        let {chat="", from=null} = data;
        
        // trigger chat listeners
        this.emit("chat", {chat, from, status});
    }

    // handles object creation notification
    handleObjectCreate(data){
        // extract object properties
        let {spawnState=null} = data;

        // trigger object create listeners
        this.emit("object-create", {spawnState});
    }

    // handles object delete notifications 
    handleObjectDelete(data){
        // extract response properties 
        let {objectID=null} = data;

        // trigger object delete listeners
        this.emit("object-delete", {objectID});
    }

    // handles object update notifications 
    handleObjectUpdate(data){
        // extract response properties 
        let {updateState=null} = data;

        // trigger object update listeners
        this.emit("object-update", {updateState});
    }

    // handles object stats response
    handleObjectStats(data, status){
        // extract response properties 
        let {message=null, stats=null} = data;

        // trigger object stats listeners 
        this.emit("object-stats", {message, stats, status});
    }

    // handles ability list response
    handleAbilityList(data, status){
        // extract response properties
        let {message=null, abilityList=null, abilityPoints=0} = data;

        // trigger ability list listeners
        this.emit("ability-list", {message, abilityList, abilityPoints, status});
    }

    // handles ability upgrade response
    handleAbilityUpgrade(data, status){
        // extract response properites
        let {message=null} = data;

        // trigger ability upgrade listeners
        this.emit("ability-upgrade", {message, status});
    }

    // handles abiltiy cast response
    handleAbilityCast(data, status){
        // extract response property
        let {message=null} = data;

        // trigger ability cast listeners
        this.emit("ability-cast", {message, status});
    }

    // handles invite notification
    handleInviteReceive(data){
        // extract notification property 
        let {message=null} = data;

        // triger invite listeners
        this.emit("invite-receive", {message});
    }

    // handles create instance reponse 
    handleCreateInstance(data, status){
        // extract response properties
        let {message=null} = data;

        // trigger create instance listeners
        this.emit("create-instance", {message, status});
    }

    // handles map players response 
    handleMapPlayers(data, status){
        // extract response properties
        let {message=null, players=null} = data;

        // trigger map players listeners
        this.emit("map-players", {players, message, status});
    }

    // handles all possible players to invite response
    handleAvailablePlayers(data, status){
        // extract response properties
        let {message=null, players=null} = data;

        // trigger available player listenres
        this.emit("available-players", {players, message, status});
    }

    // handles ability ready notifications
    handleAbilityReady(data, status){
        // extract property
        let {abilityName=""} = data;

        // trigger ability ready listeners
        this.emit("ability-ready", {abilityName, status});
    }

    // request to login to an account
    // gives the login credentials: username, password, and client verison 
    login(username, password){
        let version = CLIENT_VERSION;
        this.send(OpCode.ACCOUNT_LOGIN, {username, password, version});
    }

    // submit a logout to the server
    logout(){
        // destroy current ID
        this.clientID = null;
        // send request
        this.send(OpCode.ACCOUNT_LOGOUT);
    }

    // request the list of all characters associated with the account
    // (*** gives a 'preview' which does not include all character data ***)
    getCharacterList(){
        this.send(OpCode.CHARACTER_LIST);
    }

    // requests a character to be created
    // gives the name and skin ID of the character
    createCharacter(name, skin){
        this.send(OpCode.CHARACTER_CREATE, {name, skin});
    }

    // request a character select (*** auto joins map ***)
    // gives the name of the selected character
    selectCharacter(name){
        this.send(OpCode.CHARACTER_SELECT, {name});
    }

    // submits a chat message
    // gives the chat text 
    chatMessage(chat){
        this.send(OpCode.CHAT_MESSAGE, {chat});
    }

    // submits a player update
    // gives the player's current data (x, y, anim, objectID)
    playerUpdate(data){
        this.send(OpCode.OBJECT_UPDATE, data);
    }

    // requests the stats for a target object
    // gives the objectID of the target
    getObjectStats(objectID){
        this.send(OpCode.OBJECT_STATS, {objectID});
    }

    // requests the current ability list
    getAbilityList(){
        this.send(OpCode.ABILITY_LIST);
    }

    // requests an ability ugrade
    // gives the name of the ability to upgrade 
    upgradeAbility(abilityName){
        this.send(OpCode.ABILITY_UPGRADE, {abilityName});
    }

    // request an ability cast
    // gives the ability's name and the target's objectID 
    castAbility(abilityName, objectID){
        this.send(OpCode.ABILITY_CAST, {abilityName, objectID});
    }

    // sends a response to the pending invite
    replyToInvite(accept){
        this.send(OpCode.INVITE_REPLY, {accept});
    }

    // requests an instance to be generated
    // gives teh name of the instance to create
    createInstance(instanceName, objectIDs){
        this.send(OpCode.CREATE_INSTANCE, {instanceName, objectIDs});
    }

    // requests info about every player in the current map
    getMapPlayers(){
        this.send(OpCode.MAP_PLAYERS);
    }

    // requests all players that can be invited
    getAvailablePlayers(){
        this.send(OpCode.AVAILABLE_PLAYERS);
    }

    // sends a formatted request through the websocket 
    send(opCode, data){
        // server expects json string with opCode and data 
        this.sendString(JSON.stringify({opCode, data}));
    }

    // sends a utf8 string to the client (auto delimited for if messages are sent together)
    sendString(str){
        // must be connected to send requests 
        if(this.isConnected){
            this.socket.send(str + MSG_DELIM);
        }
    }

    // connected client = has a socket that is in the connected ready state 
    get isConnected(){
        return this.socket && this.socket.readyState === 1;
    }
}

// export singleton
export default new Client();