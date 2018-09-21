// Copyright (c) 2018 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission.
// Generate keywords.js, and convert Markdown into HTML

// needs marked + jsdoc + tern + acorn


console.log("Espruino documentation builder");
console.log("--------------------------------");
var OFFLINE = true;
var PROCESS_THUMBNAILS = true; // create thumbnails
var PROCESS_INFERENCE = true;  // type inference
var PROCESS_IMAGE_RESIZE = true;      // resize images
for (var i=2;i<process.argv.length;i++) {
  var a = process.argv[i];
  if (a=="--website") OFFLINE = false;
  else if (a=="--no-thumbs") PROCESS_THUMBNAILS = false;
  else if (a=="--no-infer") PROCESS_INFERENCE = false;
  else if (a=="--no-resize") PROCESS_IMAGE_RESIZE = false;
  else {
    console.log("Usage:");
    console.log("    build.js           # Build for offline viewing");
    console.log("    build.js --website # Build to be used on Espruino website");
    console.log("");
    console.log("         --no-thumbs    Skip creating thumbnails");
    console.log("         --no-infer     Skip type inference on code (for reference links)");
    console.log("         --no-resize    Skip image resizing");
    process.exit(1);
  }
}

var fs = require('fs');
var path = require('path');
if (fs.existsSync==undefined) fs.existsSync = path.existsSync;
var common = require("./common.js");
var child_process = require('child_process');

var BASEDIR = path.resolve(__dirname, "..");
var HTML_DIR = BASEDIR+"/html/";
var IMAGE_DIR = "refimages/";
var THUMB_WIDTH = 180;
var THUMB_HEIGHT = 140;

var ESPRUINO_DIR = path.resolve(BASEDIR, "../Espruino");
var FUNCTION_KEYWORD_FILE = path.resolve(BASEDIR, "../Espruino/function_keywords.js");
var KEYWORD_JS_FILE = path.resolve(HTML_DIR, "keywords.js");

var marked = require('marked');
// Set default options except highlight which has no default
var markedOptions = {
  gfm: true, // github markdown
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  smartLists: true,
  smartypants: false,
  langPrefix: 'lang-'
};
if (OFFLINE) {
  var hljs;
  try {
    hljs = require('highlight.js')
    markedOptions.highlight = function (code) {
      return hljs.highlightAuto(code).value;
    };
  } catch(e) {
    console.log("======================================================");
    console.log(" highlight.js not installed - not syntax highlighting");
    console.log("======================================================");
    var d = Date.now()+2000;
    while (Date.now()<d);
  }
}
marked.setOptions(markedOptions);

// Work out file ordering
var fileOrdering = {};
if (fs.existsSync(BASEDIR+"/ordering.txt")) {
  fs.readFileSync(BASEDIR+"/ordering.txt").toString().split("\n").map(function(line, linenumber) {
    line = line.substr(line.indexOf(" ")+1);
    fileOrdering[line] = linenumber;
  });
} else {
  console.log("WARNING: No 'ordering.txt' - not ordering tutorials");
  console.log(' - Generate with: git ls-tree -r --name-only HEAD | xargs -I{} git log -1 --format="%at {}" -- {} | sort > ordering.txt');
}

if (OFFLINE) {
  // if offline, copy the offline.css file in
  fs.createReadStream(path.resolve(BASEDIR, "bin/offline.css")).pipe(
    fs.createWriteStream(path.resolve(HTML_DIR, "offline.css")));
}

function WARNING(s) {
  console.log("WARNING: "+s);
}

