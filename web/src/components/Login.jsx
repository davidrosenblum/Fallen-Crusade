import React from "react";
import { Form, FormGroup, Label, Input, Button, Row, Col } from "reactstrap";
import { BUTTON_WIDTH, INPUT_MAX_LENGTH } from "../data/Data";
import { Banner } from "./Banner";
import { Footer } from "./Footer";
import Client from "../game/Client";
import ModalDispatcher from "../dispatchers/ModalDispatcher";
import NavDispatcher from "../dispatchers/NavDispatcher";


export class Login extends React.Component{
    constructor(props){
        super(props);

        this.usernameInput = null;      // username <input>
        this.passwordInput = null;      // password <input>
        this.usernameToSave = null;     // username to save to local storage (to load next time)

        this.state = {
            pending: false              // awaiting login response (locks the UI)
        };

        // handler for when the client's websocket establishes a connection to the server
        // (note: close and error are handled in App.jsx)
        this.onConnect = () => {
            // connected - unlock the UI 
            this.setState({pending: false});   
        };

        // handler for when the client receives the login response
        this.onLogin = evt => {
            // got a resposne 
            if(evt.status === "ok"){
                // successful login
                // stores the username 
                this.saveUsername(this.usernameToSave);
                // show the character selection menu
                NavDispatcher.showCharacterSelect();
            }
            else{
                // failed to login - display error message
                ModalDispatcher.modal("Login Error", evt.message);
                // unlock the UI
                this.setState({pending: false});
            }
        };
    }

    componentDidMount(){
        // listen for the client's websocket to connect
        Client.on("connect", this.onConnect);
        // listen for the client to receive a login response 
        Client.on("login", this.onLogin);

        // restore last successful login username from local storage
        this.usernameInput.value = this.getSavedUsername() || "";

        // if the socket is not connected
        if(!Client.isConnected){
            // lock the UI and connect (connection unlocks UI)
            this.setState({pending: true});
            Client.connect();
        }
    }

    componentWillUnmount(){
        // stop listening for the client's websocket to connect (prevents leak)
        Client.removeListener("connect", this.onConnect);
        // stop listening for the client to receive a login response (prevents leak)
        Client.removeListener("login", this.onLogin);
    }

    // when the create account button is clicked...
    onCreate(){
        // show the register account menu 
        NavDispatcher.showRegister();
    }

    // when the login form is submitted...
    onSubmit(evt){
        // prevent page reload
        evt.preventDefault();

        // extract username text
        let username = this.usernameInput.value;
        // extract password text
        let password = this.passwordInput.value;

        // store the username (will save to local storage on successful login)
        this.usernameToSave = username;

        // send the login request 
        Client.login(username, password);
    }

    // saves the parameter to local storage as 'username'
    saveUsername(username){
        window.localStorage.setItem("username", username);
    }

    // gets the last saved 'username' value 
    getSavedUsername(){
        return window.localStorage.getItem("username") || null;
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
                        <div className="text-center">
                            <Button width={BUTTON_WIDTH} disabled={this.state.pending}>
                                Submit
                            </Button>
                            &nbsp;
                            <Button
                                type="button"
                                width={BUTTON_WIDTH}
                                disabled={this.state.pending}
                                onClick={this.onCreate.bind(this)}
                            >
                                Create
                            </Button>
                        </div>
                    </Form>
                    <Footer/>
                </div>
            </div>
        );
    }
}