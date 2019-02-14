<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Interfacing to a PC
=================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Interfacing. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Interfacing,PC,Computer,Connect,Control,USB,Bluetooth,Serial,CDC,BLE,Bluetooth LE
* USES: BLE,USB

You can use Espruino directly from your PC, Mac or Raspberry Pi to turn things on and off or measure values.

Espruino devices appear as a serial port, and on that serial port they present a
REPL (the console). Normally you would connect with a VT100-compatible terminal
and you can write code, however you can send commands straight to them as if
you were typing the command directly at the REPL.

**NOTE:** Because the devices expect to be outputting to a VT100 terminal, they
will return extra characters - 'echoing' what was written back to the terminal.
If you're sending a lot of commands you can either turn off echo permanently
by sending the command `"echo(0)\n"`, or you can turn it off just for a line
by sending character code 16 `"\x10"` as the first character on the line - eg. `"\x10LED.toggle()\n"`.

USB
----

### Windows

You can write to Espruino very easily with the Windows Command Prompt. For instance to turn an LED on, the command is:

```Batchfile
echo LED1.set() > \\.\COM10
```

Where COM10 is the COM port of your device. If you want to wrap this up in a shortcut to go on the desktop, just enter the following as the shortcut location:

```Batchfile
cmd.exe /c "echo LED1.set() > \\.\COM10"
```

If you're not connecting by USB, you may have to set up the baud rate first. You have to do this with:

```Batchfile
MODE COM10:9600,N,8,1
```

### Mac, Linux or Raspberry Pi

This is very similar to windows as long as you know the device name of Espruino.

  **Note:** On Linux, devices will be `/dev/ttyACM0`, `ttyAMA0`, etc, but on MacOS you'll want to use the `/dev/cu.usmodem1234` device name.

```Bash
echo "LED1.set()" > /dev/ttyACM0
```

If you're not connecting by USB, you may have to set up the baud rate first. You have to do this with:

```Bash
stty -F /dev/ttyACM0 9600
```

### Python (Multiplatform)

There's a [good thread on it here](http://www.raspberrypi.org/phpBB3/viewtopic.php?f=45&t=19301&p=188619)

However, it's very simple:

* In your favourite language, open the serial port at 9600bps.
* Send the text ```echo(0)``` (and a newline) - this turns off echoing, which means that the only text Espruino sends is that which comes from ```print(...)```.
* Send javascript commands, like ```digitalWrite(LED1,1)```
* Or read back values by sending commands like ```print(analogRead(A0))```, and waiting a fraction of a second for the result to appear.
* When you exit, send the text ```echo(1)``` (and a newline) - this will turn echoing back on so that next time you connect with a terminal, Espruino responds to your keypresses in the way you'd expect.

There's some example Python code here:

```Python
#!/usr/bin/python
import time
import serial
import sys
import json

def espruino_cmd(command):
 ser = serial.Serial(
  port='/dev/ttyACM0', # or /dev/ttyAMA0 for serial on the Raspberry Pi
  baudrate=9600,
  parity=serial.PARITY_NONE,
  stopbits=serial.STOPBITS_ONE,
  bytesize=serial.EIGHTBITS,
  xonxoff=0, rtscts=0, dsrdtr=0,
 )
 ser.isOpen()
 ser.write(command+"\n")
 endtime = time.time()+0.2 # wait 0.2 sec
 result = ""
 while time.time() < endtime:
  while ser.inWaiting() > 0:
   result=result+ser.read(1)
 ser.close()
 return result

# Read 1 analog
#print espruino_cmd("print(analogRead(A1))").strip()
# Read 3 analogs into an array
#print espruino_cmd("print([analogRead(A1),analogRead(A2),analogRead(A3)])").strip().split(',')

if len(sys.argv)!=2:
 print "USAGE: espruino_command.py "+'"'+"print('hello')"+'"'
 exit(1)

print espruino_cmd(sys.argv[1]).strip()
```

You can just run this from the shell with commands like:

```Bash
$ ./espruino_command.py "echo(0)"
echo(0)
$ ./espruino_command.py "print('hello')"
hello
$ ./espruino_command.py "print(analogRead(A0))"
0.6546
$ ./espruino_command.py "digitalWrite(LED1,1)"
[no output, but turns the LED on]
```

