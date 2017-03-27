// Copyright (c) 2017 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission.

/* Adds comments to all the '.md' files pointing to the Espruino site
 - it seems lots of people are using github directly and are finding that
   unsurprisingly links, jsdocs, etc don't work. */
   
var fs = require('fs');
var path = require('path');
if (fs.existsSync==undefined) fs.existsSync = path.existsSync;
var common = require("./common.js");
var BASEDIR = path.resolve(__dirname, "..");

function getWebsiteFilename(file) {
  if (file.substr(-3)!=".md")
    throw new Error("Expecting .md file, got "+file);
  var slash = file.lastIndexOf("/")+1;
  return file.substring(slash, file.length-3);
}

var markdownFiles = common.getMarkdown(BASEDIR).map(function (file) {
  file = path.relative(BASEDIR, file);
  var originalText = fs.readFileSync(file).toString();
  var txt = originalText.split("\n");
  if (txt[0].substr(0,15)!="<!--- Copyright")
    console.warn("WARNING: Missing/mis-formatted Copyright in "+file);
  if (txt[2].substr(0,3)!="===")
    console.warn("WARNING: Missing/mis-formatted Title in "+file);
  if (txt[3]!="")
    console.warn("WARNING: Expecting blank line #4 on "+file);
  
  var realURL = "https://www.espruino.com/"+getWebsiteFilename(file);
  var warnText = '<span style="color:red">:warning: **Please '+
  'view the correctly rendered version of this page at '+realURL.replace(/ /g,"+")+'. '+
  'Links, lists, videos, search, and other features will not work correctly '+
  'when viewed on GitHub** :warning:</span>';  
  if (txt[4].substr(0,6)!="<span ") {
    txt.splice(4,0,warnText,'');
  } else
    txt[4] = warnText;
  if (txt[5]!="")
    console.warn("WARNING: Expecting blank line #6 on "+file);
  var newText = txt.join("\n");
  if (newText!=originalText) {
    console.log("Adding comments to "+file);
    fs.writeFileSync(file, newText);
  }
});