function createSafeFilename(filename) {
  filename = filename.replace(/\//g,"_");
  filename = filename.replace(/\+/g,"_");
  filename = filename.replace(/ /g,"_");
  return filename;
}

function convertHTML(str) {
    var entityPairs = [
        {character: '&', html: '&amp;'},
        {character: '<', html: '&lt;'},
        {character: '>', html: '&gt;'},
        {character: "'", html: '&apos;'},
        {character: '"', html: '&quot;'},
    ];

    entityPairs.forEach(function(pair){
        var reg = new RegExp(pair.character, 'g');
        str = str.replace(reg, pair.html);
    });
    return str;
}

var fileDates = {};
// MD files
var markdownFiles = common.getMarkdown(BASEDIR).map(function (file) {
  var p = path.relative(BASEDIR, file);
  fileDates[p] = new Date(fs.statSync(p).ctime).getTime();
  return p;
});
// JS files
var exampleDir = path.resolve(BASEDIR,"examples");
var exampleFiles = fs.readdirSync(exampleDir).filter(function(file) {
  return file.substr(-3) == ".js";
}).map(function(file) {
  var p = path.relative(BASEDIR, path.resolve(exampleDir,file));
  fileDates[p] = new Date(fs.statSync(p).ctime).getTime();
  return p;
});

var preloadedFiles = {};
var fileTitles = {};

// Create thumbnail images
var markdownThumbs = {};
if (PROCESS_THUMBNAILS) markdownFiles.concat(exampleFiles).forEach(function(filename) {
  //console.log(filename);
  var baseName = filename.slice(0,-3);
  var sourceImage;
  if (fs.existsSync(baseName+".thumb.png"))
    sourceImage = baseName+".thumb.png";
  else if (fs.existsSync(baseName+".thumb.jpg"))
    sourceImage = baseName+".thumb.jpg";
  else if (fs.existsSync(baseName+".thumb.svg"))
    sourceImage = baseName+".thumb.svg";
  else if (fs.existsSync(baseName+".png"))
    sourceImage = baseName+".png";
  else if (fs.existsSync(baseName+".jpg"))
    sourceImage = baseName+".jpg";
  if (!sourceImage) {
    var contents = fs.readFileSync(filename).toString();
    var match = contents.match(/!\[[^\]]*\]\(([^\)]*)\)/);
    if (match)
      sourceImage = filename.substr(0,filename.lastIndexOf("/")+1)+match[1];
  }
  if (sourceImage) {
    var dstImage = IMAGE_DIR+createSafeFilename(baseName)+"_thumb.png";
    var radius = 6;
    var roundcorners = `\\( +clone -crop ${radius}x${radius}+0+0  -fill white -colorize 100% -draw 'fill black circle ${radius-1},${radius-1} ${radius-1},0' -background White -alpha shape \\( +clone -flip \\) \\( +clone -flop \\) \\( +clone -flip \\) \\) -flatten`;
    var cmd = `convert "${sourceImage}" -resize ${THUMB_WIDTH}x${THUMB_HEIGHT} +repage ${roundcorners} -gravity South -extent ${THUMB_WIDTH}x -strip -define png:include-chunk=none "${path.resolve(HTML_DIR, dstImage)}"`;
    //console.log(cmd);
    child_process.exec(cmd);
    console.log("THUMBNAIL "+filename+" --> "+dstImage);
    markdownThumbs[filename] = dstImage;
  } else {
    console.log("NO THUMBNAIL FOR "+filename);
  }
});
// Add 'unknown' thumbnail
{
  let dstImage = IMAGE_DIR+"no_thumb.png";
  child_process.exec(`convert files/blank_thumb.png -resize ${THUMB_WIDTH}x${THUMB_HEIGHT} +repage -gravity Center -extent ${THUMB_WIDTH}x${THUMB_HEIGHT} -strip -define png:include-chunk=none "${path.resolve(HTML_DIR, dstImage)}"`);
  markdownThumbs[""] = dstImage;
}

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
      var path = data["path"].split("#")[0];
      var hash = data["path"].split("#")[1];
      hash = hash?"#"+hash:"";
      var f = (path.substr(0,1)=="/") ? path : htmlLinks[path];
      if (f==undefined) {
        WARNING("No file info for "+data["path"]);
        process.exit(1);
      }
      kwd.push({ title : data["title"],
                 file : f+hash });
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
      if (imageName.substr(0,5)!="data:") {
        var imagePath = directory+"/"+imageName;
        if (fs.existsSync(imagePath)) {
  /*        console.log("IMAGE -----------------------------");
          console.log(imageName);
          console.log(imagePath);*/
          console.log(imageName);
          var newPath = IMAGE_DIR + createSafeFilename(/*htmlLinks[file]+"_"+*/imageName);
          var finalImagePath = path.resolve(HTML_DIR, newPath);
          //console.log("Copying "+imagePath+" to "+finalImagePath);
          // copy gifs - so we don't break anything on optimised animations
          if (imagePath.substr(-4)==".gif" || !PROCESS_IMAGE_RESIZE)
            fs.createReadStream(imagePath).pipe(fs.createWriteStream(finalImagePath));
          else
            child_process.exec(`convert "${imagePath}" -resize "600x800>" +repage -strip -define png:include-chunk=none "${finalImagePath}"`);
          // now rename the image in the tag
          contents = contents.substr(0,tagMid+2)+newPath+contents.substr(tagEnd);
        } else {
          WARNING(file+": Image '"+imagePath+"' does not exist");
        }
      }
    }
    tagStart = contents.indexOf("![", tagStart+1);
  }
  return contents;
}

