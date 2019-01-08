import React from "react";
import { Form, FormGroup, Label, Input, Button, Row, Col } from "reactstrap";
import { NAME_MAX_LENGTH, BUTTON_WIDTH } from "../data/Data";
import Client from "../game/Client";
import NavDispatcher from "../dispatchers/NavDispatcher";
import ModalDispatcher from "../dispatchers/ModalDispatcher";

export class CharacterCreate extends React.Component{
    constructor(props){
        super(props);

        this.nameInput = null;  // <input> element for the name
        this.skinInput = null;  // <input> element for the skin (dropdown)

        this.state = {
            pending: false      // awaiting response (locks UI)
        };

        // handler for when the client receives a character create response 
        this.onCharacterCreate = evt => {
            // got a response 
            if(evt.status === "ok"){
                // successful response - show the character select menu
                // (will have the new character in its slot)
                NavDispatcher.showMenu("character-select");
            }
            else{
                // failed response
                // display error message
                ModalDispatcher.modal("Character Error", evt.message);
                // unlock UI 
                this.setState({pending: false});
            }
        };
    }

    componentDidMount(){
        // listen for the client to recieve a character create response 
        Client.on("character-create", this.onCharacterCreate);
    }

    componentWillUnmount(){
        // stop listening for the client to recieve a character create response (prevents leak)
        Client.removeListener("character-create", this.onCharacterCreate);
    }

    // when the click button is clicked
    onCancel(){
        // show the character select menu 
        NavDispatcher.showMenu("character-select");
    }

    // when the form is submitted (enforces 'required' elements)
    onSubmit(evt){
        evt.preventDefault();               // prevent page reload 

        this.setState({pending: true});     // lock the UI

        let name = this.nameInput.value;    // extract name
        let skin = this.skinInput.value;    // extract skin

        Client.createCharacter(name, skin); // send the request
    }

    render(){
        return (
            <div>
                <br/>
                <div className="app-menu">
                    <Form onSubmit={this.onSubmit.bind(this)}>
                        <FormGroup>
                            <Label>Name</Label>
                            <Input
                                innerRef={input => this.nameInput = input}
                                type="text"
                                maxLength={NAME_MAX_LENGTH}
                                disabled={this.state.pending}
                                required
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label>Skin</Label>
                            <Row>
                                <Col lg={6}>
                                    <Input
                                        innerRef={input => this.skinInput = input}
                                        type="select"
                                        disabled={this.state.pending}
                                        required
                                    >
                                        <option value={1}>Human Male</option>
                                        <option value={2}>Human Female</option>
                                    </Input>
                                </Col>
                                <Col lg={6}>
                                    (Preview)
                                </Col>
                            </Row>
                        </FormGroup>
                        <div className="text-center">
                            <Button>
                                Submit
                            </Button>
                            &nbsp;
                            <Button type="button" width={BUTTON_WIDTH} onClick={this.onCancel.bind(this)}>
                                Cancel
                            </Button>
                        </div>
                    </Form>
                </div>
            </div>
        );
    }
}