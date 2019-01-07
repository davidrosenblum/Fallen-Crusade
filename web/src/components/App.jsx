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
            menu: "login"
        };

        this.onMenu = evt => this.setState({menu: evt.menu});

        this.onClientClose = () => {
            console.log('close');
            ModalDispatcher.modal("Socket Error", "Connection error.");
            NavDispatcher.showMenu("login");
        };

        this.onClientError = err => {
            console.log('err!');
            ModalDispatcher.modal("Socket Error", "Connection error.");
            NavDispatcher.showMenu("login");
        };
    }

    componentDidMount(){
        NavDispatcher.on("menu", this.onMenu);
        Client.on("close", this.onClientClose);
        Client.on("error", this.onClientError);
    }

    componentWillUnmount(){
        NavDispatcher.removeListener("menu", this.onMenu);
        Client.removeListener("close", this.onClientClose);
        Client.removeListener("error", this.onClientError);
    }

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