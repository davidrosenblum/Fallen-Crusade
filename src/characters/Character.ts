import { EventEmitter } from "events";
import { TokenGenerator } from '../utils/TokenGenerator';

export interface CharacterConfig{
    ownerID:string;
    name:string;
    type:string;
    team?:string;
    x?:number;
    y?:number;
    anim?:string;
    moveSpeed?:number;
    spawnLocation?:SpawnLocation;
}

// spawn location schema (game uses coordinate grid)
export interface SpawnLocation{
    col?:number;
    row?:number;
}

export interface CharacterSpawnState{
    objectID:string;
    ownerID:string;
    name:string;
    type:string;
    team:string;
    x:number;
    y:number;
    anim:string;
    moveSpeed:number;
    spawnLocation:SpawnLocation;
}

export interface CharacterUpdateState{
    objectID?:string;
    x?:number;
    y?:number;
    anim?:string;
}

export abstract class Character extends EventEmitter{
    private static readonly tokenGen:TokenGenerator = new TokenGenerator();
    
    private _objectID:string;
    private _ownerID:string;
    private _name:string;
    private _type:string;
    private _team:string;
    private _x:number;
    private _y:number;
    private _anim:string;
    private _moveSpeed:number;
    private _spawnLocation:SpawnLocation;

    constructor(config:CharacterConfig){
        super();
        
        this._objectID = Character.tokenGen.nextToken();
        this._ownerID = config.ownerID;
        this._name = config.name;
        this._type = config.type;
        this._team = config.team || null;
        this._x = config.x || 0;
        this._y = config.y || 0;
        this._anim = config.anim || null;
        this._moveSpeed = Math.abs(config.moveSpeed) || 1;
        this._spawnLocation = config.spawnLocation || null;
    }

    protected onDeath():void{ }


    public inRange(target:Character, range:number):boolean{
        if(this.x + range  < target.x + range && target.x + range < this.x + range){
            if(this.y + range  < target.y + range && target.y + range < this.y + range){
                return true;
            }
        }
        return false;
    }

    public setState(state:CharacterUpdateState):void{
        let {x=undefined, y=undefined, anim=undefined} = state;

        if(x){
            this._x = x;
        }

        if(y){
            this._y = y;
        }

        if(anim){
            this._anim = anim;
        }

        this.emit("state-update", {x, y, anim});
    }

    public getUpateState():CharacterUpdateState{
        return {
            objectID:   this.objectID,
            x:          this.x,
            y:          this.y,
            anim:       this.anim
        };
    }

    public getSpawnState():CharacterSpawnState{
        return {
            objectID:       this.objectID,
            ownerID:        this.ownerID,
            name:           this.name,
            type:           this.type,
            team:           this.team,
            x:              this.x,
            y:              this.y,
            anim:           this.anim,
            moveSpeed:      this.moveSpeed,
            spawnLocation:  this._spawnLocation
        };
    }

    public set x(x:number){
        this.setState({x});
    }

    public set y(y:number){
        this.setState({y});
    }

    public set anim(anim:string){
        this.setState({anim});
    }

    public get objectID():string{
        return this._objectID;
    }

    public get ownerID():string{
        return this._ownerID;
    }

    public get name():string{
        return this._name;
    }

    public get type():string{
        return this._type;
    }

    public get team():string{
        return this._team;
    }

    public get x():number{
        return this._x;
    }

    public get y():number{
        return this._y;
    }

    public get anim():string{
        return this._anim;
    }

    public get moveSpeed():number{
        return this._moveSpeed;
    }
}