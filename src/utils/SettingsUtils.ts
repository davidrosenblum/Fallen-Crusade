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
        for(let opt in SettingsUtils.defaultSettings){
            if(typeof settings[opt] !== typeof SettingsUtils.defaultSettings[opt]){
                settings[opt] = SettingsUtils.defaultSettings[opt];
            }
        }
        return settings;
    }

    // loads and parses the settings file, automatically looks for invalid/missing properties 
    public static load():Promise<Settings>{
        return new Promise((resolve, reject) => {
            fs.readFile(SettingsUtils.PATH, (err, buffer) => {
                if(!err){
                    let json:Settings = null;

                    try{
                        json = JSON.parse(buffer.toString());
                    }
                    catch(err){
                        reject(err);
                        return;
                    }

                    resolve(SettingsUtils.provideDefaultOpts(json));
                }
                else if(err.errno === -4058){
                    SettingsUtils.writeDefault()
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
            fs.writeFile(SettingsUtils.PATH, JSON.stringify(SettingsUtils.defaultSettings, null, 4), err => {
                let settingsCopy:Settings = Object.assign({}, SettingsUtils.defaultSettings);
                err ? reject(err) : resolve(settingsCopy);
            });
        });
    }
}