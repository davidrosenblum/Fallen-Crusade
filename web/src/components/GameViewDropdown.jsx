import React from "react";
import { Dropdown, DropdownMenu, DropdownToggle, DropdownItem } from "reactstrap";
import Client from "../game/Client";
import Game from "../game/Game";
import NavDispatcher from "../dispatchers/NavDispatcher";
import ModalDispatcher from "../dispatchers/ModalDispatcher";

export class GameViewDropdown extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            isOpen: false   // dropdown visible? 
        };

        // handler for when the client receives players in map 
        this.onMapPlayers = evt => {
            // dropdown must be active and successful response 
            if(evt.status === "ok"){
                // display the players 
                ModalDispatcher.modal(
                    "Nearby Players",
                    Object.keys(evt.players).map(name => `${name} (Level ${evt.players[name]})`).join(", ")
                );
            }
        }
    }

    componentDidMount(){
        // listen for the client to get the players in the map
        Client.on("map-players", this.onMapPlayers);
    }

    componentWillUnmount(){
        // stop listening for the client to get players in the map (prevents leak)
        Client.removeListener("map-players", this.onMapPlayers);
    }

    // toggles the dropdown 
    toggle(){
        this.setState({isOpen: !this.state.isOpen});
    }

    // when the find players button is clicked...
    onFindPlayers(){
        // request player info
        Client.getMapPlayers();
    }

    // when the exit button is clicked...
    onExit(){
        // stop the game
        Game.unloadMap();
        // show login menu
        NavDispatcher.showLogin();
        // send logout notification 
        Client.logout();
    }

    // renders special options based on client's access level 
    renderAdminItems(){
        return Client.accessLevel > 1 ? [
            <DropdownItem divider/>,
            <DropdownItem header>Admin Commands</DropdownItem>,
            <DropdownItem>Upgrades Menu</DropdownItem>,
            <DropdownItem>Instances Menu</DropdownItem>
        ] : null;
    }

    render(){
        return (
            <div className="hud-dropdown">
                <Dropdown isOpen={this.state.isOpen} toggle={this.toggle.bind(this)}>
                    <DropdownToggle caret>
                        Menu
                    </DropdownToggle>
                    <DropdownMenu>
                        <DropdownItem header>Current Map</DropdownItem>
                        <DropdownItem onClick={this.onFindPlayers.bind(this)}>Find Players</DropdownItem>
                        <DropdownItem divider/>
                        <DropdownItem header>Quit</DropdownItem>
                        <DropdownItem onClick={this.onExit.bind(this)}>Exit/Logout</DropdownItem>
                        {this.renderAdminItems()}
                    </DropdownMenu>
                </Dropdown>
            </div>
        )
    }
}