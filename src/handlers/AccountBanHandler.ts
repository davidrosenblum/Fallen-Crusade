import * as express from "express";
import { DatabaseController } from "../database/DatabaseController";

class AccountBanHandler{
    // http headers
    private static httpHeaders:{[header:string]: string} = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Access-Control-Allow-Headers, Access-Control-Allow-Origin, Fallen-Crusade-Key",
    };

    // handle http OPTIONS requests
    public options(req:express.Request, res:express.Response):void{
        res.writeHead(204, AccountBanHandler.httpHeaders);
        res.end();
    }

    // handle http GET requests
    public get(req:express.Request, res:express.Response, dbc:DatabaseController):void{
        // validate auth key 
        let secretKey:string = req.query["key"];
        if(secretKey !== "crucible33"){
            res.writeHead(403, AccountBanHandler.httpHeaders);
            res.end("Unauthorized access (bad auth).");
            return;
        }

        // extract parameters from query string 
        let username:string = req.query["username"] || null;
        if(!username){
            res.writeHead(400, AccountBanHandler.httpHeaders);
            res.end("Please provide a username.");
            return;
        }

        // validate ban is 'true' or 'false'
        if(req.query["ban"] !== "true" && req.query["ban"] !== "false"){
            res.writeHead(400, AccountBanHandler.httpHeaders);
            res.end("Please specify ban=true or ban=false.");
            return;
        }

        // convert ban to boolean 
        let ban:boolean = req.query["ban"] === "true";

        // update the database
        dbc.updateAccountBan(username, ban)
            .then(response => {
                // success
                res.writeHead(200, AccountBanHandler.httpHeaders);
                res.end(response);
            })
            .catch(err => {
                // error
                res.writeHead(400, AccountBanHandler.httpHeaders);
                res.end(`Database error: ${err.message}`);
            });
    }
}

// export singleton
export default new AccountBanHandler();