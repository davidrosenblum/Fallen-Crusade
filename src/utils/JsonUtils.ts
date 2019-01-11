// utilities for using json
export class JsonUtils{
    // parses json string to object with callback instead of using try-catch block
    public static parseString(str:string, callback:(err?:Error, json?:any)=>void):void{
        let json:any = null;
        try{
            // attempt parse
            json = JSON.parse(str);
        }
        catch(err){
            // parse error
            callback(err, null);
            return;
        }

        // success
        callback(null, json);
    }
}