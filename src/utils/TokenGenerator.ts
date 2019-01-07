export class TokenGenerator{
    private static vals:string[] = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890".split("");

    private _tokenLength:number;
    private _tokens:{[token:string]: boolean};

    constructor(tokenLength:number=16){
        this._tokenLength = tokenLength;
        this._tokens = {};
    }

    // generates a new, unused token
    public nextToken():string{
        let token:string = null;

        // keep generating tokens until an unused is made 
        do{
            token = TokenGenerator.anyToken(this.tokenLength);
        } while(this.hasToken(token));

        // store new token
        this._tokens[token] = true;
        return token;
    }

    // removes token from storage (could be dangerous!)
    public releaseToken(token:string):boolean{
        return delete this._tokens[token];
    }

    // is the token currently stored? 
    public hasToken(token:string):boolean{
        return token in this._tokens;
    }

    // getter for the token length (how many characters)
    public get tokenLength():number{
        return this._tokenLength;
    }

    // hashes a token 
    public static hashToken(input:string):string{
        // buffer to store generated characters
        let buffer:string[] = new Array<string>(input.length);
        // calculate halfway index (part of algorithm)
        let halfWayIndex:number = Math.ceil(input.length / 2) - 1;

        // for each input character...
        // (i = current character index, s = buffer index to store character at)
        for(let i:number = 0, s:number=0; i < input.length; i++){
            // character code
            let cc:number = input.charCodeAt(i);

            // calculate an the hash index
            let hashIndex:number = (i + cc ** 2) % TokenGenerator.vals.length;
            // get the hash character using the hash index 
            let hashChar:string = TokenGenerator.vals[hashIndex];

            // update buffex index 's' 
            if(i < halfWayIndex){
                s = halfWayIndex - i;
            }
            else if(i >= halfWayIndex){
                s = input.length - i + halfWayIndex;
            }

            // store token in the buffer 
            buffer[s] = hashChar;
        }

        // conver the buffer to a string 
        return buffer.join("");
    }

    // generates a random token 
    public static anyToken(tokenLength:number):string{
        // holds characters
        let buffer:string[] = new Array<string>(tokenLength);

        // generate random characters 
        for(let i:number = 0; i < tokenLength; i++){
            // generate a random in-range index, store the value at that location in the buffer
            let arrayIndex:number = Math.floor(Math.random() * TokenGenerator.vals.length);
            buffer[i] = TokenGenerator.vals[arrayIndex];
        }

        // convert buffer to string 
        return buffer.join("");
    }
}