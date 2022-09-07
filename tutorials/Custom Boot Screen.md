<!--- Copyright (c) 2022 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Adding a Custom Boot Screen
===========================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Custom+Boot+Screen. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Tutorials,Boot screen,bootscreen,logo,splash,splash screen
* USES: Bangle.js,Bangle.js2,Pixl.js

On a [Bangle.js](/Bangle.js2) or [Pixl.js](/Pixl.js), when the device first starts
or is reset, a logo is displayed along with the device's firmware version and Bluetooth address:

![](data:image/png;base64,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)

If you'd like to customise the logo that is displayed, it's easy! There is no
need to recompile your firmware.

All you need to do is:

* Start up the Web IDE at https://www.espruino.com/ide/
* Connect to the Bangle/Pixl.js
* Click the storage icon in the middle of the screen (4 discs)
* Click `Upload File...`
* Choose an image file that matches your device's screen (176x176 or less for Bangle.js 2, 240x240 or less for Bangle.js 1, or 128x64 or less for Pixl.js)
* In the menu that pops up:
  * Change the filename to `.splash`
  * Ensure `Convert for Espruino` is set
  * If it's not a black and white image, change the colors to better match your device (`3 bit RGB` for Bangle.js 2, or anything for Bangle.js 1)
  * If the coloring isn't correct you can experiment with different dithering options
* Click `Upload`

Now the next time your device boots or resets you'll have a custom logo! The MAC address will no longer be shown, however nothing stops you adding the address (or other text) back into the image you upload.


### Manual upload

The `.splash` file is just a normal (uncompressed) Espruino image file that you
can create with https://www.espruino.com/Image+Converter (or `g.asImage('string')`) - so
it's easy to upload without the Web IDE if you need.
