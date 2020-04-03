<!--- Copyright (c) 2019 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Bangle.js Getting Started
==========================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Bangle.js+Getting+Started. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Tutorials,Bangle.js,Getting Started
* USES: Bangle.js

You may also be interested in the [Bangle.js Hardware reference](Bangle.js) and
[Bangle.js Technical reference](Bangle.js+Technical)

Contents
--------

* APPEND_TOC

About Bangle.js
---------------

Bangle.js has 3 physical buttons, and two touch areas.

On the right-hand side, top to bottom, the buttons are BTN1, BTN2, BTN3.

* **BTN1** : ‘Up/Previous’ in menus, and turn on if watch is off
* **BTN2** : ‘Select’ in menus, or bring up menu when in Clock
* **BTN3** : Down/Next in menus, **long-press in any app to return to the Clock**
* **BTN4** : left-hand side of touchscreen. Used for some games, but not in menus
* **BTN5** : right-hand side of touchscreen. Used for some games, but not in menus


Turning on
----------

Tap **BTN1** to turn Bangle.js on, and release it quickly. If you hold **BTN1**
you will enter the bootloader, and will have to press **BTN1** again to exit.


Loading Apps
------------

* Go to [banglejs.com/apps/](https://banglejs.com/apps) on a Web Bluetooth-capable
device (Chrome on Windows, Mac, Linux, Chromebook or Android, or the [WebBLE app on iOS](https://apps.apple.com/gb/app/webble/id1193531073))
* Click `Connect` in the top right
* You can then see you installed apps and can click the up-arrow icon to the right of an app to install it


Charging
--------

The supplied charge cable connects to a USB port to charge Bangle.js (there is
no data connection, it is power only).

You must connect the cable the right way around or it won't work: With Bangle.js
facing away from you (so you're looking at the shiny back) and the `CE Rohs` text
the right way up, the USB cable should exit from the **left** side of the watch.

**The cable is magnetic and the wires are connected directly to USB power.** Do
not leave your cable plugged in or it might attract itself to the nearest
magnetic (probably conductive) object and short out.


Powering off
------------

* Press **BTN2** when in Clock
* Choose `Settings`
* Scroll down to ‘Turn Off’
* Select it


Powering off if completely broken
---------------------------------

* Long-press **BTN1** + **BTN2** for about 6 seconds until the screen goes blank
* Keep pressing them while a progress bar of `====` goes across the screen
* The watch will start vibrating
* Release the 2 buttons
* Your watch may restart if it hasn’t been turned off since the last firmware update. If so, repeat the process again.


Resetting
---------

* Long-press **BTN1** + **BTN2** for about 6 seconds until the screen goes blank
* Release them
* Bangle.js will boot as if it just turned on normally

**Note:** The correct time will be lost and Bangle.js will start at
midnight 1970.


Resetting without loading any code
----------------------------------

If you uploaded something that runs at startup and breaks Bangle.js you may need to do this. It won’t delete anything, so unless you fix/remove the broken code Bangle.js will remain broken next time it restarts.

* Long-press **BTN1** + **BTN2** for about 6 seconds until the screen goes blank
* Release **BTN2** but keep pressing **BTN1** while ‘====’ goes across the screen
* Keep holding **BTN1** while Bangle.js boots
* Release it - you should have the Bangle.js logo, version, and MAC address

You can now go to  http://banglejs.com/apps , connect, then go to `About`-> `Install default apps` and you’re good to go.


Tutorials
----------

* APPEND_USES: Bangle.js