// Now handle our simple 'example' files
exampleFiles.forEach(function(exampleFile) {
  console.log("Example File "+exampleFile);
  var contents = fs.readFileSync(exampleFile).toString();
  var slashStar = contents.indexOf("/*");
  var starSlash = contents.indexOf("*/",slashStar);
  if (slashStar>=0 && starSlash>=0) {
    var markdown = contents.substr(slashStar+2, starSlash-(3+slashStar)).trim();
    var newFile = "";
    if (markdown.indexOf("Copyright")<0)
      newFile += "<!--- Copyright (c) 2018 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->\n";
//    newFile += exampleFile+"\n";
//    newFile += "====================================\n";
//    newFile += "\n";
    newFile += markdown + "\n";
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
});



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
  if (OFFLINE)
    htmlLinks[file] = htmlFile+".html";
  else
    htmlLinks[file] = htmlFile;
});

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

function getThumbLinkHTML(a) {
  var thumb = (a.path in markdownThumbs) ? markdownThumbs[a.path] : markdownThumbs[""];
  return `<a class="thumblink" href="${htmlLinks[a.path]}" title="${convertHTML(a.title)}"><img src="${thumb}" alt="${convertHTML(a.title)}" title="${convertHTML(a.title)}"></img><span>${convertHTML(a.title)}</span></a>`
}

