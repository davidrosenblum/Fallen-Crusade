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
                this.handleCharacterCreate(data, status);
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

    send(opCode, data){
        this.socket.send(JSON.stringify({opCode, data}) + MSG_DELIM);
    }

    sendString(str){
        this.socket.send(str + MSG_DELIM);
    }

    get isConnected(){
        return this.socket && this.socket.readyState === 1;
    }
}

export default new Client();