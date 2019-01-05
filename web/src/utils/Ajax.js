export class Ajax{
    static request(url, method="GET", headers=null, query=null, data=null){
        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            xhr.addEventListener("load", () => resolve(xhr));
            xhr.addEventListener("error", err => reject(err));

            if(query){
                url += Ajax.queryString(query);
            }

            xhr.open(method, url, true);

            if(headers){
                for(let header in headers){
                    xhr.setRequestHeader(header, headers[header]);
                }
            }

            xhr.send(data);
        });
    }

    static get(url, headers, query, data){
        return Ajax.request(url, "GET", headers, query, data);
    }

    static post(url, headers, query, data){
        return Ajax.request(url, "POST", headers, query, data);
    }

    static queryString(parameters){
        let params = [];

        for(let param in parameters){
            params.push(`${param}=${parameters[param]}`);
        }

        return "?" + params.join("&");
    }

    static getCorsHeaders(origin="*"){
        return {
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Headers": "Access-Control-Allow-Origin"
        };
    }
}