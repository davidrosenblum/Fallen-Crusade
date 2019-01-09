import { Ability } from './Ability';
import { Unit } from "../characters/Unit";

// single target damage + dot
export class Incinerate extends Ability{
    private static readonly BASE_DAMAGE:number =        15;
    private static readonly BASE_TICK_DAMAGE:number =   2;
    private static readonly BASE_NUM_TICKS:number =     2;

    constructor(level:number){
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
        // calculate how many times upgraded
        let upgrades:number = this.upgradeLevels;

        // 1 extra damage per level
        let damage:number = Incinerate.BASE_DAMAGE + (upgrades * 1);
        // 0.5 extra damage per level
        let tickDamage:number = Incinerate.BASE_TICK_DAMAGE + (upgrades * 0.5);

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

// group damage + dot
export class Fireball extends Ability{
    private static readonly BASE_DAMAGE:number =        20;
    private static readonly BASE_TICK_DAMAGE:number =   5;
    private static readonly BASE_NUM_TICKS:number =     2;

    constructor(level:number){
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
        // calculate how many times upgraded
        let upgrades:number = this.upgradeLevels;

        // 2 extra damage per level
        let damage:number = Fireball.BASE_DAMAGE + (upgrades* 2);
        // 1 extra damage per level
        let tickDamage:number = Fireball.BASE_TICK_DAMAGE + (upgrades);

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

// group damage + mana drain
export class LightningStorm extends Ability{
    private static readonly BASE_DAMAGE:number = 60;
    private static readonly BASE_MANA_DRAIN:number = 0.05;

    constructor(level:number){
        super({
            name:           "Lightning Storm",
            manaCost:       25,
            rechargeSec:    45,
            range:          LightningStorm.RANGE_CLOSE,
            radius:         LightningStorm.RADIUS_LARGE,
            maxTargets:     12,
            level
        });
    }

    public effect(caster:Unit, target:Unit):void{
        // calculate how many times upgraded
        let upgrades:number = this.upgradeLevels;

        // 10 extra damage per level
        let damage:number = LightningStorm.BASE_DAMAGE + (upgrades * 10);

        // damage + mana drain (+2% drain per level)
        if(target.takeDamage(damage)){
            target.drainMana(LightningStorm.BASE_MANA_DRAIN + ((upgrades * 2) / 100));
        }
    }

    // only hits enemies 
    public validateTarget(caster:Unit, target:Unit):boolean{
        return this.validateEnemiesOnly(caster, target);
    }

    // 2 less mana, 2.5 faster recharge each level 
    public upgrade():boolean{
        if(super.upgrade()){
            this.setManaCost(this.manaCost - 2);
            this.setRecharge(this.recharge - 2.5);
            
            return true;
        }
        return false;
    }
}

// group damage debuff and dot ?

// single target heal
export class HealingTouch extends Ability{
    private static readonly BASE_HEALTH:number = 0.20;

    constructor(level:number){
        super({
            name:           "Healing Touch",
            manaCost:       10,
            rechargeSec:    20,
            range:          HealingTouch.RANGE_CLOSE,
            radius:         0, // single target
            maxTargets:     1,
            level
        });
    }

    public effect(caster:Unit, target:Unit):void{
        // calculate how many times upgraded
        let upgrades:number = this.upgradeLevels;

        // 10% more health per level
        let healthPercent:number = HealingTouch.BASE_HEALTH + (upgrades / 10);
        
        // heal
        target.heal(healthPercent);
    }

    // only hits allies
    public validateTarget(caster:Unit, target:Unit):boolean{
        return this.validateAlliesOnly(caster, target);
    }

    // 2 less mana, 2.5 faster recharge each level 
    public upgrade():boolean{
        if(super.upgrade()){
            this.setManaCost(this.manaCost - 2);
            this.setRecharge(this.recharge - 2.5);
            
            return true;
        }
        return false;
    }
}

// group resistance bonus 
export class ArcaneBarrier extends Ability{
    private static readonly BASE_RESISTANCE:number =    0.25;
    private static readonly BASE_DURATION:number =      1000 * 20;

    constructor(level:number){
        super({
            name:           "Arcane Barrier",
            manaCost:       40,
            rechargeSec:    30,
            range:          ArcaneBarrier.RANGE_CLOSE,
            radius:         ArcaneBarrier.RADIUS_LARGE,
            maxTargets:     99,
            level
        });
    }

    public effect(caster:Unit, target:Unit):void{
        // calculate how many times upgraded
        let upgrades:number = this.upgradeLevels;

        // 5% more resistance per level
        let resistance:number = ArcaneBarrier.BASE_RESISTANCE + (upgrades * 0.05);
        // 5 more seconds per level
        let duration:number = ArcaneBarrier.BASE_DURATION + (upgrades * 5000);
        
        //target.modifyResistance(resistance, duration);
    }

    // only hits allies and/or self
    public validateTarget(caster:Unit, target:Unit):boolean{
        return this.validateAlliesOrSelf(caster, target);
    }

    /*public upgrade():boolean{
        if(super.upgrade()){            
            return true;
        }
        return false;
    }*/
}

// ideas = ability thats hits enemies and allies, effect uses caster to determine effect (more dmg to different groups?)