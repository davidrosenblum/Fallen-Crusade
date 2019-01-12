import React from "react";
import { Form, FormGroup, Label, Input, Button, Row, Col } from "reactstrap";
import { Footer } from "./Footer";
import { Banner } from "./Banner";
import humanMale from "../img/player_previews/human_male.png";
import { NAME_MAX_LENGTH, BUTTON_WIDTH } from "../data/Data";
import Client from "../game/Client";
import NavDispatcher from "../dispatchers/NavDispatcher";
import ModalDispatcher from "../dispatchers/ModalDispatcher";

export const PREVIEWS = [humanMale];

export class CharacterCreate extends React.Component{
    constructor(props){
        super(props);

        this.nameInput = null;  // <input> element for the name
        this.skinInput = null;  // <input> element for the skin (dropdown)

        this.state = {
            pending:    false,      // awaiting response (locks UI)
            previewNum: 0           // skin selected (corresponds with previews array)
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
                <div className="app-menu">
                    <br/>
                    <Banner/>
                    <br/>
                    <h2 className="text-center">Create Your Hero</h2>
                    <br/>
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
                        <br/>
                        <FormGroup>
                            <Label>Appearance</Label>
                            <Row>
                                <Col lg={6}>
                                    <Input
                                        innerRef={input => this.skinInput = input}
                                        type="select"
                                        disabled={this.state.pending}
                                        required
                                    >
                                        <option value={1}>Male Mage</option>
                                    </Input>
                                </Col>
                                <Col lg={6} className="text-center">
                                    <img 
                                        src={PREVIEWS[this.state.previewNum]}
                                        width={64}
                                        title="Preview"
                                        onContextMenu={evt => evt.preventDefault()}
                                    />
                                </Col>
                            </Row>
                        </FormGroup>
                        <br/>
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
                    <br/>
                    <Footer/>
                </div>
            </div>
        );
    }
}