import { Db } from "mongodb";

export interface NPCDocument{
    type:string;
    name:string;
    team:string;
    move_speed:number;
    health:number;
    health_regen:number;
    mana:number;
    mana_regen:number;
    defense:number;
    resistance:number;
    abilities:{[abilityName:string]: number};
    xp_value:number;
    gold_value:number;
}

export class NPCsCollection{
    public static createCollections(database:Db):void{
        database.createCollection("npcs").then(() => {
            // creates the 'characters' collection with the unique field 'name'
            database.collection("npcs").createIndex("type");
        });
    }
    public static loadNPCs(database:Db):Promise<NPCDocument[]>{
        return new Promise((resolve, reject) => {
            database.collection("npcs").find().toArray()
                .then(npcs => resolve(npcs))
                .catch(err => reject(err));
        });
    }

    public static insertNPC(database:Db, doc:NPCDocument):Promise<string>{
        return new Promise((resolve, reject) => {
            database.collection("npcs").insertOne(doc)
                .then(() => resolve("NPC inserted."))
                .catch(err => reject(err));
        });
    }
}