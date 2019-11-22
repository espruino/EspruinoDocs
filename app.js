/* node.js script that creates a webserver to serve up the pages from the html directory */

var express = require('express');
var app = express();

app.all('/*', function(req, res, next) {
  // The root page is part of the large site and so is not available
  // locally. Instead we default to a given page to kick off.
  if (req.url === '/') {
    res.redirect('/Original.html');
    return next();
  } else if (!req.url.match(/.*\/?\./)) {
    req.url += '.html';
  }
  console.log('returning: ' + req.url);
  return express.static(__dirname + '/html')(req, res, next);
});

app.listen(process.env.PORT || 3040, function(app){
  var port = this.address().port;
  console.log('** EspruinoDocs - running on http://localhost:%s/Original **', port);
});
