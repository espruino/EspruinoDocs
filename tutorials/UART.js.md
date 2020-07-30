<!--- Copyright (c) 2016 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
UART.js Library
===============

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/UART.js. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Tutorials,Puck.js,GitHub,Web Bluetooth,BLE,Web Serial,Webbluetooth,Webserial,UARTjs,UART.js
* USES: Puck.js,Web Bluetooth,BLE,Only BLE,Web Serial

This library is designed to provide a consistent API for accessing Serial/Bluetooth devices from the web using [Web Serial](https://codelabs.developers.google.com/codelabs/web-serial/#0) and [Web Bluetooth](https://developers.google.com/web/updates/2015/07/interact-with-ble-devices-on-the-web).

It is designed to more or less mimic the [Puck.js library](http://www.espruino.com/Web+Bluetooth), but adds support for Web Serial devices.

To work, it needs to be run from a website that's served over HTTPS
(not HTTP). While you can set one up yourself with [Let's Encrypt](https://letsencrypt.org/),
we're not going to cover that here. Instead, we'll use [GitHub Pages](https://pages.github.com/).

* Log in or create an account on [GitHub.com](https://github.com)
* Click on the `Repositories` tab, and click `New`
* Enter `UARTTest` as the name, make sure you check `Initialize this repository with a README`,
and click `Create` (if you don't, you'll have to use command-line tools to create a new file)
* Click on the `Settings` tab in the top right
* Scroll down to `GitHub Pages`, under `Source` choose `master branch` and click `Save`
* Now go back to the `Code` tab, and click `Create new file` in the top right
* Enter `test.html` as the name
* Now Copy and paste the following code and click `Commit new file` at the bottom:

```HTML_demo_link
<html>
 <head>
 </head>
 <body>
  <script src="https://www.espruino.com/js/uart.js"></script>
  <button onclick="UART.write('LED1.set();\n');">LED On!</button>
  <button onclick="UART.write('LED1.reset();\n');">LED Off!</button>
 </body>
</html>
```

You'll now have your own webpage at: https://your_username.github.io/UARTTest/test.html

**You can always just click 'Try Me!' above**

As well as `UART.write` for sending data, `UART.eval` is available for reading back data:

```HTML_demo_link
<html>
 <head>
 </head>
 <body>
  <script src="https://www.espruino.com/js/uart.js"></script>
  <script>
  function getTemperature() {
    UART.eval('E.getTemperature()', function(t) {
      document.getElementById("result").innerHTML = t;
    });
  }
  </script>
  <button onclick="getTemperature()">Get Temperature</button>
  <span id="result"></span>
 </body>
</html>
```



For further details, check out the [Web Bluetooth](/Web+Bluetooth) page,
the [UART.js repository](https://github.com/espruino/EspruinoWebTools), and the
[UART.js code](https://github.com/espruino/EspruinoWebTools/blob/master/uart.js) itself.
