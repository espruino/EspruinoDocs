<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Troubleshooting
=============

* KEYWORDS: Troubleshooting,Trouble,Problems,Help,Broken,Not Working

What follows is a quick list of potential problems and solutions. If your problem isn't covered here, please post in the [Forum](http://forum.espruino.com). If you have a problem that is not listed here and find a solution, please [[Contact Us]] and we'll add it here.



Getting Started
-------------

### My board doesn't seem to be recognized by my computer

#### On the Espruino Board

Hold down the RST button. Do the blue and red lights glow dimly? If not, there's a problem with your USB cable as power isn't getting to Espruino.

Hold down BTN1, and then press and release RST while keeping BTN1 held. The Blue and Red LEDs should now light brightly for a fraction of a second, and the Blue LED should be pulsing. If not, there is some issue with USB. Try another USB cable (it's surprising how often this is at fault) and if that doesn't work, see the next troubleshooting headings.

#### On other boards

If you've bought a different board, it won't come pre-installed with Espruino. You'll have to go to the [[Download]] page and follow the instructions there in order to flash the correct software onto it.


### My board doesn't appear as a USB Serial port in Windows XP / Windows 8.1

These versions of Windows don't come with the correct drivers preinstalled. You'll need to install [ST's VCP drivers](http://www.st.com/web/en/catalog/tools/PF257938) first. 


### My board doesn't appear in Windows Control Panel's 'Devices and Printers' page.

If you use many COM port devices in Windows, you may find that the COM port numbers quickly get so high that Windows refuses to add more. If this is the case, you'll have to follow the instructions here: [http://superuser.com/questions/408976/how-do-i-clean-up-com-ports-in-use]

If not, see the first troubleshooting item above.


### In Windows, the COM port appears in the Web IDE, but I can't connect to it

This is probably because you've reset or unplugged the Espruino board while the Web IDE was connected to it. Chrome hangs on to the serial port and stops Espruino from reconnecting to it.

Try unplugging Espruino and then completely close Chrome (close all windows, not just the Web IDE). However if that doesn't work, try restarting Windows.

In order to stop this happening in the future, click 'Disconnect' before resetting or unplugging the board. We're hoping that a new version of Chrome due out soon will help to fix this problem.


### In Windows, Espruino was working and now it won't connect

See above.


### I tried to reflash my Espruino Board, and now it won't work

If you have Windows, check that it's not one of the problems described above.

Try reflashing again (by holding down BTN1 when RST is released, you should always be able to get the glowing blue LED).

As Espruino itself won't work, the IDE won't know what type of board it is supposed to flash so you'll have to look up the firmware manually. Just head to [the Espruino binaries site](http://www.espruino.com/binaries/?C=M;O=D) and look for the most recent (nearest the top) file named ```espruino_1v##_espruino_1r#.bin``` where ```1r#``` is the revision number written on the back of your Espruino board. Copy the link to the file, and paste it into the Espruino Web IDE.

### My board appears as a mouse or joystick in Windows Control Panel's 'Devices and Printers' page.

This may happen if you are not working with an original Espruino board and haven't yet installed the Espuino firmware. Some boards - especially the Discovery boards are automatically recognized by Windows as a completely different kind of device. Install the firmware as described on the Download page, disconnect the board a reconnect it again. 

Using Espruino
-------------

### Espruino keeps responding `=undefined` to my commands

This is actually fine - Espruino writes what your command returned, so if you execute a command that doesn't return a value, `=undefined` gets returned.


### I typed `save()` and it succeeded, but my code isn't loaded at power on

You could try typing `dump()` to see if your code has actually been saved. If it hasn't, it's possible that **BTN1** or the pin it is connected to was held down while Espruino boots (as this stops Espruino from loading saved code).

You could try typing `load()` to force Espruino to load its saved program.

If you want to execute certain commands at power-on, put those commands in a function called `onInit` and then type `save()`.


### Espruino stopped working after I typed `save()`

You might have written some code that stops Espruino from working, and Espruino loads it at power on and breaks itself each time. To stop this:

* Press the **RST** button
* Release the **RST** button and immediately press **BTN!**
* Wait 2 seconds
* Release **BTN1** 

This will make Espruino start without loading your saved code. You can then connect with the Web IDE and type `save()` to overwrite your saved program. 

If you get a glowing blue LED, it's because you pressed **BTN1** too quickly after pressing **RST**. Try again and leave a bit more of a gap.

There's [a video of how to do this on your board here](https://www.youtube.com/watch?v=N4ueQTHDrcs)


### When powered on, Espruino just shows a glowing blue LED

This is the Espruino Bootloader. It starts on the Espruinop Board when *BTN1* or the pin it is connected to is held down while the reset button is released. To enter normal mode, just press and release **RST** while **BTN1** is not pressed.


### I typed `save()` but my connected device doesn't work at power on

Some devices (such as LCDs and WiFi) require their own initialisation code which Espruino can't remember. To do that initialisation at boot time, write a function called `onInit` which contains the initialisation code for your device. After typing `save()`, it will be executed at power on or reset.


### I typed `save()` but Espruino won't work (or stops working quickly) when powered from a computer (only a USB power supply, battery, or the computer when the Web IDE is running)

This is because you're printing information to the console.

When you are not connected to a computer via USB, Espruino writes any console data to the Serial port. However when you are connected to a computer, Espruino writes down USB. **If no terminal application is running on your computer**, it won't accept any incoming data down USB. When Espruino fills up its output buffer, it waits for the computer to accept the data rather than throwing it away, and this is what causes your program not to work.

To fix this, either remove your `console.log` and `print` statements, or explicitly set the console to be on the Serial port at startup with `function onInit() { Serial1.setConsole(); }`. However the second option will mean that you will no longer be able to program Espruino from USB unless you reset it.

### When I type `dump()` the code that is displayed isn't exactly the code that I entered

When you send code to Espruino, it is executed immediately. That means if you say:

```
var foo = 1+2;
```

Then `foo` will forever be set to `3`, and **not** the expression `1+2`. In this case it's not a problem, but you might write `var foo = analogRead(A0);` and then `foo` will be set to whatever the value of A0 was *when you uploaded the program*. 

When you type `dump()`, Espruino tries to reconstruct the code that you wrote based on its current state (by adding `setWatch`, `setInterval`, `digitalWrite`, etc) - and sometimes there is not enough information available for it to get it correct.

It's most noticeable for `setInterval` and `setWatch`, which return integers - so Espruino has no way of knowing that a given number goes with a given `setInterval`. In this case:

```
var x = setInterval("print('Hello')", 10000);
```

will turn into:

```
var x = 1;
setInterval("print('Hello')", 10000);
```

To get around this, it's best to put code that you intend to run every time Espruino starts into a function called `onInit()`.

**Note:** The problem with `setInterval` happens because Espruino is trying to turn its internal state back into a human readable form. If you just type `save()` then the correct state will still be saved.

### I've pasted code into the left-hand side of the Web IDE and it doesn't work

There could be several reasons for this, but the likely one is that you have formatted your code in a way that doesn't work well with a command-line interface. 

Each time you press enter, Espruino's command-line interface counts brackets to see if the statement you've entered is complete. If it is, it'll try and execute it. For instance:

```
if (true) {
  console.log("Hello");
}
```

That is a complete statement, so when you hit enter at the end it'll be executed immediately. However if you type:

```
if (true) {
  console.log("Hello");
}
else {
  console.log("Oh No!");
}
```

Then now we have a problem. Halfway through, Espruino sees that the first statement is complete and executes, and it's now given a line that starts `else {` that isn't a valid statement.

The easiest way to fix this is to write code in the [K&R style](http://en.wikipedia.org/wiki/Indent_style#K.26R_style):

```
if (true) {
  console.log("Hello");
} else {
  console.log("Oh No!");
}
```

If you're writing code in the right-hand side of the Web IDE, the Web IDE should try and detect the different formatting and insert a special newline character (Alt-Enter) which will fix it for you. If you're using other tools to send data to Espruino then this may not automatically happen for you though.

### I'm using an unofficial board and some of the examples don't work

This could be for several reasons:

* The pins and wiring in the examples are designed for the Espruino board. On other boards those pins often conflict with other on-board devices.
* Many of the other boards don't have enough memory for all the functionality of the Espruino Board, so things (such as Waveform, HTTP, and sometimes even Graphics) have had to be removed.
* As we only make any money from the Espruino Boards, we can't afford to spend time implementing functionality on other boards - so even if the board you have has enough memory, the functionality the example is using may still not be implemented.

In short, if you want to be sure that all the functionality you want is implemented, support us and buy an Espruino board.
