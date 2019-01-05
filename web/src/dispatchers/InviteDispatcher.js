import { EventEmitter } from "events";

export class InviteDispatcher extends EventEmitter{
    invite(type, message){
        this.emit("invite", {type, message});
    }
}