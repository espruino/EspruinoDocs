<!--- Copyright (c) 2019 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Gadgetbridge for Android
=========================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Gadgetbridge. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Gadgetbridge,Gadget bridge,Android,Notifications
* USES: Bangle.js

[Gadgetbridge](https://gadgetbridge.org/) is an Android application that allows you to use smartwatch-style notifications and health 
monitoring without the need for a proprietary application or web service. We have a modified
[`Bangle.js Gadgetbridge`](https://play.google.com/store/apps/details?id=com.espruino.gadgetbridge.banglejs) app on the 
[Google Play Store](https://play.google.com/store/apps/details?id=com.espruino.gadgetbridge.banglejs) 
or [F-Droid](https://f-droid.org/en/packages/com.espruino.gadgetbridge.banglejs/) (see [below](#bangle-js-gadgetbridge-app))

*If you like Gadgetbridge, [please consider donating](https://liberapay.com/Gadgetbridge/donate)
to help support its continued development*


How to set up
-------------

* Install [Bangle.js Gadgetbridge from the Play Store](https://play.google.com/store/apps/details?id=com.espruino.gadgetbridge.banglejs) 
or [F-Droid](https://f-droid.org/en/packages/com.espruino.gadgetbridge.banglejs/) on your Android phone.
* On Bangle.js, install ONE OF (not both!):
  * [Android Integration app](https://banglejs.com/apps/?id=android) - this is the new and recommended way of interfacing to Gadgetbridge, which allows you to view all notifications in a list
  * [The Gadgetbridge Widget](https://banglejs.com/apps/?id=gbridge) - this is the old way of interfacing to Gadgetbridge - it displays just one notification at a time.
* Now ensure you disconnect your computer from Bangle.js
* Start the Gadgetbridge app and click the blue `+` in the bottom right
* Choose your Bangle.js device from the list
* Right now we'd suggest choosing `Don't pair` when prompted in order to get the most reliable connection
* Everything should now be working. From the menu in the top-left of the Gadgetbridge Android app you can choose `Debug` and can test out notifications/etc

### Extra Setup

**Does Gadgetbridge keep disconnecting from your Bangle?** It may be that your phone is doing some 'battery usage optimisation' and deciding that Gadgetbridge should be shut down. See https://dontkillmyapp.com/ for device-specific advice on how to stop this happening.

By default, some features are disabled in Gadgetbridge and you may well want to enable them:

* Click on your device, then the Gear icon
  * `auto-reconnect to device` should probably be ticked, so Gadgetbridge reconnects if it loses the connection
  * `Text as Bitmaps` detects non-ascii characters (including Emoji) that can't be displayed on the Bangle and converts them to images that can be displayed
  * `Allow high MTU` improves transfer speed to Bangle.js
  * `Allow Internet Access` enables HTTP requests from Bangle.js apps (see below)
  * `Allow Intents` enables Bangle.js apps to interact with Android apps
  

Bangle.js Gadgetbridge app
----------------------------

The version of Gadgetbridge for Bangle.js allows Internet Access.

### HTTP requests

**Must be enabled first** by clicking the gear icon next to the Bangle.js you're connected to in Gadgetbridge, and then enabling `Allow Internet Access`

On Bangle.js just do something like this to make an HTTP request:

```
Bangle.http("https://pur3.co.uk/hello.txt").then(data=>{
  console.log("Got ",data);
});
```

For more information check out the [`Android Integration`](https://banglejs.com/apps/?id=android) app's `Read more...` link.

Right now you *must* use HTTPS (HTTP is not supported). The low-level implementation is described in `How it works internally` below.


### Intents

**Must be enabled first** by clicking the gear icon next to the Bangle.js you're connected to in Gadgetbridge, and then enabling `Allow Intents`

#### Bangle -> Android

On Bangle.js send something like:

```
Bluetooth.println(JSON.stringify({t:"int­ent",action:"com.sonyericsson.alarm.ALAR­M_ALERT",extra:{key1:"asdfas"}}));
```

Will send a Global Android intent. This can open cause certain apps/windows to open, or can be used with apps like `Tasker`.

#### Bangle -> Android

On the Android device, you can send code to execute to your Bangle.js (Programmable must be set to `true` in the Bangle's settings).

Just send an intent to `com.banglejs.uart.tx`, with Extra Data of `line` set to the JavaScript to execute. For example to display a variable from [`Tasker`](https://tasker.joaoapps.com/) on the Bangle's LCD (scrolling everything else up), set up:

```
Action: com.banglejs.uart.tx
Cat: None
Extra: line:Terminal.println(%avariable)
Target: Broadcast Receiver
Variable: Number, Configure on Import, NOT structured, Value set, Nothing Exported, NOT Same as value
```


### Weather

You can also get weather from Gadgetbridge. Install the [Weather Widget](https://banglejs.com/apps/#weather) and check out the `Read more...` link on the app page for more information. An additional app is required to forward the current weather into Gadgetbridge.

If you're using the Play Store 'Bangle.js Gadgetbridge' app, you need to set the package name to `com.espruino.gadgetbridge.banglejs`


How it works internally
--------------------------

### Messages sent to Bangle.js from Phone

Messages are wrapped in the text `"\x10" + "GB(...)\n"`, so that if they're
sent to a normal Espruino REPL the `GB` function will be executed with the
supplied data as the first argument.

Currently implemented messages are:

* `t:"notify", id:int, src,title,subject,body,sender,tel:string`  - new notification
* `t:"notify-", id:int`  - delete notification
* `t:"alarm", d:[{h:int,m:int,rep:int},...]`  - set alarms (rep=binary mask of weekdays)
* `t:"find", n:bool`  - findDevice
* `t:"vibrate", n:int`  - vibrate
* `t:"weather", temp,hum,txt,wind,loc`  - weather report
* `t:"musicstate", state:"play/pause",position,shuffle,repeat` - music play/pause/etc
* `t:"musicinfo", artist,album,track,dur,c(track count),n(track num)` - currently playing music track
* `t:"call", cmd:"accept/incoming/outgoing/reject/start/end", name: "name", number: "+491234"` - call
* `t:"act", hrm:bool, stp:bool, int:int`  - Enable realtime step counting, realtime heart rate. 'int' is the report interval in seconds

Bangle.js Gadgetbridge also provides:

* `t:"http",resp:"......",[id:"..."],[id:"..."]` - a response to an HTTP request (see below)
* `t:"http",err:"......"` - an HTTP request failed.

For example:

```
// new message
GB({"t":"notify","id":1575479849,"src":"Hangouts","title":"A Name","body":"message contents"})
// message changed
GB({"t":"notify~","id":1575479849,"body":"this changed"})
// remove message
GB({"t":"notify-","id":1575479849}); 
// maps navigation
GB({"t":"notify","id":1,"src":"Maps","title":"0 yd - High St","body":"Campton - 11:48 ETA","img":"Y2MBAA....AAAAAAAAAAAAAA="})
// music
GB({"t":"musicstate","state":"play","position":0,"shuffle":1,"repeat":1})
GB({"t":"musicinfo","artist":"My Artist","album":"My Album","track":"Track One","dur":241,"c":2,"n":2})
// Call coming in 
GB({"t":"call","cmd":"accept","name":"name","number":"+441234123123"})
// Set a single alarm, 6:30am, every day of the week
GB({"t":"alarm", "d":[{"h":"6","m":"30:","rep":127}]})
```

### Messages from Bangle.js to Phone

Any line beginning with `{` will be parsed as JSON by Gadgetbridge, so to
send a command, simply use `Bluetooth.println(JSON.stringify(json))`.

Available message types are:

* `t:"info", msg:"..."` - display info popup on phone
* `t:"warn", msg:"..."` - display warning popup on phone
* `t:"error", msg:"..."` - display error popup on phone
* `t:"status", bat:0..100, volt:float(voltage), chg:0/1` - status update
* `t:"findPhone", n:bool`
* `t:"music", n:"play/pause/next/previous/volumeup/volumedown"`
* `t:"call", n:"ACCEPT/END/INCOMING/OUTGOING/REJECT/START/IGNORE"`
* `t:"notify", id:int, n:"DISMISS,DISMISS_ALL/OPEN/MUTE/REPLY", `
  * if `REPLY` can use `tel:string(optional), msg:string`
* `t:"ver", fw1:string, fw2:string` - firmware versions - sent at connect time
* `t:"act", hrm:int, stp:int` - activity data - heart rate, steps since last call

Bangle.js Gadgetbridge also provides:

* `t:"htt­p", url:"https://pur3.co.uk/hello.txt"[,xpath:"­/html/body/p/div[3]/a"][,id:"..."]` - make an HTTPS request (HTTP not supported right now). 
  * If `xpath` is supplied, the document is loaded as XML (not all HTML is XML!), the xpath is applied and the result returned instead
  * If `id` is supplied (as a string), the response returns the same `id` (so multiple HTTP requests can be in flight at once)
* `t:"intent", action:"...", extra:{key1:"..."}` - sends an Android Intent (which can be used to send data to other apps like Tasker)

For example:

```
Bluetooth.println(JSON.stringify({t:"info", msg:"Hello World"}))
```

will display a message on your phone's screen.

### Debugging

You can click `Debug` -> `Fetch Device Debug Logs` in Gadgetbridge which will save a log of
all data sent to/from Bangle.js to a file on your phone. This is very helpful for debugging
and will show if any exceptions/errors have happened on the Bangle, and what commands
caused them. You can then connect with the Web IDE and re-issue those commands by copy/pasting
them into the IDE's left hand side to help you reproduce.

There's a [Gadgetbridge Debug](https://banglejs.com/apps/#gbdebug) app you can install. When running this
will show you the data that is being received from Gadgetbridge. See `Read more...` next to the app for
more information.

Once you know the command that caused the problem you can then disconnect Gadgetbridge, connect with the 
Web IDE and issue that command by pasting it into the left-hand side of the IDE - for example:

```
GB({"t":"notify","id":1575479849,"src":"Hangouts","title":"A Name","body":"message contents"})
```

If there are any errors shown you'll be able to see them and use them to debug what is happening.


Building Gadgetbridge
------------------------

If you want to build Gadgetbridge yourself there's proper documentation at https://codeberg.org/Freeyourgadget/Gadgetbridge/wiki/Developer-Documentation

Once you have the Android development tools on your system, all you need to do to build is:

```Bash
./gradlew assembleDebug
adb install app/build/outputs/apk/debug/app-debug.apk
```
