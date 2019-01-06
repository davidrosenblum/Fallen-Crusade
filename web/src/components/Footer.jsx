import React from "react";
import { CLIENT_VERSION } from "./../game/Client";

export class Footer extends React.Component{
    render(){
        return (
            <footer className="text-center">
                <hr/>
                David Rosenblum, 2019 | v{CLIENT_VERSION}
            </footer>
        );
    }
}