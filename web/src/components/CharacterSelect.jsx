import React from "react";
import { Table, Button } from "reactstrap";
import { BUTTON_WIDTH } from "../data/Data";
import Client from "../game/Client";
import ModalDispatcher from "../dispatchers/ModalDispatcher";
import NavDispatcher from "../dispatchers/NavDispatcher";
import Game from "../game/Game";

export class CharacterSelect extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            pending:        false,
            characterList:  null,
            errMessage:     null
        };

        this.onCharacterList = evt => {
            if(evt.status === "ok"){
                this.setState({characterList: evt.characterList || null});
            }
            else{
                ModalDispatcher.modal("Characters Error", evt.message);
                this.setState({errMessage: evt.message});
            }
        };

        this.onEnterMap = evt => {
            if(evt.status === "ok"){
               NavDispatcher.showMenu("game");
               Game.loadMap(evt);
            }
            else{
                ModalDispatcher.modal("Characters Error", evt.message);
                this.setState({pending: false});
            }
        };
    }
    
    componentDidMount(){
        Client.on("character-list", this.onCharacterList);
        Client.on("enter-map", this.onEnterMap);

        Client.getCharacterList();
    }

    componentWillUnmount(){
        Client.removeListener("character-list", this.onCharacterList);
        Client.removeListener("enter-map", this.onEnterMap);
    }

    onCreate(){
        NavDispatcher.showMenu("character-create");
    }

    onLogout(){
        Client.logout();
        NavDispatcher.showMenu("login");
    }

    selectPlayer(name){
        this.setState({pending: true});

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

    renderLogoutBtn(){
        return (
            <div className="text-center">
                <Button width={BUTTON_WIDTH} disabled={this.state.pending} onClick={this.onLogout.bind(this)}>
                    Logout
                </Button>
            </div>
        );
    }

    renderBody(){
        let {characterList=null, errMessage=null} = this.state;

        if(errMessage){
            return (
                <div>
                    <div>{errMessage}</div>
                    {this.renderLogoutBtn()}
                </div>
            );
        }

        else if(characterList){
            return this.renderCharacterList();
        }

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