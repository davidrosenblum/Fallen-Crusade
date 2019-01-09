import { Ability } from "./Ability";
import { Fireball, Incinerate } from "./Abilities";

export class AbilityFactory{
    // creates an ability object based on name and level 
    public static create(abilityName:string, level:number=1):Ability{
        // determine ability type based on name 
        switch(abilityName){
            case "incinerate":
                return new Incinerate(level);
            case "fireball":
                return new Fireball(level);
            default:
                return null;
        }
    }
}