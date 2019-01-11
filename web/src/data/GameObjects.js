import * as fw from "@davidrosenblum/frostwork";
import blacksmith from "../img/red.png";
import paragon from "../img/npcs/paragon.png";
import templar from "../img/npcs/templar.png";
import player1 from "../img/player_skins/skin1.png";
import player2 from "../img/player_skins/skin1.png";

export class GameObject extends fw.MPGameEntity{
    constructor(imgAlias, width, height, name, objectID, team, anim){
        super(fw.AssetUtils.getImageURLByAlias(imgAlias), width, height, 0, 0, objectID, team);

        if(name) this.setNametag(name);
        if(anim) this.playAnimation(anim);
    }
}

// game skins start at 1 - so keep 0 as a dupe 
export const PlayerSkins = [
    "player1", "player2", "player3"
];

export const GameObjectFactory = {
    create(data){
        let {type, name, anim, objectID, team, skin=1} = data;

        switch(type){
            case "blacksmith":
                return new GameObject("blacksmith", 64, 128, name, objectID, team, anim);
            case "paragon":
                return new GameObject("paragon", 64, 128, name, objectID, team, anim);
            case "templar":
                return new GameObject("templar", 64, 128, name, objectID, team, anim);
            case "player":
                return new GameObject(PlayerSkins[skin], 64, 128, name, objectID, team, anim);
            default:
                return null;
        }
    }
};

fw.AssetUtils.setImageAliasMany({
    blacksmith, paragon, templar, player1, player2
})