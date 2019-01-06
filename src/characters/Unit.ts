import { CombatCharacter, CombatCharacterConfig } from './CombatCharacter';
import { Ability } from '../abilities/Ability';
import { MapInstance } from '../maps/MapInstance';

export interface UnitConfig extends CombatCharacterConfig{
    abilities?: {[abilityName:string]: Ability};
}

export class Unit extends CombatCharacter{
    private _abilities:{[abilityName:string]: Ability};
    private _map:MapInstance;

    constructor(config:UnitConfig){
        super(config);

        this._abilities = {};
        this._map = null;
    }

    public castAbility(abilityName:string, target:Unit, handleError:(err:Error)=>void):void{
        if(this.hasAbility(abilityName)){
            this._abilities[abilityName].cast(this, target, handleError);
        }
    }

    public learnAbility(ability:Ability):boolean{
        if(!this.hasAbility(ability.name)){
            this._abilities[ability.name] = ability;
            return true;
        }
        return false;
    }

    public upgradeAbility(abilityName:string):boolean{
        if(this.hasAbility(abilityName)){
            return this._abilities[abilityName].upgrade();
        }
        return false;
    }

    public hasAbility(abilityName:string):boolean{
        return abilityName in this._abilities;
    }

    public getAbilities():{[abilityName:string]: number}{
        let abilities:{[abilityName:string]: number} = {};

        for(let abilityName in this._abilities){
            abilities[abilityName] = this._abilities[abilityName].level;
        }

        return abilities;
    }

    public setMap(map:MapInstance):boolean{
        if(!map || map.hasUnit(this) || map.addUnit(this)){
            this._map = map;
            return true;
        }
        return false;
    }

    public get map():MapInstance{
        return this._map;
    }
}