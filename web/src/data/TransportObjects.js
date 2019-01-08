import * as fw from "@davidrosenblum/frostwork";
import airship from "../img/silver.png";

// transport objects are game entities that can't move and have nodeIDs 
export class TransportObject extends fw.GameEntity{
    constructor(imgAlias, width, height, nodeID, text){
        super(fw.AssetUtils.getImageURLByAlias(imgAlias), width, height);

        this.nodeID = nodeID;
        this.setNametag(text);
        this.moveSpeed = 0;
    }
}

// creates transport objects using server-provided data
export const TransportObjectFactory = {
    create(data){
        let {type, nodeID, text} = data;

        switch(type){
            case "airship":
                return new TransportObject("airship", 100, 100, nodeID, text, nodeID, text);
            default:
                return null;
        }
    }
}

// all transport object image files (maps usable name: react image file)
fw.AssetUtils.setImageAliasMany({
    airship
});