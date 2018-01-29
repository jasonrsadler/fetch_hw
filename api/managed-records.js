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
    let qParams = args[0];  
    var uriObj = new URI(window.path),
    page = (qParams && qParams.page) ? qParams.page : 1,
    colors = (qParams && qParams.colors) ? qParams.colors : null,
    offset = ((page && page != 1) ? page-1 : 0) * 10;
    uriObj.addSearch({'limit': 10, 'offset': offset})
    if (colors) {
        uriObj.addSearch({'color[]': colors});
    }
    return new Promise(function(resolve, reject) {
        
        fetch(URI(uriObj))
        .then(r => r.json())
        .catch(err => console.log(err))
        .then(function(res)  {  
            uriObj.removeSearch('offset');
            uriObj.addSearch({'offset': offset + 10});
            fetch(URI(uriObj)).then(r => r.json())
            .then(next => {             
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
                    })
                    .length,
                    previousPage: page == 1 || page == NaN ? null : page-1,                
                    nextPage: next.length > 0 ? page+1 : null 
                    
                    
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

function isPrimaryColor(color) {
    return color === 'red' || color === 'yellow' || color === 'blue';
}



export default retrieve;
