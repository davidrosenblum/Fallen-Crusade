import React from "react";
import { Form, FormGroup, Label, Input, Button, Row, Col } from "reactstrap";
import { NAME_MAX_LENGTH, BUTTON_WIDTH } from "../data/Data";
import Client from "../game/Client";
import NavDispatcher from "../dispatchers/NavDispatcher";
import ModalDispatcher from "../dispatchers/ModalDispatcher";

export class CharacterCreate extends React.Component{
    constructor(props){
        super(props);

        this.nameInput = null;
        this.skinInput = null;

        this.state = {
            pending: false
        };

        this.onCharacterCreate = evt => {
            if(evt.status === "ok"){
                NavDispatcher.showMenu("character-select");
            }
            else{
                ModalDispatcher.modal("Character Error", evt.message);
                this.setState({pending: false});
            }
        };
    }

    componentDidMount(){
        Client.on("character-create", this.onCharacterCreate);
    }

    componentWillUnmount(){
        Client.removeListener("character-create", this.onCharacterCreate);
    }

    onCancel(){
        NavDispatcher.showMenu("character-select");
    }

    onSubmit(evt){
        evt.preventDefault();

        this.setState({pending: true});

        let name = this.nameInput.value;
        let skin = this.skinInput.value;

        Client.createCharacter(name, skin);
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