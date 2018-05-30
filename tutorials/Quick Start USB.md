<!--- Copyright (c) 2018 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Quick Start (USB)
=================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Quick+Start+USB. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Quick Start,Getting Started,USB
* USES: Only Espruino Board,Pico,EspruinoWiFi,nRF52832DK,WioLTE,STM32L496GDISCOVERY

[[http://youtu.be/32mewNGxax4]]

Plugging in
----------

<span style="color:red">Please check that there is no bare metal (including your desk!) near the board when you plug it in, as it could short it out.</span>

* **Espruino [Pico](/Pico)** - the Pico is designed to plug right into you computer's USB type A connector, or a USB extension lead. The components (not the text) should usually be facing upwards (so the 4 gold strips are facing the plastic in the USB socket).
* **Original [Espruino](/Original), [Espruino WiFi](/EspruinoWiFi) and [Wio LTE](/WioLTE)** - just plug the board in with a Micro USB cable and you're done.
* **[Puck.js](/Puck.js)** - there is no plug! [see the Bluetooth LE Quick Start Guide](http://www.espruino.com/Quick+Start+BLE) instead as the setup is slightly different.
* **[Pixl.js](/Pixl.js)** - the USB plug is only for power [see the Bluetooth LE Quick Start Guide](http://www.espruino.com/Quick+Start+BLE) instead as the setup is slightly different.
* **Other Boards** - please [see this page](/Other Boards) for more information.

**Windows Users:** Most versions of Windows won't automatically load the built-in driver for USB com ports. You'll have to download ST's USB driver:

  * Non-Windows XP Users [download version 1.4.0 drivers](/files/stm32_vcp_1.4.0.zip). Unzip the file, run the executable, **and then go to** `C:\Program Files (x86)\STMicroelectronics\Software\Virtual comport driver` in Windows Explorer and double-click either `dpinst_amd64.exe` for 64 bit systems, or `dpinst_x86.exe` for 32 bit.

  * Windows XP Users [download version 1.3.1 drivers](/files/stm32_vcp_1.3.1.zip). Unzip the file, run `VCP_V1.3.1_Setup.exe`, **and then go to** `C:\Program Files\STMicroelectronics\Software\Virtual comport driver` in Windows Explorer and double-click the executable.

**Linux users** to ensure that you have the correct permissions to connect as a normal user you'll need to copy [the file 45-espruino.rules](https://github.com/espruino/Espruino/blob/master/misc/45-espruino.rules) to `/etc/udev/rules.d`, reload rules with `udevadm control --reload-rules`, and ensure your user is in the `plugdev` group (you can check by typing `groups`). You add it by typing `sudo adduser $USER plugdev` and then logging out and back in. Arch Linux users need to add their user to `uucp` and `lock` groups instead.

**Mac OS X and Chromebook Users:** The board will just plug in and work, without drivers!


Set up a Terminal App
------------------

**Note:** We recommend that you use our [Chrome Web App](https://chrome.google.com/webstore/detail/espruino-web-ide/bleoifhkdalbjfbobjackfdifdneehpo) (it has a bunch of extra features, including firmware updates). However you can access Espruino from any terminal program. See [[Alternative Terminal Apps]] for some examples.

* Install the [Chrome Web Browser](https://www.google.com/intl/en/chrome/browser/)
* [Click here to get the Espruino Web IDE](https://chrome.google.com/webstore/detail/espruino-web-ide/bleoifhkdalbjfbobjackfdifdneehpo) and click ```+FREE``` in the top right to install it.

Now, to use the IDE:

* Run **Espruino Web IDE** from Chrome's home screen (or the App Launcher)
* Click the orange **Connect/Disconnect** icon in the Top Left: ![Connect icon](Quick Start USB/connect.png)
* In the window that pops up, make sure the correct serial port is chosen (Usually the highest `COM#` number on Windows, `/dev/tty.usbmodem1234` on Mac, or `ttyACM0/ttyUSB0` on Linux).
* If you don't see a port or can't get it working, please see [[Troubleshooting]]


Software Updates
--------------

Espruino is gaining features and improvements on an almost daily basis. If you've just got your Espruino Board, we *highly* recommend that you update the firmware before you start using it.

When you first use the Espruino Web IDE and connect (see above) you'll probably see a yellow warning marker in the top right saying that new firmware is available. Click on it (or click the `Settings` icon, then `Flasher`), click 'Flash Firmware' and follow the instructions. If you're given a drop-down list of different firmwares to choose from and you don't need network support, you can choose any firmware. There is no risk of damaging your Espruino board, however the firmware update process may take a few minutes to complete. If you have problems, check out the [[Troubleshooting]] guide.

**Note:** If you're not using the Web IDE, follow the instructions on the [[Download]] page to flash the latest version (however this is significantly more difficult).


Start writing code!
--------------------------

**Please [try the walkthrough](/Quick+Start+Code) to get started writing
your first code for Espruino**

Now you've got an idea how to use Espruino:

* Have a look at the [[Tutorials]] and [[Reference]] pages
* Check out [[Modules]] to see which libraries of code are available to use
* If you have a [Pico](/Pico), [WiFi](/WiFi) or [Original](/Original) Espruino board then click those links for more in-depth information about your board, as well as for links to tutorials that specifically use your board.
* See how to use the more advanced features of the [[Web IDE]]
* Check out other [ways of Programming Espruino](/Programming)
* Instantly [Search](/Search) all the Espruino website's documentation (using the box in the top right)
* If you've got a question, please check out our [[Forum]]
