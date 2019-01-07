import * as fw from "@davidrosenblum/frostwork";
import airship from "../img/silver.png";

export class TransportObject extends fw.GameEntity{
    constructor(imgAlias, width, height, nodeID, text){
        super(fw.AssetUtils.getImageURLByAlias(imgAlias), width, height);

        this.nodeID = nodeID;
        this.setNametag(text);
    }
}

export const TransportObjects = {
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

fw.AssetUtils.setImageAliasMany({
    airship
});