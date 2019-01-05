import { Db } from "mongodb";

// schema for the characters collection
export interface CharacterDocument{
    account_id:string;       
    name:string;
    skin:number;
    level:number;
    xp:number;
    gold:number;
    ability_points:number;
    abilities: {[name:string]: number};
    last_map:string;
}

// schema for a simplified character preview 
export interface CharacterPreviewDocument{
    name:string;
    skin:number;
    level:number;
    last_map:string;
}

export class CharactersCollection{
    // creates the required database collections
    public static createCollections(database:Db):void{
        database.createCollection("characters").then(() => {
            // creates the 'characters' collection with the unique field 'name'
            database.collection("characters").createIndex("name")
        });
    }

    // creates a new character
    public static createCharacter(database:Db, accountID:string, name:string, skin:number=1):Promise<string>{
        return new Promise((resolve, reject) => {
            // create the new character document (basically the default save)
            let characterDoc:CharacterDocument = {
                account_id: accountID, name, skin,
                level: 1, xp: 0, gold: 0, ability_points: 0, abilities: {},
                last_map: null
            };

            // store the character 'save' in the database
            database.collection("characters").insertOne(characterDoc)
                .then(() => resolve(`Character "${name}" created.`))
                .catch(err => reject(err));
        });
    }

    // retrieves an existing character
    public static getCharacter(database:Db, accountID:string, name:string):Promise<CharacterDocument>{
        return new Promise((resolve, reject) => {
            // find one by account ID and name 
            database.collection("characters").findOne({account_id: accountID, name})
                .then(result => {
                    result ? resolve(result) : reject(new Error(`Character "${name}" not found.`));
                })
                .catch(err => reject(err));
        });
    }

    // retrieves the character list for an account
    public static getCharacterList(database:Db, accountID:string):Promise<CharacterPreviewDocument[]>{
        return new Promise((resolve, reject) => {
            // find many by account ID and name 
            database.collection("characters").find({account_id: accountID}).toArray()
                .then(results => {
                    let previews:CharacterPreviewDocument[] = new Array(results.length);

                    // for each result... extract simple information 
                    results.forEach((result, index) => {
                        previews[index] = {
                            name:       result.name,
                            level:      result.level,
                            skin:       result.skin,
                            last_map:   result.last_map
                        };
                    });

                    resolve(previews);
                })
                .catch(err => reject(err));
        });
    }

    // deletes an existing character
    public static deleteCharacter(database:Db, accountID:string, name:string):Promise<string>{
        return new Promise((resolve, reject) => {
            // delete by account ID and name 
            database.collection("characters").deleteOne({account_id: accountID, name})
                .then(() => resolve(`Character "${name}" deleted.`))
                .catch(err => reject(err));
        });
    }

    public static updateCharacter():void{

    }
}