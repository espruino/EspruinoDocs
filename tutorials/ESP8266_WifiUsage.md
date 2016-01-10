Using the ESP8266 with Wifi
===========================

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
wifi.disconnect()
wifi.startAP("my-ssid", {password:"my-password"});
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
wifi.setHostname("my-esp")
```

Finally, you need to save the settings so they persist across hard-resets and power cycles:

```
wifi.save()
```

At this point you can power cycle your ESP8266 and then reconnect from the IDE (you may have to 
manually disconnect first, the IDE is slow at detecting that the connection got cut).

Troubleshooting
---------------

ideas?








