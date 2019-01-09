import { CombatCharacter, CombatCharacterConfig } from './CombatCharacter';
import { Ability } from '../abilities/Ability';
import { AbilityFactory } from '../abilities/AbilityFactory';
import { MapInstance } from '../maps/MapInstance';

export interface UnitConfig extends CombatCharacterConfig{
    abilities?: {[abilityName:string]: number};
}

export interface AbilityListItem{
    abilityName:string;
    level:number;
}

export class Unit extends CombatCharacter{
    private _abilities:{[abilityName:string]: Ability};
    private _map:MapInstance;

    constructor(config:UnitConfig){
        super(config);

        this._abilities = {};
        this._map = null;

        this.learnInitialAbilities(config.abilities || {});
    }

    private learnInitialAbilities(abilities:{[abilityName:string]: number}):void{
        for(let abilityName in abilities){
            let level:number = abilities[abilityName];
            let ability:Ability = AbilityFactory.create(abilityName, level);

            if(ability){
                this.learnAbility(ability);
            }
        }
    }

    public castAbility(abilityName:string, target:Unit, handleError:(err:Error)=>void):void{
        if(this.hasAbility(abilityName)){
            this._abilities[abilityName].cast(this, target, handleError);
        }
    }

    public learnAbility(ability:Ability):boolean{
        if(!this.hasAbility(ability.name)){
            this._abilities[ability.name] = ability;

            // trigger listeners 
            this.emit("ability-learn", {abilityName: ability.name})

            return true;
        }
        return false;
    }

    public upgradeAbility(abilityName:string):boolean{
        if(this.hasAbility(abilityName)){
            let ability:Ability = this._abilities[abilityName];

            if(ability.upgrade()){
                this.emit("ability-upgrade", {abilityName: ability.name, level: ability.level});
                return true;
            }
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

    public getAbilityList():AbilityListItem[]{
        let abilityList:AbilityListItem[] = [];

        for(let abilityName in this._abilities){
            let ability:Ability = this._abilities[abilityName];

            abilityList.push({
                abilityName,
                level: ability.level
            })
        }

        return abilityList;
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