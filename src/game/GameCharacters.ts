import { GameClient } from "./GameClient";
import { OpCode, Status } from "./Comm";
import { DatabaseController } from "../database/DatabaseController";
import { CharacterDocument } from '../database/CharactersCollection';

export class GameCharacters{
    private _database:DatabaseController;

    constructor(database:DatabaseController){
        this._database = database;
    }

    public handleCharacterList(client:GameClient):void{
        // client must have be logged in
        if(!client.hasAccountData){
            client.respondCharacterList(null, "You are not logged in.");
            return;
        }

        // load the character list
        this._database.getCharacterList(client.accountID)
            .then(characterList => {
                client.respondCharacterList(characterList, null);
            })  
            .catch(err => {
                client.respondCharacterList(null, "You are not logged in.");
            });
    }

    public handleCharacterCreate(client:GameClient, data:{name?:string, skin?:number}):void{
        // client must have be logged in
        if(!client.hasAccountData){
            client.respondCharacterCreate(null, "You are not logged in.");
            return;
        }

        // extract request parameters
        let {name=null, skin=1} = data;

        // enforce parameters 
        if(!name){
            client.respondCharacterCreate(null, "Bad request json.");
            return;
        }

        // create the character
        this._database.createCharacter(client.accountID, name, skin)
            .then(response => {
                client.respondCharacterCreate(response, null);
            })
            .catch(err => {
                console.log('err in HCC',err.message);
                client.respondCharacterCreate(null, err.message);
            });
    }

    public handleCharacterDelete(client:GameClient, data:{name?:string}):void{
        // client must have be logged in
        if(!client.hasAccountData){
            client.respondCharacterDelete(null, "You are not logged in.");
            return;
        }

        // extract request parameters
        let {name=null} = data;

        // enforce parameters
        if(!name){
            client.respondCharacterDelete(null, "Bad request json.");
            return;
        }

        // delete the character
        this._database.deleteCharacter(client.accountID, name)
            .then(response => {
                client.respondCharacterDelete(response, null);
            })
            .catch(err => {
                client.respondCharacterDelete(null, err.message);
            });
    }

    public handleCharacterSelect(client:GameClient, data:{name?:string}, success:(save:CharacterDocument)=>void):void{
        // client must have be logged in
        if(!client.hasAccountData){
            client.respondCharacterSelect(null, "You are not logged in.");
            return;
        }

        // can't already have a player
        if(client.player){
            client.respondCharacterSelect(null, "You already have a player.");
            return;
        }

        // extract request parameters
        let {name=null} = data;

        // enforce parameters
        if(!name){
            client.respondCharacterSelect(null, "Bad request json.");
            return;
        }

        this._database.getCharacter(client.accountID, name)
            .then(save => {
                client.setSelectedPlayer(name);
                client.respondCharacterSelect("Success.", null);
                success(save);
            })
            .catch(err => {
                client.respondCharacterSelect(null, "Server error.");
            });
    }
}