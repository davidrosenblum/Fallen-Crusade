import React from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Input, Button, Table, Form, FormGroup, Label } from "reactstrap";
import Client from "../game/Client";
import ModalDispatcher from "../dispatchers/ModalDispatcher";

export class InstanceModal extends React.Component{
    constructor(props){
        super(props);

        // <input> that will hold the instance to create
        this.instanceNameInput = null;
        // all player object IDs to invite 
        this.playersToInvite = {};

        this.state = {
            isOpen:     false,      // modal visible?
            pending:    false,      // loading players? (locks UI)
            players:    null        // list of players to render
        };

        // when the client gets available players...
        this.onAvailablePlayers = evt => {
            if(evt.status === "ok"){
                // got players - update the modal
                this.setState({players: evt.players});
            }
            else{
                // unable to load players - display error and close modal
                ModalDispatcher.modal("Available Players Error", evt.message);
                this.setState({isOpen: false});
            }
        };

        // when the instance creation responds...
        this.onInstanceCreate = evt => {
            if(evt.status === "ok"){
                // instance created - hide modal (auto joins instance)
                this.setState({isOpen: false});
            }
            else{
                // failed to create - unlock UI and display error message 
                this.setState({pending: false});
                ModalDispatcher.modal("Instance Error", evt.message);
            }
        }

        // when the modal is activated...
        this.onInstanceModal = () => {
            // show the modal and reset players (force reload)
            this.setState({isOpen: true, players: null});
            // request players
            Client.getAvailablePlayers();
        };
    }

    // when the modal mounts... append listeners
    componentDidMount(){
        // listen for the modal to be activated
        ModalDispatcher.on("instance-modal", this.onInstanceModal);
        // listen for the client to receive available players
        Client.on("available-players", this.onAvailablePlayers);
        // listen for the client to create the instance
        Client.on("create-instance", this.onInstanceCreate);
    }

    // when the modal unmounts... clear listeners
    componentWillUnmount(){
        // stop listening for the modal to be activated
        ModalDispatcher.removeListener("instance-modal", this.onInstanceModal);
        // stop listening for the client to receive available players
        Client.removeListener("available-players", this.onAvailablePlayers);
        // stop listening for the client to create the instance
        Client.removeListener("create-instance", this.onInstanceCreate);
    }

    // toggles the create instance modal (can't close while pending response)
    toggle(){
        if(!this.state.pending){
            this.setState({isOpen: !this.state.isOpen});
        }
    }

    // toggles the player's object ID in the invite list 
    toggleInvite(objectID){
        // ID in the invite list already?
        if(objectID in this.playersToInvite){
            // remove
            delete this.playersToInvite[objectID];
        }
        // object not in invite list?
        else{
            // add 
            this.playersToInvite[objectID] = true;
        }
    }

    // submits the create instance request 
    onSubmit(evt){
        // prevent page reloading
        evt.preventDefault();
        // lock UI
        this.setState({pending: true});

        // get name of instance to create
        let instanceName = this.instanceNameInput.value;
        // get array of player IDs to invite
        let objectIDs = Object.keys(this.playersToInvite);
        
        // request the instance (auto joins)
        Client.createInstance(instanceName, objectIDs);

        // clear the invite list for next time 
        this.playersToInvite = {};
    }

    // renders the player invite table 
    renderPlayers(){
        // extract players and make sure its not null (null = loading, [] = no players)
        let players = this.state.players;
        if(!players) return <div>Loading...</div>;

        // any players to invite?
        if(!players.length){
            return <div>No other available players to invite.</div>
        }

        // create the table rows
        // [x] Invite? | PlayerName | Level # 
        let rows = [];
        for(let player of players){
            // extract current player data
            let {level, name, objectID} = player;
            // create the row
            rows.push(
                <tr key={name}>
                    <td>
                        <Input
                            type="checkbox"
                            onChange={() => this.toggleInvite(objectID)}
                            disabled={this.state.pending}
                        /> Invite?
                    </td>
                    <td>
                        {name}
                    </td>
                    <td>
                        Level {level}
                    </td>
                </tr>
            );
        }

        // return the generated table 
        return (
            <div className="text-center">
                <Table>
                    <tbody>
                        {rows}
                    </tbody>
                </Table>
            </div>
        )        
    }

    render(){
        return (
            <Modal isOpen={this.state.isOpen} toggle={this.toggle.bind(this)}>
                <ModalHeader toggle={this.toggle.bind(this)}>
                    Start Raid Instance
                </ModalHeader>
                <ModalBody>
                    <Form onSubmit={this.onSubmit.bind(this)}>
                        <FormGroup>
                            <Label>Select Instance</Label>
                            <Input
                                innerRef={input => this.instanceNameInput = input}
                                type="select"
                                disabled={this.state.pending}
                                required
                            >
                                <option>Graveyard</option>
                                <option>Crypt</option>
                            </Input>
                        </FormGroup>
                        <FormGroup>
                            <Label>Invite Players</Label>
                            {this.renderPlayers()}
                        </FormGroup>
                        <div>
                            <Button disabled={this.state.pending}>Create</Button>
                        </div>
                    </Form>
                </ModalBody>
                <ModalFooter>
                </ModalFooter>
            </Modal>
        )
    }
}