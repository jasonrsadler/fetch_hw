import fetch from "../util/fetch-fill";
import URI from "urijs";

// /records endpoint
window.path = process.env.API_PATH || "http://localhost:3000/records";
var uriObj = URI(window.path);
// Your retrieve function plus any additional functions go here ...
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
    
    console.log(uriObj.toString());
    console.log('page: ' + page + ' _ offset: ' + offset);
    var promise = new Promise(function(resolve, reject) {
        fetch(URI(uriObj))
        .then((response) => response.json())
        .then(function(res)  {  
            uriObj.removeSearch('offset');
            uriObj.addSearch({'offset': offset + 10});
            fetch(URI(uriObj)).then(r => r.json())
            .then(next => {             
                var payload = { 
                    ids: res.map(idMap => { return idMap.id }),
                    previousPage: page == 1 || page == NaN ? null : page-1,                
                    nextPage: next.length > 0 ? page+1 : null, 
                    open: [],
                    closedPrimaryCount: 0
                };
                return resolve(payload);
                //resolve(res.json()); //output data grabbed from endpoint to test
            })
        })
            .catch(err => {
                resolve('Exception in promise, trying to recover: ' + err);   
            });    
        })
        return promise;
    }
    
    export default retrieve;
    
    // let qParams = args[0];  
    //     var uriObj = new URI(window.path);
    //     var limit = 10;
    //     var offset = 10 * (qParams && qParams.page) ? qParams.page - 1 : 0;
    //     var colors = (qParams && qParams.colors) ? qParams.colors : null;
    //     uriObj.addSearch({'limit': 10, 'offset': offset});
    //     if (colors)
    //         uriObj.addSearch({'color[]': colors});
    
    //     console.log(uriObj.toString());
    //     return new Promise(function(resolve, reject) {
    //         fetch(URI(uriObj))
    //         .then((response) => response.json()).catch(err => {
    //             reject(err);
    //         })
    //         .then(function(res)  { 
    //             var payload = { 
    //                 ids: res.map(idMap => { return idMap.id })
    //                 .slice((page-1 || 0)*10, ((page-1 || 0)*10) + 10),
    //                 previousPage: page == 1 || page == NaN ? 
    //                     null : --page,
    //                 nextPage: 1,
    //                 open: [],
    //                 closedPrimaryCount: 0
    //             };
    //             resolve(payload);
    //             //resolve(res.json()); //output data grabbed from endpoint to test
    //         }).reject(payload);
    
    //     });