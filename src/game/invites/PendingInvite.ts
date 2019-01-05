import { GameClient } from '../GameClient';
import { TokenGenerator } from '../../utils/TokenGenerator';

export abstract class PendingInvite{
    private static tokenGen:TokenGenerator = new TokenGenerator(16);

    private _inviteID:string;
    private _type:string;
    private _message:string;
    private _to:GameClient;
    private _from:GameClient;   
    private _pending:boolean;

    constructor(type:string, message:string, to:GameClient, from:GameClient, declineTimeout:number=6000){
        this._inviteID = PendingInvite.tokenGen.nextToken();
        this._type = type;
        this._message = message;
        this._from = from;
        this._pending = true;

        if(declineTimeout > 0){
            setTimeout(() => {
                if(this){
                    this.resolve(false)
                }
            }, declineTimeout);
        }
    }

    public abstract onAccept():void;

    public resolve(accept:boolean):void{
        if(this.isPending){
            this._pending = false;

            if(accept){
                this.onAccept();
            }
        }
    }

    public get inviteID():string{
        return this._inviteID;
    }

    public get type():string{
        return this._type;
    }

    public get message():string{
        return this._message;
    }

    public get to():GameClient{
        return this._to;
    }

    public get from():GameClient{
        return this._from;
    }

    public get isPending():boolean{
        return this._pending;
    }
}