/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/

var http = require('http');
var thisData = {results: []}; //
// use url module to parse url 


exports.requestHandler = function(request, response) {

  console.log("Serving request type " + request.method + " for url " + request.url);

  if (request.url==="/arglebargle"){
    response.writeHead(404, defaultCorsHeaders);
    response.end();
  }

  if (request.method==="GET"){
    processGET(request, response);
  } 

  if (request.method==="POST"){
    processPOST(request, response, function(value){
      var val = JSON.parse(value);
      thisData.results.push(val);
    });
  }

  
};


var defaultCorsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10, // Seconds.
  'Content-Type': "application/json"
};

function processGET(request, response) {
    var headers = defaultCorsHeaders;
    var data = JSON.stringify(thisData);
    var statusCode=200;
    console.log("Sending:" + data);

    response.writeHead(statusCode, headers);
    response.end(data);


}

function processPOST(request, response, cb) {
  var headers = defaultCorsHeaders;
  var statusCode=201;
  var data="";

  request.on('data', function(chunk) { data += chunk; });
  request.on('end', function() { 
    cb(data); 
    response.writeHead(statusCode, headers);
    response.end();
  });

}
