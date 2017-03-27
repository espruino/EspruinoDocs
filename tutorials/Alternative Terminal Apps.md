<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Using Alternative Terminal Apps
============================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Alternative+Terminal+Apps. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

**Note:** We're putting a lot of functionality into the Chrome Web App (built in firmware updates, tutorials, module loading, syntax highlighting, etc) so we'd really recommend that you use it (see [[Quick Start]] for details on how to do this. However you can still access Espruino in other ways...

Windows
-------

On versions of Windows earlier than Vista, you can use HyperTerminal which comes pre-installed. However to keep things simple, we'll just use an excellent free terminal application called [PuTTY](http://www.chiark.greenend.org.uk/~sgtatham/putty/).

Download PuTTY [from here](http://www.chiark.greenend.org.uk/~sgtatham/putty/). You can either download the simple 'PuTTY' (which is a single executable which needs no installer), or you can download an installer.

Go to the Start Menu, open the Control Panel, then click on ```View Devices and Printers```. Look for an icon called ```STM32 Virtual COM Port``` (if you can't find it, unplug and re-plug Espruino and see which icon appears). After Windows has installed all drivers (which could take several minutes), you should see some text in brackets by the icon saying COM then a number (eg. COM4). This is the name of Espruino's serial port.

Start PuTTY, and click on ```Session``` in the left-hand pane.

Click on the ```Serial``` radio button near the top right, then enter COM4 (or whatever port you found above) under ```Serial Line``` and 9600 under ```Speed```. Then click the 'Open' button.

You can copy text just by dragging over it and releasing the mouse button - and you paste by right-clicking.


Linux/Raspberry Pi
-------------------

Type the following:

```ls /dev/ttyACM* /dev/ttyUSB* /dev/ttyAMA*```

This will list all the serial ports that Espruino could be on (it may say 'No such file or directory' - this is ok). If there isn't just one port, unplug Espruino and run the command again, then plug Espruino in and run it yet again. You should be able to see which one the 'new' device is.

### Picocom

Picocom is installed by default in Ubuntu. Try typing ```picocom``` in a shell to see if it is installed in your OS. If it's not we'd recommend using Minicom (below).

Then run picocom to connect to the device (instead of /dev/ttyACM0, use the device name you got above):

```picocom --baud 9600 --flow n /dev/ttyACM0```

To copy, highlight the text and press ```Shift + Ctrl + C```. To paste, press ```Shift + Ctrl + V```. Use ```Ctrl+A``` then ```Ctrl+X``` to exit.

### Minicom

In a terminal window, install minicom if it isn't installed already:

```sudo apt-get install minicom```

Then run minicom to connect to the device (instead of /dev/ttyACM0, use the device name you got above):

```minicom -b 9600 -D /dev/ttyACM0```

To copy, highlight the text and press ```Shift + Ctrl + C```. To paste, press ```Shift + Ctrl + V```. Use ```Ctrl+A``` then ```X``` to exit.

### Problems

Having permission problems? Usually the Espruino device appears in the ```dialout``` group (for accessing modems), which means your user needs these permissions to access it. Type ```groups``` to check if dialout is listed, and run the following if it isn't:

```sudo adduser $USER dialout```

Now log out and back in, and you will no longer need to use ```sudo``` before running the terminal program.

Mac OS X
----------

Make sure Espruino is unplugged, and type the following in a terminal:

```ls /dev/tty.*```

You should see a list of your available serial devices. Plug Espruino in, wait a few seconds, and run the command again. An new entry should have appeared - and this is Espruino's serial port.

Open a shell, then type the following (instead of /dev/tty.yourdevicename, use the device name you got from Step 3):

```screen /dev/tty.yourdevicename 9600```

To copy, highlight the text and press ```Cmd + C```. To paste, press ```Cmd + V```
