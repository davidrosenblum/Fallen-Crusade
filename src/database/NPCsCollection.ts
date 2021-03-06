import { Db } from "mongodb";
import { NPCTier } from "../characters/NPC";

export interface NPCDocument{
    type:string;
    name:string;
    team:string;
    tier:string;
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
        database.createCollection("npcs").then(er => {
            // creates the 'characters' collection with the unique field 'name'
            database.collection("npcs").createIndex("type", {unique: true});
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

    public static insertDefaults(database:Db):Promise<string[]>{
        return Promise.all([
            this.insertNPC(database, {
                type:           "blacksmith",
                name:           "Blacksmith",
                team:           "Crusaders",
                tier:           NPCTier.CONTACT,
                move_speed:     0,
                health:         500,
                health_regen:   0.10,
                mana:           100,
                mana_regen:     0.10,
                defense:        1,
                resistance:     1,
                abilities:      {},
                gold_value:     0,
                xp_value:       0
            }),

            this.insertNPC(database, {
                type:           "commander",
                name:           "Commander",
                team:           "Crusaders",
                tier:           NPCTier.CONTACT,
                move_speed:     0,
                health:         500,
                health_regen:   0.10,
                mana:           100,
                mana_regen:     0.10,
                defense:        1,
                resistance:     1,
                abilities:      {},
                gold_value:     0,
                xp_value:       0
            }),

            this.insertNPC(database, {
                type:           "paragon",
                name:           "Paragon",
                team:           "Crusaders",
                tier:           NPCTier.CONTACT,
                move_speed:     0,
                health:         500,
                health_regen:   0.10,
                mana:           100,
                mana_regen:     0.10,
                defense:        1,
                resistance:     1,
                abilities:      {},
                gold_value:     0,
                xp_value:       0
            }),

            this.insertNPC(database, {
                type:           "templar",
                name:           "Templar",
                team:           "Crusaders",
                tier:           NPCTier.STANDARD,
                move_speed:     1,
                health:         100,
                health_regen:   0.03,
                mana:           100,
                mana_regen:     0.05,
                defense:        0.10,
                resistance:     0.25,
                abilities:      {},
                gold_value:     5,
                xp_value:       5
            }),

            this.insertNPC(database, {
                type:           "disciple",
                name:           "Disciple",
                team:           "Crusaders",
                tier:           NPCTier.ELITE,
                move_speed:     1,
                health:         250,
                health_regen:   0.04,
                mana:           100,
                mana_regen:     0.06,
                defense:        0.20,
                resistance:     0.35,
                abilities:      {},
                gold_value:     25,
                xp_value:       25
            }),

            this.insertNPC(database, {
                type:           "grave-knight",
                name:           "Grave Knight",
                team:           "Undead",
                tier:           NPCTier.STANDARD,
                move_speed:     1,
                health:         60,
                health_regen:   0.02,
                mana:           100,
                mana_regen:     0.02,
                defense:        0.00,
                resistance:     0.20,
                abilities:      {},
                gold_value:     2,
                xp_value:       5
            }),

            this.insertNPC(database, {
                type:           "animus",
                name:           "Animus",
                team:           "Undead",
                tier:           NPCTier.STANDARD,
                move_speed:     1,
                health:         45,
                health_regen:   0.02,
                mana:           100,
                mana_regen:     0.02,
                defense:        0.15,
                resistance:     0.00,
                abilities:      {},
                gold_value:     2,
                xp_value:       5
            }),

            this.insertNPC(database, {
                type:           "lich",
                name:           "Lich",
                team:           "Undead",
                tier:           NPCTier.ELITE,
                move_speed:     1,
                health:         125,
                health_regen:   0.02,
                mana:           100,
                mana_regen:     0.04,
                defense:        0.20,
                resistance:     0.25,
                abilities:      {},
                gold_value:     15,
                xp_value:       20
            }),

            this.insertNPC(database, {
                type:           "devourer",
                name:           "Devourer",
                team:           "Undead",
                tier:           NPCTier.ELITE,
                move_speed:     1,
                health:         150,
                health_regen:   0.03,
                mana:           100,
                mana_regen:     0.04,
                defense:        0.25,
                resistance:     0.50,
                abilities:      {},
                gold_value:     15,
                xp_value:       20
            }),

            this.insertNPC(database, {
                type:           "death-knight",
                name:           "Death Knight",
                team:           "Undead",
                tier:           NPCTier.BOSS,
                move_speed:     1,
                health:         250,
                health_regen:   0.03,
                mana:           100,
                mana_regen:     0.06,
                defense:        0.20,
                resistance:     0.75,
                abilities:      {},
                gold_value:     35,
                xp_value:       50
            }),

            this.insertNPC(database, {
                type:           "meehan",
                name:           "Meehan",
                team:           "Ancients",
                tier:           NPCTier.BOSS,
                move_speed:     1,
                health:         900,
                health_regen:   0.02,
                mana:           100,
                mana_regen:     0.05,
                defense:        0.15,
                resistance:     0.90,
                abilities:      {},
                gold_value:     150,
                xp_value:       100
            })
        ]);
    }
}