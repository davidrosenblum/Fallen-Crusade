import { Ability } from "./Ability";
import { Fireball } from "./Abilities";

export class AbilityFactory{
    // creates an ability object based on name and level 
    public static create(abilityName:string, level:number=1):Ability{
        // determine ability type based on name 
        switch(abilityName){
            case "fireball":
                return new Fireball(level);
            default:
                return null;
        }
    }
}