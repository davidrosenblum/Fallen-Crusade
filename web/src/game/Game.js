import * as fw from "@davidrosenblum/frostwork";
import { EventEmitter } from "events";
import { GameObjectFactory } from "../data/GameObjects";
import { MapTiles } from "../data/MapObjects";
import { TransportObjectFactory } from "../data/TransportObjects";
import Client from "./Client";
import ModalDispatcher from "../dispatchers/ModalDispatcher";

// how big each tile square is for the game (game is tile-based)
export const TILE_SIZE = 64;

// default font for each unit's nametag and any floating game text 
fw.TextField.defaultFont = "15px electrolize";

// game singleton
class Game extends EventEmitter{
    constructor(){
        super();

        this.renderer = new fw.Renderer(1280, 720);     // the renderer (has the canvas)
        this.layers = new fw.MapLayers();               // map layers (background, midground, foreground)
        this.objects = new fw.MPEntityStorage();        // game object updater
        this.keys = null;                               // keyboard input listener
        this.collisionGrid = null;                      // has every static collidable object stored
        this.mapBounds = null;                          // the bounds of the map
        this.scroller = null;                           // performs x-y scrolling
        this.player = null;                             // the player object

        // current selected game object
        this.selectedTarget = null;

        // process everything required for next frame before the underlying framework is renders
        this.renderer.on("render", this.onGameFrame.bind(this));
        // when the renderer's canvas is clicked, have the layers object determine if a game object is at the mouse 
        this.renderer.on("click", evt => this.layers.processClick(evt));

        // game is not started and ready to receive tasks
        this.started = false;
        this.todo = [];
    }

    // preloads assets (marked in the /data folder)
    loadAssets(){
        // since file paths can be long and weird
        // each asset is mapped to a friendly name (like player instead of foo/bar/player.png)
        // and all marked assets can be asychronously loaded at once 
        return fw.AssetUtils.loadAliases();
    }

    // asychronously loads the map 
    // mapState is provided by the server 
    async loadMap(mapState){
        // destroy existing map
        this.unloadMap();

        // extract response data
        // ({name} also in mapState)
        let {mapData, transportNodes, units} = mapState;
        
        // asychronously load all assets (wait for this to complete)
        let report = await this.loadAssets();
        
        // calculate the total amount of assets failed to load (hopefully 0!) 
        let errs = report.images.errors + report.sounds.errors; 
        if(errs){
            // 1+ errors found - alert the user that assets failed to load
            // (game continues)
            ModalDispatcher.modal(
                "Assets Error",
                `Error: ${errs} assets failed to load. The game will run, but some things might be missing.`
            );
        }

        // build the map, which returns the GMD (generated map data - includes bounds & collision data)
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

        // instantiate the keyboard listener (used for keyboard inputs)
        this.keys = new fw.KeyboardWatcher();
        // click '+' to toggle map grid 
        this.keys.onKey("+", () => this.layers.toggleMapGrid());
        // collision grid for collision detection, relative to loaded map
        this.collisionGrid = gmd.collisionGrid;
        // get the bounds (top, left, bottom, right) of the map 
        this.mapBounds = gmd.mapBounds;
        // scroller to have X-Y scrolling 
        this.scroller = new fw.Scroller(this.renderer, this.mapBounds);

        // create each transport node 
        transportNodes.forEach(tData => this.createTransportNode(tData));
        // create each game object (synonymous in the code as 'unit')
        units.forEach(uData => this.createObject(uData));

        // begin rendering the game
        this.renderer.startRendering(this.layers.mapSprite);

        // game at this point is considered initialized
        this.started = true;
        // process every task that occurred between the server entering this client in the map and now 
        this.todo.forEach(task => task());
        // reset the task list for next time 
        this.todo = [];
    }

    // destroys the current map
    // game stops listening for inputs and stops rendering 
    unloadMap(){
        // the game is no longer initialized
        this.started = false;
        // stop renderings
        this.renderer.stopRendering();

        // remove all objects from all draw lists
        this.layers.removeAll();
        // reset object updater 
        this.objects.clear();

        // nullify fields relevant to current map 
        this.keys = null;
        this.collisionGrid = null;
        this.mapBounds = null;
        this.scroller = null;
        this.player = null;
    }

