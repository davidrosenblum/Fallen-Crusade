import { Db } from "mongodb";
import { TokenGenerator } from '../utils/TokenGenerator';
import { AccountData } from './AccountData';

// schema for the accounts collection
export interface AccountDocument{
    username:string;
    password:string;
    enabled:boolean;
    access_level:number;
    date_joined:number;
}

// schema for salts collection
export interface SaltDocument{
    username:string;
    salt:string;
}

export class AccountsCollection{
    // # of characters each password must be in storage (salt length included!)
    private static readonly PASSWORD_LENGTH:number = 64;

    // creates the expected database collections and indexes
    public static createCollections(database:Db):void{
        // creates the 'accounts' collection, with the unique field 'username'
        database.createCollection("accounts").then(() => {
            database.collection("accounts").createIndex("username", {unique: true})
        });

        // creates the 'salts' collection, with the unique field 'username'
        database.createCollection("salts").then(() => {
            database.collection("salts").createIndex("username", {unique: true})
        });
    }

    // creates a new account 
    public static createAccount(database:Db, username:string, password:string):Promise<string>{
        return new Promise((resolve, reject) => {
            // generate a salt, relative to the size of the password 
            let salt:string = TokenGenerator.anyToken(AccountsCollection.PASSWORD_LENGTH - password.length);
            // salt the password and hash it 
            let hash:string = TokenGenerator.hashToken(password + salt);

             // create the account document object
            let accountDoc:AccountDocument = {
                username, password: hash, enabled: true, access_level: 1, date_joined: Date.now()
            };

            // create the salt document object
            let saltDoc:SaltDocument = {
                username, salt
            };

            // store the account object in the database 
            database.collection("accounts").insertOne(accountDoc)
                .then(() => {
                    // account success, store the salt object in the database
                    database.collection("salts").insertOne(saltDoc)
                        .then(() => {
                            // total success!
                            resolve(`Account "${username}" created.`)
                        })  
                        .catch(err => {
                            // (this is highly unlikely)
                            // salt failed - reject and delete the account 
                            database.collection("accounts").deleteOne({username});
                            reject(err);
                        });                             
                })
                .catch(err => {
                    // account error (probably bad username)
                    if(err.code === 11000){
                        reject(new Error(`Account "${username}" already exists.`));
                    }
                    else reject(err);
                }); 
        });
    }

    // retrieves an account - requires login credentials 
    public static getAccount(database:Db, username:string, password:string):Promise<AccountData>{
        return new Promise((resolve, reject) => {
            // find account by username 
            database.collection("accounts").findOne({username})
                .then(accountDoc => {
                    // database responded - results exist?
                    if(accountDoc){
                        // result! is it enabled?
                        if(accountDoc.enabled){
                            // enabled! - load the salt to then verify password
                            AccountsCollection.getSalt(database, username)
                                .then(saltDoc => {
                                    // salt and hash request password
                                    let hash:string = TokenGenerator.hashToken(password + saltDoc.salt);

                                    // comparse result hashed password to request hashed password
                                    if(accountDoc.password === hash){
                                        // its a match! - resolve an account object
                                        // (hides certain details and is read-only)
                                        resolve(new AccountData(
                                            accountDoc._id.toString(), accountDoc.username, accountDoc.access_level
                                        ));
                                    }
                                    else reject(new Error(`Wrong password.`));
                                })
                                .catch(err => reject(err)); // database error
                        }
                        else reject(new Error(`Account "${username}" is locked.`));
                    }
                    else reject(new Error(`Account "${username}" does not exist.`));
                })
                .catch(err => reject(err));     // database error
        });
    }

    // gets salt document for associated username 
    private static getSalt(database:Db, username:string):Promise<SaltDocument>{
        return new Promise((resolve, reject) => {
            // load the salt 
            database.collection("salts").findOne({username})
                .then(result => {
                    // resolve salt doc or reject if nothing found
                    result ? resolve(result) : reject(new Error("Salt not found."));
                })
                .catch(err => reject(err)); // database error
        });
    }
}