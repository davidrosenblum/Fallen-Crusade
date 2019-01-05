import { EventEmitter } from "events";

class NavDispatcher extends EventEmitter{
    showMenu(menu){
        this.emit("menu", {menu});
    }
}

export default new NavDispatcher();