    // creates a game object
    createObject(data){
        // if the game has not started, process this when the game begins
        // (handles case were create object update comes while the game is still initializing)
        if(!this.started){
            this.todo.push(() => this.createObject(data));
            return;
        }

        // extract possible location of object
        let {x, y, spawnLocation} = data;
        // create the object 
        let object = GameObjectFactory.create(data);

        // if the object was created and successfully added...
        if(object && this.objects.addObject(object)){
            // position the object
            // use spawn location (col-row), fallback to pixel position (x-y)
            if(spawnLocation){
                // extract column & row
                let {col, row} = spawnLocation;
                // place the object
                this.layers.addAt(object, col, row);
            }
            else{
                // no col-row provided, position at current x-y point 
                this.layers.add(object);
                object.setPosition(x, y);
            }

            // select any object when it is clicked 
            object.on("click", () => this.selectTarget(object));

            // check if the object is the current player 
            if(data.type === "player" && data.ownerID === Client.clientID){
                // player found!
                this.player = object;
                // update the server on validated movements 
                object.on("move", () => Client.playerUpdate(object.getData()));
                // load the current stats and abilities 
                Client.getObjectStats(object.objectID);
                Client.getAbilityList();
            }
        }
    }

    // removes an object from the game (won't be rendered or updated)
    removeObject(objectID){
        // if the game has not started, process this when the game begins
        // (handles case were delete object update comes while game is still initializing)
        if(!this.started){
            this.todo.push(() => this.removeObject(objectID));
            return;
        }

        // find the object
        let object = this.objects.getObject(objectID);
        // if the object exists (it always should), remove it from rendering and updater
        if(object){
            object.remove();
            this.objects.removeObject(object);

            // selected target just deleted?
            if(Game.selectedTarget && Game.selectedTarget.objectID === objectID){
                Game.unselectTarget();
            }
        }
    }

    // updates a game object (animation, position, etc)
    updateObject(data){
        // if the game has not started, process this when the game begins
        // (handles case were update object comes while game is still initializing)
        if(!this.started){
            this.todo.push(() => this.updateObject(data));
            return;
        }

        // tell the updater to update apply the object update
        this.objects.updateObject(data);
    }

    // creates a transport node object 
    // used for requesting to enter a new map 
    createTransportNode(data){
        // get the spawn location (tile points, not x-y)
        let {col, row} = data.spawnLocation;
        // create the object
        let tnode = TransportObjectFactory.create(data);
        // if successful, add it to the game 
        if(tnode){
            this.layers.addAt(tnode, col, row);
        }
    }

    // injects the <canvas> into the DOM 
    // (not very reactful)
    injectInto(element){
        this.renderer.injectInto(element);
    }

    // selects an object - requests the target's stats (triggers UI update)
    selectTarget(target){
        // remove current selection
        this.unselectTarget();
        // store new target
        this.selectedTarget = target;
        // get target stats (triggers UI update)
        Client.getObjectStats(target.objectID);
    }

    // cancels current target selection 
    unselectTarget(){
        // must have a target 
        if(this.selectedTarget){
            // (remove any changes made)
            // remove now previous target
            this.selectedTarget = null;
        }
    }

    // submits a cast ability request to the server 
    castAbility(abilityName){
        // must have a target
        if(this.selectedTarget){
            // send the request 
            Client.castAbility(abilityName, this.selectedTarget.objectID);
        }
    }

    // immediately before rendering the next frame... 
    onGameFrame(){
        // check for movement input if a player exists and if at least 1 key is pressed 
        if(this.player && this.keys.numKeys > 0){
            // move up? 
            if(this.keys.isKeyDown("w")){
                this.player.moveUp(this.collisionGrid, this.mapBounds, this.scroller);
            }
            // move down?
            else if(this.keys.isKeyDown("s")){
                this.player.moveDown(this.collisionGrid, this.mapBounds, this.scroller);
            }
            // move left? 
            if(this.keys.isKeyDown("a")){
                this.player.moveLeft(this.collisionGrid, this.mapBounds, this.scroller);
            }
            // move right?
            else if(this.keys.isKeyDown("d")){
                this.player.moveRight(this.collisionGrid, this.mapBounds, this.scroller);
            }

            // depth sort the game (midground) layer 
            this.layers.depthSort();
        }
    }
}

// export singleton 
export default new Game();