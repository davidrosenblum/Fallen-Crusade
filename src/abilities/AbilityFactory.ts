import { Ability } from "./Ability";
import { Fireball, Incinerate, HealingTouch, ArcaneBarrier, LightningStorm } from './Abilities';

export class AbilityFactory{
    // creates an ability object based on name and level 
    public static create(abilityName:string, level:number):Ability{
        // determine ability type based on name 
        switch(Ability.formatName(abilityName)){
            case "incinerate":
                return new Incinerate(level);
            case "fireball":
                return new Fireball(level);
            case "lightning-storm":
                return new LightningStorm(level);
            case "healing-touch":
                return new HealingTouch(level);
            case "arcane-barrier":
                return new ArcaneBarrier(level);
            default:
                return null;
        }
    }
}