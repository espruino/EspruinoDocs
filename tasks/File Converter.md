<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Converting files to Strings
========================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/File+Converter. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: File,String,Conversion,Internet,CC3000
* USES: Internet,CC3000

This page helps you to convert a file into a quoted JavaScript string of bytes.

It's useful if:

* You're making a webserver with a [[CC3000]] and you want to encode an image in a string.
* You want to turn a raw bitmap into something that you can send to [[WS2811]] LEDs

To use it just click 'Choose File'. Once the file is chosen, the string representation of it will be output in the text area below.

<input type="file" id="fileLoader"/>

Quoted String
------------

<p id="sizeQuoted">...</p>
<textarea id="resultQuoted" style="width:650px;height:300px;"></textarea>

Base64 encoded
-------------

<p id="sizeBase64">...</p>
<textarea id="resultBase64" style="width:650px;height:300px;"></textarea>

<script>
  $("#fileLoader").change(function(event) {
      if (event.target.files.length != 1) return;
      var reader = new FileReader();
      reader.onload = function(event) {
        var bytes = new Uint8Array(event.target.result);
        
        if (bytes.length>(20*1024)) {
          $("#resultQuoted").val("File too long - must be less than 20kB");
        } else {        
          var str = "";
          for (var i=0;i<bytes.length;i++) { 
            var ch = bytes[i];
            if (ch==34) str += "\\\"";
            else if (ch==9) str += "\\t";
            else if (ch==10) str += "\\n";
            else if (ch==13) str += "\\r";
            else if (ch==92) str += "\\\\";
            else if (ch>=32 && ch<127)
              str += String.fromCharCode(ch);
            else { // hex code
              if (ch<64 && (i+1>=bytes.length || (bytes[i+1]<48/*0*/ || bytes[i+1]>55/*7*/))) 
                str += "\\"+ch.toString(8/*octal*/); // quick compactness hack
              else
                str += "\\x"+(ch+256).toString(16).substr(-2); // hex
            }
          }
          var qStr = '"'+str+'"';
          var b64Str = 'atob("'+btoa(String.fromCharCode.apply(null, bytes))+'")';
          
          $("#sizeQuoted").html(qStr.length+" Characters");
          $("#sizeBase64").html(b64Str.length+" Characters");
          $("#resultQuoted").val(qStr);
          $("#resultBase64").val(b64Str);
        }
      };
      reader.readAsArrayBuffer(event.target.files[0]);
    });
</script>

