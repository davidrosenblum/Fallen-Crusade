import * as fs from "fs";

export interface Settings{
    port:number;
    mongo_uri:string;
}

export class SettingsUtils{
    // settings file name 
    private static readonly PATH:string = "settings.json";

    // default settings 
    private static defaultSettings:Settings = {
        port: 8080,
        mongo_uri: "mongodb://localhost:27017/fallen_crusade"
    };

    // fills out any missing or wrong (datatype) in the settings object
    // overrides parameter object
    private static provideDefaultOpts(settings:Settings):Settings{
        for(let opt in this.defaultSettings){
            if(typeof settings[opt] !== typeof this.defaultSettings[opt]){
                settings[opt] = this.defaultSettings[opt];
            }
        }
        return settings;
    }

    // loads and parses the settings file, automatically looks for invalid/missing properties 
    public static load():Promise<Settings>{
        return new Promise((resolve, reject) => {
            fs.readFile(this.PATH, (err, buffer) => {
                if(!err){
                    let json:Settings = null;

                    try{
                        json = JSON.parse(buffer.toString());
                    }
                    catch(err){
                        // json parse error
                        reject(err);
                        return;
                    }

                    resolve(this.provideDefaultOpts(json));
                }
                else if(err.errno === -4058){
                    this.writeDefault()
                        .then(settings => resolve(settings))
                        .catch(err => reject(err));
                }
                else reject(err);
            });
        });
    }

    // writes the default settings json file 
    public static writeDefault():Promise<Settings>{
        return new Promise((resolve, reject) => {
            let settingsCopy:Settings = this.copyDefaultSettings();
            fs.writeFile(this.PATH, JSON.stringify(settingsCopy, null, 4), err => {
                err ? reject(err) : resolve(settingsCopy);
            });
        });
    }

    // creates a copy the default settings object
    public static copyDefaultSettings():Settings{
        return Object.assign({}, this.defaultSettings);
    }
}