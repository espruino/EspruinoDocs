// Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. 
// Generate keywords.js, and convert Markdown into HTML

// needs marked + jsdoc + tern + acorn

var fs = require('fs');
var path = require('path');
if (fs.existsSync==undefined) fs.existsSync = path.existsSync;
var common = require("./common.js");

var BASEDIR = path.resolve(__dirname, "..");
var HTML_DIR = BASEDIR+"/html/";
var IMAGE_DIR = "refimages/";

var ESPRUINO_DIR = path.resolve(BASEDIR, "../Espruino");
var FUNCTION_KEYWORD_FILE = path.resolve(BASEDIR, "../Espruino/function_keywords.js");
var KEYWORD_JS_FILE = path.resolve(HTML_DIR, "keywords.js");

var marked = require('marked');
//var pygmentize = require('pygmentize-bundled')
//var hljs = require('highlight.js')


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


function WARNING(s) {
  console.log("WARNING: "+s);
}

var markdownFiles = common.getMarkdown(BASEDIR).map(function (file) {
  return path.relative(BASEDIR, file);
});

var preloadedFiles = {};
var fileTitles = {};

function addToList(keywords, k, fileInfo) {
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

function grabInfo(markdownFiles, preloadedFiles) {
  var keywords = {};
  var parts = {};

  if (fs.existsSync(FUNCTION_KEYWORD_FILE))
    keywords = JSON.parse(fs.readFileSync(FUNCTION_KEYWORD_FILE));

  markdownFiles.forEach(function (file) { 
   // get file info
   var contents = preloadedFiles[file] ? preloadedFiles[file] : fs.readFileSync(BASEDIR+"/"+file).toString();
//   console.log(file,contents.length); 
   var contentLines = contents.split("\n");
   if (contentLines[0].substr(0,15)!="<!--- Copyright") WARNING(file+" doesn't have a copyright line");
   if (contentLines[1].trim()=="" || contentLines[2].substr(0,3)!="===") WARNING(file+" doesn't have a title on the first line");
   var fileInfo = {
     path : file,
     title : contentLines[1], // second line
   };
   fileTitles[fileInfo.path] = fileInfo.title; 
   // add keyword for directory
   file.split("/").forEach(function (k) {
     if (k.indexOf(".")>0) k = k.substr(0,k.indexOf(".")); // remove file extension
     addToList(keywords, k, fileInfo);
   });
   // add keywords in file
   var match;
   match = contents.match(/\n\* KEYWORDS: (.*)/);
   if (match!=null) {
     match[1].split(",").forEach(function(k) { 
       addToList(keywords, k, fileInfo);
     });
   }
   match = contents.match(/\n\* USES: (.*)/);
   if (match!=null) {
     match[1].split(",").forEach(function(k) { 
       addToList(parts, k, fileInfo);
     });
   }
  });

  // sort keywords
  for (keyword in keywords) 
    keywords[keyword].sort(function(a,b){ return (a.title == b.title)?0:(a.title > b.title ? 1 : -1); });

  return {keywords:keywords, parts:parts};
}

function grabWebsiteKeywords(keywords) {        
  common.getFiles(path.resolve(BASEDIR,"../espruinowebsite/cms")).forEach(function(f) { 
    if (f.substr(-5) != ".html") return;
    var fileName = f.substring(f.lastIndexOf("/")+1,f.length-5);
    var fileInfo = {
      path : "/"+fileName,
      title : fileName.replace(/\+/g, " ")
    };
    addToList(keywords, fileName.replace("+"," "), fileInfo); // add filename
    console.log("Checking Website file "+fileName);

    var contents = fs.readFileSync(f).toString();

    var match = contents.match(/\* KEYWORDS: (.*)/);
     if (match!=null) {
       console.log("  found keywords "+match[1]);
       match[1].split(",").forEach(function(k) { 
         addToList(keywords, k, fileInfo);
     });
   }
  });
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
      var f = (data["path"].substr(0,1)=="/") ? data["path"] : htmlLinks[data["path"]];
      if (f==undefined) WARNING("No file info for "+data["path"]);
      kwd.push({ title : data["title"],
                 file : f });
    }
  }
  return kw;
}

