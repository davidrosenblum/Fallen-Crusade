import * as fw from "@davidrosenblum/frostwork";
import { TILE_SIZE } from "../game/Game";
import grass from "../img/environment/grass.png";
import stonewall from "../img/environment/stonewall.png";

// holds all the map tile classes 
export const MapTiles = {
    Grass: class Grass extends fw.Sprite{
        constructor(){
            super(fw.AssetUtils.getImageURLByAlias("grass"), TILE_SIZE, TILE_SIZE);
        }
    },

    StoneWall: class StoneWall extends fw.Sprite{
        constructor(){
            super(fw.AssetUtils.getImageURLByAlias("stonewall"), TILE_SIZE, TILE_SIZE * 2.5);
        }
    }
};

// all map object image files (maps usable name: react image file)
fw.AssetUtils.setImageAliasMany({
    grass, stonewall
});