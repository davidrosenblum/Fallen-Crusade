import { PendingInvite } from './PendingInvite';
import { GameClient } from '../GameClient';
import { MapInstance } from '../../maps/MapInstance';

export class InstanceInvite extends PendingInvite{ 
    private _map:MapInstance;

    constructor(to:GameClient, from:GameClient, declineTimeout?:number){
        // create the message
        let pname:string = from.selectedPlayer;
        let lvl:number = from.player.level;
        let mname:string = from.player.map.name;
        let ppl:number = from.player.map.numClients;
        let message:string = `${pname} (Level ${lvl}) has invited you to join them in the ${mname}, with ${ppl} other players.`;

        super("instance", message, to, from, declineTimeout);

        this._map = from.player.map;
    }

    public onAccept():void{
        if(this._map){
            this._map.addClient(this.to);
        }
    }
}