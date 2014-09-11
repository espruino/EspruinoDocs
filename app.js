/* node.js script that creates a webserver to serve up the pages from the html directory */

var express = require('express');
var app = express();

app.all('/*', function(req, res, next) {
  if (!req.url.match(/.*\/?\./)) {
    req.url += '.html';
  }
  console.log('returning: ' + req.url);
  return express.static(__dirname + '/html')(req, res, next);
});

var port = process.env.PORT || 3040;
console.log('** EspruinoDocs - running on port ' + port + ' **');
app.listen(port);
