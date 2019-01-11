import React from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Table, Button } from "reactstrap";
import { BUTTON_WIDTH } from "../data/Data";
import Client from "../game/Client";
import ModalDispatcher from "../dispatchers/ModalDispatcher";

export class UpgradesModal extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            isOpen:         false,      // modal visible?
            abilityList:    null,       // list for table
            pending:        false       // loading list? (locks UI)
        };

        // when the client receives the ability list...
        this.onAbilityList = evt => {
            if(evt.status === "ok"){
                // got the list - update the modal
                let {abilityList, abilityPoints} = evt;
                this.setState({abilityList, abilityPoints});
            }
            else{
                // failed to get list - close the modal and display error
                this.setState({isOpen: false});
                ModalDispatcher.modal("Ability List Error", evt.message);
            }
        };

        // when the client receives the ability upgrade response...
        this.onAbilityUpgrade = evt => {
            if(evt.status === "ok"){
                // successful upgrade - close the modal
                this.setState({isOpen: false});
                Client.getAbilityList(); // update ability UI - this could be redudant
            }
            else{
                // error upgrading - display error and unlock
                this.setState({pending: false});
                ModalDispatcher.modal("Upgrade Error", evt.message);
            }
        }

        // when the upgrades modal is triggered...
        this.onUpgradesModal = () => {
            // show the modal and reset ability list (forces update)
            this.setState({isOpen: true, abilityList: null, abilityPoints: 0, pending: false});
            // request updated ability list 
            Client.getAbilityList();
        };
    }

    // when the modal mounts... append listeners
    componentDidMount(){
        // listen for the modal to be activated
        ModalDispatcher.on("upgrades-modal", this.onUpgradesModal);
        // listen for the client to get the ability list 
        Client.on("ability-list", this.onAbilityList);
        // listen for the client to get the ability upgrade response
        Client.on("ability-upgrade", this.onAbilityUpgrade);
    }

    // when the modal unmounts... remove listeners
    componentWillUnmount(){
        // stop listening for the modal activation
        ModalDispatcher.removeListener("upgrades-modal", this.onUpgradesModal);
        // stop listening for the client to get the abiltiy list 
        Client.removeListener("ability-list", this.onAbilityList);
        // stop listening for the client to get the ability upgrade response
        Client.removeListener("ability-upgrade", this.onAbilityUpgrade);
    }

    // toggles the upgreades modal (can't close while pending)
    toggle(){
        if(!this.state.pending){
            this.setState({isOpen: !this.state.isOpen});
        }
    }

    // submits the upgrade request
    submitUpgrade(abilityName){
        // lock the UI 
        this.setState({pending: true});

        // send the request
        Client.upgradeAbility(abilityName);
    }

    // renders the upgrades table 
    renderUpgradesTable(){
        // extract ability list (current and locked abilities) and points to spend
        let {abilityList, abilityPoints} = this.state;

        // null ability list = still loading
        if(!abilityList) return <div>Loading...</div>;

        // must have points to upgrade! 
        if(!abilityPoints){
            return <div>You have no ability points.</div>
        }

        // no current/locked abilities
        if(!abilityList.length){
            return <div>No abilities available.</div>;
        }

        // sort alphabetically 
        abilityList = abilityList.sort((a, b) => a.name > b.name ? 1 : -1);

        // generate the table rows
        let rows = [];
        for(let i = 0; i < abilityList.length; i++){
            // get ability properties
            // note: name = display name, abilityName = server-recognized name 
            let {abilityName, name, level} = abilityList[i];

            rows.push(
                <tr key={i}>
                    <td>
                        {name}
                    </td>
                    <td>
                        Level {level} to {level + 1}
                    </td>
                    <td>
                        <Button
                            width={BUTTON_WIDTH}
                            onClick={() => this.submitUpgrade(abilityName)}
                            disabled={this.state.pending}
                        >
                            {level > 0 ? "Upgrade" : "Unlock"}
                        </Button>
                    </td>
                </tr>
            )
        }

        // return the generated the table 
        return (
            <div className="text-center">
                <Table>
                    <tbody>
                        {rows}
                    </tbody>
                </Table>
            </div>
        );
    }

    render(){
        return (
            <Modal isOpen={this.state.isOpen} toggle={this.toggle.bind(this)}>
                <ModalHeader toggle={this.toggle.bind(this)}>
                    Ability Upgrades
                </ModalHeader>
                <ModalBody>
                    {this.renderUpgradesTable()}
                </ModalBody>
                <ModalFooter>

                </ModalFooter>
            </Modal>
        )
    }
}