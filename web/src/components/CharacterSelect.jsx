import React from "react";
import { Table, Button } from "reactstrap";
import { BUTTON_WIDTH } from "../data/Data";
import Client from "../game/Client";
import Game from "../game/Game";
import ModalDispatcher from "../dispatchers/ModalDispatcher";
import NavDispatcher from "../dispatchers/NavDispatcher";

export class CharacterSelect extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            pending:        false,  // awaiting character list (locks UI)
            characterList:  null,   // character list array
            errMessage:     null    // error message string 
        };

        // handler for when the client receives the character list 
        this.onCharacterList = evt => {
            if(evt.status === "ok"){
                // succeess - render character list
                this.setState({characterList: evt.characterList || null});
            }
            else{
                // failed - display error message
                ModalDispatcher.modal("Characters Error", evt.message);
                this.setState({errMessage: evt.message});
            }
        };

        // handler for when the client receives the enter map OR enter instance signal
        // (should always be map since you cant first enter into an instance?)
        this.onEnterMap = evt => {
            // must be successful to continue to game
            if(evt.status === "ok"){
                // success - show the game
                NavDispatcher.showGame();
                // begin loading the map with received map data
                Game.loadMap(evt.mapState);
            }
            else{
                // fail - display error message
                ModalDispatcher.modal("Characters Error", evt.message);
                // unlock UI 
                this.setState({pending: false});
            }
        };
    }

    componentDidMount(){
        // listen for the client to receive the character list
        Client.on("character-list", this.onCharacterList);
        // listen for the client to enter a map (this will happen after successful character select)
        Client.on("enter-map", this.onEnterMap);
        // listen for the client to enter an instance 
        Client.on("enter-instance", this.onEnterMap);

        // request the character list 
        Client.getCharacterList();
    }

    componentWillUnmount(){
        // stop listening for the client to receive the character list (prevents leak)
        Client.removeListener("character-list", this.onCharacterList);
        // stop listening for the client to receive the enter map signal (prevents leak)
        Client.removeListener("enter-map", this.onEnterMap);
        // stop listening for the client to receive the enter instance signal (prevents leak)
        Client.removeListener("enter-instance", this.onEnterMap);
    }

    // when a create character button is clicked...
    onCreate(){
        // show the character create menu
        NavDispatcher.showCharacterCreate();
    }

    // when the logout button is clicked...
    onLogout(){
        // send the logout 'request'
        Client.logout();
        // show the login menu
        NavDispatcher.showLogin();
    }

    selectPlayer(name){
        // lock the UI while awaiting selection response
        this.setState({pending: true});
        // send the character select request 
        Client.selectCharacter(name);
    }

    renderCharacterList(){
        let characterList = this.state.characterList;

        if(!characterList){
            return <div>{this.state.characterListErrMsg || "Loading..."}</div>;
        }

        let rows = [];

        for(let i = 0; i < 6; i++){
            let characterData = characterList[i] || null;

            if(characterData){
                let {name, level, last_map} = characterData;

                rows.push(
                    <tr key={i}>
                        <td>{name}</td>
                        <td>Level {level}</td>
                        <td>{last_map}</td>
                        <td>
                            <Button
                                width={BUTTON_WIDTH}
                                onClick={() => this.selectPlayer(name)}
                                disabled={this.state.pending}
                            >
                                Select
                            </Button>
                        </td>
                    </tr>
                );
            }
            else{
                rows.push(
                    <tr key={i}>
                        <td>
                            <Button
                                width={BUTTON_WIDTH}
                                onClick={this.onCreate.bind(this)}
                                disabled={this.state.pending}
                            >
                                Create
                            </Button>
                        </td>
                    </tr>
                );
            }
        }

        // render the table
        return (
            <div>
                <Table>
                    <thead>
                        {rows}
                    </thead>
                </Table>
                {this.renderLogoutBtn()}
            </div>  
        )
    }

    // renders the logout button
    renderLogoutBtn(){
        return (
            <div className="text-center">
                <Button width={BUTTON_WIDTH} disabled={this.state.pending} onClick={this.onLogout.bind(this)}>
                    Logout
                </Button>
            </div>
        );
    }

    // renders the body (character list or error message)
    renderBody(){
        // extract character list and error message
        let {characterList=null, errMessage=null} = this.state;

        // if there is an error message - render the error in the body 
        if(errMessage){
            return (
                <div>
                    <div>{errMessage}</div>
                    {this.renderLogoutBtn()}
                </div>
            );
        }

        // if no error and character list - render the character list table
        else if(characterList){
            return this.renderCharacterList();
        }

        // else - character list is still loading 
        return <div>Loading...</div>
    }

    render(){
        return (
            <div>
                <div className="app-menu">
                    <br/>
                    {this.renderBody()}
                </div>
            </div>
        );
    }
}