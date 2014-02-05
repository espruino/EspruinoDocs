<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Converting files to Strings
========================

* KEYWORDS: File,String,Conversion,Internet,CC3000

This page helps you to convert a file into a quoted JavaScript string of bytes.

It's useful if:

* You're making a webserver with a [[CC3000]] and you want to encode an image in a string.
* You want to turn a raw bitmap into something that you can send to [[WS2811]] LEDs

To use it just click 'Choose File'. Once the file is chosen, the string representation of it will be output in the text area below.

<input type="file" id="fileLoader"/>
<textarea id="result" style="width:650px;height:500px;"></textarea>

<script>
  $("#fileLoader").change(function(event) {
      if (event.target.files.length != 1) return;
      var reader = new FileReader();
      reader.onload = function(event) {
        var bytes = new Uint8Array(event.target.result);
        var str = "";
        for (var i=0;i<bytes.length;i++) { 
          var ch = bytes[i];
          if (ch>=32 && ch<127 && ch!=34/*quote*/)
            str += String.fromCharCode(ch);
          else {
            if (ch==0 && i+1<bytes.length && bytes[i+1]<32)
              str += "\\0"; // quick compactness hack
            else
              str += "\\x"+(ch+256).toString(16).substr(-2); // hex
          }
        }
        $("#result").val('"'+str+'"');
      };
      reader.readAsArrayBuffer(event.target.files[0]);
    });
</script>

