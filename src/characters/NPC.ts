import { Unit, UnitConfig } from './Unit';

export interface NPCConfig extends UnitConfig{
    xpValue?:number;
    goldValue?:number;
}

export class NPC extends Unit{
    private _xpValue:number;
    private _goldValue:number;
    private _bountyGiven:boolean;

    constructor(config:NPCConfig){
        super(config);

        this._xpValue = config.xpValue || 0;
        this._goldValue = config.goldValue || 0;
        this._bountyGiven = false;

        this.on("death", () => this.giveBounty());
    }

    private giveBounty():void{
        if(!this._bountyGiven){
            this._bountyGiven = true;

            this.map.giveBounty(this.xpValue, this.goldValue);
        }
    }

    public get xpValue():number{
        return this._xpValue;
    }

    public get goldValue():number{
        return this._goldValue;
    }
}