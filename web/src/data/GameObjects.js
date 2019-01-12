import * as fw from "@davidrosenblum/frostwork";
import { TILE_SIZE } from "../game/Game";
import missing from "../img/misc/missing.png";
import blacksmith from "../img/red.png";
import commander from "../img/npcs/commander.png";
import paragon from "../img/npcs/paragon.png";
import templar from "../img/npcs/templar.png";
import player1 from "../img/player_skins/skin1.png";
import player2 from "../img/player_skins/skin1.png";

export class GameObject extends fw.MPGameEntity{
    constructor(imgAlias, width, height, name, objectID, team, anim=null, moveSpeed=0){
        super(fw.AssetUtils.getImageURLByAlias(imgAlias), width, height, 0, 0, objectID, team);

        if(name) this.setNametag(name);
        if(anim) this.playAnimation(anim);
        if(moveSpeed) this.moveSpeed = moveSpeed;

        this.setCustomCollisionBounds(width, height * 0.20);
    }
}

// game skins start at 1 - so keep 0 as a dupe 
export const PlayerSkins = [
    "player1", "player1", "player2"
];

export const GameObjectFactory = {
    create(data){
        let {type, name, anim, objectID, team, moveSpeed, skin=1} = data;

        switch(type){
            case "blacksmith":
                return new GameObject("blacksmith", TILE_SIZE, TILE_SIZE*2, name, objectID, team, anim, moveSpeed);
            case "commander":
                return new GameObject("commander", TILE_SIZE, TILE_SIZE*2, name, objectID, team, anim, moveSpeed);
            case "paragon":
                return new GameObject("paragon", TILE_SIZE, TILE_SIZE*2, name, objectID, team, anim, moveSpeed);
            case "templar":
                return new GameObject("templar", TILE_SIZE, TILE_SIZE*2, name, objectID, team, anim, moveSpeed);
            case "player":
                return new GameObject(PlayerSkins[skin], TILE_SIZE, TILE_SIZE*2, name, objectID, team, anim, moveSpeed);
            default:
                return new GameObject("missing", TILE_SIZE, TILE_SIZE*2, name, objectID, team, anim, moveSpeed);
        }
    }
};

fw.AssetUtils.setImageAliasMany({
    missing, blacksmith, commander, paragon, templar, player1, player2
});