import React from "react";
import Client from "../game/Client";

export class GameViewChat extends React.Component{
    constructor(props){
        super(props);

        this.displayRef = React.createRef();
        this.inputRef = React.createRef();

        // handler for when the client receives chat messages 
        this.onChatReceived = evt => {
            // must receive a good update 
            if(evt.status === "ok"){
                // get the chat display <textarea> element
                let elem = this.displayRef.current;
                // formate the new text ('from' might not be provided)
                let text = evt.from ? `${evt.from}: ${evt.chat}` : evt.chat;

                // upate the <textarea> 
                if(elem.value){
                    // put new text underneath old text 
                    elem.value += "\n" + text;
                }
                else{
                    // no text - make display text the first chat message
                    elem.value = text;
                }
            }
        };
    }

    componentDidMount(){
        // listen for the client to get a chat message
        Client.on("chat", this.onChatReceived);
    }

    componentWillUnmount(){
        // stop listening for the client to get chat messages (prevents leak)
        Client.removeListener("chat", this.onChatReceived);
    }

    // sends a chat message
    onChatSend(evt){
        // 13 = enter key 
        if(evt.keyCode === 13){
            // get the chat message from the DOM
            let chat = this.inputRef.current.value;
            // must have chat to send (pointless to send empty text)
            if(chat){
                // send the chat
                Client.chatMessage(chat);
                // clear the chat input 
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