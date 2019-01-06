import { EventEmitter } from "events";
import * as fw from "@davidrosenblum/frostwork";
import { MapTiles } from "../data/MapObjects";
import { TransportObjects } from "../data/TransportObjects";
import { GameObjects } from "../data/GameObjects";
import ModalDispatcher from "../dispatchers/ModalDispatcher";

export const TILE_SIZE = 64;

class Game extends EventEmitter{
    constructor(){
        super();

        this.renderer = new fw.Renderer(1280, 720);
        this.layers = new fw.MapLayers();
        this.objects = new fw.MPEntityStorage();
        this.keys = null;
        this.collisionGrid = null;
        this.mapBounds = null;
        this.scroller = null;
    }

    loadAssets(){
        return fw.AssetUtils.loadAliases();
    }

    async loadMap(data){
        // destroy existing map
        this.unloadMap();

        let {mapState, playerState} = data;
        let {name, mapData, transportNodes, units} = mapState;
        let {abilities, abilityPoints, gold, xp, xpNeeded, level, current, base} = playerState;
        
        let report = await this.loadAssets();
        
        let errs = report.images.errors + report.sounds.errors;
        if(errs){
            ModalDispatcher.modal(
                "Assets Error",
                `Error: ${errs} assets failed to load. The game will run, but some things might be missing.`
            );
        }

        let gmd = this.layers.buildMap({
            tileSize: TILE_SIZE,
            background: {
                tileLayout: mapData.background,
                tileTypes:  [null, MapTiles.Grass]
            },
            midground: {
                tileLayout: mapData.midground,
                tileTypes:  [null]
            },
            foreground: {
                tileLayout: mapData.foreground,
                tileTypes:  [null]
            },
        });

        this.keys = new fw.KeyboardWatcher();
        this.collisionGrid = gmd.collisionGrid;
        this.mapBounds = gmd.mapBounds;
        this.scroller = new fw.Scroller(this.renderer, this.mapBounds);

        transportNodes.forEach(tData => this.createTransportNode(tData));

        this.renderer.startRendering(this.layers.mapSprite);
    }

    unloadMap(){
        this.renderer.stopRendering();

        this.layers.removeAll();
        this.objects.clear();

        this.keys = null;
        this.collisionGrid = null;
        this.mapBounds = null;
        this.scroller = null;
    }

    createObject(data){
        let {type, col, row} = data;

        let object = GameObjects.create(type);

        if(object && this.objects.addObject(object)){
            this.layers.addAt(object, col, row);
        }
    }

    removeObject(objectID){
        let object = this.objects.getObject(objectID);
        if(object){
            object.remove();
            this.objects.removeObject(object);
        }
    }

    updateObject(data){
        this.objects.updateObject(data);
    }

    createTransportNode(data){
        console.log(data);
        let {col, row} = data.spawnLocation;
        let tnode = TransportObjects.create(data);
        if(tnode){
            this.layers.addAt(tnode, col, row);
            console.log(tnode)
        }
        else console.log("NO TNDOE")
    }

    injectInto(element){
        this.renderer.injectInto(element);
    }
}

export default new Game();