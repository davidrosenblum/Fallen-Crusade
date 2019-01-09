import { Unit } from '../characters/Unit';
import { EventEmitter } from 'events';

// ability configuration schema 
export interface AbilityConfig{
    name:string;
    manaCost:number;
    rechargeSec:number;
    range:number;
    level:number;
    maxTargets?:number
    radius?:number;
}

export interface AbilityListItem{
    abilityName:string;
    name:string;
    level:number;
}

export abstract class Ability extends EventEmitter{
    // how many times abilities can be ugraded (exclusive of first level)
    public static readonly UPGRADE_CAP:number =     3;
    // close range distance in pixels
    public static readonly RANGE_CLOSE:number =     64;
    // medium range distance in pixels
    public static readonly RANGE_MEDIUM:number =    128;
    // far range distance in pixels 
    public static readonly RANGE_FAR:number =       256;
    // small effect radius in pixels
    public static readonly RADIUS_SMALL:number =    32;
    // medium effect radius in pixels
    public static readonly RADIUS_MEDIUM:number =   64;
    // large effect radius in pixels
    public static readonly RADIUS_LARGE:number =    128;

    private _name:string;           // name of the ability
    private _manaCost:number;       // how much mana the ability costs to cast
    private _recharge:number;       // cooldown time in milliseconds
    private _maxTargets:number;     // max amount of targets hit (inclusive of initial target)
    private _range:number;          // the range, in pixels, of how far away the caster can be from the target
    private _radius:number;         // effect range from relative to targset
    private _level:number;          // upgrade level
    private _ready:boolean;         // ability ready to cast again or not 

    constructor(config:AbilityConfig){
        super();

        // extract name
        this._name = config.name;
        // extract mana cost
        this._manaCost = config.manaCost;
        // exttract recharge time, convert from seconds to milliseconds
        this._recharge = config.rechargeSec / 1000;
        // extract range
        this._range = config.range;
        // effect range from target 
        this._radius = config.radius || this._range;
        // extract amount of targets tha can be hit (default is 1, meaning single target)
        this._maxTargets = config.maxTargets || 1;
        // ability level (default is 1, 0 = learnable)
        this._level = config.level;
        // begins ready to cast
        this._ready = true;

        // apply upgrades 
        for(let i:number = 1; i < this._level; i++){
            this.upgrade();
        }
    }

    // determines if a target is eligible to be effected (hit)
    public abstract validateTarget(caster:Unit, target:Unit):boolean;
    
    // what happens to a target when 'hit'
    public abstract effect(caster:Unit, target:Unit):void;

    // casts the ability on the initial target
    public cast(caster:Unit, target:Unit, handleError:(err?:Error)=>void):void{
        // ability unlocked? 
        if(this.level < 1){
            handleError(new Error("Ability not learned."));
            return;
        }

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
        // start recharge (emit when ready)
        this.beginCooldown(() => caster.emit("ability-ready", {abilityName: this.name}));

        // effect the target if its friendly OR if the target is an enemy and did not dodge 
        if(caster.team === target.team || !target.rollDodge()){
            this.effect(caster, target);

            // multie target ability in a map? (should always be in a map!)
            if(this.maxTargets > 1 && caster.map){
                caster.map.handleAoEAbility(caster, target, this);
            }
        }
    }

    private beginCooldown(ready:()=>void):void{
        // ability no longer available
        this._ready = false;

        // make available when recharge is done
        setTimeout(() => {
            this._ready = true;
            this.emit("ready");
            ready();
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

    public validateNotSelf(caster:Unit, target:Unit):boolean{
        return caster !== target;
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

    public toListItem():AbilityListItem{
        return {
            abilityName:    this.formattedName,
            name:           this.name,
            level:          this.level
        }
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

    public get radius():number{
        return this._radius;
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

    public get upgradeLevels():number{
        return Math.max(0, this._level - 1);
    }

    public get formattedName():string{
        return Ability.formatName(this.name);
    }

    public static formatName(abilityName:string):string{
        return abilityName.toLowerCase().replace(/[\s_]/gi, "-");
    }
}