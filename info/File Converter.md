<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Converting files to Strings
========================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/File+Converter. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: File,String,Conversion,Internet,Tools
* USES: Internet,CC3000

This page helps you to convert a file into a quoted JavaScript string of bytes.

It's useful if:

* You're [making a webserver](/Internet) and you want to encode an image in a string.
* You want to turn a raw bitmap into something that you can send to a display (you may also want to look at the [[Image Converter]] in that case).


To use it just click 'Choose File'. Once the file is chosen, various string representations of it will be output in the text area below. You can then copy and paste them into your JS code.

<script src="/js/heatshrink.js"></script>
<input type="file" id="fileLoader"/>
As : <select id="fileType" onchange="fileLoaded()">
<option value="b64" selected="selected">Base 64</option>
<option value="b64c">Base 64 Compressed</option>
<option value="quoted">Quoted String</option>
<option value="templated">Templated String</option>
</select><br/>

<h2>Result</h2>

<p id="size">...</p>
<textarea id="result" style="width:650px;height:300px;display:none;"></textarea>


<script>
  var bytes;
  function fileLoaded() {
    document.getElementById("result").innerText = "";
    document.getElementById("result").style.display = "none";
    document.getElementById("size").innerText = "Please Choose a file first";
    if (!bytes) return;

    var fileTypeSelect = document.getElementById("fileType");
    var fileType = fileTypeSelect.options[fileTypeSelect.selectedIndex].value;

    if (bytes.length>(20*1024)) {
      document.getElementById("size").innerText = "File too long - must be less than 20kB";
      return;
    }

    var dqStr = "";
    var tmpStr = "";
    var lastCh = 0;
    for (var i=0;i<bytes.length;i++) {
      var ch = bytes[i];
      // templated string
      if (ch==92) tmpStr += "\\\\"; // escaping slash
      else if (ch==96) tmpStr += "\\\`"; // template quote
      else if (lastCh==36 && ch==126) tmpStr += "\\{" // ${
      else tmpStr += String.fromCharCode(ch);
      // double-quoted string
      if (ch==34) dqStr += "\\\"";
      else if (ch==9) dqStr += "\\t";
      else if (ch==10) dqStr += "\\n";
      else if (ch==13) dqStr += "\\r";
      else if (ch==92) dqStr += "\\\\";
      else if (ch>=32 && ch<127)
        dqStr += String.fromCharCode(ch);
      else { // hex code
        if (ch<64 && (i+1>=bytes.length || (bytes[i+1]<48/*0*/ || bytes[i+1]>55/*7*/)))
          dqStr += "\\"+ch.toString(8/*octal*/); // quick compactness hack
        else
          dqStr += "\\x"+(ch+256).toString(16).substr(-2); // hex
      }
      lastCh = ch;
    }

    var finalStr = "";
    switch (fileType) {
      case "b64" :
        finalStr = 'atob("'+btoa(String.fromCharCode.apply(null, bytes))+'")';
        break;
      case "b64c" :
        finalStr = 'E.toString(require("heatshrink").decompress(atob("'+btoa(String.fromCharCode.apply(null, heatshrink_compress(bytes)))+'")))';
        break;
      case "quoted" :
        finalStr = '"'+dqStr+'"';
        break;
      case "templated" :
        finalStr = '"'+tmpStr+'"';
        break;
      default: throw new Error("Unknown type!");
    }
    document.getElementById("size").innerText = finalStr.length+" Characters";
    document.getElementById("result").style.display = "";
    document.getElementById("result").innerText = finalStr;
  }
  function handleFileSelect(event) {
      if (event.target.files.length != 1) return;
      var reader = new FileReader();
      reader.onload = function(event) {
        bytes = new Uint8Array(event.target.result);
        fileLoaded();
      };
      reader.readAsArrayBuffer(event.target.files[0]);
    };
    document.getElementById('fileLoader').addEventListener('change', handleFileSelect, false);
    fileLoaded(); // set up elements
</script>
