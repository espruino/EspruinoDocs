<!--- Copyright (c) 2015 Thorsten von Eicken, Pur3 Ltd. See the file LICENSE for copying permission. -->
Using the ESP8266 with Wifi
===========================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/ESP8266_WifiUsage. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

This tutorial provides an intro to using Espruino running on the ESP8266 over Wifi instead of
hooked up via the serial port.

Wifi Configuration
------------------

The first step is to configure Wifi to maintain a persistent connection. You need Wifi to be
stable even when you reset the ESP8266, when your code doesn't run, when you upload bad code, etc.
The way you do this is to connect to your access point and then save the wifi config. After that,
do not try to connect in your code: it will happen automatically.

There are 3 steps to getting started. As you follow along, you may want to consult the
[Wifi library reference](http://www.espruino.com/Reference#Wifi).

### 1. Connect to your access point

```
var wifi = require("Wifi");
wifi.connect("my-ssid", {password:"my-pwd"}, function(err){
  console.log("connected? err=", err, "info=", wifi.getIP());
});
wifi.stopAP();
```
You should see a message saying "connected? err= null" message after a few seconds and your
ESP8266 will be on the network! If an error is shown, adjust your connect call appropriately.

### 1-alt. Create an access point

Using the ESP8266 is not recommended in general because its functionality is very limited and
you'll have to reconnect to the AP whenever something bad happens, but it's a handy mode if
you're out on the road and don't have an AP you can use to get internet access. To get that
going use:

```
var wifi = require("Wifi");
wifi.disconnect();
wifi.startAP("my-ssid", {password:"my-password",authMode:"wpa_wpa2"});
```
You should see the access point appear on your phone or laptop if you do a wifi scan.
You can verify the ESP8266's IP address using `wifi.getAPIP()`, it should be 192.168.4.1.

### 2. Connect via the web IDE

Start the Espruino Web IDE, open the settings (gear icon), and on the communications tab set the
IP address and port of your ESP8266, e.g. something like `192.168.1.34:23` or, if you're using
the AP mode it would be `192.168.4.1:23`. Note the `:23`, which is the port on which
Espruino is listening.

Close the settings and hit the connect button (yellow disconnected plug icon) and choose
your TCP entry. You should now be connected to your ESP8266's interpreter. You can type
`wifi.getStatus()` to confirm. To get a clea interpreter environment, type `reset()`.

If you do not want to use the IDE, you can also connect using a simple terminal program.
Just use the ESP8266's hostname or IP address and port 23.

### 3. Name and persist

You probably want to assign a DNS name to your ESP8266 so you don't need to chase the IP address,
the ticket for that is:

```
wifi.setHostname("my-esp");
```

Finally, you need to save the settings so they persist across hard-resets and power cycles:

```
wifi.save();
```

At this point you can power cycle your ESP8266 and then reconnect from the IDE (you may have to
manually disconnect first, the IDE is slow at detecting that the connection got cut).
Note that the saving of the wifi settings means that your program code should not configure
the wifi unless you want special effects that cannot be achieved simply by saving your current
wifi config.

Troubleshooting
---------------

### Recovering from saved JS code

Sometimes you may have commands stored in the regular JS save area that mess with wifi at
start-up, or some other weird stuff is happening. To recover, try this: `reset()` to clear
the interpreter. Then `save()` to clear the JS save area. Then use the wifi commands to
connect to you access point and otherwise get the wifi into the state you want. Then
use `wifi.save()` to save the wifi settings and power cycle or reboot your esp8266
(`require("ESP8266").reboot()` will work too). Now ensure that it comes back up the way
you want. Then load your application JS code (without any commands that mess with wifi
in it) and use `save()` to commit that to flash. Now reboot again and the esp8266 should connect
to wifi and run your code.

### Recovering from an endless reset loop

This is not all that related to wifi, but... Sometimes you may have saved JS code that causes
Espruino to crash or otherwise mess things up such that you can't gain control over the
interpreter. The solution is to flash over the JS save area: flash blank.bin to 0x7a000
(or consult the current flash map and pick the last 4KB sector of the save area).

If you need to wipe the wifi save area flash blank.bin to 0x7b000.

### How to wait for a connection before starting services

You can actually start any listening sockets at any time, even before a wifi connetion is
established. The listening socket is on the wifi interface devices and doesn't care whether
wifi is connected or not, whether the IP address changes over time, etc.

If you need to make outbound calls, the recommended approach is to retry until successful
instead of waiting for a connection because that is a more robust approach which can deal
with errors other than just the loss of wifi association.
