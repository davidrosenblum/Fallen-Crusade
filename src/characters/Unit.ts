import { CombatCharacter, CombatCharacterConfig } from './CombatCharacter';
import { Ability, AbilityListItem } from '../abilities/Ability';
import { AbilityFactory } from '../abilities/AbilityFactory';
import { MapInstance } from '../maps/MapInstance';

export interface UnitConfig extends CombatCharacterConfig{
    abilities?: {[abilityName:string]: number};
}

export class Unit extends CombatCharacter{
    private _abilities:{[abilityName:string]: Ability};
    private _map:MapInstance;

    constructor(config:UnitConfig){
        super(config);

        this._abilities = {};
        this._map = null;

        if(config.abilities) this.learnInitialAbilities(config.abilities);
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
        let formattedName:string = Ability.formatName(abilityName);

        if(this.hasAbility(formattedName)){
            this._abilities[formattedName].cast(this, target, handleError);
        }
    }

    public learnAbility(ability:Ability):boolean{
        let abilityName:string = Ability.formatName(ability.name);

        if(!this.hasAbility(abilityName)){
            this._abilities[abilityName] = ability;

            // trigger listeners 
            this.emit("ability-learn", {abilityName: ability.name});
            this.emit("ability-upgrade", {abilityName: ability.name, level: ability.level});

            return true;
        }
        return false;
    }

    public upgradeAbility(abilityName:string):boolean{
        let formattedName:string = Ability.formatName(abilityName);

        if(this.hasAbility(formattedName)){
            let ability:Ability = this._abilities[formattedName];

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

        this.forEachAbility((ability, abilityName) => abilities[abilityName] = ability.level);

        return abilities;
    }

    public getAbilityList():AbilityListItem[]{
        let abilityList:AbilityListItem[] = [];

        this.forEachAbility(ability => abilityList.push(ability.toListItem()));

        return abilityList;
    }

    public setMap(map:MapInstance):boolean{
        if(!map || map.hasUnit(this) || map.addUnit(this)){
            this._map = map;
            return true;
        }
        return false;
    }

    private forEachAbility(fn:(ability:Ability, abilityName?:string)=>void):void{
        for(let abilityName in this._abilities){
            fn(this._abilities[abilityName], abilityName);
        }
    }

    public get map():MapInstance{
        return this._map;
    }
}