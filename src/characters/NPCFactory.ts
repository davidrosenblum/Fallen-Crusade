import { NPC } from './NPC';
import { NPCDocument } from '../database/NPCsCollection';
import { SpawnLocation } from './Character';

export interface NPCOptions{
    type:string;
    ownerID:string;
    spawnLocation:SpawnLocation;
    anim?:string;
    name?:string;
    team?:string;
}

export class NPCFactory{
    private static npcTypes:{[type:string]: NPCDocument} = {};

    public static create(options:NPCOptions):NPC{
        let {type, ownerID, anim, name, team, spawnLocation} = options;

        if(type in this.npcTypes){
            let doc:NPCDocument = this.npcTypes[type];
            
            return new NPC({
                ownerID,
                type:           doc.type,
                name:           name || doc.name,
                team:           team || doc.team,
                moveSpeed:      doc.move_speed,
                anim:           anim || null,
                health:         doc.health,
                healthRegen:    doc.health_regen,
                mana:           doc.mana,
                manaRegen:      doc.mana_regen,
                defense:        doc.defense,
                resistance:     doc.resistance,
                xpValue:        doc.xp_value,
                goldValue:      doc.gold_value,
                spawnLocation
            });
        }
        else throw new Error("Invalid NPC type.");
    }

    public static setNPCTypes(docs:NPCDocument[]):void{
        docs.forEach(doc => {
            this.npcTypes[doc.type] = doc;
        });
    }
}