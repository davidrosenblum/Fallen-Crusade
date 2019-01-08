export class Ajax{
    // sends an http request (returns a promise)
    static request(options){
        // extract request parameters 
        let {url, method="GET", headers=null, query=null, data=null} = options;

        return new Promise((resolve, reject) => {
            // create the request
            let xhr = new XMLHttpRequest();
            // handle
            xhr.addEventListener("load", () => resolve(xhr));
            // handle errors
            xhr.addEventListener("error", err => reject(err));

            // optional query strings
            if(query){
                url += Ajax.queryString(query);
            }

            // open the request
            xhr.open(method, url, true);
            
            // optional request headers
            if(headers){
                for(let header in headers){
                    xhr.setRequestHeader(header, headers[header]);
                }
            }

            // send the request 
            xhr.send(data);
        });
    }

    // sends an http GET request 
    static get(url, headers, query, data){
        return Ajax.request({url, headers, query, data, method: "GET"});
    }

    // sends an http POST request
    static post(url, headers, query, data){
        return Ajax.request({url, headers, query, data, method: "POST"});
    }

    // generates a query string for the given parameters
    // {linkinPark: "meteora", tool: "lateralus"} -> "?linkinPark=meteora&tool=lateralus"
    static queryString(parameters){
        let params = [];

        for(let param in parameters){
            params.push(`${param}=${parameters[param]}`);
        }

        return "?" + params.join("&");
    }

    // gets simple cross-origin resource sharing (cors) headers object
    static getCorsHeaders(origin="*"){
        return {
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Headers": "Access-Control-Allow-Origin"
        };
    }
}