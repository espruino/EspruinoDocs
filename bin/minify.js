#!/usr/bin/node
/*
Minify Espruino Modules
-----------------------

Will use offline closure compiler if it was installed
or will use online compiler.

*/

var JSEXTERNS_FILE = __dirname+"/espruino.externs";
var fs = require("fs");
const os = require('os');
const path = require('path');
const child_process = require("child_process");
const CLOSURE_JAR = path.join(__dirname, "..", "closure-compiler.jar");

function closureOnline(js,jsExterns,fileOut, compilation_level,advancedOptimisation) {
  var https = require("https");
  var options = [
    ['compilation_level',compilation_level],
    ['language_out',language_out],
    ['output_format','json'],
    ['output_info','compiled_code'],
    ['output_info','errors'],
    ['output_info','warnings'],
    ['warning_level','VERBOSE'],
    ['rewrite_polyfills',false],
    ['js_code',js],
    ['js_externs',jsExterns]
   //['language','ECMASCRIPT5_STRICT'],
  ];
  var post_data = options.map( o => encodeURIComponent(o[0])+"="+encodeURIComponent(o[1])).join("&");
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
      codeMinified(fileOut, minified,advancedOptimisation );
    });
  });
  // post the data
  post_req.write(post_data);
  post_req.end();
}


function closureOffline(js,jsExterns,fileOut,compilation_level,advancedOptimisation) {
  // wow. closure CLI doesn't like binary literals??
  //js = js.replace(/(0b[01]+)/g, n => parseInt(n.substr(2),2));
  // create files
  const tmpPath = path.join(os.tmpdir(), 'minify-'+Math.round(Math.random()*0xFFFFF).toString(16));
  fs.writeFileSync(tmpPath+".js", js);
  fs.writeFileSync(tmpPath+".ext.js", jsExterns);

  var options = [
    ['compilation_level',compilation_level],
    ['warning_level','VERBOSE'],
    ['rewrite_polyfills',false],
    ['language_in','ECMASCRIPT_2020'],
    ['language_out','ECMASCRIPT_2015'],
    ['jscomp_warning','undefinedVars'],    
    ['strict_mode_input','false'],    
    ["js", tmpPath+".js"],
    ["externs", tmpPath+".ext.js"],
    ["js_output_file", tmpPath+".out.js"]
  ];
  var cli;// = "closure-compiler";
  cli = "java -jar "+'"'+CLOSURE_JAR+'"';
  cli += " "+options.map( o => "--"+o[0]+" "+o[1]).join(" ");
  child_process.execSync(cli);

  fs.unlinkSync(tmpPath+".js", js)
  fs.unlinkSync(tmpPath+".ext.js", js)

  var finalJS = fs.readFileSync(tmpPath+".out.js").toString();
  fs.unlinkSync(tmpPath+".out.js", js)
  codeMinified(fileOut,finalJS,advancedOptimisation);
}

function codeMinified(fileOut, minified,advancedOptimisation) {
  if (!advancedOptimisation) {
    minified = unwrapSelfInvocation( minified );
  }
  // replace unicode-style \u00## string escapes with \x## - shorter, and in Espruino even if unicode is enabled we treat them as bytes
  minified = minified.replace(/\\u00([0-9a-f][0-9a-f])/g, "\\x$1");
  console.log("Complete!");
  fs.writeFileSync(fileOut, minified);
}

function wrapSelfInvocation( js ) {
  return "(function(){\n" + js + "\n})();";
}

function unwrapSelfInvocation( wrappedJs ) {
  if (wrappedJs.startsWith("'use strict';"))
    wrappedJs = wrappedJs.substr("'use strict';".length);
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

module.exports  = function(fileIn,fileOut,fileExterns){
  

  console.log("Minifying ",fileIn,"to",fileOut);
  var js = fs.readFileSync(fileIn).toString();

  // check if advanced optimization is possible
  var advancedOptimisation = false;
  var jsExterns = fs.readFileSync( JSEXTERNS_FILE );
  if (fs.existsSync(fileExterns)) {
    jsExterns += ("\n" + fs.readFileSync(fileExterns).toString());
    advancedOptimisation = true;
  }

  // Now wrap up the JS so that the compiler will strip out any locals in simple optimization mode.
  // This is not necessary with advance optimization.
  if (!advancedOptimisation) {
    js = wrapSelfInvocation( js );
  }

  var compilation_level = advancedOptimisation ? 'ADVANCED_OPTIMIZATIONS' : 'SIMPLE_OPTIMIZATIONS';
  if (js.includes("MINIFY_WHITESPACE_ONLY"))
    compilation_level = "WHITESPACE_ONLY";
  var language_out = (js.includes('ECMASCRIPT_2015')?'ECMASCRIPT_2015':'STABLE');
  console.log("compilation_level =",compilation_level,
              "\nlanguage_out =",language_out);

                // any other way to test for existence??
  if (!fs.existsSync(CLOSURE_JAR)) {
    console.log(CLOSURE_JAR);
    console.log("===================================================================");
    console.log("Using online closure compiler. To use faster offline version download");
    console.log("the closure compiler jar to closure-compiler.jar");
    console.log("===================================================================");
    closureOnline(js,jsExterns,fileOut,compilation_level,advancedOptimisation);
  } else {
    console.log("Using offline closure compiler");
    closureOffline(js,jsExterns,fileOut,compilation_level,advancedOptimisation);
  }
}


