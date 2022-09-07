<!--- Copyright (c) 2019 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Firmware Updates
=================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Firmware+Update. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Firmware Update,Firmware Upgrade,Flashing,Upgrade,Update,Version

Official Espruino boards come in two main flavours, and firmware updates are
slightly different for each flavour. See below for instructions.

* **NRF52** : Puck.js, Pixl.js, MDBT42Q, Bangle.js, Bangle.js 2 - Boards **with** Bluetooth LE
* **STM32** : Espruino Original, Pico and WiFi - Boards with USB, and **without** Bluetooth LE

For non-official board firmware updates, see the [Other Boards](/Other+Boards) page for instructions.

NRF52
-----

### Bangle.js 2

Bangle.js 2 provides its own firmware update mechanism using the [App Loader](https://banglejs.com/apps/?id=fwupdate).

**On Bangle.js 2 this is the recommended method** (although other methods still work). Simply click on the **≡** icon
to the right of the [`Firmware Update`](https://banglejs.com/apps/?id=fwupdate) app and follow the instructions.

The firmware will upload to Bangle.js, and when it is complete, Bangle.js will
restart and install the firmware.

**Note:** KickStarter Bangles that shipped with 2v10 firmware will have 2v10 bootloaders
which need updating before you use the firmware updater. Just follow the instructions on
the `Firmware Update` page to update your bootloader.

### Android / iOS App

Install the relevant app...

* [iOS Device Firmware Update (15 or later - recommended)](https://apps.apple.com/gb/app/device-firmware-update/id1624454660)
* [Android Device Firmware Update (recommended)](https://play.google.com/store/apps/details?id=no.nordicsemi.android.dfu)

or:

* [iOS nRF Toolbox (before 15)](https://apps.apple.com/us/app/nrf-toolbox/id820906058)
* [iOS nRF Connect](https://apps.apple.com/gb/app/nrf-connect-for-mobile/id1054362403)
* [Android nRF Connect](https://play.google.com/store/apps/details?id=no.nordicsemi.android.mcp)

Now on your device, download the latest stable distribution zip from the [Espruino site](https://www.espruino.com/Download) by selecting your board from the `Find a binary` drop-down. You can also choose `Cutting Edge build` for the absolute latest firmware.

Now, you need to put your device into DFU mode using the instructions below. Note that DFU mode usually times out after 30-60 seconds of inactivity.

#### Entering DFU mode

##### MDBT42Q / Puck.js

* Apply power while holding the button (or button 1 on Pixl.js) down
* A LED will now stay lit (green on Puck.js, red on MDBT42Q)
* The device is now in bootloader mode

##### Pixl.js

* [Reset Pixl.js](/Pixl.js#resetting-pixl-js) with `BTN1` held down. The display will show `BOOTLOADER` `RELEASE BTN1 FOR DFU`. Make sure release `BTN1` before the progress bar reaches the end.
* The display should now show `DFU STARTED` `READY TO UPDATE`
* The Pixl.js is now in bootloader mode  

##### Bangle.js 1

* Long-press `BTN1` + `BTN2` for about 6 seconds until the screen goes blank
* Release `BTN2`
* Release `BTN1` a moment later while `====` is going across the screen
* The watch should now be in Dfu mode

##### Bangle.js 2

* Long-press the button for about 10 seconds until the screen goes blank
* While `====` is going across the screen, release the button (releasing it later will just boot back to Bangle.js)
* The watch should now be in DFU mode

#### Performing firmware update  

Run the relevant app on your Android/iOS device.

Each app/device is slightly different (they are covered below), but
in general you need to connect to a device called `DfuTarg`, and choose the zip
file you downloaded.

**Note:** If the firmware upgrade fails, please try again. The firmware update
process will usually resume where it left off so even if it fails once, you
can usually complete successfully on a second attempt.

##### Device Firmware Update

* Tap `Select File`, choose `Distribution Packet (ZIP)` if prompted, and choose the ZIP file you downloaded
  * If a `Select scope` window appears, choose `All`
* Tap `Select Device` and choose the device called `DfuTarg`
* Now tap `Upload` and wait
* The upgrade will take around 90 seconds to complete

##### nRF Toolbox

* Tap the `DFU` button/tab
* Tap `Connect` and choose the device called `DfuTarg`
* Tap `Select File`/`Browse` and choose the ZIP you downloaded
  * Choose `Distribution Packet (ZIP)` if prompted,
  * If a `Select scope` window appears, choose All
* Now tap `Upload` and wait
* The upgrade take around 90 seconds to complete

**Note:** It has been reported that iOS 15+ devices the NRF Toolbox
app disconnects from the Bangle after performing only part of the update process (iOS 12.5 works flawlessly). If this
happens to you, you'll have to manually click to start the update multiple times (it will
start from where it left off) in order to complete the update.

##### nRF Connect

* The `Scanning` tab should show some Bluetooth devices, including one called `DfuTarg`
* Click `Connect` to the right of `DfuTarg`
* Once connected, a `DFU` symbol in a circle will appear in the top right of the App
* Click it, choose `Distribution Packet (ZIP)`, and your Download.
  * If clicking on the downloaded zip file opens its contents (Android 7 may do this) then long-press on the zip and tap open instead.
* The upgrade take around 90 seconds to complete

### Web IDE

It is also possible to use the [Web IDE](https://www.espruino.com/ide/)
to update firmware. Click `Settings` (top right), then `Flasher`
and follow the instructions.

However on some operating systems the firmware update process using the IDE
can be unreliable. If this happens to you, you can try using another computer,
or the `Android/iOS App` method above.


STM32
-----

These updates are done using a Serial-over-USB connection:

We'd strongly recommend that you use the [Web IDE](espruino.com/ide) which has a flasher (and firmware download) built-in. Downloading up to date firmware is as easy as clicking the `Settings` button (top right), then `Flasher`, then `Flash Firmware`. To flash a 'cutting edge' or older binary, simply:

* Find the `.bin` file that you wish to flash online, right-click on it and `Copy Link Address`.
* Click the `Settings` button in the IDE, then `Flasher`.
* Paste the URL into the text box under `Advanced Firmware Update`
* Click the `Flash from URL` button

If you absolutely don't want or can't do this then do the following on Linux or MacOS:

* Open a Terminal Window
* Make sure you have Python installed (type `python --help` and see if anything happens)
* Download the `stm32loader.py` Python script from https://github.com/espruino/Espruino/blob/master/scripts/stm32loader.py
* Run `python stm32loader.py -k -p MySerialPort -evw espruino_for_your_device.bin`
  * On Mac OS, MySerialPort will probably look a lot like /dev/tty.usbmodem### where ### is a number. You can use the 'Tab' key to autocomplete once you have typed /dev/tty.usbserial
  * On Linux, MySerialPort will probably look a lot like /dev/ttyACM# where # is a number. If you only have one USB-Serial device plugged in, it's almost certainly /dev/ttyUSB0
  * Note the -k flag above. This is specific to Espruino rev 1.3 Boards and helps to ensure that the USB link is reliable during flashing.

You can also completely overwrite Espruino's bootloader using the [Serial Bootloader](/Serial+Bootloader) instructions, but you'll need a USB-TTL converter for this.
