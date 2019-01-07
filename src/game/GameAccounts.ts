import { GameClient } from "./GameClient";
import { DatabaseController } from '../database/DatabaseController';

export class GameAccounts{
    public static readonly CLIENT_VERSION:string = "0.1.0";

    private _accounts:{[username:string]: GameClient};
    private _database:DatabaseController;

    constructor(database:DatabaseController){
        this._accounts = {};
        this._database = database;
    }

    public handleLogin(client:GameClient, data:{username?:string, password?:string, version?:string}):void{
        // extract request parameters
        let {username=null, password=null, version=null} = data;

        // enforce version
        if(version !== GameAccounts.CLIENT_VERSION){
            client.respondLogin(null, "Wrong client version.");
            return;
        }

        // one login at once
        if(username in this._accounts){
            client.respondLogin(null, `Account "${username}" is already online.`);
            return;
        }

        // load account from database (enforces login credentials)
        this._database.getAccount(username, password)
            .then(accountData => {
                // successful login! 
                // associate username with client
                this._accounts[username] = client;
                // store account data
                client.setAccountData(accountData);

                client.respondLogin(client.clientID, null);
            })
            .catch(err => {
                client.respondLogin(null, err.message);
            }); 
        
    }

    public handleLogout(client:GameClient):void{
        // logout functionality
        this.forceLogout(client);

        // update client 
        client.respondLogout("You have been logged out.", null);
    }

    public forceLogout(client:GameClient):void{
        // remove account
        if(client.hasAccountData){
            delete this._accounts[client.username];
        }

        // remove from map
        if(client.player && client.player.map){
            client.player.map.removeClient(client);
        }

        // decline any pending invite 
        if(client.hasPendingInvite){
            client.pendingInvite.from.notifyInviteResponse(false);
        }
    }
}