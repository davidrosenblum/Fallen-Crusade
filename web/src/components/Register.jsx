import React from "react";
import { Form, FormGroup, Label, Input, Button } from "reactstrap";
import { BUTTON_WIDTH, INPUT_MAX_LENGTH } from "../data/Data";
import { Footer } from "./Footer";
import { Banner } from "./Banner";
import { Ajax } from "../utils/Ajax";
import ModalDispatcher from "../dispatchers/ModalDispatcher";
import NavDispatcher from "../dispatchers/NavDispatcher";

export class Register extends React.Component{
    constructor(props){
        super(props);

        this.usernameInput = null;
        this.passwordInput = null;
        this.confirmInput = null;

        this.state = {
            pending: false
        };
    }

    clearForm(){
        this.usernameInput.value = "";
        this.passwordInput.value = "";
        this.confirmInput.value = "";
    }

    onCancel(){
        NavDispatcher.showMenu("login");
    }

    onSubmit(evt){
        evt.preventDefault();

        this.setState({pending: true});

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
                this.setState({pending: false})
            });
    }

    render(){
        return (
            <div>
                <br/>
                <Banner/>
                <br/>
                <div className="app-menu">
                    <Form onSubmit={this.onSubmit.bind(this)}>
                        <FormGroup>
                            <Label>Username</Label>
                            <Input
                                innerRef={input => this.usernameInput = input}
                                type="text"
                                maxLength={INPUT_MAX_LENGTH}
                                disabled={this.state.pending}
                                required
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label>Password</Label>
                            <Input
                                innerRef={input => this.passwordInput = input}
                                type="password"
                                maxLength={INPUT_MAX_LENGTH}
                                disabled={this.state.pending}
                                required
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label>Confirm Password</Label>
                            <Input
                                innerRef={input => this.confirmInput = input}
                                type="password"
                                maxLength={INPUT_MAX_LENGTH}
                                disabled={this.state.pending}
                                required
                            />
                        </FormGroup>
                        <FormGroup>
                            <Button width={BUTTON_WIDTH} disabled={this.state.pending}>
                                Submit
                            </Button>
                            &nbsp;
                            <Button
                                width={BUTTON_WIDTH}
                                type="button"
                                onClick={this.onCancel.bind(this)}
                                disabled={this.state.pending}
                            >
                                Cancel
                            </Button>
                        </FormGroup>
                    </Form>
                    <Footer/>
                </div>
            </div>
        );
    }
}