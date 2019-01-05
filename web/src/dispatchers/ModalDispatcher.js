import { EventEmitter } from "events";

class ModalDispatcher extends EventEmitter{
    modal(header, body, footer){
        this.emit("modal", {header, body, footer});
    }
}

// export singleton
export default new ModalDispatcher();