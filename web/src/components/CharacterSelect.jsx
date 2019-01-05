import React from "react";
import { Table, Button } from "reactstrap";
import { BUTTON_WIDTH } from "../data/Data";
import Client from "../game/Client";
import ModalDispatcher from "../dispatchers/ModalDispatcher";

export class CharacterSelect extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            characterList:          null,
            characterListErrMsg:    null
        };

        this.onCharacterList = evt => {
            if(evt.status === "ok"){
                this.setState({characterList: evt.characterList || null});
            }
            else{
                ModalDispatcher.modal("Character List Error", evt.message);
                this.setState({characterListErrMsg: evt.message});
            }
        };
    }

    componentWillMount(){
        Client.on("character-list", this.onCharacterList);
    }

    componentDidMount(){
        Client.getCharacterList();
    }

    componentWillUnmount(){
        Client.removeListener("character-list", this.onCharacterList);
    }

    selectPlayer(name){
        Client.selectCharacter(name);
    }

    renderCharacterList(){
        let {characterList} = this.state.characterList;
        if(!characterList){
            return <div>{this.state.characterListErrMsg || "Loading..."}</div>;
        }

        let rows = [];

        for(let i = 0; i < 6; i++){
            let characterData = characterList[i] || null;

            if(characterData){
                let {name, level, last_map} = characterData;

                rows.push(
                    <tr>
                        <td>{name}</td>
                        <td>Level {level}</td>
                        <td>{last_map}</td>
                        <td>
                            <Button width={BUTTON_WIDTH} onClick={() => this.selectPlayer(name)} disabled={this.state.inputsDisabled}>
                                Select
                            </Button>
                        </td>
                    </tr>
                );
            }
            else{
                rows.push(
                    <tr>
                        <td>
                            <Button width={BUTTON_WIDTH} disabled={this.state.inputsDisabled}>
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
            </div>  
        )
    }

    render(){
        return (
            <div>
                {this.renderCharacterList()}
            </div>
        );
    }
}