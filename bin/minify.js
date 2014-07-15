var querystring = require('querystring');
var http = require("http");
var fs = require("fs");

if (process.argv.length!=4) {
  console.log("USAGE: node minify.js fileIn.js fileOut.min.js");
  process.exit(1);
}

var fileIn = process.argv[2];
var fileOut = process.argv[3];

console.log("Minifying ",fileIn,"to",fileOut);
var js = fs.readFileSync(fileIn).toString();

// first off, replace all binary numbers
js = require("./common.js").makeECMA5(js);

//console.log(js);

// Now wrap up the JS so that the compiler will strip out any locals
js = "(function(){\n" + js + "\n})();";

//console.log(js);

// Now send to closure compiler 

function minify(type, callback) {
  // nicked from http://stackoverflow.com/questions/6158933/how-to-make-an-http-post-request-in-node-js)
  var post_data = querystring.stringify({
  'compilation_level' : 'SIMPLE_OPTIMIZATIONS',
  'output_format': 'text',
  'output_info': type,
  //'warning_level' : 'QUIET',
  'js_code' : js
  });

  //console.log(js);

  var post_options = {
  host: 'closure-compiler.appspot.com',
  port: '80',
  path: '/compile',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': post_data.length
  }
  };
  var minified = "";
  console.log('Sending to Google Closure Compiler...');
  // Set up the request
  var post_req = http.request(post_options, function(res) {
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      minified += chunk;
    });
    res.on('end', function () {
      console.log('Minification complete!');
      callback(minified);
    });
  });
  // post the data
  post_req.write(post_data);
  post_req.end();
}

minify('compiled_code', codeMinified);


function codeMinified(minified) {
  var codeStart = "(function(){";
  var codeEnd = "})();\n";
  var actualStart = minified.substr(0,codeStart.length);
  var actualEnd = minified.substr(-codeEnd.length);
  if (actualStart==codeStart && actualEnd==codeEnd) {
    console.log("Complete!");
    minified = minified.substring(codeStart.length, minified.length - codeEnd.length);
    fs.writeFileSync(fileOut, minified);
  } else {
    console.log("Compilation failed - function wrapper not found. Got:", JSON.stringify(actualStart), JSON.stringify(actualEnd));
    console.log(minified);
    minify('errors', function(errors) {
      console.log(errors);
      process.exit(1);
    });
  }
}
/*

    cat module_wrapped.js | curl -s \
       -d compilation_level=SIMPLE_OPTIMIZATIONS \
       -d output_format=text \
       -d output_info=compiled_code \
       --data-urlencode "js_code@/dev/fd/0" \
       http://closure-compiler.appspot.com/compile > module_minified.js
    sed -n ':a;N;$!ba;s/^(function(){\(.*\)})();$/\1/p' module_minified.js > $MODULEDIR/$MINJS*/
