import { GameClient } from './GameClient';
import { PendingInvite } from './invites/PendingInvite';
import { PendingInviteFactory } from './invites/PendingInviteFactory';

export class GameInvites{
    private _pendingInvites:{[inviteID:string]: PendingInvite};

    constructor(){
        this._pendingInvites = {};
    }

    public handleInviteSend(client:GameClient, data:{objectID:string, inviteType?:string}, findClient:(objectID:string)=>GameClient):void{
        if(!client.map){
            client.respondInviteSend(null, "You are not in a map.");
            return;
        }

        /*if(client.hasSentInvite){
            client.respondInviteSend(null, "You sent an invitation that is pending.");
            return;
        }*/

        // extract request parameters
        let {objectID=null, inviteType=null} = data;
        
        // enforce request parameters
        if(!objectID || !inviteType){
            client.respondInviteSend(null, "Bad request json.");
            return;
        }

        // find the recipient player from the actual player object 
        let targetClient:GameClient = findClient(objectID);

        // must find target
        if(!targetClient){
            client.respondInviteSend(null, "Couldn't find target to invite.");
            return;
        }

        // recipient cant only have 1 invite at time 
        if(targetClient.hasPendingInvite){
            client.respondInviteSend(null, `${targetClient.selectedPlayer} is busy.`);
            return;
        }

        // create the invite
        let invite:PendingInvite = PendingInviteFactory.create("instance", targetClient, client);

        // deliver invite to target 
        targetClient.setPendingInvite(invite);
        targetClient.notifyInvite(invite.message);

        // inform sender that the invitation was sent
        client.respondInviteSend(`Invite sent to ${targetClient.selectedPlayer}.`, null);
    }

    public handleReplyInvite(client:GameClient, data:{inviteID:string, accept?:boolean}):void{
        // must be in a map
        if(!client.map){
            client.respondInviteReply(null, "You are not in a map.");
            return;
        }
        
        // must have a pending invite
        if(!client.pendingInvite){
            client.respondInviteReply(null, "You do not have any pending invitations.");
            return;
        }

        // extract request parameters
        let {accept} = data;

        // enforce request parameters
        if(typeof accept !== "boolean"){
            client.respondInviteReply(null, "Bad request json.");
            return;
        }

        // this should never happen, but fallback for avoid delaying/double responses
        if(!client.pendingInvite.isPending){
            client.respondInviteReply(null, "Invitation expired.");
            return;
        }

        // tell the sender of the update 
        //client.pendingInvite.from.notifyInviteResponse(accept);

        // send response text
        client.pendingInvite.from.sendChatMessage(`${client.selectedPlayer} has ${accept ? "accepted" : "declined"} your invite.`);

        // accept or decline invitation? (does its job)
        client.pendingInvite.resolve(accept);

        // destroy the invitation 
        client.setPendingInvite(null);
    }
}