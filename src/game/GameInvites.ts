import { GameClient } from './GameClient';
import { Unit } from '../characters/Unit';
import { PendingInvite } from './invites/PendingInvite';
import { GameController } from './GameController';
import { PendingInviteFactory } from './invites/PendingInviteFactory';

export class GameInvites{
    private _pendingInvites:{[inviteID:string]: PendingInvite};

    constructor(){
        this._pendingInvites = {};
    }

    public handleInviteSend(client:GameClient, data:{objectID:string, inviteType?:string}):void{
        if(!client.player || !client.player.map){
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

        // get the target player's actual player by ID 
        let unit:Unit = client.player.map.getUnit(objectID);
        if(!unit){
            client.respondInviteSend(null, "Target not found.");
            return;
        }

        // find the recipient player from the actual player object 
        let targetClient:GameClient = unit.map.getClient(unit.ownerID);
        if(!targetClient){
            client.respondInviteSend(null, "Target is not a player."); // or player not found (impossible?)
            return;
        }

        // recipient cant only have 1 invite at time 
        if(targetClient.hasPendingInvite){
            client.respondInviteSend(null, `${targetClient.selectedPlayer} is busy.`);
            return;
        }

        // create the invite
        let invite:PendingInvite = PendingInviteFactory.create(inviteType, client, targetClient);

        // deliver invite to target 
        targetClient.setPendingInvite(invite);
        targetClient.notifyInvite(invite.message);

        // inform sender that the invitation was sent
        client.respondInviteSend(`Invite sent to ${targetClient.selectedPlayer}.`, null);
    }

    public handleReplyInvite(client:GameClient, data:{inviteID:string, accept?:boolean}):void{
        // must be in a map
        if(!client.player || !client.player.map){
            client.respondInviteReply(null, "You are not in a map.");
            return;
        }
        
        // must have a pending invite
        if(!client.pendingInvite){
            client.respondInviteReply(null, "You do not have any pending invitations.");
            return;
        }

        // extract request parameters
        let {inviteID=null, accept=null} = data;

        // enforce request parameters
        if(!inviteID || typeof accept !== "boolean"){
            client.respondInviteReply(null, "Bad request json.");
            return;
        }

        // find the invite
        let invite:PendingInvite = this.getPendingInvite(inviteID);
        if(!invite || invite !== client.pendingInvite){
            client.respondInviteReply(null, "Invalid invite ID.");
            return;
        }

        // this should never happen, but fallback for avoid delaying/double responses
        if(!invite.isPending){
            client.respondInviteReply(null, "Invitation expired.");
            return;
        }

        // accept or decline invitation? 
        invite.resolve(accept);

        // forget invite
        delete this._pendingInvites[invite.inviteID];

        // destroy the invitation 
        client.setPendingInvite(null);
        delete this._pendingInvites[invite.inviteID];
        invite = null;
    }

    private getPendingInvite(inviteID:string):PendingInvite{
        return this._pendingInvites[inviteID] || null;
    }
}