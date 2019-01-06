import { Ability } from "./Ability";
import { Unit } from "../characters/Unit";

export class AbilityFactory{
    public static create(abilityName:string, level:number=1):Ability{
        switch(abilityName){
            case "fireball":
                return new Fireball(level);
            default:
                return null;
        }
    }
}

class Fireball extends Ability{
    constructor(level:number){
        super({
            name:           "Fireball",
            manaCost:       5,
            rechargeSec:    4,
            range:          128,
            maxTargets:     6,
            level
        });
    }

    public effect(caster:Unit, target:Unit):void{
        let damage:number = 10 * (this.level * 2);


    }

    public validateTarget(caster:Unit, target:Unit):boolean{
        return this.validateEnemiesOnly(caster, target);
    }

    public upgrade():boolean{
        if(super.upgrade()){
            this.setMaxTargets(this.maxTargets + 1);
            this.setManaCost(this.manaCost - 1);
            this.setRecharge(this.recharge - 0.5);
            
            return true;
        }
        return false;
    }
}