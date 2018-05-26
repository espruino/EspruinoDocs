<!--- Copyright (c) 2016 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Puck.js Security and Access Control
===================================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Puck.js+Security. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Tutorials,Puck.js,BLE,Bluetooth,Security,Safe,Password,Login,Hack,Access Control
* USES: Puck.js,BLE,Only BLE

When you take the plastic separator out of Puck.js's battery compartment, it'll
start up, and will be connectable (and programmable) by anyone.

Much like many other development devices, this is done so you can get up and
running quickly, without the hurdle of having to enter passwords.

However as soon as you want to use Puck.js properly, you will almost certainly
want to lock it down so that it can't be programmed by other people.

**Note:** While unbonded (see the end of this page) Bluetooth communications
are unencrypted - so you should be aware that someone within range with
bluetooth sniffing hardware could conceivably view anything written or
uploaded to Puck.js.

There are a few options:

## Don't allow connections to Puck.js

With [`NRF.setAdvertising`](http://www.espruino.com/Reference#l_NRF_setAdvertising)
you can allow Puck.js to keep transmitting advertising data, but ensure that no
computer can connect to it:

```
NRF.setAdvertising({}, { connectable:false });
```

## Add a password with `E.setPassword("password")`

[See here.](http://www.espruino.com/Reference#l_E_setPassword) This will keep
the UART service and allow any computer to connect to Puck.js, but will require
anyone connecting to enter a password to access the Espruino Console.

This isn't perfect as it still allows anyone to connect, just not to access
the JavaScript prompt.


## 'Hide' the console device

Using a command like `LoopbackA.setConsole(true)` you can force the JavaScript
console into [`Loopback`](http://www.espruino.com/Reference#l__global_LoopbackA).

This means it will only be accessible via reads and writes to the `LoopbackB`
variable. If someone connects to Puck.js they will still get access to the UART,
but will be unable to do anything.

Anything written to the Bluetooth UART will still be available on the `Bluetooth`
variable via `Bluetooth.on('data', function(data) { ... })` and you can write
responses with `Bluetooth.write(...)`.

**Note:** you will no longer be able to program the Puck until you reset it
or programatically call `Bluetooth.setConsole()`.


## Disconnect when an unknown address is found (whitelisting)

You can easily hook onto the `connect` event, and then force a disconnect if
it is from an unknown address.

```
NRF.on('connect',function(addr) {
  if (addr!="69:2d:94:d0:9d:97 public")
    NRF.disconnect();
});
```

Other Puck.js devices will tend to have an address of the form `"aa:bb:cc:dd:ee:ff random"`,
but PCs and phones will generally have the form `"aa:bb:cc:dd:ee:ff public"`

## Disable the BLE UART

If you don't need the user to be able to access the BLE UART, we'd suggest
totally disabling it with [`NRF.setServices`](http://www.espruino.com/Reference#l_NRF_setServices)

```
NRF.setServices(undefined, {
  uart : false
});
```

This will completely remove the UART service, making Puck.js unprogrammable
until it is reset.

Calling `NRF.setServices` again with `uart:true` will re-add the service. For
instance the following code will disable or enable the UART (as well as flashing
the red or green LEDs) when the button is pressed.

```
var locked = true;
NRF.setServices(undefined,{uart:!locked}­);
setWatch(function() {
  locked = !locked;
  digitalPulse(locked?LED1:LED2,1,100);
  NRF.setServices(undefined,{uart:!locked}­);
}, BTN, {repeat:true, edge:"rising", debounce:50});
```


## Disable Bluetooth

You can call [`NRF.sleep()`](http://www.espruino.com/Reference#l_NRF_sleep) and
[`NRF.wake()`](http://www.espruino.com/Reference#l_NRF_wake) to turn Bluetooth
off or on.

This will stop the device from advertising its presence, and will make it
unconnectable by anyone - however it does increase the battery life.

The following code flashes the red or green LED and turns Bluetooth on or
off.

```
var locked = false;
setWatch(function() {
  locked = !locked;
  digitalPulse(locked?LED1:LED2,1,100);
  if (locked) NRF.sleep();
  else NRF.wake();
}, BTN, {repeat:true, edge:"rising", debounce:50});
```


## Bonding / Whitelisting

As of Espruino 1v92, Bonding is implemented in Puck.js. When devices
are bonded they will be able to establish secure communications with each
other.

Puck.js will accept secure or insecure connections - it is up to the
connecting device to initiate the bonding procedure. If
`NRF.setWhitelist(true)` has been called, when a device is next
bonded to Puck.js, it will be added to the whitelist and the whitelist
will be enabled - stopping other devices from connecting until
Puck.js is restarted with the button held down.

Puck.js can also handle secure connections and bonding when it connects to other
devices. Once connected, you can initiate the bonding procedure with the
[`startBonding`](http://www.espruino.com/Reference#l_BluetoothRemoteGATTServer_startBonding)
method, and can check the status of the connection with
[`getSecurityStatus`](http://www.espruino.com/Reference#l_BluetoothRemoteGATTServer_getSecurityStatus).

## Disable the `dump()` and `E.dumpStr()` commands

These commands allow someone with console access to Espruino to easily
dump the program code that's stored in the device.

You can disable them with `global.dump=function(){};E.dumpStr=function(){};`,
*however* this is not full protection: with some work it is possible to
re-enable them, and even without them, console access to Espruino allows
you to read the state of the interpreter, so you can still reconstruct
most of the code even without `dump()`.

If you're worried about code readout then it's best to disable the
console completely (see above).
