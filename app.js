/* node.js script that creates a webserver to serve up the pages from the html directory */

var express = require('express');
const cors = require('cors');
const homeDirectory = require('os').homedir();
var app = express();
app.use(cors());

app.all('/*', function(req, res, next) {
  // The root page is part of the large site and so is not available
  // locally. Instead we default to a given page to kick off.
  var urlLocation = __dirname + '/html';
  if (req.url === '/') {
    res.redirect('/Original.html');
    return next();
  } else if (!req.url.match(/.*\/?\./)) {
    req.url += '.html';
  } else if (req.url.match(/^\/modules\//)){
    console.log("got here")
    urlLocation = homeDirectory + "/workspace/espruinowebsite/www";
  }
  console.log('returning: ' + req.url);
  return express.static(urlLocation)(req, res, next);
});

app.listen(process.env.PORT || 3040, function(app){
  var port = this.address().port;
  console.log('** EspruinoDocs - running on http://localhost:%s/Original **', port);
});
