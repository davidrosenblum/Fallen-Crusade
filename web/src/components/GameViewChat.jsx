import React from "react";
import Client from "../game/Client";

export class GameViewChat extends React.Component{
    constructor(props){
        super(props);

        this.displayRef = React.createRef();
        this.inputRef = React.createRef();

        this.onChatReceived = evt => {
            if(evt.status === "ok"){
                let elem = this.displayRef.current;
                let text = evt.from ? `${evt.from}: ${evt.chat}` : evt.chat;

                if(elem.value){
                    elem.value += "\n" + text;
                }
                else{
                    elem.value = text;
                }
            }
        };
    }

    componentDidMount(){
        Client.on("chat", this.onChatReceived);
    }

    componentWillUnmount(){
        Client.removeListener("chat", this.onChatReceived);
    }

    onChatSend(evt){
        if(evt.keyCode === 13){
            let chat = this.inputRef.current.value;
            if(chat){
                Client.chatMessage(chat);
                this.inputRef.current.value = "";
            }
        }
    }

    render(){
        return (
            <div className="hud-chat">
                <textarea
                    ref={this.displayRef}
                    readOnly
                />
                <br/>
                <input
                    ref={this.inputRef}
                    type="text"
                    maxLength={128}
                    onKeyUp={this.onChatSend.bind(this)}
                />
            </div>
        );
    }
}