export class AccountData{
    private _username:string;
    private _accountID:string;
    private _accessLevel:number;

    constructor(accountID:string, username:string, accessLevel:number){
        this._accountID = accountID;
        this._username = username;
        this._accessLevel = accessLevel;
    }

    // getter for read-only account ID
    public get accountID():string{
        return this._accountID;
    }

    // getter for read-only username
    public get username():string{
        return this._username;
    }

    // getter for read-only access level
    public get accessLevel():number{
        return this._accessLevel;
    }
}