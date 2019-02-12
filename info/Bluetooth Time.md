<!--- Copyright (c) 2019 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Bluetooth Time Setter
=====================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Bluetooth+Time. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Bluetooth,Time,Date,setTime,Tools,set time
* USES: BLE,Only BLE

This page uses [Web Bluetooth](Puck.js Web Bluetooth) to set the current time on your Bluetooth LE-enabled Espruino device direct from the web page.

See the [Graphics](/Graphics) library page for more information.

<button id="setTime" type="button" class="btn btn-primary">Set Time!</button>
<script src="https://www.puck-js.com/puck.js"></script>
<script>
// Force HTTPS - needed for web bluetooth
var l = window.location.toString();
if (l.substr(0,7)=="http://" && !window.location.port)
  window.location = "https://"+l.substr(7);

document.getElementById("setTime").addEventListener("click",function() {
  Puck.setTime(function() {
    Puck.close();
    window.alert("Time set successfully!");
  });
});
</script>

How does it work?
-----------------

The Puck.js Web Bluetooth library is used - it's as simple as:

```
<script src="https://www.puck-js.com/puck.js"></script>
<script>
...
Puck.setTime(function() {
  Puck.close();
  window.alert("Time set successfully!");
});
```
