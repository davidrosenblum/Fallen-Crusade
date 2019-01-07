import { Character, CharacterConfig } from "./Character";

export interface CombatCharacterConfig extends CharacterConfig{
    health?:number;
    healthRegen?:number;
    mana?:number;
    manaRegen?:number;
    defense?:number;
    resistance?:number;
}

export interface CombatStats{
    health:number;
    healthRegen:number;
    mana:number;
    manaRegen:number;
    defense:number;
    resistance:number;
}

export interface CharacterStats{
    base:CombatStats;
    current:CombatStats;
    objectID:string;
    name:string;
    team:string;
}

export interface CombatModifiers{

}

export abstract class CombatCharacter extends Character{ 
    public static readonly HEALTH_CAP:number = 9999;
    public static readonly HEALTH_REGEN_CAP:number = 0.15;
    public static readonly MANA_CAP:number = 9999;
    public static readonly MANA_REGEN_CAP:number = 0.15;
    public static readonly DEFENSE_CAP:number = 0.45;
    public static readonly RESISTANCE_CAP:number = 0.90;
    public static readonly DODGE_ROLL_NEEDED:number = 0.80;
    public static readonly CRIT_ROLL_NEEDED:number = 0.90;

    private _baseStats:CombatStats;
    private _currStats:CombatStats;

    constructor(config:CombatCharacterConfig){
        super(config);

       this._baseStats = this.combatStatsFromConfig(config);
       this._currStats = this.combatStatsFromConfig(config);
    }

    private combatStatsFromConfig(config:CombatCharacterConfig):CombatStats{
        let {health=1, healthRegen=0, mana=1, manaRegen=0, defense=0, resistance=0} = config;

        return {
            health:         Math.max(1, Math.min(health, CombatCharacter.HEALTH_CAP)),
            healthRegen:    Math.max(0, Math.min(healthRegen, CombatCharacter.HEALTH_REGEN_CAP)),
            mana:           Math.max(1, Math.min(mana, CombatCharacter.MANA_CAP)),
            manaRegen:      Math.max(0, Math.min(manaRegen, CombatCharacter.MANA_REGEN_CAP)),
            defense:        Math.max(0, Math.min(defense, CombatCharacter.DEFENSE_CAP)),
            resistance:     Math.max(0, Math.min(resistance, CombatCharacter.RESISTANCE_CAP))
        };
    }

    public useMana(mana:number):boolean{
        if(this.hasEnoughMana(mana)){
            this._currStats.mana -= mana;
            return true;
        }
        return false;
    }

    public hasEnoughMana(manaNeeded:number):boolean{
        return this._currStats.mana >= manaNeeded;
    }

    public takeDamage(damage:number, defend:boolean=true, resist:boolean=true):boolean{
        // possibly dodge (based on defense)
        if(defend && this.rollDodge()){
            this.emit("dodge");
            return false;
        }

        // possibly resist damage
        let resistAmount:number = resist ? (damage * this._currStats.resistance) : 0;
        let actualDamage:number = damage - resistAmount;

        // lose hit points
        this._currStats.health -= actualDamage;
        this.emit("hurt", {damage, actualDamage, resistAmount});

        // dead? 
        if(this._currStats.health <= 0){
            this.emit("death");
        }
        return true;
    }

    public takeDamageWithDOT(damage:number, tickDamage:number, ticks:number, defend:boolean=true, resist:boolean=true):void{
        if(this.takeDamage(damage, defend, resist)){
            this.takeDamageOverTime(tickDamage, ticks, defend, resist);
        }
    }

    public takeDamageOverTime(damagePerTick:number, ticks:number, defend:boolean=true, resist:boolean=true):void{
        setTimeout(() => this.takeDamage(damagePerTick, defend, resist), 1000);
    }

    public rollDodge():boolean{
        return Math.random() + this._currStats.defense >= CombatCharacter.DODGE_ROLL_NEEDED
    }

    public getCharacterStats():CharacterStats{
        return {
            base:       this.getBaseStats(),
            current:    this.getCurrentStats(),
            objectID:   this.objectID,
            name:       this.name,
            team:       this.team
        };
    }    

    public getBaseStats():CombatStats{
        return Object.assign({}, this._baseStats);
    }

    public getCurrentStats():CombatStats{
        return Object.assign({}, this._currStats)
    }
}