var https = require("https");
var fs = require("fs");

if (process.argv.length!=4 && process.argv.length!=5) {
  console.log("USAGE: node minify.js fileIn.js fileOut.min.js [fileIn.externs]");
  process.exit(1);
}

var fileIn = process.argv[2];
var fileOut = process.argv[3];
var fileExterns = process.argv[4];

console.log("Minifying ",fileIn,"to",fileOut);
var js = fs.readFileSync(fileIn).toString();

// check inf advanced optimization is possible
var advancedOptimisation = false;
var jsExterns = fs.readFileSync( __dirname+"/espruino.externs" );
if (fs.existsSync(fileExterns)) {
  jsExterns += ("\n" + fs.readFileSync(fileExterns).toString());
  advancedOptimisation = true;
}

// Now wrap up the JS so that the compiler will strip out any locals in simple optimization mode.
// This is not necessary with advance optimization.
if (!advancedOptimisation) {
  js = wrapSelfInvocation( js );
}

// Now send to closure compiler

var compilation_level = advancedOptimisation ? 'ADVANCED_OPTIMIZATIONS' : 'SIMPLE_OPTIMIZATIONS';
console.log("compilation_level =",compilation_level);
// Couldn't use querystring library because of the multiple existence of 'output_info'.
var post_data = encodeURIComponent( 'compilation_level' ) + '=' + encodeURIComponent( compilation_level )
    + '&output_format=json'
    + '&output_info=compiled_code'
    + '&output_info=errors'
    + '&output_info=warnings'
    + '&warning_level=VERBOSE'
    //+ '&language=ECMASCRIPT5_STRICT'
    + '&js_code=' + encodeURIComponent( js )
    + '&js_externs=' + encodeURIComponent( jsExterns );

  //console.log(js);

var post_options = {
  host: 'closure-compiler.appspot.com',
  port: '443',
  path: '/compile',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(post_data) // post_data.length is not always corrrect
  }
};
var jsonResponseData = "";
console.log('Sending to Google Closure Compiler ('+(advancedOptimisation ? 'advanced' : 'simple')+')...');
// Set up the request
var post_req = https.request(post_options, function(res) {
  res.setEncoding('utf8');
  res.on('data', function (chunk) {
    jsonResponseData += chunk;
  });
  res.on('end', function () {

    try {
      var jsonResult = JSON.parse( jsonResponseData );
    } catch (e) {
      console.error("Error parsing JSON string:", JSON.stringify(jsonResponseData));
      process.exit(4);
    }

    if (jsonResult.serverErrors) {
      jsonResult.serverErrors.forEach( function (error) {
        console.error( "  Servererror " + error.code + ": " + error.error );
      });
      process.exit(3);
    }

    if (jsonResult.errors) {
      jsonResult.errors.forEach( function (error) {
        console.error( "  Error " + error.type + ": (" + error.lineno + "," + error.charno + ") "
            + error.error + ": '" + error.line + "'");
      });
      process.exit(2);
    }

    if (jsonResult.warnings) {
      jsonResult.warnings.forEach( function (warning) {
        // ignore certain warnings
        if (warning.type !== 'JSC_NOT_A_CONSTRUCTOR') {
          console.warn( "  Warning " + warning.type + ": (" + warning.lineno + "," + warning.charno + ") "
              + warning.warning + ": '" + warning.line + "'");
        }
      });
    }

    var minified = jsonResult.compiledCode + '\n';

    console.log('Minification complete! ' );
    codeMinified( minified );
  });
});
// post the data
post_req.write(post_data);
post_req.end();


function codeMinified(minified) {
  if (!advancedOptimisation) {
    minified = unwrapSelfInvocation( minified );
  }
  console.log("Complete!");
  fs.writeFileSync(fileOut, minified);
}

function wrapSelfInvocation( js ) {
  return "(function(){\n" + js + "\n})();";
}

function unwrapSelfInvocation( wrappedJs ) {
  var codeStart = "(function(){";
  var codeEnd = "})();\n";
  var actualStart = wrappedJs.substr(0,codeStart.length);
  var actualEnd = wrappedJs.substr(-codeEnd.length);
  if (actualStart===codeStart && actualEnd===codeEnd) {
    return wrappedJs.substring(codeStart.length, wrappedJs.length - codeEnd.length);
  } else {
    console.log("Compilation failed - function wrapper not found. Got:", JSON.stringify(actualStart), JSON.stringify(actualEnd));
    console.log( wrappedJs );
    process.exit(1);
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
