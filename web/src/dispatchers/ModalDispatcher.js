import { EventEmitter } from "events";

class ModalDispatcher extends EventEmitter{
    modal(header, body, footer){
        this.emit("modal", {header, body, footer});
    }

    instanceModal(){
        this.emit("instance-modal");
    }

    upgradesModal(){
        this.emit("upgrades-modal");
    }
}

// export singleton
export default new ModalDispatcher();