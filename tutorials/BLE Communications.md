<!--- Copyright (c) 2019 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
BLE Communications
==================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/BLE+Communications. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Tutorials,BLE,Bluetooth,Bluetooth LE,Communications,Send,Receive,Command
* USES: Puck.js,MDBT42Q,BLE,Only BLE,Servo Motor

In other tutorials like the [Wireless temperature Display](/Pixl.js+Wireless+Temperature+Display)
we use Bluetooth Advertising to communicate. This is great for many-to-one type
applications, but often you just want one-to-one communications.

In this case you probably want one Espruino device to create a connection
to the other device, which is what we're covering here. Depending on the
'Connection Interval' chosen with `NRF.setConnectionInterval` this can be
very power efficient as well (the default in Espruino 2v00 and above is to
use a power efficient interval, but to switch to the fastest speed possible
 as soon as data starts being transmitted/received).

**NOTE:** Advertising is very power efficient for the sender, but the
receiver has to be listening for packets a lot of the time which is
extremely inefficient. If the receiver needs to run off a battery you
might want to consider using a connection as well.

In this example we're going to use an [MDBT42Q breakout board](/MDBT42Q) attached
to a [Servo Motor](/Servo Motors). There are a few main ways you might want to
communicate:

* Sending commands as JavaScript code
* Sending commands to a custom Bluetooth LE Characteristic
* Streaming data to a custom Bluetooth LE Characteristic

Check out the headings for more information. The video below covers
sending commands, and the one further down the page covers streaming.

