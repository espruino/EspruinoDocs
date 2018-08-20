<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Interfacing to a PC
=================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Interfacing. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Interfacing,PC,Computer,Connect,Control,USB

You can use Espruino directly from your PC, Mac or Raspberry Pi to turn things on and off or measure values.

On Windows
---------

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

On Mac, Linux or Raspberry Pi
--------------------------

This is very similar to windows as long as you know the device name of Espruino.

  **Note:** On Linux, devices will be `/dev/ttyACM0`, `ttyAMA0`, etc, but on MacOS you'll want to use the `/dev/cu.usmodem1234` device name.

```Bash
echo "LED1.set()" > /dev/ttyACM0
```

If you're not connecting by USB, you may have to set up the baud rate first. You have to do this with: 

```Bash
stty -F /dev/ttyACM0 9600
```

Multiplatform
-----------

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
