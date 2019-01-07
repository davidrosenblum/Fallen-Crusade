import * as fw from "@davidrosenblum/frostwork";
import { TILE_SIZE } from "../game/Game";
import grass from "../img/grass.png";

export const MapTiles = {
    Grass: class Grass extends fw.Sprite{
        constructor(){
            super(fw.AssetUtils.getImageURLByAlias("grass"), TILE_SIZE, TILE_SIZE);
        }
    }
};

fw.AssetUtils.setImageAliasMany({
    grass
});