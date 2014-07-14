#!/bin/node
// This code runs over all the files in EspruinoDocs and works out what functions they call.
// That's then stored and used to make a list of usages

// tern stuff
var fs = require("fs"), path = require("path"), url = require("url");
var util = require('util');
var dir = process.cwd();

// Load tern inference thingybob
var infer = require("./tern/infer.js");
// require("../../tern/plugin/node.js"); // for handling node.js 'require'?
var defs = [JSON.parse(fs.readFileSync("espruino.json"))];

var urls = {};

function inferFile(filename, fileContents) {
  var cx = new infer.Context(defs, this);
  infer.withContext(cx, function() {
    //console.log(JSON.stringify(filename));
    var ast = infer.parse(fileContents);
    infer.analyze(ast, "file:"+filename /* just an id */);
    // find all calls
    require("acorn/util/walk").simple(ast, { "CallExpression" : function(n) {
     var expr = infer.findExpressionAt(n.callee);
     var type = infer.expressionType(expr);
     // search prototype chain of type to try and find our call
     if (type.forward && type.types) {
       var name = type.forward[0].propName;
       type.types.forEach(function(t) {
         var def = undefined;
         while (t && !def) {
           if (t.props && name in t.props)
             def = t.props[name];
           t = t.proto;
         }
         if (def) type = def;
       });
     }
     if (type && type.types && type.types.length>0) {
       var url = type.types[0].url;
       if (url) {
         if (!(url in urls)) urls[url] = [];
         var lineInfo = require("acorn").getLineInfo(fileContents, n.start);
         var link = filename+"#line"+lineInfo.line;
         if (urls[url].indexOf(link)<0)
           urls[url].push(link);
         // lineInfo.col?
       }
     }
    }});
  });
}

// Scan for all JS files
require('child_process').exec("find .. -name '*.js'", function(error, stdout, stderr) {
  var files = stdout.toString().trim().split("\n");
  files.forEach(function(fn) {
    if (fn.indexOf("../bin/")!=0 && fn.indexOf("../node_modules/")!=0) {
      var fileContents = fs.readFileSync(fn);
      //inferFile(fn, fileContents);
    }
  });

  require('child_process').exec("find .. -name '*.md'", function(error, stdout, stderr) {
    var files = stdout.toString().trim().split("\n");
    files.forEach(function(fn) {
      if (fn.indexOf("../README.md")!=0 && fn.indexOf("../node_modules/")!=0) {
        console.log(fn);
        var fileContents = fs.readFileSync(fn).toString();
        var codeBlocks = fileContents.match( /```[^`]*```/g );
        if (codeBlocks)
          codeBlocks.forEach(function(code) {
            if (code.indexOf("```\n")==0 || code.indexOf("```JavaScript\n")==0) {
              code = code.slice(code.indexOf("\n")+1,-3);
              inferFile(fn, code);
            } else console.log("Ignoring code block because first line is "+JSON.stringify(code.split("\n")[0]));
          });

        //inferFile(fn, fileContents);
      }
    });
    console.log(urls);
  });
});