To be able to communicate with the serial port using Python, you will need pySerial: [http://pyserial.sourceforge.net](http://pyserial.sourceforge.net) . If you run into the trouble that the code complains that it cannot find `serial`, you will first need to install pySerial, which is luckily very straightforward (example below assumes you have downloaded version 2.7, update the commands as appropriate):

```Bash
tar xfvz pyserial-2.7.tar.gz
cd pyserial-2.7
sudo python setup.py install
```

Bluetooth LE
-------------

Espruino Bluetooth LE devices provide a serial port as something called the
'Nordic UART Service'. While this is now used by many devices, it is
not part of the Bluetooth SIG's standard for Bluetooth LE, so no operating
system will add it as a communications port in the same way that USB devices
get added.

As a result you have to access the Nordic UART service via Bluetooth LE directly.

### Web Bluetooth

Check out the page on [using Espruino with Web Bluetooth](http://www.espruino.com/Puck.js+Web+Bluetooth).

### Node.js

Run `npm install noble`, then:

```
/* On Linux, BLE normally needs admin right to be able to access BLE
 *
 * sudo setcap cap_net_raw+eip $(eval readlink -f `which node`)
 */

var noble = require('noble');

var ADDRESS = "ff:a0:c7:07:8c:29";
var COMMAND = "\x03\x10clearInterval()\n\x10setInterval(function() {LED.toggle()}, 500);\n\x10print('Hello World')\n";

var btDevice;
var txCharacteristic;
var rxCharacteristic;

noble.on('stateChange', function(state) {
 console.log("Noble: stateChange -> "+state);
  if (state=="poweredOn")
    noble.startScanning([], true);
});

noble.on('discover', function(dev) {
  console.log("Found device: ",dev.address);
  if (dev.address != ADDRESS) return;
  noble.stopScanning();
  connect(dev, function() {
    // Connected!
    write(COMMAND, function() {
      btDevice.disconnect();
    });
  });
});



function connect(dev, callback) {
  btDevice = dev;
  console.log("BT> Connecting");
  btDevice.on('disconnect', function() {
    console.log("Disconnected");
  });
  btDevice.connect(function (error) {
    if (error) {
      console.log("BT> ERROR Connecting",error);
      btDevice = undefined;
      return;
    }
    console.log("BT> Connected");
    btDevice.discoverAllServicesAndCharacteristics(function(error, services, characteristics) {
      function findByUUID(list, uuid) {
        for (var i=0;i<list.length;i++)
          if (list[i].uuid==uuid) return list[i];
        return undefined;
      }

      var btUARTService = findByUUID(services, "6e400001b5a3f393e0a9e50e24dcca9e");
      txCharacteristic = findByUUID(characteristics, "6e400002b5a3f393e0a9e50e24dcca9e");
      rxCharacteristic = findByUUID(characteristics, "6e400003b5a3f393e0a9e50e24dcca9e");
      if (error || !btUARTService || !txCharacteristic || !rxCharacteristic) {
        console.log("BT> ERROR getting services/characteristics");
        console.log("Service "+btUARTService);
        console.log("TX "+txCharacteristic);
        console.log("RX "+rxCharacteristic);
        btDevice.disconnect();
        txCharacteristic = undefined;
        rxCharacteristic = undefined;
        btDevice = undefined;
        return openCallback();
      }

      rxCharacteristic.on('data', function (data) {
        var s = "";
        for (var i=0;i<data.length;i++) s+=String.fromCharCode(data[i]);
        console.log("Received", JSON.stringify(s));
      });
      rxCharacteristic.subscribe(function() {
        callback();
      });
    });
  });
};

function write(data, callback) {  
  function writeAgain() {
    if (!data.length) return callback();
    var d = data.substr(0,20);
    data = data.substr(20);
    var buf = new Buffer(d.length);
    for (var i = 0; i < buf.length; i++)
      buf.writeUInt8(d.charCodeAt(i), i);
    txCharacteristic.write(buf, false, writeAgain);
  }
  writeAgain();
}

function disconnect() {
  btDevice.disconnect();
}

```

### Python

You need to run `pip install bluepy`, and you can then do:

```
# USAGE:
# python bluepy_uart.py ff:a0:c7:07:8c:29

import sys
from bluepy import btle
from time import sleep

if len(sys.argv) != 2:
  print "Fatal, must pass device address:", sys.argv[0], "<device address="">"
  quit()

# \x03 -> Ctrl-C clears line
# \x10 -> Echo off for line so don't try and send any text back
#command = "\x03\x10reset()\nLED.toggle()\n"
command = "\x03\x10clearInterval()\n\x10setInterval(function() {LED.toggle()}, 500);\n\x10print('Hello World')\n"

# Handle received data
class NUSRXDelegate(btle.DefaultDelegate):
    def __init__(self):
        btle.DefaultDelegate.__init__(self)
        # ... initialise here
    def handleNotification(self, cHandle, data):
        print('RX: ', data)
# Connect, set up notifications
p = btle.Peripheral(sys.argv[1], "random")
p.setDelegate( NUSRXDelegate() )
nus = p.getServiceByUUID(btle.UUID("6E400001-B5A3-F393-E0A9-E50E24DCCA9E"))
nustx = nus.getCharacteristics(btle.UUID("6E400002-B5A3-F393-E0A9-E50E24DCCA9E"))[0]
nusrx = nus.getCharacteristics(btle.UUID("6E400003-B5A3-F393-E0A9-E50E24DCCA9E"))[0]
nusrxnotifyhandle = nusrx.getHandle() + 1
p.writeCharacteristic(nusrxnotifyhandle, b"\x01\x00", withResponse=True)
# Send data (chunked to 20 bytes)
while len(command)>0:
  nustx.write(command[0:20]);
  command = command[20:];
# wait for data to be received
while p.waitForNotifications(1.0): pass
# No more data for 1 second, disconnect
p.disconnect()
```
