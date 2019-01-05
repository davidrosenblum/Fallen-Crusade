import React from "react";
import { Form, FormGroup, Label, Input, Button } from "reactstrap";
import { BUTTON_WIDTH, INPUT_MAX_LENGTH } from "../data/Data";
import { Ajax } from "../utils/Ajax";
import ModalDispatcher from "../dispatchers/ModalDispatcher";

export class Register extends React.Component{
    constructor(props){
        super(props);

        this.usernameInput = null;
        this.passwordInput = null;
        this.confirmInput = null;

        this.state = {
            inputsDisabled: false
        };
    }

    clearForm(){
        this.usernameInput.value = "";
        this.passwordInput.value = "";
        this.confirmInput.value = "";
    }

    onSubmit(evt){
        evt.preventDefault();

        this.setState({inputsDisabled: true});

        let username = this.usernameInput.value;
        let password = this.passwordInput.value;
        let confirm = this.confirmInput.value;

        if(password !== confirm){
            ModalDispatcher.modal("Passwords Error", "Passwords do not match.");
            return;
        }

        let url = window.location.origin.replace(":3000", ":8080");
        let headers = Ajax.getCorsHeaders();
        let query = null;
        let data = JSON.stringify({username, password});

        Ajax.post(url, headers, query, data)
            .then(xhr => {
                let header = xhr.status === 200 ? "Account Created" : "Account Error";
                ModalDispatcher.modal(header, xhr.response);
            })
            .catch(err => {
                ModalDispatcher.modal("Request Error", "HTTP request failed.");
            })
            .then(() => {
                this.setState({inputsDisabled: false})
            });
    }

    render(){
        return (
            <div>
                <Form onSubmit={this.onSubmit.bind(this)}>
                    <FormGroup>
                        <Label>Username</Label>
                        <Input
                            innerRef={input => this.usernameInput = input}
                            type="text"
                            maxLength={INPUT_MAX_LENGTH}
                            disabled={this.state.inputsDisabled}
                            required
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label>Password</Label>
                        <Input
                            innerRef={input => this.passwordInput = input}
                            type="password"
                            maxLength={INPUT_MAX_LENGTH}
                            disabled={this.state.inputsDisabled}
                            required
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label>Confirm Password</Label>
                        <Input
                            innerRef={input => this.confirmInput = input}
                            type="password"
                            maxLength={INPUT_MAX_LENGTH}
                            disabled={this.state.inputsDisabled}
                            required
                        />
                    </FormGroup>
                    <FormGroup>
                        <Button width={BUTTON_WIDTH} disabled={this.state.inputsDisabled}>
                            Submit
                        </Button>
                        <Button width={BUTTON_WIDTH} type="button" onClick={this.clearForm.bind(this)} disabled={this.state.inputsDisabled}>
                            Clear
                        </Button>
                    </FormGroup>
                </Form>
            </div>
        );
    }
}