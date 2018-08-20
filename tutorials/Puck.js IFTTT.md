<!--- Copyright (c) 2016 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Puck.js and If This Then That
==============================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Puck.js+IFTTT. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Tutorials,Puck.js,BLE,Bluetooth,Light,Magnet,Magnetometer,Door
* USES: Puck.js,BLE,Only BLE

[If This Then That](https://ifttt.com) has a [Maker Applet](https://ifttt.com/maker)
that allows you to trigger things easily from the internet.

If you were using an Espruino device [connected straight to the Internet](/Internet)
then all you'd have to do is to call the special URL (you'll see how to get this
later on).

However when using Puck.js you need a 'bridge' - something that will take
messages over Bluetooth LE and turn them into webpage requests on the
internet.

Getting an IFTTT URL
--------------------

* Create an account on [If This Then That](https://ifttt.com)
* In the top right, click `New Applet`
* Click on `+this`, search for `Webhooks`, and click it
* Click `Receive a web request`
* Enter `puck_pressed` as the event name
* Click on `+that` and choose a task to perform - maybe `Email` to send yourself an email
* Click through the remaining pages and click `Finish`
* Now, to find the URL, go to the [Maker Applet](https://ifttt.com/maker)
* In the top right click `Settings`
* It'll say something like `URL: https://maker.ifttt.com/use/jghfJHGFhjkgHJKGjhgJHgkHfRDhgfKJtfrjgh`
* Copy that URL and paste it into your browser's address bar
* At the top it'll show you a URL like: `https://maker.ifttt.com/trigger/{event}/with/key/jghfJHGFhjkgHJKGjhgJHgkHfRDhgfKJtfrjgh`
* Replace `{event}` with `puck_pressed` (which we entered earlier) so you get a URL like this:

```
https://maker.ifttt.com/trigger/puck_pressed/with/key/jghfJHGFhjkgHJKGjhgJHgkHfRDhgfKJtfrjgh
```

This is what you need to copy in below (or access if you're using an Internet-connected Espruino board)

HTML
----

Create a Webpage with the following code in - it'll need to be hosted on HTTPS.

For an example of how to do this, see the [Web Bluetooth tutorial](Puck.js Web Bluetooth)

```HTML
<html>
 <head>
   <title>IFTTT Web Bluetooth Example</title>
 </head>
 <body>
  <pre id="log"></pre>
  <button>Click here to start</button><br/>
  <iframe id="ifttt" style="width:640px;height:32px"></iframe>
  <script src="https://www.puck-js.com/puck.js"></script>
  <script type="text/javascript">
    // ------------------------------------- REPLACE ME
    var URL = "https://maker.ifttt.com/trigger/puck_pressed/with/key/jghfJHGFhjkgHJKGjhgJHgkHfRDhgfKJtfrjgh";
    // ------------------------------------- REPLACE ME
    var button = document.getElementsByTagName('button')[0];
    var logelement = document.getElementById('log');
    var iftttRequests = 0;
    function log(txt) {
      logelement.innerHTML += txt+"\n";
    }

    function ifttt() {
      document.getElementById('ifttt').src = URL+"?"+iftttRequests;
      iftttRequests++;
    }

    // Called when we get a line of data
    function onLine(v) {
      log("Received: "+JSON.stringify(v));
      if (v.indexOf("Pressed")>=0) {
        log("Calling IFTTT");
        ifttt();
      }
    }

    // When clicked, connect or disconnect
    var connection;
    button.addEventListener("click", function() {
      if (connection) {
        log("Closing connection");
        connection.close();
        connection = undefined;
      }
      log("Opening connection");
      Puck.connect(function(c) {
        if (!c) {
          log("Couldn't connect!");
          return;
        }
        log("Connecting...");
        connection = c;
        // Handle the data we get back, and call 'onLine'
        // whenever we get a line
        var buf = "";
        connection.on("data", function(d) {
          buf += d;
          var i = buf.indexOf("\n");
          while (i>=0) {
            onLine(buf.substr(0,i));
            buf = buf.substr(i+1);
            i = buf.indexOf("\n");
          }
        });
        // First, reset Puck.js
        connection.write("\x10reset();\n", function() {
          // Wait for it to reset itself
          setTimeout(function() {
            // Now tell it to write data on the current light level to Bluetooth 10 times a second
            connection.write("\x10setWatch(function(){Bluetooth.println('Pressed');},BTN,{repeat:true,debounce:50,edge:'rising'});\n",
              function() { log("Ready!"); });
          }, 1500);
        });
      });
    });
  </script>
 </body>
</html>
```

Now just click `Click here to start` - when you press the button on the Puck,
IFTTT will now be called!

**Note:** If you're a web developer you'll want to make the code above use an AJAX request - however sadly IFTTT don't set the `Access-Control-Allow-Origin` header, so you basically
have to use an IFrame.