function handleImages(file, contents) {
  var directory = file;
  if (directory.lastIndexOf("/")>0)
    directory = directory.substr(0, directory.lastIndexOf("/"));
  var tagStart = contents.indexOf("![");
  while (tagStart>=0) {
    var tagMid = contents.indexOf("](", tagStart);
    var tagEnd = contents.indexOf(")", tagMid);
    if (tagMid>=0 && tagEnd>=0) {
      // we've found a tag - do stuff
      var imageName = contents.substring(tagMid+2, tagEnd);
      var imagePath = directory+"/"+imageName;
      if (fs.existsSync(imagePath)) {
/*        console.log("IMAGE -----------------------------");
        console.log(imageName);
        console.log(imagePath);*/
        var newPath = /*htmlLinks[file]+"_"+*/imageName;
        console.log(newPath);
        newPath = newPath.replace(/\//g,"_");
        newPath = newPath.replace(/\+/g,"_");
        newPath = newPath.replace(/ /g,"_");
        newPath = IMAGE_DIR+newPath
        //console.log("Copying "+imagePath+" to "+HTML_DIR+newPath);
        fs.createReadStream(imagePath).pipe(fs.createWriteStream(path.resolve(HTML_DIR, newPath)));
        // now rename the image in the tag
        contents = contents.substr(0,tagMid+2)+newPath+contents.substr(tagEnd);
      } else {
        WARNING(file+": Image '"+imagePath+"' does not exist");
      }
    }
    tagStart = contents.indexOf("![", tagStart+1);
  }
  return contents;
}

// Now handle our simple 'example' files
var exampleDir = path.resolve(BASEDIR,"examples");
var exampleFiles = fs.readdirSync(exampleDir);
for (i in exampleFiles) {
  var exampleFile = path.relative(BASEDIR, path.resolve(exampleDir,exampleFiles[i]));
  if (exampleFile.substr(-3) != ".js") continue;
  console.log("Example File "+exampleFile);
  var contents = fs.readFileSync(exampleFile).toString();
  var slashStar = contents.indexOf("/*");
  var starSlash = contents.indexOf("*/",slashStar);
  if (slashStar>=0 && starSlash>=0) {  
    var newFile = "<!--- Copyright (c) 2014 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->\n";
//    newFile += exampleFile+"\n";
//    newFile += "====================================\n";
//    newFile += "\n";
    newFile += contents.substr(slashStar+2, starSlash-(3+slashStar)).trim() + "\n";
    newFile += "\n\n";
    newFile += "Source Code\n";
    newFile += "-----------\n\n";
    newFile += "```\n";
    newFile += contents.substr(starSlash+2).trim()+"\n";
    newFile += "```\n";
    // add file
    markdownFiles.push(exampleFile);
    preloadedFiles[exampleFile] = newFile;

  } else WARNING(exampleFile+" has no comment block at the start");
  
}



//console.log(markdownFiles);
var fileInfo = grabInfo(markdownFiles, preloadedFiles);
//console.log(fileInfo.keywords);
grabWebsiteKeywords(fileInfo.keywords);

htmlFiles = {};
htmlLinks = {};
markdownFiles.forEach(function (file) {
  var htmlFile = file.substring(file.lastIndexOf("/")+1);
  htmlFile = htmlFile.replace(/ /g,"+");
  htmlFile = htmlFile.substring(0,htmlFile.lastIndexOf("."));
  htmlFiles[file] = HTML_DIR+htmlFile+".html";
  htmlLinks[file] = htmlFile;
});

fs.writeFileSync(KEYWORD_JS_FILE, "var keywords = "+JSON.stringify(createKeywordsJS(fileInfo.keywords),null,1)+";");


// ---------------------------------------------- Inference code
/* Works out which of Espruino's built-in commands are used in which
 files */
//Load tern inference thingybob
var infer = require("tern/lib/infer");

var defs = [JSON.parse(fs.readFileSync(path.resolve(BASEDIR, "bin/espruino.json")))];
// Our list of Reference URLs that are used
var urls = {};


function inferFile(filename, fileContents, baseLineNumber) {
  function addLink(url, node) {
    if (!(url in urls)) urls[url] = [];
    var lineNumber = baseLineNumber + require("acorn").getLineInfo(fileContents, node.start).line;
    var link = "/"+htmlLinks[filename]+"#line=";
    var found = false;
    for (var i in urls[url]) {
      if (urls[url][i].url.indexOf(link)==0) {
        var lineNumbers = urls[url][i].url.substr(link.length).split(",");
        if (lineNumbers.indexOf(lineNumber)<0)
          urls[url][i].url += ","+lineNumber;
        found = true;
      }
    }
    if (!found)
      urls[url].push({ url : link+lineNumber, title : fileTitles[filename]});
  }

  var cx = new infer.Context(defs, null);
  infer.withContext(cx, function() {
    //console.log(JSON.stringify(filename));
    var ast = infer.parse(fileContents, {}, {});
    infer.analyze(ast, "file:"+filename /* just an id */);
    // find all calls
    require("acorn/dist/walk").simple(ast, { "CallExpression" : function(n) {
     var expr = infer.findExpressionAt(n.callee);
     var type = infer.expressionType(expr);

     // Try and handle 'require(...).foo) - this doesn't work for 
     // var fs = require("fs") though.
     if (n.callee.type=="MemberExpression" && 
         n.callee.object.type=="CallExpression" &&
         n.callee.object.callee.type=="Identifier" &&
         n.callee.object.callee.name=="require" &&
         n.callee.object.arguments.length==1 &&
         n.callee.object.arguments[0].type=="Literal") {
       var lib = n.callee.object.arguments[0].value;
       var name = n.callee.property.name;       
       if (defs[0][lib] && defs[0][lib][name] && defs[0][lib][name]["!url"]) { 
//         console.log(">>>>>>>>>>>>>>>"+lib+":"+name);       
//         console.log(defs[0][lib][name], defs[0][lib][name]["!url"]);
         addLink(defs[0][lib][name]["!url"], n);
       }
     }

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
       if (url) addLink(url, n);
     }
    }});
  });
}

