<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Quick Start
==========

* KEYWORDS: Quick Start,Getting Started

If you're not using the Espruino board, you'll want to see the [[Other Boards]] for details on how to get started first.

Plugging in
----------

The Espruino board only has one USB connector - just plug it in with a Micro USB cable and you're done.


**Windows XP Users:** Windows XP does not to have generic drivers for USB CDC devices installed, so you'll have to get them from ST via http://www.st.com/web/en/catalog/tools/PF257938

**Other Windows Users:** Newer versions of windows have USB CDC devices installed already, however windows may inexplicably take a few minutes or two to install them.

**Mac OS X and Linux Users:** The board will just plug in and go!

Set up a Terminal App
------------------

If you have installed the [Chrome Web Browser](https://www.google.com/intl/en/chrome/browser/) you can [go here and get the Espruino Serial Terminal](https://chrome.google.com/webstore/detail/espruino-serial-terminal/bleoifhkdalbjfbobjackfdifdneehpo). This is a Chrome Web App that includes the Terminal, a syntax highlighted editor, and a graphical code editor. To use it:

* Run the Web app from Chrome's home screen
* If you've only just plugged your device in, press the refresh button
* In the Top Left, make sure the correct serial port is chosen (usually: Highest COM# number on Windows, tty.usbmodem/ttys000 on Mac, ttyUSB0/ttyACM0 on linux)
* Click the 'Play' (connect) button
* Click in the terminal window to the left and start typing away!

And after you've got it running you can:

* Click the button with left/right arrows to transfer the text (or graphics) in the right-hand pane to Espruino
* Click the button with a picture frame to switch between graphical and text views (the code will not auto-update)
* To copy on the left-hand side, click and drag over the text to copy
* To paste, press ```Ctrl + V```
* If you don't want to use the Chrome Web App, you can use the instructions below for your specific platform though:

Set up a Terminal App (Alternative)
--------------------------------

**Note:** We're putting a lot of functionality into the Chrome Web App (built in firmwre updates, tutorials, module loading, syntax highlighting, etc) so we'd really recommend that you use it. However you can still access Espruino in other ways...

### Windows

On versions of Windows earlier than Vista, you can use HyperTerminal, which comes pre-installed. However to keep things simple, we'll just use an excellent free terminal application called [PuTTY](http://www.chiark.greenend.org.uk/~sgtatham/putty/).

Download PuTTY [from here](http://www.chiark.greenend.org.uk/~sgtatham/putty/). You can either download the simple 'PuTTY' (which is a single executable which needs no installer), or you can download an installer.

Go to the Start Menu, open the Control Panel, then click on 'View Devices and Printers. Look for an icon called 'STM32 Virtual COM Port' (if you can't find it, unplug and re-plug Espruino and see which icon appears). After Windows has installed all drivers (which could take several minutes), you should see some text in brackets by the icon saying COM then a number (eg. COM4). This is the name of Espruino's serial port.

Start PuTTY, and click on 'Session' in the left-hand pane.

Click on the 'Serial' radio button near the top right, then enter COM4 (or whatever port you found above) under 'Serial Line' and 9600 under 'Speed'. Then click the 'Open' button.

**Note:** You can copy text just by dragging over it and releasing th emouse button - and you paste by right-clicking

### Linux/Raspberry Pi

In a terminal window, install minicom if it isn't installed already:

```sudo apt-get install minicom```

Type the following:

```ls /dev/ttyACM* /dev/ttyUSB* /dev/ttyAMA*```

This will list all the serial ports that Espruino could be on (it may say 'No such file or directory' - this is ok). If there isn't just one port, unplug Espruino and run the command again, then plug Espruino in and run it yet again. You should be able to see which the 'new' device is.

Then run minicom to connect to the device (instead of /dev/ttyACM0, use the device name you got from Step 3):

```minicom -b 9600 -D /dev/ttyACM0```

(Note that 'picocom' is installed by default on Ubuntu. If you wish to use this, the command you need is: ```picocom --baud 9600 --flow n /dev/ttyACM0```)

If you get an error accessing the port, you may need to run ```sudo minicom ...```

**Note:** To copy, highlight the text and press ```Shift + Ctrl + C```. To paste, press ```Shift + Ctrl + V```

### Mac OS X

Make sure Espruino is unplugged, and type the following in a terminal:

```ls /dev/tty.*```

You should see a list of your available serial devices. Plug Espruino in, wait a few seconds, and run the command again. An new entry should have appeared - and this is Espruino's serial port.

Open a shell, then type the following (instead of /dev/tty.yourdevicename, use the device name you got from Step 3):

```screen /dev/tty.yourdevicename 9600```

**Note:** To copy, highlight the text and press ```Cmd + C```. To paste, press ```Cmd + V```
 
Software Updates
--------------

Espruino is gaining features and improvements on an almost daily basis. If you get an Espruino board from KickStarter or a preorder, we highly recommend that you update its firmware before you start using it.

When you first use the Espruino Web IDE and connect (see above) you'll probably see a message saying that new firmware is available. Click the **(i)** symbol in the top right of the window, click 'Firware Updates', and follow the instructions. There is no risk of damaging your Espruino board, however the firmware update process will take several minutes to complete.
 
Start writing code!
--------------------------

Now you can type commands and they will be executed (you can also copy+paste them in to the terminal window).

Try typing the following, and press 'Enter' after it:

```1+2```

This should return ```=3```. If it doesn't, there might have been some text entered already by the terminal application. Press ```Ctrl-C``` to clear this, and try again.

Every time you type a command and press enter, it will be executed immediately. ```=``` will be displayed followed by the result. If there is no result (for instance if you were executing a function that returned no value), ```=undefined``` is displayed.

```digitalWrite(LED1,1)```

```=undefined``` will be displayed, however the LED1 light on the board will light up. This allows you to set voltages that come out of the processor (1=3.3 volts, 0=0 volts). Instead of LED1, you can use any pin name, such as ```A1``` or ```D5```.

Now, press the 'up' arrow. This will display the last command you ran, and will show the text ```digitalWrite(LED1,1)``` again. Press the left arrow until the cursor moves to the end of ```1```, press delete, then press ```0```. You can now step back to the end of the line (using the right arrow, or the 'end' key) and can press enter to execute the command (which will turn the LED off). If you press enter before the cursor is on the end of the line, it won't execute the command, but will split it on to two lines.

It should now look like this:

```digitalWrite(LED1,0)```

You can now write functions. Type the following:

```
function toggle() {
 on = !on;
 digitalWrite(LED1, on);
}
```

When you hit 'enter' after the first line, the command wasn't executed, but instead Espruino just created a new line because there was an unclosed open bracket. If you don't define functions with an open bracket on the end of the line then they will be executed immediately, which is probably not what you want (If you really want to put your brackets on a new line, type ```{```, then the left arrow, then enter).

What if you created a new line by mistake? Just hit backspace. Or if you're totally confused and just want to start again, press Ctrl+C and the text you typed will be deleted.

Once you've finally hit enter, the text ```=function() ...``` will be displayed in the terminal window. This means that your function (called 'toggle') is defined. So what does it do? The 'on' variable stores a value which is either true or false. The command ```on = !on;``` makes the value of 'on' true if it was false before, or false if it was true before. If you pronounce ```=``` as becomes, and ```!``` as 'not', reading the line makes much more sense.

The next line takes the changed value of 'on' (either true of false) and applies it to the digital output (in this case LED number 1). Every time you use the toggle function, the value of 'on' toggles between true and false, and so turns the LED on or off.

Now we can try it, type the following and hit enter:

```toggle()```

If you want to run it again, just hit the up arrow (to find the command in history) followed by enter. Every time you run it, the LED will turn on or off.

Now type:

```var interval = setInterval(toggle, 500)```

This will call the 'toggle' function every 500ms (eg. twice a second). The new variable 'interval' (which is defined by 'var') is a reference to the timer we have created - this will be useful later!

But what if we want to change the 'toggle' function? Type:

```edit(toggle)```

You can also get a similar effect by hitting the up arrow until you get to the command where you defined 'toggle'. Now the Function is displayed, press the left arrow to move the cursor backwards, and start to edit the function. Add a new line at the end so that it looks like this (to add a line after 'digitalWrite', move the cursor to the end of the line, and press 'enter'):

```
function toggle() {
 on = !on;
 digitalWrite(LED1, on);
 digitalWrite(LED2, !on);
}
```

Now, move the cursor to the end of the last line using the arrow keys, and press enter. This will execute the command, which will redefine the function - and now LED1 will light, then LED2, then LED1 - and so on.

You can now change the speed to the lights, using this command:

```changeInterval(interval, 200);```

And if you want your lights to stop flashing - just type this:

```clearInterval(interval);```

If you want to start completely from scratch, and wipe out everything you have done, just type:

```reset()```

If you press the reset button on the board, Espruino will also reset. However we don't recommend this - on most boards this will reset the USB connection as well, so you may need to restart your terminal application, or in some cases even unplug and re-plug the device.

Note that if you power off or reset Espruino using the reset button, it will also lose all the code that you wrote. You can save the state of Espruino so this doesn't happen using the ```save()``` command!


Now you've got an idea how to use Espruino, have a look at the [[Tutorials]], and [[Reference]] pages!
