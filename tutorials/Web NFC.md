<!--- Copyright (c) 2020 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Web NFC, and writing to NFC tags
=================================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Web+NFC. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Tutorials,Puck.js,NFC,Web NFC,WebNFC,Writing NFC
* USES: Puck.js,Pixl.js,NFC

Espruino Bluetooth devices like [Puck.js](/Puck.js) and [Pixl.js](/Pixl.js)
contain a programmable NFC tag.

In most cases you'd program them using `NRF.nfcURL` to make a URL available,
and then a user can scan the device to go to that URL.

However, two way communications are possible by emulating an NFC tag on Puck.js.

To make a complete system, we'll write code for Puck.js that emulates a tag,
and will then send text to it from a [Web Page with Web NFC](https://w3c.github.io/web-nfc/).

Puck.js
---------

Upload the following code to Puck.js:

```
var data = new Uint8Array(10+64);
var header = NRF.nfcStart();
var written = false;
data.set(header,0); // NFC device header
data.set([0,0,0xE1,0x10,(data.length-10)/8,0,0,3,0,0xFe], 0x0A); // NDEF tag header
// 0,0,e1
NRF.on('NFCrx', function(rx) {
  var idx = rx[1]*4;
  switch(rx[0]) {
    case 0x30: //command: READ
      NRF.nfcSend(new Uint8Array(data.buffer, idx, 16));
      break;
    case 0xa2: //command: WRITE
      written = true;
      if(idx > data.length) {
        NRF.nfcSend(0x0);
      } else {
        data.set(new Uint8Array(rx, 2, 4), idx);
        NRF.nfcSend(0xA);
      }
      break;
    default:   //just, re-enable rx
      NRF.nfcSend();
      break;
    }
});
NRF.on("NFCoff",function() {
  if (written)
    onWritten(E.toString(new Uint8Array(data.buffer,26,data[21]-3)));
  written = false;
});

function onWritten(data) {
  console.log("NFC written", data);
  var colors = {
    red : 1,
    green : 2,
    blue : 4,
  };
  // Only light LEDs if we actually have 3 LEDs! Allows Pixl.js upload
  if (colors[data] && global.LED1 && global.LED2 && global.LED3) {
    digitalWrite([LED3,LED2,LED1], colors[data]);
    setTimeout(function() {
      digitalWrite([LED3,LED2,LED1], 0);
    },1000);
  }
}
```

This will create a simple 64 byte NFC tag, and when the NFC writer is removed
from within range of the Espruino device, Espruino will call `onWritten`
with the new tag information if the tag had been modified.

On Puck.js this'll light up the red, green or blue LEDs, but on Pixl.js
it'll just display the text that was written.

Web Page
---------

First, [check out this page for instructions on enabling Web NFC in your browser](https://web.dev/nfc/#use).

Then you can click the 'try now' link at the bottom of the page below to try it out:

```HTML_demo_link
<html>
<body>
<script>
if (typeof NDEFReader==="undefined") {
  document.write("NDEFReader is not supported on this browser<br/>");
}

const ndef = new NDEFReader();
ndef.onreading = event => {
  console.log("NFC", event);
};

function start() {
  /* Starting a scan stops Android from
  moving away from the Chrome window when a tag is found*/
  ndef.scan();
  // hide 'start' button
  document.querySelector("#startButton").style.display = "none";
  document.querySelector("#buttons").style.display = "block";
}

// If we already have permission, start right up!
// Otherwise we need the user to press a button
navigator.permissions.query({ name: "nfc" }).then(p => {
  if (p.state === "granted") start();
});

function send(msg) {
  ndef.write(msg).then(_=>console.log("Written ",msg));
}
</script>
<button id="startButton" onclick="start()">Start!</button>
<div id="buttons" style="display:none">
<button onclick="send('red')">Red</button>
<button onclick="send('green')">Green</button>
<button onclick="send('blue')">Blue</button>
</div>
</body>
</html>
```

Simply click one of the buttons while in NFC range of the Puck.js
(eg your phone buzzes), and when you exit NFC range of the device the relevant
LED will light.

**Note:** Old versions of Web NFC used `NDEFWriter`. If you get a
`ndef.write is not a function` error, you'll need to update your browser.


Android app
------------

* Install [`NXP TagWriter` for Android](https://play.google.com/store/apps/details?id=com.nxp.nfc.tagwriter&hl=en)
* Tap `Write Tags`
* `New Dataset`
* `Plain text`
* Under `Enter text` type `red` (lowercase)
* Tap `Save` - if you can't see the button because it's under the keyboard,
choose `About` from the top right, then press the `Back` button and you
should be able to see `Save` again.
* Tap `Ok`
* Now tap `Write Tags` again
* `My Datasets`
* `red`
* Uncheck `Confirm overwrite`
* Now click `Write`, move the phone near Puck.js and the app should make
a noise to show the content has been written.
* Move the phone away and the Puck.js will light up red! You can do the same
with `green` and `blue`, or could update the Puck.js code above.
