import * as fw from "@davidrosenblum/frostwork";
import { TILE_SIZE } from "../game/Game";
import grass from "../img/grass.png";

// holds all the map tile classes 
export const MapTiles = {
    Grass: class Grass extends fw.Sprite{
        constructor(){
            super(fw.AssetUtils.getImageURLByAlias("grass"), TILE_SIZE, TILE_SIZE);
        }
    }
};

// all map object image files (maps usable name: react image file)
fw.AssetUtils.setImageAliasMany({
    grass
});