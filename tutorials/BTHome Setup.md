<!--- Copyright (c) 2020 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
BTHome and Home Assistant Setup
=====================================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/BTHome+Setup. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Tutorials,BTHome,HomeAssistant,Home Assistant
* USES: Puck.js,Bangle.js,BLE,BTHome

This video shows you how to set up [Home Assistant](https://www.home-assistant.io/) with [BTHome](https://bthome.io/) on a Raspberry Pi.

[[https://youtu.be/eQpwemNit4c]]

## You'll need

* A [Raspberry Pi 3B or later](https://www.raspberrypi.com/) (not a 'Pico')
* A Micro SD card (32gb or more) and a way to write to it
* A Power Supply for the Raspberry Pi
* Ethernet Connection for the Raspberry Pi (using WiFi will reduce your BLE range)

## Install Home Assistant

Follow the steps at https://www.home-assistant.io/installation/raspberrypi

But in short:

* Put the SD card in your PC
* Install the `Raspberry Pi Imager` from https://www.raspberrypi.com/software/
* Choose your Pi version, then `Other specific-purpose OS > Home assistants and home automation > Home Assistant`
* Flash the SD card

Once that's done, put the card in your Pi, connect to ethernet and power, and wait a few minutes!

You can now follow https://www.home-assistant.io/getting-started/onboarding/ to set it up by going to `http://homeassistant.local:8123/` in your browser - although it's pretty straightforward as you can see from the video!


## Make/buy a BTHome device

There are a bunch of supported devices listed on https://bthome.io/, but for Espruino devices:

* [Pre-made Bangle.js apps are available](https://banglejs.com/apps/?q=bthome) which will make your [Bangle.js watch](/Bangle.js2)
appear in BTHome
* [Pre-made Puck.js apps are available](https://espruino.github.io/EspruinoApps/?q=bthome) which will make your [Puck.js](/Puck.js)
appear in BTHome
* You can [write your own apps using the BTHome library](/BTHome)


## BTHome

Once Home Assistant is running, it will automatically pick up BTHome devices that are advertising within range.

You can see these by going to `Settings -> Devices & Services -> BTHome` : http://homeassistant.local:8123/config/integrations/integration/bthome

* If you previously set up a device it'll be in `Integration entries`
* If you haven't yet added a device, you should see it under a `Discovered` heading. Click `Configure` and choose where in your house it is and you're good.
* If you previously set up a device and then deleted it, you need to click `Add Entry` and `Setup another instance of BTHome`

Once you have a device, click on the link under it that says `1 Device` - here you can see the Logbook, current sensor values, and can even set up Automations.