import { GameClient } from "./GameClient";
import { OpCode, Status } from "./Comm";

export class GameChat{
    public handleChatMessage(client:GameClient, data:{chat?:string}):void{
        // must be in a map
        if(!client.player || !client.player.map){
            client.respondChatMessage(null, null, "You must be in a map.");
            return;
        }

        // extract request parameters
        let {chat=null} = data;

        // enforce request parameters
        if(!chat){
            client.respondChatMessage(null, null, "Bad request json.");
            return;
        }

        // admin command or normal chat? 
        if(chat.charAt(0) === "~" && client.accessLevel > 1){
            // admin command with privilege
            this.handleAdminCommand(client, chat);
        }
        else{
            // send the chat to everyone in the map 
            client.player.map.broadcastChat(chat, client.selectedPlayer);
        }
    }

    // handle admin command
    private handleAdminCommand(client:GameClient, chat:string):void{
        let split:string[] = chat.split(" ");   // each word in message
        let command:string = split[0];          // first word = '~command'

        // which command requested? 
        switch(command){
            // broadcast message to map 
            case "~broadcast":
                client.player.map.broadcastChat(split[1], "<Server Admin>");
                break;
            // add something (xp, gold, etc)
            case "~add":
                this.adminCommandAdd(client, split);
                break;
            default:
                this.sendChat(client, "Invalid admin command.");
                break;

        }
    }

    private adminCommandAdd(client:GameClient, split:string[]):void{
        let subcommand:string = split[1] || null;
        let arg:number = parseInt(split[2]) || 1;

        switch(subcommand){
            case "xp":
                client.player.addXP(arg);
                break;
            case "gold":
                client.player.addGold(arg);
                break;
            default:
                this.sendChat(client, "Invalid add subcommand.");
                break;
        }
    }

    private sendChat(client:GameClient, chat:string, from?:string):void{
        client.respondChatMessage(chat, from, null);
    }
}