[[https://youtu.be/lWjuMEIrmY8]]

Sending Commands (as JavaScript)
-----------------------------------

### Receiver (Bluetooth Peripheral Device)

All the code that's needed here deals with moving the servo. To control this, we're just going to send the command `flag()` to execute the function.

```
var s = require("servo").connect(D14);
s.move(1,3000); // move to position 0 over 3 seconds

var timeout;
function flag() {
  if (timeout) clearTimeout();
  s.move(0.2,2000);
  timeout = setTimeout(function() {
    timeout = undefined;
    s.move(1,2000);
  },2000);
}

setWatch(flag, BTN, {repeat:true});
```

### Transmitter (Bluetooth Central Device)

For the transmitter, we'll just use the [Bluetooth LE UART module](/Puck.js+BLE+UART)
to allow us to send the command as if we were typing it in the REPL. Note that we need
a newline to execute it - like we'd have to press `Enter` in the left hand side of the IDE.

```
function flag() {
  NRF.requestDevice({ filters: [{ namePrefix: 'MDBT42Q' }]
                    }).then(function(device) {
    require("ble_simple_uart").write(
          device,
          "flag()\n",
          function() {
            print('Done!');
          });
  });
}

setWatch(flag, BTN, {repeat:true});
```

**NOTE:** By default Espruino is expecting a REPL, so it echoes back the characters
it was sent (plus the result of executing the command). You might not want this
normally as it will slow down communications - check out the notes at the
top of [the page in Interfacing](/Interfacing) for the characters you can send
to stop the echoing.


Sending Commands (Custom Service)
-----------------------------------

### Receiver (Bluetooth Peripheral Device)

To create a more 'normal' Bluetooth device you'll want to create your own service,
and also disable the REPL that we used previously with `{uart:false}` in `setServices`.

You should always generate your own UUID - just search online for a UUID generator
(or on Linux type `date | md5sum` into the terminal). Then keep that same UUID
and replace the 5th to 8th characters with `0001`, `0002`, etc for all the
different services and characteristics you need - this is efficient in BLE as
the 128 bit UUID only has to be sent once.

```
// Same code as before
var s = require("servo").connect(D14);
s.move(1,3000); // move to position 0 over 3 seconds

var timeout;
function flag() {
  if (timeout) clearTimeout();
  s.move(0.2,2000);
  timeout = setTimeout(function() {
    timeout = undefined;
    s.move(1,2000);
  },2000);
}

setWatch(flag, BTN, {repeat:true});

// New code to define services
NRF.setServices({
  "3e440001-f5bb-357d-719d-179272e4d4d9": {
    "3e440002-f5bb-357d-719d-179272e4d4d9": {
      value : [0],
      maxLen : 1,
      writable : true,
      onWrite : function(evt) {
        // When the characteristic is written, raise flag
        flag();
      }
    }
  }
}, { uart : false });
// Change the name that's advertised
NRF.setAdvertising({}, {name:"Flag"});
```

### Transmitter (Bluetooth Central Device)

The code for the Puck is a little more complicated
than needed because it traps errors and deals with
multiple calls at once.

However the basic `requestDevice,connect,getPrimaryService,getCharacteristic,writeValue`
code can be used in [Web Bluetooth](http://www.espruino.com/Puck.js+Web+Bluetooth) too.

```
var busy = false;

function flag() {
  if (busy) {
    digitalPulse(LED1,1,[10,200,10,200,10]);
    return;
  }
  busy = true;
  var gatt;
  NRF.requestDevice({ filters: [{ name: 'Flag' }] })
  .then(function(device) {
    console.log("Found");
    digitalPulse(LED2,1,10);
    return device.gatt.connect();
  }).then(function(g) {
    console.log("Connected");
    digitalPulse(LED3,1,10);
    gatt = g;
    return gatt.getPrimaryService(
        "3e440001-f5bb-357d-719d-179272e4d4d9");
  }).then(function(service) {
    return service.getCharacteristic(
        "3e440002-f5bb-357d-719d-179272e4d4d9");
  }).then(function(characteristic) {
    return characteristic.writeValue(1);
  }).then(function() {
    digitalPulse(LED2,1,[10,200,10,200,10]);
    gatt.disconnect();
    console.log("Done!");
    busy=false;
  }).catch(function(e) {
    digitalPulse(LED1,1,10);
    console.log("ERROR",e);
    busy=false;
  });
}

setWatch(flag, BTN, {repeat:true});

NRF.setServices({}, { uart : false });
NRF.setAdvertising({}, {showName:false, connectable:false, discoverable:false});
```

**NOTE:** The video shows how you can improve on the connection speed by
remembering characteristics.


Streaming Data
---------------

In this case, we don't want to send a command, but instead to send
a stream of data to Espruino.

[[https://youtu.be/9y-kHxamDec]]

### Receiver (Bluetooth Peripheral Device)

The receiver sets up services as in the last example,
but this time it actually uses the data that was sent
on the `onWrite` event.

```
NRF.setServices({
  "3e440001-f5bb-357d-719d-179272e4d4d9": {
    "3e440002-f5bb-357d-719d-179272e4d4d9": {
      value : [0],
      maxLen : 1,
      writable : true,
      onWrite : function(evt) {
        // Data comes in as a byte, make it 0..1 range
        var n = evt.data[0] / 255;
        // Send data directly to servo as PWM
        analogWrite(D14, (1.2 + n*0.8)/20, {freq:50});
      }
    }
  }
}, { uart : false });

// On disconnect, stop the servo
NRF.on('disconnect', function() {
  digitalWrite(D14,0);
});
// Change name to 'Flag'
NRF.setAdvertising({}, {name:"Flag"});
```

### Transmitter (Bluetooth Central Device)

The transmitter is much the same as before, however this
time we don't disconnect, and just repeatedly call
`writeValue`. Note the code to detect if a transmit is
in progress or if the connection is lost.

```
var gatt,characteristic;

NRF.requestDevice({ filters: [{ name: 'Flag' }] }).then(function(device) {
  console.log("Found");
  return device.gatt.connect();
}).then(function(g) {
  console.log("Connected");
  gatt = g;
  return gatt.getPrimaryService(
    "3e440001-f5bb-357d-719d-179272e4d4d9");
}).then(function(service) {
  return service.getCharacteristic(
    "3e440002-f5bb-357d-719d-179272e4d4d9");
}).then(function (c) {
  console.log("Got Characteristic");
  characteristic = c;

  startWriting();
});


function startWriting() {
  var busy = false;
  var i = setInterval(function() {
    if (!gatt.connected) {
      clearInterval(i);
      return;
    }
    if (busy) return;
    busy = true;
    var n = analogRead(D5)*255;
    characteristic.writeValue([n]).then(function() {
      busy = false;
    });
  }, 50);
}
```
