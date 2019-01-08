import * as fw from "@davidrosenblum/frostwork";
import blacksmith from "../img/red.png";
import paragon from "../img/red.png";
import templar from "../img/red.png";
import player from "../img/blue.png";

export class GameObject extends fw.MPGameEntity{
    constructor(imgAlias, width, height, name, objectID, team, anim){
        super(fw.AssetUtils.getImageURLByAlias(imgAlias), width, height, 0, 0, objectID, team);

        if(name) this.setNametag(name);
        if(anim) this.playAnimation(anim);
    }
}

export const GameObjectFactory = {
    create(data){
        let {type, name, anim, objectID, team} = data;

        switch(type){
            case "blacksmith":
                return new GameObject("blacksmith", 100, 100, name, objectID, team, anim);
            case "paragon":
                return new GameObject("paragon", 100, 100, name, objectID, team, anim);
            case "templar":
                return new GameObject("templar", 100, 100, name, objectID, team, anim);
            case "player":
                return new GameObject("player", 100, 100, name, objectID, team, anim);
            default:
                return null;
        }
    }
};

fw.AssetUtils.setImageAliasMany({
    blacksmith, paragon, templar, player
})