<!--- Copyright (c) 2016 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Testing Espruino on Bangle.js 2
===============================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Testing+Espruino+on+Bangle.js+2. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Tutorials,Test,Espruino,Bangle.js2,Web Bluetooth,BLE
* USES: Espruino,Bangle.js2,Web Bluetooth,BLE

If you are making changes to Espruino itself, you need a way to quickly build and test it. This tutorial shows you how to do that on the [Bangle.js 2 watch](https://www.espruino.com/Bangle.js2).

We will build Espruino both for a real Bangle.js 2 and the eumulator that is built into the [Web IDE](https://www.espruino.com/Web+IDE). It is always recommended to test on real hardware, but you can use the emulator if you don't have a watch, or if you're just trying things out and plan to test on the real watch later.


Compiling Espruino
------------------

You'll first need to compile Espruino. The recommended way to do this is via the GitHub action. To use it, you must push your changes to a branch on GitHub, then you can start a GitHub action that will compile Espruino for you:

![Video showing how to use the GitHub action](Testing Espruino on Bangle.js 2/github_compile.gif)

1. Go to your Espruino repository on GitHub.
2. Click the `Actions` tab.
3. Under `Workflows` click `Firmware Build`.
4. Click `Run Workflow`.
5. Choose the branch that you have made the changes on.
6. Optionally, disable all builds except the `DFU` and `emulator` builds. This will make the workflow run faster.
7. Click `Run Workflow`.
8. Optionally, click on the `BANGLEJS2` or `EMSCRIPTEN2` build under `Jobs` to see logs from the build process.
9. If any of the builds fail, you need to read the build logs and fix the error before you continue.
10. Wait for the build to finish.
11. Click on `Summary`.
12. Scroll down to the `Artifacts` section to find the builds you need.
13. Click the `BANGLEJS2` file to download the firmware for a Bangle.js 2 watch.
14. Click the `EMSCRIPTEN2` file to download the emulator for a Bangle.js 2 watch.

You can read more about this method and other methods of compiling at https://github.com/espruino/Espruino/blob/master/README_Building.md

The GitHub method is recommended because it works on any machine and builds the firmware in a reproducible manner. If you choose to compile on your local machine, it might be configured incorrectly which can break your build in various ways that are hard to debug.


Prevent bricking your watch
---------------------------

If you upload bad firmware, you can potentially brick your watch. There are a few things you can do to minimise this risk.

If the app loader refuses to upload your firmware, don't try to force it by using a different method. Chances are your firmware is bad and you need to fix it.

If there are any new build errors or warnings, fix them before trying to upload the firmware to your watch.

The watch uses something called the DFU loader to flash new firmware. Try to not make any changes to code that references `DFU`, that way if you upload broken Espruino firmware, it is still possible to recover your watch because the DFU is intact and can load a new firmware file.

If you are making a lot of unstable changes, consider testing in the emulator first. You can brick the emulator as much as you want, and then when the firmware seems to work in the emulator, there is a better chance that the firmware will not brick your watch.


Uploading Espruino to a Bangle.js 2 watch
-----------------------------------------

To upload the firmware, use the [Banglejs App Loader](https://banglejs.com/apps/?id=fwupdate).

1. Connect your watch to the App Loader
   1. Make sure you are in a browser that supports bluetooth connections, such as Chrome.
   2. Disconnect your watch from any other phones or computers
   3. Make sure your watch is connectable (read more here: [Bangle.js Development](https://www.espruino.com/Bangle.js+Development))
   4. Press the `Connect` button in the app loader and follow the prompt
2. Find the app called `Firmware Update` and open it by clicking the hamburger icon
3. Scroll down and expand the `Advanced` section
4. Choose the zip file that you just downloaded
5. Click `Upload`

The upload takes a few minutes to complete, then the watch needs to flash the new firmware and reboot. The flash is complete when your normal watch face is displayed.


Running the Espruino emulator locally
-------------------------------------

For this, you need to have a local copy of the [Web IDE](https://www.espruino.com/Web+IDE). The source code is available on GitHub: https://github.com/espruino/EspruinoWebIDE

Unzip the `EMSCRIPTEN2` file you just downloaded, it should contain a file called `emulator_banglejs2.js`. Replace the existing emulator file with the new one at `EspruinoWebIDE/emu/emulator_banglejs2.js`.

Now make sure you have the necessary dependencies installed. You need to have [Node](https://nodejs.org) installed, then from the Web IDE repository run the command:

```sh
npm install
```

Now you can start the Web IDE locally with the command:

```sh
npm run web
```

Check the terminal output to find a link that looks something like `http://localhost:3000`, then open it in a browser.

Now you should be able to use the Web IDE with your custom emulator firmware.
