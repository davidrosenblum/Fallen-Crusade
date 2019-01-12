import React from "react";
import bannerImg from "../img/misc/banner.png";

export class Banner extends React.Component{
    render(){
        return (
            <div className="text-center">
                <h1>
                    <img
                        src={bannerImg}
                        title="Fallen Crusade"
                        alt="Fallen Crusade"
                        width="100%"
                    />
                </h1>
            </div>
        );
    }
}