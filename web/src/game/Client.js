import { EventEmitter } from "events";
import { MSG_DELIM, OpCode, Status } from "./Comm";

export const CLIENT_VERSION = "0.1.0";

class Client extends EventEmitter{
    constructor(){
        super();

        this.socket = null;
        this.clientID = null;
    }

    connect(){
        if(!this.isConnected){
            let url = window.location.origin
                .replace(":3000", ":8080")
                .replace("https://", "wss://")
                .replace("http://", "ws://");

            this.socket = new WebSocket(url);

            this.socket.addEventListener("open", () => {
                this.emit("connect");
            });

            this.socket.addEventListener("error", err => {
                this.emit("error", err);
            });

            this.socket.addEventListener("message", evt => {
                this.handleData(evt.data.toString());
            });

            this.socket.addEventListener("close", () => {
                this.emit("close");
            });
        }
    }

    handleData(data){
        data.split(MSG_DELIM).forEach(msg => {
            let opCode, data, status;

            try{
                let json = JSON.parse(msg);

                console.log(json);

                opCode = json.opCode || -1;
                data = json.data || {};
                status = json.status || Status.BAD;
            }
            catch(err){
                return;
            }

            this.processResponse(opCode, data, status);
        });
    }

    processResponse(opCode, data, status){
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
        }
    }

    handleLogin(data, status){
        let {message=null, clientID=null} = data;

        if(status === Status.GOOD){
            this.clientID = clientID;
        }

        this.emit("login", {message, status})
    }

    handleLogout(data, status){
        let {message=null} = data;

        this.emit("logout", {message, status});
    }

    handleCharacterList(data, status){
        let {message=null, characterList=null} = data;

        this.emit("character-list", {message, characterList, status});
    }

    handleCharacterCreate(data, status){
        let {message=null} = data;

        this.emit("character-create", {message, status});
    }

    handleMapEnter(data, status){
        let {message=null, mapState=null} = data;

        this.emit("enter-map", {message, mapState, status});
    }

    handleInstanceEnter(data, status){
        let {message=null, mapState=null} = data;

        this.emit("enter-instance", {message, mapState, status});
    }

    handleChatMessage(data, status){
        let {chat="", from=null} = data;
        
        this.emit("chat", {chat, from, status});
    }

    handleObjectCreate(data){
        this.emit("object-create", data);
    }

    handleObjectDelete(data){
        this.emit("object-delete", data);
    }

    handleObjectUpdate(data){
        this.emit("object-update", data);
    }

    handleObjectStats(data, status){
        let stats = Object.assign({status}, data);
        this.emit("object-stats", stats);
    }

    login(username, password){
        let version = CLIENT_VERSION;
        this.send(OpCode.ACCOUNT_LOGIN, {username, password, version});
    }

    logout(){
        this.send(OpCode.ACCOUNT_LOGOUT);
    }

    getCharacterList(){
        this.send(OpCode.CHARACTER_LIST);
    }

    createCharacter(name, skin){
        this.send(OpCode.CHARACTER_CREATE, {name, skin});
    }

    selectCharacter(name){
        this.send(OpCode.CHARACTER_SELECT, {name});
    }

    chatMessage(chat){
        this.send(OpCode.CHAT_MESSAGE, {chat});
    }

    playerUpdate(data){
        this.send(OpCode.OBJECT_UPDATE, data);
    }

    getObjectStats(objectID){
        this.send(OpCode.OBJECT_STATS, {objectID});
    }

    getAbilityList(){
        this.send(OpCode.ABILITY_LIST);
    }

    upgradeAbility(abilityName){
        this.send(OpCode.ABILITY_UPGRADE, {abilityName});
    }

    castAbility(abilityName, objectID){
        this.send(OpCode.ABILITY_CAST, {abilityName, objectID});
    }

    send(opCode, data){
        if(this.isConnected){
            this.socket.send(JSON.stringify({opCode, data}) + MSG_DELIM);
        }
    }

    sendString(str){
        this.socket.send(str + MSG_DELIM);
    }

    get isConnected(){
        return this.socket && this.socket.readyState === 1;
    }
}

export default new Client();