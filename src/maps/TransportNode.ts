import { TokenGenerator } from "../utils/TokenGenerator";
import { SpawnLocation } from '../characters/Character';
import { MapInstance } from './MapInstance';

export interface TransportNodeState{
    nodeID:string;
    type:string;
    text:string;
    spawnLocation:SpawnLocation;
    outID:string
    outLocation:SpawnLocation;
}

export class TransportNode{
    private static tokenGen:TokenGenerator = new TokenGenerator(16);

    private _nodeID:string;
    private _type:string;
    private _text:string;
    private _spawnLocation:SpawnLocation;
    private _map:MapInstance;
    private _outID:string;
    private _outLocation:SpawnLocation;

    constructor(type:string, text:string, map:MapInstance, col:number, row:number, outID:string, outCol:number, outRow:number){
        this._nodeID = TransportNode.tokenGen.nextToken();
        this._type = type;
        this._text = text;
        this._spawnLocation = {col, row};
        this._map = map;
        this._outID = outID;
        this._outLocation = {col: outCol, row: outRow};
    }

    public getTransportNodeState():TransportNodeState{
        return {
            nodeID:         this.nodeID,
            type:           this.type,
            text:           this.text,
            outID:          this.outID,
            spawnLocation:  Object.assign({}, this._spawnLocation),
            outLocation:    Object.assign({}, this._outLocation)
        };
    }

    public get nodeID():string{
        return this._nodeID;
    }

    public get type():string{
        return this._type;
    }

    public get text():string{
        return this._text;
    }

    public get outID():string{
        return this._outID;
    }
}