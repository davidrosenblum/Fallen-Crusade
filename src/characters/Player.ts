import { Unit } from "./Unit";
import { CharacterDocument } from '../database/CharactersCollection';
import { CharacterStats } from './CombatCharacter';

export interface PlayerStats extends CharacterStats{ 
    gold:number;
    abilityPoints:number;
    xp:number;
    xpNeeded:number;
    level:number;
    abilities:{[abilityName:string]: number};
}

export class Player extends Unit{
    public static readonly LEVEL_CAP:number =   50;
    public static readonly GOLD_CAP:number =    999999;
    
    private _level:number;
    private _xp:number;
    private _xpNeeded:number;
    private _gold:number;
    private _abilityPoints:number;
    private _skin:number;

    constructor(saveData:CharacterDocument, ownerID?:string){
        super({
            name:           saveData.name,
            type:           "player",
            team:           "Crusaders",
            ownerID,
            health:         100,
            healthRegen:    0.02,
            mana:           100,
            manaRegen:      0.02,
            defense:        0,
            resistance:     0,
            abilities:      saveData.abilities || {},
            moveSpeed:      1.5
        });

        this._level =           Math.max(1, Math.min(saveData.level, Player.LEVEL_CAP));
        this._xpNeeded =        this.calculateXPNeeded(); 
        this._xp =              Math.max(0, Math.min(saveData.xp, this._xpNeeded - 1));
        this._gold =            Math.max(0, Math.min(saveData.gold, Player.GOLD_CAP));
        this._abilityPoints =   Math.max(0, Math.min(saveData.ability_points, Player.LEVEL_CAP - 1));
        this._skin =            Math.max(1, saveData.skin);
    }

    private calculateXPNeeded():number{
        return (this.level + 1) * (this.level + 2);

    }

    private levelUp():void{
        if(this._level < Player.LEVEL_CAP){
            this._xpNeeded = this.calculateXPNeeded();
            this._xp = 0;
            this._level++;

            this.emit("level", {level: this.level});
            this.addAbilityPoints(1);
        }
    }

    public addXP(xp:number):void{
        let xpRemaining:number = xp;

        while(xpRemaining >= this.xpToGo){
            xpRemaining -= this.xpToGo;
            this.levelUp();
        }

        this._xp += xpRemaining;
        
        this.emit("xp", {xp});
    }

    public addGold(gold:number):void{
        this._gold = Math.min(this.gold + gold, Player.GOLD_CAP);
        this.emit("gold", {gold});
    }

    public addAbilityPoints(points:number):void{
        this._abilityPoints = Math.min(this.abilityPoints + points, Player.LEVEL_CAP - 1);
        this.emit("ability-points", {abilityPoints: points});
    }

    public setSkin(skin:number):void{
        this._skin = Math.max(1, skin);
        this.emit("skin-change", {skin});
    }

    // override
    public upgradeAbility(abilityName:string):boolean{
        if(this._abilityPoints > 0){
            if(super.upgradeAbility(abilityName)){
                this._abilityPoints--;
                this.emit("ability-points", {abilityPoints: -1});
                return true;
            }
        }
        return false;
    }

    public getPlayerStats():PlayerStats{
        let stats:CharacterStats = this.getCharacterStats();

        return {
            base:           stats.base,
            current:        stats.current,
            objectID:       stats.objectID,
            name:           stats.name,
            team:           stats.team,
            gold:           this.gold,
            xp:             this.xp,
            xpNeeded:       this.xpNeeded,
            abilityPoints:  this.abilityPoints,
            level:          this.level,
            abilities:      this.getAbilities()
        }
    }

    public getDatabaseUpdate(field?:"level"|"xp"|"gold"|"skin"|"ability_points"|"abilities"|"last_map"):{[field:string]: any}{
        // get the entire update query object 
        let $set:{[field:string]: any} = {
            level:          this.level,
            xp:             this.xp,
            gold:           this.gold,
            ability_points: this.abilityPoints,
            skin:           this.skin,
            abilities:      this.getAbilities()
        };

        // only can update map if currently in one
        if(this.map){
            $set.last_map = this.map.name;
        }

        // optional update only one field - extract and return from update
        if(field && field in $set){
            let update:{[field:string]: any} = {};
            update[field] = $set[field];
            return {$set: update};
        }

        // update all
        return {$set};
    }

    public get xpToGo():number{
        return this._xpNeeded - this._xp;
    }

    public get xp():number{
        return this._xp;
    }

    public get xpNeeded():number{
        return this._xpNeeded;
    }

    public get level():number{
        return this._level;
    }

    public get gold():number{
        return this._gold;
    }

    public get abilityPoints():number{
        return this._abilityPoints;
    }

    public get skin():number{
        return this._skin;
    }
}