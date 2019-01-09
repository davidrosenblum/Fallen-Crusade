import * as express from "express";
import { DatabaseController } from "../database/DatabaseController";

class AdminSetHandler{
    // http headers
    private static httpHeaders:{[header:string]: string} = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Access-Control-Allow-Headers, Access-Control-Allow-Origin, Fallen-Crusade-Key",
    };

    // handle http OPTIONS requets
    public options(req:express.Request, res:express.Response):void{
        res.writeHead(204, AdminSetHandler.httpHeaders);
        res.end();
    }

    // handle http GET requests
    public get(req:express.Request, res:express.Response, dbc:DatabaseController):void{
        // validate auth key 
        let secretKey:string = req.query["key"];
        if(secretKey !== "crucible33"){
            res.writeHead(403, AdminSetHandler.httpHeaders);
            res.end("Unauthorized access (bad auth).");
            return;
        }

        // extract parameters from query string 
        let accessLevel:number = parseInt(req.query["access_level"]) || 2;
        let username:string = req.query["username"] || null;

        // enforce parameters
        if(!username){
            res.writeHead(400, AdminSetHandler.httpHeaders);
            res.end("Please provide a username.");
            return;
        }

        // update the database
        dbc.updateAccessLevel(username, accessLevel)
            .then(response => {
                // success
                res.writeHead(200, AdminSetHandler.httpHeaders);
                res.end(response);
            })
            .catch(err => {
                // error
                res.writeHead(400, AdminSetHandler.httpHeaders);
                res.end(`Database error: ${err.message}`);
            });
    }
}

// export singleton
export default new AdminSetHandler();