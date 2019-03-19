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

<input type="file" id="fileLoader"/>

Quoted String
------------

<p id="sizeQuoted">...</p>
<textarea id="resultQuoted" style="width:650px;height:300px;"></textarea>

Base64 encoded
-------------

<p id="sizeBase64">...</p>
<textarea id="resultBase64" style="width:650px;height:300px;"></textarea>

Templated String
------------

<p id="sizeTemplated">...</p>
<textarea id="resultTemplated" style="width:650px;height:300px;"></textarea>

<script>
  $("#fileLoader").change(function(event) {
      if (event.target.files.length != 1) return;
      var reader = new FileReader();
      reader.onload = function(event) {
        var bytes = new Uint8Array(event.target.result);

        if (bytes.length>(20*1024)) {
          $("#resultQuoted").val("File too long - must be less than 20kB");
        } else {        

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
          var dqStr = '"'+dqStr+'"';
          var b64Str = 'atob("'+btoa(String.fromCharCode.apply(null, bytes))+'")';

          $("#sizeQuoted").html(dqStr.length+" Characters");
          $("#sizeBase64").html(b64Str.length+" Characters");
          $("#sizeTemplated").html(tmpStr.length+" Characters");
          $("#resultQuoted").val(dqStr);
          $("#resultBase64").val(b64Str);
          $("#resultTemplated").val(tmpStr);
        }
      };
      reader.readAsArrayBuffer(event.target.files[0]);
    });
</script>
