import React from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";
import Client from "../game/Client";

export class InviteModal extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            isOpen:     false,
            message:    null
        };

        this.onInvite = evt => this.setState({isOpen: true, message: evt.message});
    }

    componentDidMount(){
        Client.on("invite-receive", this.onInvite);
    }

    componentWillUnmount(){
        Client.removeListener("invite-receive", this.onInvite);
    }

    onAccept(){
        this.close();
        Client.replyToInvite(true);
    }

    onDecline(){
        this.close();
        Client.replyToInvite(false);
    }

    close(){
        this.setState({isOpen: false, message: null});
    }

    render(){
        return (
            <Modal isOpen={this.state.isOpen}>
                <ModalHeader>
                    Invitation
                </ModalHeader>
                <ModalBody>
                    {this.state.message}
                </ModalBody>
                <ModalFooter>
                    <Button onClick={this.onAccept.bind(this)}>Accept</Button>
                    <Button onClick={this.onDecline.bind(this)}>Decline</Button>
                </ModalFooter>
            </Modal>
        );
    }
}