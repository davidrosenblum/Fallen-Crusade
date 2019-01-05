import React from "react";
import { Modal, ModalBody, ModalHeader, ModalFooter } from "reactstrap";
import ModalDispatcher from "../dispatchers/ModalDispatcher";

export class AlertModal extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            isOpen: false,
            header: null,
            body: null,
            footer: null
        };

        this.onModal = evt => {
            this.setState({
                isOpen: true,
                header: evt.header || null,
                body: evt.body || null,
                footer: evt.footer || null
            })
        };
    }

    componentWillMount(){
        ModalDispatcher.on("modal", this.onModal);
    }

    componentWillUnmount(){
        ModalDispatcher.removeListener("modal", this.onModal);
    }

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