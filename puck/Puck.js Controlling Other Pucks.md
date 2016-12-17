<!--- Copyright (c) 2016 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Controlling Other Pucks
========================

* KEYWORDS: Tutorials,Puck.js,Controlling,BLE,Bluetooth
* USES: Puck.js,Web Bluetooth

There are two main ways for one Puck to control another:

* Using the built-in UART service
* Using custom services
* Using advertising and scanning

See the [About Bluetooth](/About Bluetooth LE) page for a bit more information

We're just going to use the UART here because it's the easiest.


On the slave/peripheral Puck (to be controlled)
------------------------------------------------

* Connect to the Puck with the Web IDE (if you have more than 2 Pucks, remember what it was called)
* Enter a function that you'll want to make available to the controlling Puck on the right-hand side of the IDE:

```
var on = 0;
function toggle() {
  on = !on;
  digitalWrite(LED, on);
}
```

* Click the `Upload` button
* Now disconnect.


On the master/central Puck (that will control the other)
--------------------------------------------------------

* Connect to the master Puck with the Web IDE
* Enter the following code on the right-hand side of the IDE:

```
// Are we busy?
var busy = false;

// Function to call 'toggle' on the other Puck
function sendToggle() {
  if (!busy) {
    busy = true;
    digitalPulse(LED3, 1, 500); // light blue to show we're working
    NRF.requestDevice({ filters: [{ name: 'Puck.js 7fcf' }] }).then(function(device) {
      require("ble_simple_uart").write(device, "toggle()\n", function() {
        digitalPulse(LED2, 1, 500); // light green to show it worked
        busy = false;
      });
    }).catch(function() {
      digitalPulse(LED1, 1, 500); // light red if we had a problem
      busy = false;
    });
  }
}

// Call this function when the button is pressed
setWatch(sendToggle, BTN, { edge:"rising", debounce:50, repeat: true });
```

* Replace the name of the Puck (`Puck.js 7fcf`) with the name of your Puck.
* Click the `Upload` button
* Disconnect if you want to (you don't have to)


Testing
-------

* Now if you press the button on the Puck you're programming:
  * It'll flash Blue
  * The other Puck will turn Red
  * It'll flash Green
* Or, it might flash Blue and then Red - this shows the communications failed.
After all, it is radio and isn't 100% reliable - you'll have to write code to
retry until you're sure there is success.

**Note:** the function above is also having to check if there is a task in
progress. If there is, `NRF.requestDevice` will immediately raise an exception
saying that a BLE task is already in progress.


Making it faster
----------------

You probably noticed that it takes a while to control the other Puck. This
is because it's having to use `requestDevice` to search for the Puck first,
and then we need to connect to it.

To get a lot faster, we'll need to go a bit more low level than the
`ble_simple_uart` module, and access the individual characteristics
as shown on the [About Bluetooth](/About Bluetooth LE) page.

* Reconnect to the 'master' Puck again (if you'd disconnected).
* Copy the following code onto the right-hand side

```
// Are we busy?
var busy = false;

// The device, if we're connected
var connected = false;

// The 'tx' characteristic, if connected
var txCharacteristic = false;

// Function to call 'toggle' on the other Puck
function sendToggle() {
  if (!busy) {
    busy = true;
    if (!connected) {
      NRF.requestDevice({ filters: [{ name: 'Puck.js 7fcf' }] }).then(function(device) {
        return device.gatt.connect();
      }).then(function(d) {
        connected = d;
        return d.getPrimaryService("6e400001-b5a3-f393-e0a9-e50e24dcca9e");
      }).then(function(s) {
        return s.getCharacteristic("6e400002-b5a3-f393-e0a9-e50e24dcca9e");
      }).then(function(c) {
        txCharacteristic = c;
        busy = false;
        // Now actually send the toggle command
        sendToggle();
      }).catch(function() {
        if (connected) connected.disconnect();
        connected=false;
        digitalPulse(LED1, 1, 500); // light red if we had a problem
        busy = false;
      });
    } else {
      txCharacteristic.writeValue("toggle()\n").then(function() {
        digitalPulse(LED2, 1, 500); // light green to show it worked
        busy = false;
      }).catch(function() {
        digitalPulse(LED1, 1, 500); // light red if we had a problem
        busy = false;
      });
    }
  }
}
```

* Replace the name of the Puck (`Puck.js 7fcf`) with the name of your Puck.
* Click the `Upload` button
* Now press the button again - it'll be just as slow as before :(
* Now press it a few more times - now it's connected and has found the
transmit characteristic, everything is really fast
* When you're done, type `reset()`. **If you don't, even after you disconnect the IDE, the Puck will stay connected and will drain your battery**
