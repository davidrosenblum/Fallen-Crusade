import { EventEmitter } from "events";
import * as fw from "@davidrosenblum/frostwork";
import { MapTiles } from "../data/MapObjects";
import { TransportObjects } from "../data/TransportObjects";
import { GameObjects } from "../data/GameObjects";
import Client from "./Client";
import ModalDispatcher from "../dispatchers/ModalDispatcher";

export const TILE_SIZE = 64;

fw.TextField.defaultFont = "15px electrolize";

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
        this.player = null;

        this.selectedTarget = null;
        this.selectionBox = {draw(ctx, x, y){ ctx.strokeRect(x, y, this.selectTarget.width, this.selectTarget.height) }};

        this.renderer.on("render", this.onGameFrame.bind(this));
        this.renderer.on("click", evt => this.layers.processClick(evt));

        this.started = false;
        this.todo = [];
    }

    loadAssets(){
        return fw.AssetUtils.loadAliases();
    }

    async loadMap(mapState){
        // destroy existing map
        this.unloadMap();

        let {name, mapData, transportNodes, units} = mapState;
        
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
        this.keys.onKey("+", () => this.layers.toggleMapGrid());
        this.collisionGrid = gmd.collisionGrid;
        this.mapBounds = gmd.mapBounds;
        this.scroller = new fw.Scroller(this.renderer, this.mapBounds);

        transportNodes.forEach(tData => this.createTransportNode(tData));
        units.forEach(uData => this.createObject(uData));

        this.renderer.startRendering(this.layers.mapSprite);

        this.started = true;
        this.todo.forEach(task => task());
        this.todo = [];
    }

    unloadMap(){
        this.started = false;
        this.renderer.stopRendering();

        this.layers.removeAll();
        this.objects.clear();

        this.keys = null;
        this.collisionGrid = null;
        this.mapBounds = null;
        this.scroller = null;
        this.player = null;
    }

    createObject(data){
        if(!this.started){
            this.todo.push(() => this.createObject(data));
            return;
        }

        let {x, y, spawnLocation} = data;
        let object = GameObjects.create(data);

        if(object && this.objects.addObject(object)){
            if(spawnLocation){
                let {col, row} = spawnLocation;
                this.layers.addAt(object, col, row);
            }
            else{
                object.setPosition(x, y);
                this.layers.add(object);
            }

            if(data.type === "player" && data.ownerID === Client.clientID){
                // player found
                this.player = object;
                object.on("move", () => Client.playerUpdate(object.getData()));

                Client.getObjectStats(object.objectID);
                Client.getAbilityList();
            }

            object.on("click", () => this.selectTarget(object));
        }
    }

    removeObject(objectID){
        if(!this.started){
            this.todo.push(() => this.removeObject(objectID));
            return;
        }

        let object = this.objects.getObject(objectID);
        if(object){
            object.remove();
            this.objects.removeObject(object);
        }
    }

    updateObject(data){
        if(!this.started){
            this.todo.push(() => this.updateObject(data));
            return;
        }

        this.objects.updateObject(data);
    }

    createTransportNode(data){
        let {col, row} = data.spawnLocation;
        let tnode = TransportObjects.create(data);
        if(tnode){
            this.layers.addAt(tnode, col, row);
        }
    }

    injectInto(element){
        this.renderer.injectInto(element);
    }

    selectTarget(target){
        this.unselectTarget();

        this.selectedTarget = target;
        
        Client.getObjectStats(target.objectID);
    }

    unselectTarget(){
        if(this.selectedTarget){
            // something? 
        }
        this.selectedTarget = null;
    }

    castAbility(abilityName){
        if(this.selectedTarget){
            Client.castAbility(abilityName, this.selectedTarget.objectID);
        }
    }

    onGameFrame(){
        if(this.player && this.keys.numKeys > 0){
            if(this.keys.isKeyDown("w")){
                this.player.moveUp(this.collisionGrid, this.mapBounds, this.scroller);
            }
            else if(this.keys.isKeyDown("s")){
                this.player.moveDown(this.collisionGrid, this.mapBounds, this.scroller);
            }
            if(this.keys.isKeyDown("a")){
                this.player.moveLeft(this.collisionGrid, this.mapBounds, this.scroller);
            }
            else if(this.keys.isKeyDown("d")){
                this.player.moveRight(this.collisionGrid, this.mapBounds, this.scroller);
            }

            this.layers.depthSort();
        }
    }
}

export default new Game();