import * as express from "express";
import { GameController } from "../game/GameController";

class MapStatsHandler{
    // http headers
    private static httpHeaders:{[header:string]: string} = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Access-Control-Allow-Headers, Access-Control-Allow-Origin",
    };

    // handle http OPTIONS requests
    public options(req:express.Request, res:express.Response):void{
        res.writeHead(204, MapStatsHandler.httpHeaders);
        res.end();
    }

    // handle http GET requests
    public get(req:express.Request, res:express.Response, gc:GameController):void{
        // send a json string of the world map states 
        res.writeHead(200, MapStatsHandler.httpHeaders);
        res.end(JSON.stringify(gc.getMapStats(), null, 4));
    }
}

// export singleton
export default new MapStatsHandler();