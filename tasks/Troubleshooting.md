<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Troubleshooting
=============

* KEYWORDS: Trouble,Problems,Help,Not working,Broken

What follows is a quick list of potential problems and solutions. If your problem isn't covered here, please post in the [Forum](http://forum.espruino.com). If you have a problem that is not listed here and find a solution, please [[Contact Us]] and we'll add it here.

### Espruino keeps responding ```=undefined``` to my commands
This is actually fine - Espruino writes what your command returned, so if you execute a command that doesn't return a value, ```=undefined``` gets returned.

### I typed ```save()``` and it succeeded, but my code isn't loaded at power on
You could try typing ```dump()``` to see if your code has actually been saved. If it hasn't, it's possible that **Button 1** or the pin it is connected to was held down while Espruino boots (as this stops Espruino from loading saved code).

### Espruino stopped working after I typed ```save()```
You might have written some code that stops Espruino from working, and Espruino loads it at power on and breaks itself each time. To stop this, press the **Reset** button, and right after you release it hold down **Button 1** for about 2 seconds. This will make Espruino start without loading your saved code, and you can then type ```save()``` to overwrite your saved program.

### When powered on, Espruino just shows a glowing blue LED
This is the Espruino Bootloader. It starts when  **Button 1** or the pin it is connected to is held down while the reset button is released. To enter normal boot mode, just press and release **Reset** while **Button 1** is not pressed.

### I typed ```save()``` but my connected device doesn't work at power on
Some devices (such as LCDs) require their own initialisation code which Espruino can't remember. To do that initialisation at boot time, write a function called ```onInit```. After typing ```save()```, it will be executed at power on or reset. 

