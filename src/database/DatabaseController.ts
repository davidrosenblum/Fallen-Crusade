import { MongoClient, Db } from "mongodb";
import { AccountsCollection } from './AccountsCollection';
import { AccountData } from "./AccountData";
import { CharactersCollection, CharacterDocument, CharacterPreviewDocument } from './CharactersCollection';
import { NPCDocument, NPCsCollection } from "./NPCsCollection";

export class DatabaseController{
    private _database:Db;

    constructor(database:Db){
        this._database = database;

        this.createCollections();
    }

    public close():void{
        this._database
    }

    private createCollections():void{
        AccountsCollection.createCollections(this._database);
        CharactersCollection.createCollections(this._database);
        NPCsCollection.createCollections(this._database);
    }   

    public createAccount(username:string, password:string):Promise<string>{
        return AccountsCollection.createAccount(this._database, username, password);
    }

    public getAccount(username:string, password:string):Promise<AccountData>{
        return AccountsCollection.getAccount(this._database, username, password);
    }

    public updateAccessLevel(username:string, accessLevel?:number):Promise<string>{
        return AccountsCollection.updateAccessLevel(this._database, username, accessLevel);
    }

    public updateAccountBan(username:string, ban:boolean):Promise<string>{
        return AccountsCollection.updateAccountBan(this._database, username, ban);
    }

    public createCharacter(accountID:string, name:string, skin?:number):Promise<string>{
        return CharactersCollection.createCharacter(this._database, accountID, name, skin);
    }

    public getCharacter(accountID:string, name:string):Promise<CharacterDocument>{
        return CharactersCollection.getCharacter(this._database, accountID, name);
    }

    public getCharacterList(accountID:string):Promise<CharacterPreviewDocument[]>{
        return CharactersCollection.getCharacterList(this._database, accountID);
    }

    public deleteCharacter(accountID:string, name:string):Promise<string>{
        return CharactersCollection.deleteCharacter(this._database, accountID, name);
    }

    public updateCharacter(accountID:string, name:string, update:{[field:string]: any}):Promise<string>{
        return CharactersCollection.updateCharacter(this._database, accountID, name, update);
    }

    public loadNPCs():Promise<NPCDocument[]>{
        return NPCsCollection.loadNPCs(this._database);
    }

    public insertDefaultNPCs():Promise<string[]>{
        return NPCsCollection.insertDefaults(this._database);
    }
}