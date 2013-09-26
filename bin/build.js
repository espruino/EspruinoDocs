// Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. 
var fs = require('fs');
var marked = require('marked');
//var pygmentize = require('pygmentize-bundled')
//var hljs = require('highlight.js')

var BASEDIR = ".";

// Set default options except highlight which has no default
marked.setOptions({
  gfm: true, // github markdown
// yay. both broken.
/*  highlight: function (code, lang) {
    return hljs.highlightAuto(lang, code).value;
  },*/
/*  highlight: function (code, lang, callback) {
    pygmentize({ lang: lang, format: 'html' }, code, function (err, result) {
      if (err) return callback(err);
      callback(null, result.toString());
    });
  },*/
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: true,
  smartLists: true,
  smartypants: false,
  langPrefix: 'lang-'
});


function getFiles(dir) {
  var results = [];
  var list = fs.readdirSync(dir);
  for (i in list) {
    var file = list[i];
    if (file == "node_modules") continue;
    file = dir + '/' + file;
    var stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(file));
    } else {
      results.push(file);
    }
  }
  return results;
};

function getMarkdown(dir) {
  var results = [];
  getFiles(dir).forEach(function(f) { 
    if (f.substr(-3) == ".md" && f.substr(-9)!="README.md") {
      results.push(f);
    }
  });
  return results;
}

var markdownFiles = getMarkdown(BASEDIR);

function grabKeywords(markdownFiles) {
  var keywords = {};
  var regex = /KEYWORDS: (.*)/;
  markdownFiles.forEach(function (file) {

   // get file info
   var contents = fs.readFileSync(file).toString();
   var contentLines = contents.split("\n");
   if (contentLines[0].substr(0,15)!="<!--- Copyright") console.log("WARNING: "+file+" doesn't have a copyright line");
   if (contentLines[2].substr(0,3)!="===") console.log("WARNING: "+file+" doesn't have a title on the first line");
   var fileInfo = {
     path : file,
     title : contentLines[1], // second line
   };
   // add keyword for directory
   file.split("/").forEach(function (k) {
     if (k.indexOf(".")>0) return; // no actual files
     if (keywords[k] != undefined)  {
       keywords[k].push(fileInfo);
     } else {
       keywords[k] = [fileInfo];
     }
   });
   // add keywords in file
   var match = contents.match(regex);
   if (match!=null) {
     match[1].split(",").forEach(function(k) { 
       //console.log(k);
       if (keywords[k] != undefined)  {
         keywords[k].push(fileInfo);
       } else {
         keywords[k] = [fileInfo];
       }
     });
   }
  });
  return keywords;
}

console.log(markdownFiles);
var keywords = grabKeywords(markdownFiles);
console.log(keywords);

htmlFiles = {};
htmlLinks = {};
markdownFiles.forEach(function (file) {
  var htmlFile = file.substring(file.lastIndexOf("/")+1);
  htmlFile = htmlFile.replace(/ /g,"+");
  htmlFile = htmlFile.substring(0,htmlFile.lastIndexOf("."))+".html";
  htmlFiles[file] = "html/"+htmlFile;
  htmlLinks[file] = htmlFile;
});

markdownFiles.forEach(function (file) {
   var contents = fs.readFileSync(file).toString();
   // replace simple links
   contents = contents.replace(/\[\[([a-zA-Z0-9_ ]+)\]\]/g,"[$1]($1.html)");
   // TODO - 'Tutorial 2' -> 'Tutorial+2', recognize pages that are references in docs themselves
   var contentLines = contents.split("\n");
   var regex = /APPEND_KEYWORD: (.*)/;
   for (i in contentLines) {
      var match = contentLines[i].match(regex);
      if (match!=null) {
        var kw = match[1];
        if (keywords[kw]!=undefined) {
          var links = keywords[kw].map(function(a,b) { return "* ["+a.title+"]("+htmlLinks[a.path]+")"; });
          contentLines[i] = links.join("\n");
        } else {
          console.log("WARNING: APPEND_KEYWORD for '"+kw+"' in "+file+" found nothing");
          contentLines[i] = "";
        }
      }
   }
   
   contentLines.splice(0,1); // remove first line (copyright)
   
   html = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">'+
'<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">'+
'<head>'+
'        <link rel="stylesheet" href="css/sitewide.css" type="text/css" />'+
'        <link rel="stylesheet" href="css/sh_style.css" type="text/css" />'+		
'        <script type="text/javascript" src="js/sh_main.min.js"></script>'+
'        <script type="text/javascript" src="js/sh_javascript.min.js"></script>'+
'        <title>'+contentLines[0]+'</title>'+
'</head>'+
'<body onload="sh_highlightDocument();"><div id="wrap"><div id="main">'+
marked(contentLines.join("\n")).replace(/lang-JavaScript/g, 'sh_javascript')+
'</div></div></body>'+
'</html>';

   
   fs.writeFile(htmlFiles[file], html);
});


