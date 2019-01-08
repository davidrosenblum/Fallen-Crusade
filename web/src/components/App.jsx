import React from "react";
import "./App.css";
import { Login } from "./Login";
import { Register } from "./Register";
import { CharacterSelect } from "./CharacterSelect";
import { CharacterCreate } from "./CharacterCreate";
import { GameView } from "./GameView";
import { AlertModal } from "./AlertModal";
import Client from "../game/Client";
import NavDispatcher from "../dispatchers/NavDispatcher";
import ModalDispatcher from "../dispatchers/ModalDispatcher";

export class App extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            menu: "login"   // default menu is the login menu
        };

        // handler for when a menu change is triggered via modal dispatcher 
        this.onMenu = evt => this.setState({menu: evt.menu});

        // handler for when the websocket closes
        this.onClientClose = () => {
            // display connection lost message
            ModalDispatcher.modal("Socket Error", "Connection error.");
            // show the login menu
            NavDispatcher.showLogin();
        };

        // handler for the websocket errors 
        this.onClientError = err => {};
    }

    componentDidMount(){
        // listen for menu change signal from the navigation dispatcher 
        NavDispatcher.on("menu", this.onMenu);
        // listen for the websocket to close 
        Client.on("close", this.onClientClose);
        // listen for the websocket to error 
        Client.on("error", this.onClientError);
    }

    componentWillUnmount(){
        // stop listening for menu changes (prevents leark)
        NavDispatcher.removeListener("menu", this.onMenu);
        // stop listening for websocket closes (prevents leak)
        Client.removeListener("close", this.onClientClose);
        // stop listening for websocket errors (prevents leak)
        Client.removeListener("error", this.onClientError);
    }

    // renders the current menu component 
    renderMenu(){
        switch(this.state.menu){
            case "login":
                return <Login/>
            case "register":
                return <Register/>;
            case "character-select":
                return <CharacterSelect/>;
            case "character-create":
                return <CharacterCreate/>
            case "game":
                return <GameView/>;
            default:
                return null;
        }
    }

    render(){
        return (
            <div>
                {this.renderMenu()}
                <AlertModal/>
            </div>
        );
    }
}