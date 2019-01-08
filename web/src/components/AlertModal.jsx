import React from "react";
import { Modal, ModalBody, ModalHeader, ModalFooter } from "reactstrap";
import ModalDispatcher from "../dispatchers/ModalDispatcher";

export class AlertModal extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            isOpen: false,      // visible or not?
            header: null,       // header text
            body: null,         // body text
            footer: null        // footer text
        };

        // handler for when a display modal is triggered via the modal dispatcher 
        this.onModal = evt => {
            // show the modal with the new text data 
            this.setState({
                isOpen: true,
                header: evt.header  || null,    // optional
                body:   evt.body    || null,    // optional
                footer: evt.footer  || null     // optional 
            })
        };
    }

    componentWillMount(){
        // listen for display modal triggers
        ModalDispatcher.on("modal", this.onModal);
    }

    componentWillUnmount(){
        // stop listening for display modal triggers (prevents leak)
        ModalDispatcher.removeListener("modal", this.onModal);
    }

    // toggles the modal
    toggle(){
        this.setState({isOpen: !this.state.isOpen});
    }

    render(){
        return (
            <Modal isOpen={this.state.isOpen} toggle={this.toggle.bind(this)}>
                <ModalHeader toggle={this.toggle.bind(this)}>
                    {this.state.header || null}
                </ModalHeader>
                <ModalBody>
                    {this.state.body|| null}
                </ModalBody>
                <ModalFooter>
                    {this.state.footer || null}
                </ModalFooter>
            </Modal>
        );
    }
}