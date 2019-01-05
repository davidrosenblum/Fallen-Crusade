import * as express from "express";

export class RequestParser{
    public static parseHttpJson(req:express.Request):Promise<any>{
        return new Promise((resolve, reject) => {
            // holds future data chunks 
            let buffer:string[] = [];

            // http load error
            req.on("error", err => reject(err));

            // data chunk streamed
            req.on("data", chunk => buffer.push(chunk));

            // all data chunks received 
            req.on("end", () => {
                let json:any = null;

                // attempt to parse the json string 
                try{
                    json = JSON.parse(buffer.join(""));
                }
                catch(err){
                    // json parse error
                    reject(err);
                    return;
                }

                resolve(json);
            });
        });
    }
}