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

        this.usernameInput = null;      // username <input>
        this.passwordInput = null;      // password <input>
        this.confirmInput = null;       // confirm password <input>

        this.state = {
            pending: false              // awaiting account create response (locks UI)
        };
    }

    // clears the form text fields 
    clearForm(){
        this.usernameInput.value = "";  // clear the username <input> text
        this.passwordInput.value = "";  // clear the password <input> text
        this.confirmInput.value = "";   // clear the confirm password <input> text
    }

    // when the cancel buton is clicked...
    onCancel(){
        // show the login menu
        NavDispatcher.showLogin();
    }

    // when the form is submitted...
    onSubmit(evt){
        // prevent page reload 
        evt.preventDefault();

        // lock the UI 
        this.setState({pending: true});

        // extract username text
        let username = this.usernameInput.value;
        // extract password text
        let password = this.passwordInput.value;
        // extract confirm password text 
        let confirm = this.confirmInput.value;

        // enforce the passwords match 
        if(password !== confirm){
            // they do not - display error
            ModalDispatcher.modal("Passwords Error", "Passwords do not match.");
            // unlock UI
            this.setState({pending: false});
            return;
        }

        // generate the url for character creation API 
        let url = `${window.location.origin.replace(":3000", ":8080")}/accounts/create`;
        // get request header (cors)
        let headers = Ajax.getCorsHeaders();
        // no request query
        let query = null;
        // create a json string of the account data
        let data = JSON.stringify({username, password});

        // send the request 
        Ajax.post(url, headers, query, data)
            .then(xhr => {
                // server responded - could be good or bad
                // set header based on success (200 == success)
                let header = xhr.status === 200 ? "Account Created" : "Account Error";
                // display the response (xhr.response is server-generated)
                ModalDispatcher.modal(header, xhr.response);

                // clear input fields on success
                if(xhr.status === 200){
                    this.clearForm();
                }
            })
            .catch(() => {
                // http request error, basically request failed to send (not a 4xx or 5xx!)
                ModalDispatcher.modal("Request Error", "HTTP request failed.");
            })
            .then(() => {
                // unlock the UI 
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
                        <div className="text-center">
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
                        </div>
                    </Form>
                    <Footer/>
                </div>
            </div>
        );
    }
}