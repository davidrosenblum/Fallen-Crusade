import * as fw from "@davidrosenblum/frostwork";
import airship from "../img/silver.png";

export class TransportObject extends fw.GameEntity{
    constructor(image, width, height, nodeID, text){
        super(image, width, height);

        this.nodeID = nodeID;
        this.setNametag(text);
    }
}

export const TransportObjects = {
    Airship: class Airship extends TransportObject{
        constructor(nodeID, text){
            super(fw.AssetUtils.getImageURLByAlias("airship"), 100, 100, nodeID, text);
        }
    },

    create(data){
        let {type, nodeID, text} = data;

        switch(type){
            case "airship":
                return new TransportObjects.Airship(nodeID, text);
            default:
                return null;
        }
    }
}

fw.AssetUtils.setImageAliasMany({
    airship
});