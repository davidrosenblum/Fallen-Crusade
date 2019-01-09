import { Ability } from "./Ability";
import { Unit } from "../characters/Unit";

export class Incinerate extends Ability{
    private static readonly BASE_DAMAGE:number =        15;
    private static readonly BASE_TICK_DAMAGE:number =   2;
    private static readonly BASE_NUM_TICKS:number =     2;

    constructor(level:number=1){
        super({
            name: "Incinerate",
            manaCost:       5,
            rechargeSec:    6,
            range:          Incinerate.RANGE_MEDIUM,
            maxTargets:     1,
            radius:         0,
            level
        });
    }

    public effect(caster:Unit, target:Unit):void{
        // 1 extra damage per level
        let damage:number = Incinerate.BASE_DAMAGE + ((this.level-1) * 1);
        // 0.5 extra damage per level
        let tickDamage:number = Incinerate.BASE_TICK_DAMAGE + (this.level - 1) * 0.5;

        // damage + damage over time 
        target.takeDamageWithDOT(damage, tickDamage, Incinerate.BASE_NUM_TICKS);
    }

    // only hits enemies 
    public validateTarget(caster:Unit, target:Unit):boolean{
        return this.validateEnemiesOnly(caster, target);
    }    

    // 1 extra target, 0.5 less mana, 0.25s faster recharge each level 
    public upgrade():boolean{
        if(super.upgrade()){
            this.setManaCost(this.manaCost - 0.5);
            this.setRecharge(this.recharge - 0.25);
            
            return true;
        }
        return false;
    }
}

export class Fireball extends Ability{
    private static readonly BASE_DAMAGE:number =        20;
    private static readonly BASE_TICK_DAMAGE:number =   5;
    private static readonly BASE_NUM_TICKS:number =     2;

    constructor(level:number=1){
        super({
            name:           "Fireball",
            manaCost:       10,
            rechargeSec:    12,
            range:          Fireball.RANGE_MEDIUM,
            radius:         Fireball.RADIUS_MEDIUM,
            maxTargets:     6,
            level
        });
    }

    public effect(caster:Unit, target:Unit):void{
        // 2 extra damage per level
        let damage:number = Fireball.BASE_DAMAGE + ((this.level-1) * 2);
        // 1 extra damage per level
        let tickDamage:number = Fireball.BASE_TICK_DAMAGE + (this.level - 1);

        // damage + damage over time 
        target.takeDamageWithDOT(damage, tickDamage, Fireball.BASE_NUM_TICKS);
    }

    // only hits enemies 
    public validateTarget(caster:Unit, target:Unit):boolean{
        return this.validateEnemiesOnly(caster, target);
    }

    // 1 extra target, 1 less mana, 0.5s faster recharge each level 
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