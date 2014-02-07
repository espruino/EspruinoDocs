<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Troubleshooting
=============

* KEYWORDS: Troubleshooting,Trouble,Problems,Help,Broken,Not Working

What follows is a quick list of potential problems and solutions. If your problem isn't covered here, please post in the [Forum](http://forum.espruino.com). If you have a problem that is not listed here and find a solution, please [[Contact Us]] and we'll add it here.



Getting Started
-------------

### My board doesn't seem to be recognized by my computer

Hold down the RST button. Do the blue and red lights glow dimly? If not, there's a problem with your USB cable as power isn't getting to Espruino.

Hold down BTN1, and then press and release RST while keeping BTN1 held. The Blue and Red LEDs should now light brightly for a fraction of a second, and the Blue LED should be pulsing. If not, there is some issue with USB. Try another USB cable and if that doesn't work, see the next troubleshooting headings.


### My board doesn't appear as a USB Serial port in Windows XP / Windows 8.1

These versions of Windows don't come with the correct drivers preinstalled. You'll need to install [ST's VCP drivers](http://www.st.com/web/en/catalog/tools/PF257938) first. 


### My board doesn't appear in Windows Control Panel's 'Devices and Printers' page.

If you use many COM port devices in Windows, you may find that the COM port numbers quickly get so high that Windows refuses to add more. If this is the case, you'll have to follow the instructions here: [http://superuser.com/questions/408976/how-do-i-clean-up-com-ports-in-use]

If not, see the first troubleshooting item above.


### I tried to reflash my Espruino Board, and now it won't work

Just try reflashing again (by holding down BTN1 when RST is released, you should always be able to get the glowing blue LED).

As Espruino itself won't work, the IDE won't know what type of board it is supposed to flash so you'll have to look up the firmware manually. Just head to [the Espruino binaries site](http://www.espruino.com/binaries/?C=M;O=D) and look for the most recent (nearest the top) file named ```espruino_1v##_espruino_1r#.bin``` where ```1r#``` is the revision number written on the back of your Espruino board. Copy the link to the file, and paste it into the Espruino Web IDE.



Using Espruino
-------------

### Espruino keeps responding `=undefined` to my commands

This is actually fine - Espruino writes what your command returned, so if you execute a command that doesn't return a value, `=undefined` gets returned.


### I typed `save()` and it succeeded, but my code isn't loaded at power on

You could try typing `dump()` to see if your code has actually been saved. If it hasn't, it's possible that **BTN1** or the pin it is connected to was held down while Espruino boots (as this stops Espruino from loading saved code).

You could try typing `load()` to force Espruino to load its saved program.


### Espruino stopped working after I typed `save()`

You might have written some code that stops Espruino from working, and Espruino loads it at power on and breaks itself each time. To stop this, press the **RST** button, and right after you release it hold down **BTN1** for about 2 seconds. This will make Espruino start without loading your saved code, and you can then type `save()` to overwrite your saved program. 

If you get a glowing blue LED, it's because you pressed **BTN1** too quickly after pressing **RST**. Try again and leave a bit more of a gap.


### When powered on, Espruino just shows a glowing blue LED

This is the Espruino Bootloader. It starts on the Espruinop Board when *BTN1* or the pin it is connected to is held down while the reset button is released. To enter normal mode, just press and release **RST** while **BTN1** is not pressed.


### I typed `save()` but my connected device doesn't work at power on

Some devices (such as LCDs and WiFi) require their own initialisation code which Espruino can't remember. To do that initialisation at boot time, write a function called `onInit` which contains the initialisation code for your device. After typing `save()`, it will be executed at power on or reset.

### I typed `save()` but Espruino won't work (or stops working quickly) when powered from a computer (only a USB power supply, battery, or the computer when the Web IDE is running)

This is because you're printing information to the console.

When you are not connected to a computer via USB, Espruino writes any console data to the Serial port. However when you are connected to a computer, Espruino writes down USB. **If no terminal application is running on your computer**, it won't accept any incoming data down USB. When Espruino fills up its output buffer, it waits for the computer to accept the data rather than throwing it away, and this is what causes your program not to work.

To fix this, either remove your `console.log` and `print` statements, or explicitly set the console to be on the Serial port at startup with `function onInit() { Serial1.setConsole(); }`. However the second option will mean that you will no longer be able to program Espruino from USB unless you reset it.
