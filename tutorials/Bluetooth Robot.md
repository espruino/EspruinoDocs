<!--- Copyright (c) 2014 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Bluetooth Voice Controlled Robot
============================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Bluetooth+Robot. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Robot,Bluetooth,Android,Voice
* USES: Robot,Motor,Bluetooth,Android,L293D

[[http://youtu.be/2YLtu7l5CR8]]

Here, we'll show you how to create the bluetooth-controlled Robot that you can see in the video above...

What you need
-----------

* An Espruino board with [[Bluetooth]] and [[L293D]] Motor driver soldered on
* A [[Battery]]
* An assembled, two-motor [[Robot]]


What to do
--------

Connect the four outputs of the Motor Driver to each of the 4 wires from the 2 motors - the order doesn't matter.

Connect the battery, and connect USB to your computer

Now, copy in the following code into the left-hand side of the Web IDE - changing the Pin names for `MOTORS` to the ones that were used when you wired your L293D motor driver up:

```
// Pins for the motors
var MOTORS = [B0,B1,A7,A6];
// Pin values to set
var GO = { FORWARD: 0b1010, BACK : 0b0101, LEFT : 0b0110, RIGHT : 0b1001 }; 

function move(motorState, time) {
   digitalWrite(MOTORS, motorState);
   setTimeout("digitalWrite(MOTORS, 0);", 500);
}
```

Now, type the following (with the robot's wheels off the ground!):

```
move(0b1010, 500);
```

This will move the motors for half a second. The first argument is a binary number which defines which of the 4 motor driver outputs should be on and which should be off.

Keep running the above command but experiment with different orderings of the 1s and 0s in `0b1010` until you have both motors moving forwards. When you have this done, press the up-arrow to move back to the `var GO = ...` line, and change the number after FORWARD to the one that you found worked. Press the 'Page down' key to move your cursor to the end of the text, and press enter.

You should now be able to type:

```
move(Go.FORWARD, 500);
```

And the robot will move forwards.

Now repeat the steps for `BACK`, `LEFT` and `RIGHT` until the robot does what you want.

Wireless Control
--------------

You can now control it wirelessly! Copy and paste the following code in:

```
Serial1.setup(9600);
Serial1.on('data', function(command) {
  if (command=="w") move(GO.FORWARD, 500); 
  if (command=="s") move(GO.BACK, 500);
  if (command=="a") move(GO.LEFT, 500);
  if (command=="d") move(GO.RIGHT, 500);
});
```

This looks on `Serial1` (the serial port that Bluetooth is connected to) and if it gets one of the letters w,s,a or d, it moves the robot.

Try connecting your phone/tablet to Espruino and starting up a terminal application. See the [[Bluetooth]] page for more details.

You can now type the letters `w`,`s`,`a` and `d` on the keyboard of your device, and it'll control the Robot!

You can do a bit better though - if your device has voice typing (most Android ones do) you can control your Robot with your voice!

Just copy and paste the following in:

```
Serial1.setup(9600);
var command = "";
Serial1.on('data', function(data) {
  command += data;
  if (command.indexOf(" ")>=0 || command.indexOf("\n")) {
    command="";
  } else {
    print(command);
    if (command=="forward") move(GO.FORWARD, 500); 
    if (command=="back") move(GO.BACK, 500); 
    if (command=="left") move(GO.LEFT, 500); 
    if (command=="right") move(GO.RIGHT, 500); 
  }
});
```

This will watch for the words 'forward', 'back', 'left' and 'right' being sent over bluetooth and separated by spaces and will move the robot when it sees them. Click the little microphone symbol on your Android Device's keyboard to enable voice typing and try it out!

It might take a few attempts to respond - the voice typing expects sentances, not individual commands and so it sometimes gets confused.

If you leave USB connected, you'll see what words are being sent over bluetooth - you could easily add your own commands to do other things!

**Note:** When you unplug Espruino from USB, the 'console' (that interprets commands you type) will be automatically moved to `Serial1`, and will stop the data handler for `Serial1` from working. To work around this, we'd suggest you add the following:

```
function onInit() {
  USB.setConsole();
}
```

Then, when you `save()` your code, every time the Espruino restarts it'll make sure that the console is set to USB, allowing the Serial1 data handler to work.
