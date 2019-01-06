import { EventEmitter } from "events";

class Game extends EventEmitter{
    constructor(){
        super();
    }
}

export default new Game();