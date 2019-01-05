import React from "react";
import { Form, FormGroup, Label, Input, Button, Row, Col } from "reactstrap";
import { BUTTON_WIDTH, INPUT_MAX_LENGTH } from "../data/Data";
import Client from "../game/Client";
import ModalDispatcher from "../dispatchers/ModalDispatcher";
import NavDispatcher from "../dispatchers/NavDispatcher";

export class Login extends React.Component{
    constructor(props){
        super(props);

        this.usernameInput = null;
        this.passwordInput = null;
        this.successfulUsername = null;

        this.state = {
            inputsDisabled: false
        };

        this.onConnect = () => {
            console.log("Connected");
            this.setState({inputsDisabled: false});
        };

        this.onLogin = evt => {
            if(evt.status === "ok"){
                this.saveUsername();
                NavDispatcher.showMenu("character-select");
            }
            else{
                console.log(evt);
                ModalDispatcher.modal("Login Error", evt.message);
            }
            this.setState({inputsDisabled: false});
        };
    }

    componentWillMount(){
        Client.on("connect", this.onConnect);
        Client.on("login", this.onLogin);
    }

    componentDidMount(){
        this.usernameInput.value = this.getSavedUsername() || "";

        if(!Client.isConnected){
            this.setState({inputsDisabled: true});
            Client.connect();
        }
    }

    componentWillUnmount(){
        Client.removeListener("connect", this.onConnect);
        Client.removeListener("login", this.onLogin);
    }

    onSubmit(evt){
        evt.preventDefault();

        let username = this.usernameInput.value;
        let password = this.passwordInput.value;

        this.saveUsername = username;

        Client.login(username, password);
    }

    saveUsername(username){
        window.localStorage.setItem("username", username || this.successfulUsername);
    }

    getSavedUsername(){
        return window.localStorage.getItem("username") || null;
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
                        <Row>

                        </Row>
                        <Button disabled={this.state.inputsDisabled}>Submit</Button>
                    </FormGroup>
                </Form>
            </div>
        );
    }
}