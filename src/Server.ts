import * as express from "express";
import * as http from "http";
import * as websocket from "websocket";
import { MongoClient } from "mongodb";
import AccountCreateHandler from "./handlers/AccountCreateHandler";
import { SettingsUtils, Settings } from './utils/SettingsUtils';
import { DatabaseController } from './database/DatabaseController';
import { GameController } from './game/GameController';
import { NPCDocument } from './database/NPCsCollection';
import { NPCFactory } from "./characters/NPCFactory";

export class Server{
    private _app:express.Application;       // express application helps to handle http requests
    private _httpServer:http.Server;        // http server hanldes http connections
    private _wsServer:websocket.server;     // websocket server handles websocket connections
    private _mongo:MongoClient;             // mongo client is the database connection
    private _database:DatabaseController;   // database is the database controller
    private _game:GameController;           // game is the game controler
    private _shuttingDown:boolean;          // server shutdown started or not 

    constructor(){
        // create the express handler app, also serves static files from the /web folder
        this._app = express().use(express.static(`${__dirname}/../../web`));
        // create the http server, use the express app as the handler
        this._httpServer = http.createServer(this._app);
        // create the websocket server, uses the existing http server
        this._wsServer = new websocket.server({httpServer: this._httpServer});
        // hold mongo client (set in init)
        this._mongo = null;
        // hold the database controller (set in init)
        this._database = null;
        // hold the game controller (set in init)
        this._game = null;
        // server in shutdown phase? 
        this._shuttingDown = false;

        // listen for websocket connections
        this._wsServer.on("request", this.onWebSocket.bind(this));

        // setup http routing
        this.createRoutes();
        // start the server 
        this.init();
    }

    // shuts down the server 
    public close():void{
        // close http server (kills connections / requests)
        this._httpServer.close(() => {
            // once server is down, terminate database connection (this is sync?)
            this._mongo.close();
            console.log("\nDatabase disconnected.");
            console.log("Server offline.\n");
        });
    }

    // integrates a websocket connection into the game system 
    private onWebSocket(request:websocket.request):void{
        // accept the connection
        let conn:websocket.connection = request.accept(null, "*");

        // give the connection to the game 
        this._game.handleConnection(conn);
    }

    // http routing with express 
    private createRoutes():void{
        // serve web client 
        this._app.get("/", (req, res) => res.sendFile("index.html"));

        // killswitch :) 
        this._app.get("/killswitch/engage", (req, res) => {
            if(!this._shuttingDown){
                this._shuttingDown = true;
                let s:number = 30 // delay in seconds

                console.log("KILLSWITCH: ENGAGE");
                console.log(`Terminating in ${s} seconds.`)
                setTimeout(() => this.close(), 1000 * s);
            }
        });

        // account creation handler 
        this._app.options("/accounts/create", (req, res) => {
            AccountCreateHandler.options(req, res);
        });
        this._app.post("/accounts/create", (req, res) => {
            AccountCreateHandler.post(req, res, this._database);
        });
    }

    // initializes the server 
    private async init():Promise<any>{
        try{
            // step 1: load settings file
            // (missing file does NOT throw an error)
            console.log("Loading settings...");
            let settings:Settings = await SettingsUtils.load();

            // settings file loaded and parsed
            console.log("Settings loaded.\n");

            // step 2: connect to the database
            console.log("Connecting to MongoDB...");
            
            // get database variables - check for command line argument, fallback to settings file 
            let mongoUri:string = process.env.MONGO_URI || settings.mongo_uri;
            let mongoDbName:string = mongoUri.split("/").pop();

            // begin connection 
            let client:MongoClient = await MongoClient.connect(mongoUri, {useNewUrlParser: true});

            // connected! 
            console.log("Connected to database.\n");

            // create the database controller 
            this._database = new DatabaseController(client.db(mongoDbName));
            // store connection 
            this._mongo = client;

            // step 3 load required collections
            console.log("Loading game data...");
            let npcs:NPCDocument[] = await this._database.loadNPCs();

            // create NPCs if none are found! 
            if(!npcs.length){
                console.log("\t(Creating default NPCs)");
                await this._database.insertDefaultNPCs();
                npcs = await this._database.loadNPCs();
            }
        
            // store npc types from the database
            NPCFactory.setNPCTypes(npcs);

            // create the game
            this._game = new GameController(this._database, settings);

            // data loaded
            console.log("Game data loaded.\n");

            // step 4: start the server
            // get server variables - check for command line aerugment, fallback to settings file
            let port:number = parseInt(process.env.PORT) || settings.port;
            this._httpServer.listen(port, () => {
                // server listening! 
                console.log(`Server listening on port ${port}.\n`);
            })

        }
        catch(err){
            // something went wrong 
            console.log(err.message);
            process.exit();
        }
    }
}

// main method 
if(require.main === module){
    new Server();
}