<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Quick Start
==========

* KEYWORDS: Quick Start,Getting Started
* USES: Only Espruino Board

[[http://youtu.be/32mewNGxax4]]

For the best experience, please use one of our [Espruino Boards](/Order). Please [click here](/Order) to get one.

If you have a kit from KickStarter and want to see what everything is, check out [[Espruino Kits]]...

Plugging in
----------

The Espruino board only has one USB connector - just plug it in with a Micro USB cable and you're done. If you're not using the Espruino board it may be more tricky. Please [see this page](/Other Boards) for more information.

<span style="color:red;">**NOTE:** The Espruino board has no case and so the USB connector is completely unsupported. This means it is relatively delicate. Treat it carefully. Try and pull the connector straight out, and **do not** push down on the board when the connector is inserted, or try and move the board around using the cable.</span>

**Windows 8.1 and XP Users:** Windows XP and 8.1 do not appear to have generic drivers for USB CDC devices, so you'll have to get them from ST via http://www.st.com/web/en/catalog/tools/PF257938

**Other Windows Users:** Newer versions of windows have USB CDC devices installed already, however Windows may take a few minutes to check with Windows Update and install them.

**Linux users** to ensure that you have the the correct permissions to connect you'll need to copy [the file 45-espruino.rules](https://github.com/espruino/Espruino/blob/master/misc/45-espruino.rules) to `/etc/udev/rules.d`, and to ensure your user is in the 'plugdev' group (you can check by typing ```groups```). You add it by typing ```sudo adduser $USER plugdev``` and then logging out and back in.

**Mac OS X and Chromebook Users:** The board will just plug in and go!



Set up a Terminal App
------------------

**Note:** We recommend that you use our [Chrome Web App](https://chrome.google.com/webstore/detail/espruino-web-ide/bleoifhkdalbjfbobjackfdifdneehpo) (it has a bunch of extra features, including firmware updates). However you can access Espruino from any terminal program. See [[Alternative Terminal Apps]] for some examples.

* Install the [Chrome Web Browser](https://www.google.com/intl/en/chrome/browser/)
* [Click here to get the Espruino Web IDE](https://chrome.google.com/webstore/detail/espruino-web-ide/bleoifhkdalbjfbobjackfdifdneehpo) and click ```+FREE``` in the top right to install it.

Now, to use the Terminal App:

* Run **Espruino Web IDE** from Chrome's home screen (or the App Launcher)
* Click the **Connect/Disconnect** icon in the top left
* In the window that pops up, make sure the correct serial port is chosen (usually: Highest `COM#` number on Windows, `/dev/tty.usbmodem1234` on Mac, `ttyACM0/ttyUSB0` on Linux).
* If you don't see a port or can't get it working, please see [[Troubleshooting]]

Please click the 'tour' button in the top right of the Web IDE for more information on how to get started.

 
Software Updates
--------------

Espruino is gaining features and improvements on an almost daily basis. If you've just got your Espruino Board, we *highly* recommend that you update the firmware before you start using it.

When you first use the Espruino Web IDE and connect (see above) you'll probably see a yellow warning marker in the top right saying that new firmware is available. Click on it (or click 'Settings', then 'Flasher'), click 'Flash Firmware', and follow the instructions. There is no risk of damaging your Espruino board, however the firmware update process may take a few minutes to complete. If you have problems, check out the [[Troubleshooting]] section.

**Note:** If you're not using the Web IDE, follow the instructions on the [[Download]] page to flash the latest version (but this is significantly more difficult).
 

Start writing code!
--------------------------

Now you can type commands and they will be executed (you can also copy and paste them in to the terminal window).

Try typing the following, and press 'Enter' after it:

```1+2```

This should return ```=3```. If it doesn't, there might have been some text entered already by the terminal application. Press ```Ctrl-C``` to clear this, and try again.

Every time you type a command and press enter, it will be executed immediately. ```=``` will be displayed followed by the result. If there is no result (for instance if you were executing a function that returned no value), ```=undefined``` is displayed.

```digitalWrite(LED1,1)```

```=undefined``` will be displayed, however the LED1 light on the board will light up. This allows you to set voltages that come out of the processor (1=3.3 volts, 0=0 volts). Instead of LED1, you can use any pin name, such as ```A1``` or ```C5```.

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

When you hit 'enter' after the first line, the command wasn't executed, but instead Espruino just created a new line because there was an unclosed open bracket. If you don't define functions with an open bracket on the end of the line then they will be executed immediately, which is probably not what you want (If you really want to put your brackets on a new line, press 'alt-enter' at the end of the line `function toggle()` - but we don't recommend this).

What if you created a new line by mistake? Just hit backspace. Or if you're totally confused and just want to start again, press Ctrl+C and the text you typed will be deleted.

Once you've finally hit enter, the text ```=function () { ... }``` will be displayed in the terminal window. This means that your function (called 'toggle') is defined. So what does it do? The 'on' variable stores a value which is either true or false. The command ```on = !on;``` makes the value of 'on' true if it was false before, or false if it was true before. If you pronounce ```=``` as becomes, and ```!``` as 'not', reading the line makes much more sense.

The next line takes the changed value of 'on' (either true of false) and applies it to the digital output (in this case LED number 1). Every time you use the toggle function, the value of 'on' toggles between true and false, and so turns the LED on or off.

Now we can try it, type the following and hit enter:

```toggle()```

If you want to run it again, just hit the up arrow (to find the command in history) followed by enter. Every time you run it, the LED will turn on or off.

Now type:

```var interval = setInterval(toggle, 500)```

This will call the 'toggle' function every 500ms (eg. twice a second). The new variable 'interval' (which is defined by 'var') is a reference to the timer we have created - this will be useful later!

But what if we want to change the 'toggle' function? Type:

```edit('toggle')```

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

If you want to start completely from scratch and wipe out everything you have done, just type:

```reset()```

If you press the reset button on the board, Espruino will also reset. However we don't recommend this - on most boards this will reset the USB connection as well, so you may need to restart your terminal application, or in some cases even unplug and re-plug the device.

If you power off or reset Espruino using the reset button, it will lose all the code that you wrote. You can save the state of Espruino so this doesn't happen using the `save()` command. 

The `save()` command saves the current state of the pins and on-chip peripherals, as well as all your functions, variables, watches and timers. The commands that you typed in previously won't be executed again though. If you want to execute some code when Espruino starts (for example you may need to initialise some external bit of hardware like an LCD), create a function called `onInit`. For example this bit of code lights the red, then green, then blue LED each time Espruino starts up:

```
function onInit() {
  digitalWrite([LED1,LED2,LED3],0b100);
  setTimeout("digitalWrite([LED1,LED2,LED3],0b010);", 1000)
  setTimeout("digitalWrite([LED1,LED2,LED3],0b001);", 2000)
  setTimeout("digitalWrite([LED1,LED2,LED3],0);", 3000)
}
```

If you do manage to save something to Espruino that causes it not to work, don't worry - you can easily fix it. Just see the [[Troubleshooting]] page.

Now you've got an idea how to use Espruino:

* Have a look at the [[Tutorials]] and [[Reference]] pages
* If you have one of the Espruino Kits, you can [click here](/Espruino Kits) to see the kit contents and to get information on how to use them
* Check out [[Modules]] to see which libraries of code are available to use
* See how to use the more advanced features of the [[Web IDE]]
* Instantly [[Search]] all the Espruino website's documentation
* If you've got a question, please check out our [[Forum]]

