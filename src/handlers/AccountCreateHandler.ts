import * as express from "express";
import { DatabaseController } from '../database/DatabaseController';
import { RequestParser } from "../utils/RequestParser";

class AccountCreateHandler{
    private static httpHeaders:{[header:string]: string} = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Access-Control-Allow-Headers, Access-Control-Allow-Origin, Content-Type",
        "Content-Type": "json"
    };

    public options(req:express.Request, res:express.Response):void{
        res.writeHead(204, AccountCreateHandler.httpHeaders);
        res.end();
    }

    public post(req:express.Request, res:express.Response, dbc:DatabaseController):void{
        // parse the post body json 
        RequestParser.parseHttpJson(req)
            .then(json => {
                // parse complete - extract properties 
                let {username=null, password=null} = json;

                // enforce properties 
                if(username && password){
                    // properties exist 
                    dbc.createAccount(username, password)
                        .then(result => {
                            // account created
                            res.writeHead(200, AccountCreateHandler.httpHeaders);
                            res.end(result);
                        })
                        .catch(err => {
                            // failed to create account
                            res.writeHead(400, AccountCreateHandler.httpHeaders);
                            res.end(err.message);
                        });
                }
                else{
                    // properties missing 
                    res.writeHead(400, AccountCreateHandler.httpHeaders);
                    res.end("Invalid json schema.");
                }
            })
            .catch(err => {
                // json parse error OR http load error (bad request)
                res.writeHead(400, AccountCreateHandler.httpHeaders);
                res.end("Error parsing request json.");
            });
    }
}

export default new AccountCreateHandler();