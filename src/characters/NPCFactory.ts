import { NPC, NPCTier } from './NPC';
import { NPCDocument } from '../database/NPCsCollection';

export interface NPCOptions{
    type:string;
    ownerID:string;
    x?:number;
    y?:number;
    tier?:NPCTier;
    anim?:string;
    name?:string;
    team?:string;
}

export class NPCFactory{
    private static npcTypes:{[type:string]: NPCDocument} = {};

    public static create(options:NPCOptions):NPC{
        let {type, ownerID, x, y, anim=null, name=null, team=null, tier=null} = options;

        if(type in this.npcTypes){
            let doc:NPCDocument = this.npcTypes[type];
            
            return new NPC({
                ownerID,
                type:           doc.type,
                name:           name || doc.name,
                team:           team || doc.team,
                tier:           tier || doc.tier,
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
                x,
                y
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