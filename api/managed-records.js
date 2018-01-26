import fetch from "../util/fetch-fill";
import URI from "urijs";

// /records endpoint
window.path = "http://localhost:3000/records";
var uriObj = URI(window.path);
// Your retrieve function plus any additional functions go here ...
function retrieve(...args) {
    var uriObj = new URI(window.path);
    var data = args[0];  
    uriObj.addSearch({page: data.page, 'colors': data.colors});
    fetch(URI(uriObj)).then(function(res)  {  
        
        console.dir(res.id);
    })
    .catch(err => {
        console.log('promise rejected: ', err);
    });
}
export default retrieve;
