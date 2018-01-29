import fetch from "../util/fetch-fill";
import URI from "urijs";

// /records endpoint
window.path = process.env.API_PATH || "http://localhost:3000/records";
var uriObj = URI(window.path);
// Your retrieve function plus any additional functions go here ...
function handleErrors(response) {
    if (!response.ok) {
        throw Error(response.statusText);
    }
    return response;
}

function retrieve(...args) {
    var uri = constructURI(args[0]);
    return new Promise(function(resolve, reject) {
        fetch(URI(uri.uriObj))
        .then(res => res.json())
        .catch(err => console.log(err))
        .then(res =>  {  
            peekNext(uri)
            .then(peek => {             
                var payload = { 
                    ids: res.map(idMap => { return idMap.id }),
                    open: 
                        res.filter(filter => {
                            return filter.disposition === 'open'
                        })
                        .map(map => { 
                            return  {                                  
                                id: map.id, 
                                color: map.color, 
                                disposition: map.disposition, 
                                isPrimary: isPrimaryColor(map.color) 
                            } 
                        }),
                    closedPrimaryCount: 
                        res.filter(filter => {
                            return filter.disposition === 'closed' && 
                            isPrimaryColor(filter.color);                        
                        }).length,
                    previousPage: uri.page == 1 || uri.page == NaN ? null : uri.page-1,                
                    nextPage: peek.length > 0 ? uri.page+1 : null 
                };
                return resolve(payload);
            })
            .catch(err => {
                console.log(err);
                resolve(err);                
            });
        });       
    });
}

function peekNext(uri) {
    uri.uriObj.removeSearch('offset');
    uri.uriObj.addSearch({'offset': uri.offset + 10});
    return fetch(URI(uri.uriObj)).then(res => res.json())
}

function constructURI(params) {
    uriObj = new URI(window.path);        
    var constructed = {
        uriObj: uriObj,
        page: (params && params.page) ? params.page : 1,
        colors: (params && params.colors) ? params.colors : null,
        offset: ((params && params.page && params.page != 1) ? params.page-1 : 0) * 10    
    };
    constructed.uriObj.addSearch({'limit': 10, 'offset': constructed.offset});
    if (constructed.colors) {
        uriObj.addSearch({'color[]': constructed.colors});
    }
    return constructed;
}

function isPrimaryColor(color) {
    return ['red', 'yellow', 'blue'].includes(color);
}



export default retrieve;
