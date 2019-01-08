import { EventEmitter } from "events";

class NavDispatcher extends EventEmitter{
    showMenu(menu){
        this.emit("menu", {menu});
    }

    showLogin(){
        this.showMenu("login");
    }

    showRegister(){
        this.showMenu("register");
    }

    showCharacterSelect(){
        this.showMenu("character-select")
    }

    showCharacterCreate(){
        this.showMenu("character-create");
    }

    showGame(){
        this.showMenu("game");
    }
}

// export singleton
export default new NavDispatcher();