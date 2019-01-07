import { MapInstance } from './MapInstance';
import { NorthernKeep, VillageCenter } from './Maps';

export class MapInstanceFactory{
    public static create(type:string):MapInstance{
        switch(type){
            case "Village Center":
                return new VillageCenter();
            case "Northern Keep":
                return new NorthernKeep();
            default:
                throw new Error("Invalid map type.");
        }
    }

    public static createDefaultMaps():{[mapName:string]: MapInstance}{
        return {
            "Village Center":   new VillageCenter(),
            "Northern Keep":    new NorthernKeep()
        };
    }
}