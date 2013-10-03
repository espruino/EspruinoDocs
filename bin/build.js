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
  sanitize: false,
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

function addKeyword(keywords, k, fileInfo) {
  k = k.toLowerCase();
  //console.log(k);
  if (keywords[k] != undefined)  {
    var contains = false;
    for (i in keywords[k])
      if (keywords[k][i]["title"]==fileInfo["title"])
        return true;
    if (!contains)
      keywords[k].push(fileInfo);
  } else {
    keywords[k] = [fileInfo];
  }
}

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
     if (k.indexOf(".")>0) k = k.substr(0,k.indexOf(".")); // remove file extension
     addKeyword(keywords, k, fileInfo);
   });
   // add keywords in file
   var match = contents.match(regex);
   if (match!=null) {
     match[1].split(",").forEach(function(k) { 
       addKeyword(keywords, k, fileInfo);
     });
   }
  });
  return keywords;
}

// Create a keywords structure that can be used for searching the website
function createKeywordsJS(keywords) {
  var kw = {};
  for (keyword in keywords) {
    var keywordPages = keywords[keyword];
    var kwd = [];
    kw[keyword] = kwd;
    for (idx in keywordPages) {
      var data = keywordPages[idx];
      kwd.push({ title : data["title"],
                 file : htmlLinks[data["path"]] });
    }
  }
  return kw;
}

console.log(markdownFiles);
var keywords = grabKeywords(markdownFiles);
console.log(keywords);

htmlFiles = {};
htmlLinks = {};
markdownFiles.forEach(function (file) {
  var htmlFile = file.substring(file.lastIndexOf("/")+1);
  htmlFile = htmlFile.replace(/ /g,"+");
  htmlFile = htmlFile.substring(0,htmlFile.lastIndexOf("."));
  htmlFiles[file] = "html/"+htmlFile+".html";
  htmlLinks[file] = htmlFile;
});

fs.writeFile("html/keywords.js", "var keywords = "+JSON.stringify(createKeywordsJS(keywords))+";");


markdownFiles.forEach(function (file) {
   var contents = fs.readFileSync(file).toString();
   // replace simple links
   contents = contents.replace(/\[\[http:\/\/youtu.be\/([a-zA-Z0-9_ ]+)\]\]/g,"[![Video Thumbnail](http://img.youtube.com/vi/$1/0.jpg)](http://www.youtube.com/watch?v=$1)"); // youtube
   contents = contents.replace(/\[\[([a-zA-Z0-9_ ]+)\]\]/g,"[$1]($1.html)");
   contents = contents.replace(/(\[.+\]\([^ ]+) ([^ ]+\))/g,"$1+$2");
   // Hacks for 'broken' markdown parsing
   contents = contents.replace(/\n\n```([^\n]+)```\n\n/g,"\n\n```\n$1\n```\n\n"); // turn in-line code on its own into separate paragraph
   contents = contents.replace(/```([^ \n][^\n]+)```/g,"``` $1 ```"); // need spaces after ```
   // Hide keywords
   contents = contents.replace(/(.*KEYWORDS: .*)/g, "<!---\n$1\n--->");
   // TODO - 'Tutorial 2' -> 'Tutorial+2', recognize pages that are references in docs themselves
   var contentLines = contents.split("\n");
   var regex = /APPEND_KEYWORD: (.*)/;
   for (i in contentLines) {
      var match = contentLines[i].match(regex);
      if (match!=null) {
        var kw = match[1].toLowerCase();;
        if (keywords[kw]!=undefined) {
          var pages = keywords[kw];
          var links = [ ];
          for (j in pages) {
            var a = pages[j];
            if (a["path"]!=file)
              links.push("* ["+a.title+"]("+htmlLinks[a.path]+")" );
          }        
          contentLines[i] = links.join("\n");
        } else {
          console.log("WARNING: APPEND_KEYWORD for '"+kw+"' in "+file+" found nothing");
          contentLines[i] = "";
        }
      }
   }
   
   contentLines.splice(0,1); // remove first line (copyright)
   
   html = marked(contentLines.join("\n")).replace(/lang-JavaScript/g, 'sh_javascript');
   github_url = "https://github.com/espruino/EspruinoDocs/blob/master/"+file;
   html = '<div style="min-height:700px;">' + html + '</div>'+
          '<p style="text-align:right;font-size:75%;">This page is auto-generated from <a href="'+github_url+'">GitHub</a>. If you see any mistakes or have suggestions, please <a href="https://github.com/espruino/EspruinoDocs/issues">let us know</a>.</p>';
/*   html = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">'+
'<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">'+
'<head>'+
'        <link rel="stylesheet" href="css/sitewide.css" type="text/css" />'+
'        <link rel="stylesheet" href="css/sh_style.css" type="text/css" />'+		
'        <script type="text/javascript" src="js/sh_main.min.js"></script>'+
'        <script type="text/javascript" src="js/sh_javascript.min.js"></script>'+
'        <title>'+contentLines[0]+'</title>'+
'</head>'+
'<body onload="sh_highlightDocument();"><div id="wrap"><div id="main">'+
html+
'</div></div></body>'+
'</html>';*/

   
   fs.writeFile(htmlFiles[file], html);
});


