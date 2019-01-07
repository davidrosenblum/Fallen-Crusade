import { Unit } from '../characters/Unit';
import { EventEmitter } from 'events';

export interface AbilityConfig{
    name:string;
    manaCost:number;
    rechargeSec:number;
    range:number;
    level?:number;
    maxTargets?:number
}

export abstract class Ability extends EventEmitter{
    public static readonly UPGRADE_CAP:number = 3;

    private _name:string;
    private _manaCost:number;
    private _recharge:number;
    private _maxTargets:number;
    private _range:number;
    private _level:number;
    private _ready:boolean;

    constructor(config:AbilityConfig){
        super();

        this._name = config.name;
        this._manaCost = config.manaCost;
        this._recharge = config.rechargeSec / 1000;
        this._range = config.range;
        this._maxTargets = config.maxTargets || 1;
        this._level = 1;
        this._ready = false;

        for(let i:number = 1; i < this._level; i++){
            this.upgrade();
        }
    }

    public abstract validateTarget(caster:Unit, target:Unit):boolean;
    public abstract effect(caster:Unit, target:Unit):void;

    public cast(caster:Unit, target:Unit, handleError:(err?:Error)=>void):void{
        // ability ready? 
        if(!this.isReady){
            handleError(new Error("Not done recharging."));
            return;
        }

        // has enough mana? 
        if(!caster.hasEnoughMana(this.manaCost)){
            handleError(new Error("Not enough mana."));
            return;
        }

        // target valid?
        if(!this.validateTarget(caster, target)){
            handleError(new Error("Invalid target."));
            return;
        }

        // target in range?
        if(!caster.inRange(target, this.range)){
            handleError(new Error("Target not in range."));
            return;
        }

        // 'consume' ability
        caster.useMana(this.manaCost);
        this.beginCooldown();

        // effect the target if its friendly OR if the target is an enemy and did not dodge 
        if(caster.team === target.team || !target.rollDodge()){
            this.effect(caster, target);

            // multie target ability in a map? (should always be in a map!)
            if(this.maxTargets > 1 && caster.map){
                caster.map.handleAoEAbility(caster, target, this);
            }
        }
    }

    private beginCooldown():void{
        // ability no longer available
        this._ready = false;

        // make available when recharge is done
        setTimeout(() => {
            this._ready = true;
            this.emit("recharge");
        }, this.recharge);
    }

    public upgrade():boolean{
        if(this.level < Ability.UPGRADE_CAP){
            this._level++;
            return true;
        }
        return false;
    }

    public validateEnemiesOnly(caster:Unit, target:Unit):boolean{
        return caster.team !== target.team;
    }

    public validateAlliesOnly(caster:Unit, target:Unit):boolean{
        return target === caster || this.validateAlliesOrSelf(caster, target);
    }

    public validateAlliesOrSelf(caster:Unit, target:Unit):boolean{
        return caster.team === target.team;
    }

    protected setManaCost(manaCost:number){
        this._manaCost = manaCost;
    }

    protected setMaxTargets(maxTargets:number){
        this._maxTargets = maxTargets;
    }

    protected setRecharge(rechargeSec:number){
        this._recharge = rechargeSec;
    }

    protected setRange(range:number){
        this._range = range;
    }

    public get name():string{
        return this._name;
    }

    public get manaCost():number{
        return this._manaCost;
    }

    public get recharge():number{
        return this._recharge;
    }

    public get range():number{
        return this._range;
    }

    public get maxTargets():number{
        return this._maxTargets;
    }

    public get level():number{
        return this._level;
    }

    public get isReady():boolean{
        return this._ready;
    }
}