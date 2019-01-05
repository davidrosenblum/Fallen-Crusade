import { GameClient } from '../GameClient';
import { PendingInvite } from './PendingInvite';
import { InstanceInvite } from './InstanceInvite';

export class PendingInviteFactory{
    public static create(type:string, to:GameClient, from:GameClient, declineTimeout?:number):PendingInvite{
        switch(type){
            case "instance":
                return new InstanceInvite(to, from, declineTimeout);
            default:
                return null;
        }
    }
}