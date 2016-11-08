Getting Started
===============

Once you've got power on your Puck.js it'll start doing two things:

* Advertising itself on Bluetooth Low Energy
* Acting as an NFC tag that will redirect you to the Puck.js website

If you have an NFC phone, make sure NFC is on, and then move Puck.js near the NFC receiver on it. A Web page should open that will direct you to some examples.

Otherwise, you'll need to go straight to the Puck.js website - [https://puck-js.com/go](https://puck-js.com/go)


Using Puck.js
==============

By default, Puck.js appears as a Bluetooth Low Energy device with a serial port. When you connect to this serial port you get full command-line access to the Espruno Javascript interpreter built into it.

To get started you have two options:

* Use the Espruino IDE to write code to Puck.js
* Send individual JavaScript commands to Puck.js, without programming it


Using the Espruino IDE
----------------------

### With Web Bluetooth

If your computer supports it, Web Bluetooth is the easiest way to get started with Puck.js. 

You'll need:

* A Mac OS, Android, Chromebook or Linux computer (Windows should be supported in Q1 2017)
* The [Google Chrome](https://www.google.com/chrome/browser/desktop/) web browser
* If you have Linux you need `Bluez` newer than `5.40` - you can check by typing `bluetoothd --version`

First, you need to enable Web Bluetooth support:

* Type `chrome://flags` in the address bar
* Search for `Web Bluetooth` and click `Enable`
* Restart your browser

Now:

* Go to the [Puck.js site](https://puck-js.com/go) and click the Web IDE option.
* Click the orange icon in the Top Left
* You should be shown a list of devices - click on Puck.js
* Wait a few seconds - you should be connected!


### With an application

On some platforms (Windows, or Linux with older `Bluez`) Web Bluetooth isn't supported. 

On these you'll need to install a native application. We've packaged up the Web IDE in builds for Windows, Linux, and Mac OS that you can download from the Espruino site.


### Via a Raspberry Pi

To be added soon...


### By wired connection

In the worst case, you don't have any computers that allow you to communicate using Bluetooth Low Energy.

But all is not lost! You can buy a USB-TTL converter, and can connect directly to your Puck.js.

Connect as follows:

| Puck.js  | USB->TTL converter |
|----------|--------------------|
| GND      | GND                |
| D28      | RX ( -> PC )       |
| D29      | TX ( <- PC )       |
| 3V       | 3.3v (Optional - to run without a battery) |

You can now use the normal Espruino Web IDE, or a serial terminal application at 9600 baud.


Sending Individual Commands
---------------------------

### Using Adafruit 'Bluefruit LE' app

* Start the app
* Choose the Puck.js device you want to communicate with and click `Connect`
* Click `UART`
* When connected you're ready to enter some commands - see below

### `nRF UART` app

* Start the app
* Tap `Connect` and choose your Puck.js device
* Type commands into the console - see below. 

**Note:** In this app, you need to manually press the `Enter` key *before* sending a line

### A Website

You can use Web Bluetooth on your own website to control Puck.js devices, as long as you have a compatible browser.

While you can use Web Bluetooth directly, we've provided a helpful library. Just include 
`<script src="https://puck-js.com/puck.js"></script>` in your website (served off `HTTPS`)
and you can easily execute commands just by running JS code like:


```
Puck.write('LED1.set();\n');
```

### Your own app

You can make your own application to control Espruino for whatever platform you need.

For the simplest control, add you need to do is connect to the Puck.js bluetooth device and connect to the characteristic with ID `6e400002b5a3f393e0a9e50e24dcca9e`. You can then write repeatedly to it to send commands to Espruino.


### Commands...

type in `LED1.set()` and click send
* The red LED should light up.
* You can now type `LED1.reset()` to turn it off. `LED2` and `LED3` work too
* Note that responses are also being sent back. You can type in `BTN.read()` and `false` will be returned - it'll be `true` if the button is pressed 



Troubleshooting
===============

## I think I saved something and stopped it working

Unplug the battery, and plug it back in with the button held down until all 3 LEDs turn on. Then release it. The green LED should flash a few times.

This will stop Puck.js loading any stored code (that time only) - you can then `save()` new code to flash.
