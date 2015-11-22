// common espruino-related stuff

// sudo npm install -g acorn

var fs = require('fs');
var path = require('path');
if (fs.existsSync==undefined) fs.existsSync = path.existsSync;

/** Make Espruino code ECMA5 compatible (remove binary numbers, etc */
exports.makeECMA5 = function(code) {
  code = code.replace(/0b([01][01]*)/g, "parseInt(\"$1\",2)");
  return code;
};

/** Given JavaScript code, parse it and return a flattened version with comments */
exports.getJSDocumentation = function(js) {
  js = exports.makeECMA5(js);
  // Parse it and store any '/**' comments we got
  var comments = [];
  var ast = require("acorn").parse(js, {
    locations : true,
    onComment : function(block, text, start, end, startLoc, endLoc) {
      if (text[0]=="*" || text[0]=="/") text=text.substr(1);
      comments[endLoc.line+1] = text.trim();
    }
  });
  // convert function to a pretty string
  function fnToString(node) {
    var args = node.params.map(function (n) { return n.name; });
    return "function ("+args.join(", ")+") { ... }";
  }
  function tweakComment(comment) {
    comment = ("\n"+comment).
              replace(/```\n/g,"").
              replace(/```/g,"").trim();
   if (comment[0]=="*")
     return "/" + comment + "\n */\n";
   else if (comment.indexOf("\n")>=0)
     return "/* " + comment + "\n*/\n";
   else
     return "// " + comment + "\n";
  }
  
  var functions = {};
  var result = "";
  // Now try and find function definitions in the base of the module
  // These are either 'exports.XXX = ' or 'XXX.prototype.YYY = '
  ast.body.forEach(function (expr) {
    //console.log(expr);
    if (expr.type=="FunctionDeclaration") {
      functions[expr.id.name] = expr;
    }
    // X.prototype.y = function() ...
    // exports.foo = function() ...
    if (expr.type=="ExpressionStatement" && expr.expression.right.type=="FunctionExpression") {
      var left = expr.expression.left;
      var leftString = undefined;
      if (left.object.property && left.object.property.name == 'prototype')
        leftString = left.object.object.name+".prototype."+left.property.name;
      else if (left.object.name == 'exports')
        leftString = "exports."+left.property.name;
      if (leftString) {
        if (expr.loc.start.line in comments) result += tweakComment(comments[expr.loc.start.line]);
        result += leftString+" = "+fnToString(expr.expression.right)+"\n\n";
      }
    }
    // exports = Function
    if (expr.type=="ExpressionStatement" && expr.expression.right.type=="Identifier" &&
        (expr.expression.right.name in functions)) {
       var func = functions[expr.expression.right.name];
       if (func.loc.start.line in comments) 
         result += tweakComment(comments[func.loc.start.line]);
       result += fnToString(func)+"\n\n";
    }

  });
  return result;
};


exports.getFiles = function(dir) {
  var results = [];
  if (fs.existsSync(dir)) {
    var list = fs.readdirSync(dir);
    for (i in list) {
      var file = list[i];
      if (file == "node_modules" || file == "html") continue;
      file = dir + '/' + file;
      var stat = fs.statSync(file);
      if (stat && stat.isDirectory()) {
        results = results.concat(exports.getFiles(file));
      } else {
        results.push(file);
      }
    }
  }
  return results;
};

exports.getMarkdown = function(dir) {
  var results = [];
  exports.getFiles(dir).forEach(function(f) { 
    if (f.substr(-3) == ".md" && f.substr(-9)!="README.md") {
      results.push(f);
    }
  });
  return results;
 }; 