function inferMarkdownFile(filename, fileContents) {
  var baseLineNumber = 0;
  var codeBlocks = fileContents.match( /```[^`]+```|[ \n\t]`[^`]+`/g );
  if (codeBlocks)
    codeBlocks.forEach(function(code) {
      if (code.indexOf("```\n")==0 || code.indexOf("```JavaScript\n")==0) {
        code = code.slice(code.indexOf("\n")+1,-3);
        inferFile(filename, code, baseLineNumber);
      } else {
        //console.log("Ignoring code block because first line is "+JSON.stringify(code.split("\n")[0]));        
      }
      // increment line counter
      // ... multi-line code has ``` at the end which takes up a line
      var lines = code.split("\n").length;
      if (lines>1) lines--;
      //console.log(code, "--->",lines);
      baseLineNumber += lines;      
    });
}

// -------------------------------------------------------------
markdownFiles.forEach(function (file) {
   var contents = preloadedFiles[file] ? preloadedFiles[file] : fs.readFileSync(file).toString();
   //console.log(file,contents.length); 
   // Check over images... ![Image Title](foo.png)
   contents = handleImages(file, contents);
   
   // replace simple links
   contents = contents.replace(/\[\[http[s]?:\/\/youtu.be\/([a-zA-Z0-9\-_ ]+)\]\]/g,
           '<iframe allowfullscreen="" frameborder="0" height="360" src="http://www.youtube.com/embed/$1" width="640"></iframe>'); // youtube
   contents = contents.replace(/\[\[([a-zA-Z0-9_\- ]+).js\]\]/g,"[$1](/modules/$1.js) ([About Modules](/Modules))");
   contents = contents.replace(/\[\[([a-zA-Z0-9_\- ]+)\]\]/g,"[$1](/$1)");
   for (var i=0;i<3;i++) // cope with multiple spaces in links (nasty!)
     contents = contents.replace(/(\[.+\]\([^) ]+) ([^)]+\))/g,"$1+$2"); // spaces in links
   // Hacks for 'broken' markdown parsing
   contents = contents.replace(/\n\n```([^\n]+)```\n\n/g,"\n\n```\n$1\n```\n\n"); // turn in-line code on its own into separate paragraph
   contents = contents.replace(/```([^ \n][^\n]+)```/g,"``` $1 ```"); // need spaces after ```
   // Hide keywords
   contents = contents.replace(/\n(\* KEYWORDS: .*)/g, "<!---\n$1\n--->");
   contents = contents.replace(/\n(\* USES: .*)/g, "<!---\n$1\n--->");
   // TODO - 'Tutorial 2' -> 'Tutorial+2', recognize pages that are references in docs themselves
   var contentLines = contents.split("\n");
   
   var appendMatching = function(regex, kwName, infoList, ifNone) {
     for (i in contentLines) {
       var match = contentLines[i].match(regex);
       if (match!=null) {
         var kws = match[1].toLowerCase().split(",");
         var kw = kws[0];
         var links = [ ];
         if (infoList[kw]!=undefined) {
           var pages = infoList[kw];
           for (j in pages) {
             var a = pages[j];
             if (a["path"]!=file && htmlLinks[a.path]!=undefined) { // if we don't have links it is probably in the reference
               var pageOk = true;
               // if extra keywords specified, they may be to reject certain pages... check
               for (var k=1;k<kws.length;k++)
                 if (kws[k][0]=="-") {
                   var notkw = kws[k].substr(1);
                   if (infoList[notkw]!=undefined)                     
                     for (var notpg in infoList[notkw])
                       if (infoList[notkw][notpg]["path"]==a.path) {
                         console.log("REJECTED "+a.path+" from "+file+" because of '-"+notkw+"' keyword");
                         pageOk = false;
                       }
                 } else WARNING("Unknown keyword option '"+kws[k]+"'");
               // add page link if ok
               if (pageOk) 
                 links.push("* ["+a.title+"]("+htmlLinks[a.path]+")" );
             }
           }        
         } 
         if (links.length>0) {
           contentLines[i] = links.join("\n");
         } else {
           WARNING(kwName+" for '"+kw+"' in "+file+" found nothing");
           contentLines[i] = ifNone;
         }
       }
     }
   };
   
   appendMatching(/^\* APPEND_KEYWORD: (.*)/ , "APPEND_KEYWORD", fileInfo.keywords, "");
   appendMatching(/^\* APPEND_USES: (.*)/ , "APPEND_USES", fileInfo.parts, "No tutorials use this yet.");
   // try and handle module documentation
   for (i in contentLines) {
     var match;
     match = contentLines[i].match(/^\* APPEND_JSDOC: (.*)/);
     if (match!=null) {
       var jsfilename = file.substr(0, file.lastIndexOf("/")+1) + match[1];       
       var js = fs.readFileSync(jsfilename).toString();
       console.log("APPEND_JSDOC "+jsfilename);
       var doc = common.getJSDocumentation(js);
       /* setting the language to Java lets it be highlighted correctly
       while not adding the 'send to Espruino' icon */
       contentLines[i] = "```Java\n"+doc+"```\n";
     }
   }

   contentLines.splice(0,1); // remove first line (copyright)

   contents = contentLines.join("\n");
   
   // Get Markdown
   inferMarkdownFile(file, contents);
   html = marked(contents).replace(/lang-JavaScript/g, 'sh_javascript');

   // Check for Pinouts
        
   var regex = /<ul>\n<li>APPEND_PINOUT: (.*)<\/li>\n<\/ul>/;
   var match = html.match(regex);
   if (match!=null) {
     var htmlfilename = HTML_DIR+"boards/" + match[1] + ".html";       
     console.log("APPEND_PINOUT "+htmlfilename);       
     var pinout = fs.readFileSync(htmlfilename).toString();
     html = html.replace(regex, pinout);
   }

   //
   github_url = "https://github.com/espruino/EspruinoDocs/blob/master/"+path.relative(BASEDIR, file);
   html = '<div style="min-height:700px;">' + html + '</div>'+
          '<p style="text-align:right;font-size:75%;">This page is auto-generated from <a href="'+github_url+'">GitHub</a>. If you see any mistakes or have suggestions, please <a href="https://github.com/espruino/EspruinoDocs/issues/new?title='+file+'">let us know</a>.</p>';

   fs.writeFileSync(htmlFiles[file], html);
});


// -----------------------------------------------------------
// Finally write out the references
var refPath = path.resolve(BASEDIR, "references.json");
console.log("---------------------");
console.log("Writing references to "+refPath);
fs.writeFileSync(refPath, JSON.stringify(urls,null,1));
