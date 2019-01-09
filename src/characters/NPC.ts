import { Unit, UnitConfig } from './Unit';

export const enum NPCTier{
    CONTACT =   "contact",
    STANDARD =  "standard",
    ELITE =     "elite",
    BOSS =      "boss"
}

export interface NPCConfig extends UnitConfig{
    tier:NPCTier|string;
    xpValue?:number;
    goldValue?:number;
}

export class NPC extends Unit{
    private _tier:NPCTier|string;
    private _xpValue:number;
    private _goldValue:number;
    private _bountyGiven:boolean;

    constructor(config:NPCConfig){
        super(config);

        this._tier = config.tier;
        this._xpValue = config.xpValue || 0;
        this._goldValue = config.goldValue || 0;
        this._bountyGiven = false;

        //  this.on("death", () => this.giveBounty()); map listens now
    }

    private giveBounty():void{
        if(!this._bountyGiven){
            this._bountyGiven = true;

            this.map.giveBounty(this.xpValue, this.goldValue);
        }
    }

    public get tier():NPCTier|string{
        return this._tier;
    }

    public get xpValue():number{
        return this._xpValue;
    }

    public get goldValue():number{
        return this._goldValue;
    }
}