// -------------------------------------------------------------
markdownFiles.forEach(function (file) {
   var contents = preloadedFiles[file] ? preloadedFiles[file] : fs.readFileSync(file).toString();

   if (file.substr(-3)==".md") {
    var contentLines = contents.split("\n");
     if (contentLines[3].trim()!="" || contentLines[4].trim().substr(0,6)!="<span " || contentLines[5].trim()!="") {
       console.log("=============");
       console.log(JSON.stringify(contentLines[3]));
       console.log(JSON.stringify(contentLines[4]));
       console.log(JSON.stringify(contentLines[5]));
       console.log("=============");
       throw new Error("Expecting to find warning comment in "+file+", but didn't.");
     }
     contentLines.splice(4,2); // remove comment line
     contents = contentLines.join("\n");
   }

   //console.log(file,contents.length);
   // Check over images... ![Image Title](foo.png)
   contents = handleImages(file, contents);

   // replace simple links
   contents = contents.replace(/\[\[http[s]?:\/\/youtu.be\/([a-zA-Z0-9\-_ ]+)\]\]/g,
           '<iframe allowfullscreen="" frameborder="0" height="450" src="https://www.youtube.com/embed/$1" width="800"></iframe>'); // youtube
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

   var appendMatching = function(kwName, infoList, ifNone) {
     var regex = new RegExp("<ul>\n<li>"+kwName+": (.*)<\/li>\n<\/ul>");
     var match = regex.exec(html,"g");
     while (match!=null) {
       var kws = match[1].toLowerCase().split(",").map(function(x){return x.trim();});
       var kw = kws[0];
       var links = [ ];
       if (infoList[kw]!=undefined) {
         // deep copy
         var pages = {};
         // add keywords
         for (var k=0;k<kws.length;k++) {
           if (kws[k][0]!="-" && infoList[kws[k]]!=undefined) {
             for (var attr in infoList[kws[k]])
               pages[attr] = infoList[kws[k]][attr];
           }
         }
         // remove any keywords
         for (j in pages) {
           var a = pages[j];
           if (a["path"]!=file && htmlLinks[a.path]!=undefined) { // if we don't have links it is probably in the reference
             var pageOk = true;
             // if extra keywords specified, they may be to reject certain pages... check
             for (var k=1;k<kws.length;k++) {
               if (kws[k][0]=="-") {
                 var notkw = kws[k].substr(1);
                 if (infoList[notkw]!=undefined)
                   for (var notpg in infoList[notkw])
                     if (infoList[notkw][notpg]["path"]==a.path) {
                       console.log("REJECTED "+a.path+" from "+file+" because of '-"+notkw+"' keyword");
                       pageOk = false;
                     }
               }
             }
             // add page link if ok
             if (pageOk) {
               console.log(a);
               links.push(a);
             }
           }
         }
       }

       var content = "";
       if (links.length>0) {
         var contentThumbs = [];
         // Put ones with thumbnails first, otherwise base on fileOrdering
         links = links.sort(function(a,b) {
           var d = ((b.path in markdownThumbs)?1:0) - ((a.path in markdownThumbs)?1:0);
           if (d) return d;
           var at = 0|fileOrdering[a.path];
           var bt = 0|fileOrdering[b.path];
           return bt-at;
           /*if (a.title > b.title) return 1;
           if (a.title < b.title) return -1;
           return 0;*/
         });
         // Output images
         links.forEach(function(a) {
           contentThumbs.push(getThumbLinkHTML(a));
         });
         content = '<div class="thumblinklist thumblinklist-thumbnails">\n  '+contentThumbs.join("\n  ")+'\n</div>';
       } else {
         WARNING(kwName+" for '"+kw+"' in "+file+" found nothing");
         content = ifNone;
       }
       html = html.substr(0,match.index)+content+html.substr(match.index+match[0].length);
       match = regex.exec(html);
     }
   };

   for (i in contentLines) {
     var match;
     // try and handle module documentation
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
     // handle buy links
     match = contentLines[i].match(/^\* BUYFROM:(.*)/);
     if (match!=null) {
       var info = match[1].trim().split(",");

       var html = `<div style="float:right;z-index:-1" class="panel panel-info" >
    <div class="panel-heading"><h4 style="text-align:center;margin:0px;">Buy Now</h4></div>
    <div class="panel-body center-block">
      <h1 style="margin-top:0px"><a name="buy"></a><small>From</small>  ${info[0]}</h1>
      <p><small>Or ${info[1]} in volume</small></p>`;
      html += `      <a role="button" class="btn btn-primary" style="width:100%" href="${info[2]}">Espruino Shop</a><br/>`;
      if (info[3]) html += `      <a role="button" class="btn btn-default" style="width:100%" href="${info[3]}">&#x1F30E; Distributors</a>`;
      html += `   </div>
  </div>`;
      contentLines[i] = html;
     }
   }

   contentLines.splice(0,1); // remove first line (copyright)
   var title = contentLines[0];
   contents = contentLines.join("\n");

   // Get Markdown
   if (PROCESS_INFERENCE) inferMarkdownFile(file, contents);
   html = marked(contents).replace(/lang-JavaScript/g, 'sh_javascript');

   // Append tutorial links
   appendMatching("APPEND_KEYWORD", fileInfo.keywords, "");
   appendMatching("APPEND_USES", fileInfo.parts, "<p>(No tutorials are available yet)</p>");


   // Check for Pinouts
   var regex = /<ul>\n<li>APPEND_PINOUT: (.*)<\/li>\n<\/ul>/;
   var match = html.match(regex);
   if (match!=null) {
     var htmlfilename = HTML_DIR+"boards/" + match[1] + ".html";
     console.log("APPEND_PINOUT "+htmlfilename);
     var pinout = fs.readFileSync(htmlfilename).toString();
     html = html.replace(regex, pinout);
   }

   // Check for TOC and create it if needed
   var tocTag = "<li>APPEND_TOC</li>";
   var tocIdx = html.indexOf(tocTag);
   if (tocIdx>=0) {
     // parse out all headings, and create lists based on them
     regex = /<([hH])([123]) id="([a-z\-]*)"[^>]*>/g;
     var toc = "";
     var currentLevel = 1;
     var m = regex.exec(html);
     while (m) {
       if (m.index > tocIdx) { // only add headings from AFTER this TOC tag
         var heading = {level:0|m[2], hash:m[3]};
         var endIdx = html.indexOf("</"+m[1]+m[2], m.index);
         heading.title = html.substring(m.index+m[0].length, endIdx);
         heading.title = heading.title.replace(/<\/?a[^>]*>/g,""); // remove anchors
         while (currentLevel<heading.level) { toc+="<ul>";currentLevel++; }
         while (currentLevel>heading.level) { toc+="</ul>";currentLevel--; }
         toc += '<li><a href="#'+heading.hash+'">'+heading.title+"</a></li>\n";
         // add keywords
         var pageInfo = {
           path : file+"#"+heading.hash,
           title : title+": "+heading.title,
         };
         fileTitles[pageInfo.path] = pageInfo.title;
         addToList(fileInfo.keywords, heading.title, pageInfo);
       }
       m = regex.exec(html);
     }
     while (currentLevel>1) { toc+="</ul>";currentLevel--; }
     html = html.substr(0,tocIdx) + toc + html.substr(tocIdx+tocTag.length);
   }

   // If compiling for offline, quick hack to modify most links to go direct
   if (OFFLINE)
     html = html.replace(/(<[aA] .*href=")\/([^"#]*)/g, '$1$2.html');

   // work out of we have any images that might be at the top of the page
   var hasImageContent = html.indexOf("<iframe ")>=0; // do we have a video?
   // do we have an image in the first few lines of markdown?
   for (var i=0;i<15 && i<contentLines.length;i++)
     if (contentLines[i].match(/!\[[^\]]*\]\(([^\)]*)\)/)) // find an image tag
       hasImageContent = true;
   // if there's no image/video then we add the thumbnail in the top-right
   var thumbnail = "";
   if (!hasImageContent && file in markdownThumbs)
     thumbnail = `<img class="topthumbnail" src="${markdownThumbs[file]}">`;
  // GitHub link
   var github_url = "https://github.com/espruino/EspruinoDocs/blob/master/"+path.relative(BASEDIR, file);
   // assemble final page
   html = '<div style="min-height:700px;">' +
          thumbnail +
          html + '</div>'+
          '<p style="text-align:right;font-size:75%;">This page is auto-generated from <a href="'+github_url+'">GitHub</a>. If you see any mistakes or have suggestions, please <a href="https://github.com/espruino/EspruinoDocs/issues/new?title='+file+'">let us know</a>.</p>';

   if (OFFLINE) {
     html = `<html><head>
  <title>${title}</title>
  <link rel="stylesheet" href="offline.css" type="text/css" />
  </head>
  <body style="background-image:none;">
    <div id="wrap">${html}</div>
  </body>
</html>
     `;
   }

   fs.writeFileSync(htmlFiles[file], html);
});

// -----------------------------------------------------------
// write out the references
var refPath = path.resolve(BASEDIR, "references.json");
console.log("---------------------");
console.log("Writing references to "+refPath);
fs.writeFileSync(refPath, JSON.stringify(urls,null,1));
// Write out keywords
fs.writeFileSync(KEYWORD_JS_FILE, "var keywords = "+JSON.stringify(createKeywordsJS(fileInfo.keywords),null,1)+";");

// -----------------------------------------------------------
// Newest tutorials
/*child_process.exec(
  'git log --name-status | grep "^A" | cut -c3- | grep -e ".*\.md$" -e "examples/.*\.js$" | grep -v "^boards" | head -20',
  function(error, stdout, stderr){
    var newTutorials = stdout.split("\n").map(x=>x.trim());
    newTutorials.forEach(tutorial=>{
      var p = path.relative(BASEDIR, tutorial);
      if (!p) return;
      var thumb = getThumbLinkHTML({
        path: p,
        title: fileTitles[p]
      });
      console.log(thumb);
    });
  });*/
