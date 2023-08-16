<!--- Copyright (c) 2016 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Bluetooth LE Security and Access Control
=========================================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/BLE+Security. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Tutorials,Puck.js,BLE,Bluetooth,Security,Safe,Password,Login,Hack,Access Control
* USES: Puck.js,BLE,Only BLE

When you apply power to an Espruino device, it'll
start up, and will be connectable (and programmable) by anyone.

Much like many other development devices, this is done so you can get up and
running quickly, without the hurdle of having to enter passwords.

However as soon as you want to use Espruino properly, you will almost certainly
want to lock it down so that it can't be programmed by other people.

**Note:** While unbonded (see the end of this page) Bluetooth communications
are unencrypted - so you should be aware that someone within range with
bluetooth sniffing hardware could conceivably view anything written or
uploaded to Espruino.

There are a few options:

## Don't allow connections to Espruino

With [`NRF.setAdvertising`](http://www.espruino.com/Reference#l_NRF_setAdvertising)
you can allow Espruino to keep transmitting advertising data, but ensure that no
computer can connect to it:

```JS
NRF.setAdvertising({}, { connectable:false });
```

## Add a password with `E.setPassword("password")`

[See here.](http://www.espruino.com/Reference#l_E_setPassword) This will keep
the UART service and allow any computer to connect to Espruino, but will require
anyone connecting to enter a password to access the Espruino Console.

This isn't perfect as it still allows anyone to connect, just not to access
the JavaScript prompt.


## 'Hide' the console device

Using a command like `LoopbackA.setConsole(true)` you can force the JavaScript
console into [`Loopback`](http://www.espruino.com/Reference#l__global_LoopbackA).

This means it will only be accessible via reads and writes to the `LoopbackB`
variable. If someone connects to Espruino they will still get access to the UART,
but will be unable to do anything.

Anything written to the Bluetooth UART will still be available on the `Bluetooth`
variable via `Bluetooth.on('data', function(data) { ... })` and you can write
responses with `Bluetooth.write(...)`.

**Note:** you will no longer be able to program the Puck until you reset it
or programatically call `Bluetooth.setConsole()`.

**Note:** it's also possible to totally disable the console with `E.setConsole(null,{force:true})`


## Disconnect when an unknown address is found (whitelisting)

You can easily hook onto the `connect` event, and then force a disconnect if
it is from an unknown address.

```JS
NRF.on('connect',function(addr) {
  if (addr!="69:2d:94:d0:9d:97 public")
    NRF.disconnect();
});
```

Other Espruino devices will tend to have an address of the form `"aa:bb:cc:dd:ee:ff random"`,
but PCs and phones will generally have the form `"aa:bb:cc:dd:ee:ff public"`

To find out which MAC address to use, you can upload this code:

```JS
devices = [];
NRF.on('connect',function(addr) {
  devices.push(addr);
});
// now connect a few times and see what's in 'devices' using the left-hand side
```

**NOTE:** iOS and New versions of Android can perform 'MAC randomisation' where they
use a random MAC address each time they connect. In those cases, on firmware 2v19 and
later you can use [NRF.resolveAddress(addr)](http://www.espruino.com/Reference#l_NRF_resolveAddress)
to attempt to look up the non-random address (if the device is bonded).

**NOTE:** MAC addresses can be modified so this is not 100% secure. However
the chances of someone *guessing* the correct MAC address without being in the
area to snoop on a connection while it is active are extemely low.


## Disable the BLE UART

If you don't need the user to be able to access the BLE UART, we'd suggest
totally disabling it with [`NRF.setServices`](http://www.espruino.com/Reference#l_NRF_setServices)

```JS
NRF.setServices(undefined, {
  uart : false
});
```

This will completely remove the UART service, making Espruino unprogrammable
until it is reset.

Calling `NRF.setServices` again with `uart:true` will re-add the service. For
instance the following code will disable or enable the UART (as well as flashing
the red or green LEDs) when the button is pressed.

```JS
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

```JS
var locked = false;
setWatch(function() {
  locked = !locked;
  digitalPulse(locked?LED1:LED2,1,100);
  if (locked) NRF.sleep();
  else NRF.wake();
}, BTN, {repeat:true, edge:"rising", debounce:50});
```


## Bonding / Whitelisting

As of Espruino 1v92, Bonding is implemented in Espruino. When devices
are bonded they will be able to establish secure communications with each
other.

Espruino will accept secure or insecure connections - it is up to the
connecting device to initiate the bonding procedure. If
`NRF.setWhitelist(true)` has been called, when a device is next
bonded to Espruino, it will be added to the whitelist and the whitelist
will be enabled - stopping other devices from connecting until
Espruino is restarted with the button held down.

Espruino can also handle secure connections and bonding when it connects to other
devices. Once connected, you can initiate the bonding procedure with the
[`startBonding`](http://www.espruino.com/Reference#l_BluetoothRemoteGATTServer_startBonding)
method, and can check the status of the connection with
[`getSecurityStatus`](http://www.espruino.com/Reference#l_BluetoothRemoteGATTServer_getSecurityStatus).

It's also possible to force bonding as soon as a device attempts to access the
Bluetooth UART. You can do this with `NRF.setSecurity({encryptUart:1});`

## Passkey/Pin pairing

As of Espruino 2v02, you can set a static Passkey for Espruino:

```JS
NRF.setSecurity({passkey:"123456", mitm:1, display:1});
```

When connecting, the central device will then request a passkey, and
the connection will fail if `123456` isn't entered.

As of 2v19 you can also display a PIN that the connecting device provides. For instance
with the following:

```JS
NRF.setSecurity({mitm:1, display:1});
NRF.on("passkey", key => print("Enter PIN: ", key));
```

The bonding will then only succeed if you enter the PIN number on the connecting
device that Espruino has displayed.


**Note:** When Espruino is acting as central connecting to another device you can
enter a passkey using the `BluetoothDevice.passkeyRequest` event and
`BluetoothDevice.sendPasskey` method (as long as `NRF.setSecurity`
contains `keyboard:1`). This isn't implemented for peripheral mode yet.

## Disabling bonding of new devices

As of Espruino 2v19, once you have a device paired with `NRF.setSecurity({mitm:1, ...});` above,
you can use `pair:false` to disallow new devices from pairing, which will effectively whitelist
connections to the device to just those devices that have paired in the past.

```JS
NRF.setSecurity({pair:0,mitm:1});
```