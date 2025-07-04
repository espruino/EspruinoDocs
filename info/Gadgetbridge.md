<!--- Copyright (c) 2019 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Gadgetbridge for Android
=========================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Gadgetbridge. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Gadgetbridge,Gadget bridge,Android,Notifications,Remote Debugging,Remote Connection
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

* Install Bangle.js Gadgetbridge on your Android phone (see below for more info on our `Bangle.js Gadgetbridge` app). This can be:
  * [Bangle.js Gadgetbridge from the Play Store](https://play.google.com/store/apps/details?id=com.espruino.gadgetbridge.banglejs) - easiest for most users.
  * [Bangle.js Gadgetbridge from F-Droid](https://f-droid.org/en/packages/com.espruino.gadgetbridge.banglejs) - not dependent on the Google Play Store
  * [Bangle.js Gadgetbridge 'nightly' builds](https://freeyourgadget.codeberg.page/fdroid/repo/) - with all the very latest changes
  * Normal [Gadgetbridge from F-Droid](https://f-droid.org/packages/nodomain.freeyourgadget.gadgetbridge/) (this doesn't provide any Internet connectivity features)
  * On alternative platforms such as [Sailfish OS](https://sailfishos-chum.github.io/apps/harbour-amazfish/), [Ubuntu Touch](https://open-store.io/app/uk.co.piggz.amazfish), or [Flatpak](https://flathub.org/apps/uk.co.piggz.amazfish), Amazfish can be used as it implements the Gadgetbridge interface.
* On Bangle.js, install the [Android Integration app](https://banglejs.com/apps/?id=android) - this is the new and recommended way of interfacing to Gadgetbridge. (The [Gadgetbridge Widget](https://banglejs.com/apps/?id=gbridge) is the old, unmaintained way of interfacing to Gadgetbridge)
* Now ensure you disconnect your computer from Bangle.js
* Start the Gadgetbridge app and click the blue `+` in the bottom right
* Choose your Bangle.js device from the list
* You'll be prompted on whether you'd like to Pair the Bangle or not. Pairing will use an encrypted connection, and it's been reported that with enabled on modern Android versions, Gadgetbridge auto-connects to Bangle.js more reliably.
* Everything should now be working. From the menu in the top-left of the Gadgetbridge Android app you can choose `Debug` and can test out notifications/etc

### Extra Setup

**Does Gadgetbridge keep disconnecting from your Bangle?** It may be that your phone is doing some 'battery usage optimisation' and deciding that Gadgetbridge should be shut down. See https://dontkillmyapp.com/ for device-specific advice on how to stop this happening.

By default, some features are disabled in Gadgetbridge and you may well want to enable them:

* Click on the three bars icon (`≡`) in the top left, then `Settings`
  * Enable `Connect to Gadgetbridge device when Bluetooth is turned on`
  * Enable `Reconnect automatically`, so Gadgetbridge reconnects if it loses the connection
  * `Sync time` is on by default, but needs to be left on if you want to enable `Sync Calendar Events` (below)

* Click on your device, then the Gear icon
  * `Text as Bitmaps` detects non-ascii characters (including Emoji) that can't be displayed on the Bangle and converts them to images that can be displayed
  * `Allow high MTU` improves transfer speed to Bangle.js
  * `Allow Internet Access` enables HTTP requests from Bangle.js apps (see below)
  * `Allow Intents` enables Bangle.js apps to interact with Android apps
  * `Sync Calendar Events` allows Gadgetbridge to send info on your Calendar events to Bangle.js, to be viewed with the `Agenda` app.

On some phones, even though Gadgetbridge requests permissions, they may not have been granted by default:

* Go to `Android Settings` on your Android Device
* Go to `Apps` then `Permissions` then `Permissions`(again)
* Now click `Calendar` and scroll down to `Bangle.js Gadgetbridge` and check if it is under `Allowed`. If not, click it under `Denied` and then click `Allow`
* Now click `Location` and scroll down to `Bangle.js Gadgetbridge` and check if it is under `Allowed All the Time`. If it is, click it and then click `Allow`

On some custom Android ROMS (and Xiaomi/Redmi MIUI phones) you need to grant extra permissions for 'Find My Phone' to be able to create a sound. See https://gadgetbridge.org/basics/features/find-phone/

If you're using the [Play Store Gadgetbridge](https://play.google.com/store/apps/details?id=com.espruino.gadgetbridge.banglejs), you can
also [sign up to be a tester](https://play.google.com/apps/testing/com.espruino.gadgetbridge.banglejs) - occasionally we will release a new
version for testing before rolling it out to everyone and you'll get access to that.


Bangle.js Gadgetbridge app
----------------------------

We have a version of Gadgetbridge for Bangle.js that allows Internet Access (normal Gadgetbridge does not). It is available from:

  * [the Google Play Store](https://play.google.com/store/apps/details?id=com.espruino.gadgetbridge.banglejs) - recommended
  * [F-Droid](https://f-droid.org/en/packages/com.espruino.gadgetbridge.banglejs)

The Bangle.js Gadgetbridge app is built [from the same source code](https://codeberg.org/Freeyourgadget/Gadgetbridge) as
the normal Gadgetbridge, however the `Bangle.js Gadgetbridge` app requires extra internet permissions to install and so can
provide extra features:

### HTTP requests

**Must be enabled first** by clicking the gear icon next to the Bangle.js you're connected to in Gadgetbridge, and then enabling `Allow Internet Access`

On Bangle.js just do something like this to make an HTTP request:

```
Bangle.http("https://pur3.co.uk/hello.txt").then(data=>{
  console.log("Got ",data);
  // actual response is in data.resp
});
// Prints:
//Got  {
//  "t": "http",
//  "id": "89875941444",
//  "resp": "Hello World!\n"
// }
```

**For more information check out the [`Android Integration`](https://banglejs.com/apps/?id=android) app's `Read more...` link.**

Right now you *must* use HTTPS (HTTP is not supported). The low-level implementation is described in `How it works internally` below.


### Intents

**Must be enabled first** by clicking the gear icon next to the Bangle.js you're connected to in Gadgetbridge, and then enabling `Allow Intents`

#### Bangle -> Android

On Bangle.js send something like:

```
Bluetooth.println(JSON.stringify({t:"int­ent",action:"com.sonyericsson.alarm.ALAR­M_ALERT",extra:{key1:"asdfas"}}));
```

This will send a Global Android intent which can cause certain apps/windows to open, or can be used with apps like `Tasker`.

Or:

```
Bluetooth.println(JSON.stringify({t:"intent", target:"activity", action:"android.media.action.MEDIA_PLAY_FROM_SEARCH", flags:["FLAG_ACTIVITY_NEW_TASK"], categories:["android.intent.category.DEFAULT"], extra:{"query":'track:"Sittin\' on the Dock of the Bay" artist:"Otis Redding"'}}))
```

This will search for and play the song "Sittin' on the Dock of the Bay". The android device will ask about what app to use. The flag ```"FLAG_ACTIVITY_NEW_TASK"``` is needed in order for the activity to launch in this case.

Gadgetbridge connected to a Bangle.js watch can broadcast intents and start activities or services.

Toggling play/pause of the android music app Poweramp can be done via its [API-service](https://github.com/maxmpz/powerampapi/blob/master/poweramp_api_lib/readme.md):

```
Bluetooth.println(JSON.stringify({t:"intent", target:"foregroundservice", action:"com.maxmpz.audioplayer.API_COMMAND", package:"com.maxmpz.audioplayer", extra:{cmd:"TOGGLE_PLAY_PAUSE"}}));
```

Services can act while the android device is locked and/or sleeping. Activities cannot. A way around this is to fire this intent that wakes and unlocks the device:

```
Bluetooth.println(JSON.stringify({t:"intent", target:"activity", flags:["FLAG_ACTIVITY_NEW_TASK", "FLAG_ACTIVITY_CLEAR_TASK", "FLAG_ACTIVITY_EXCLUDE_FROM_RECENTS", "FLAG_ACTIVITY_NO_ANIMATION"], package:"gadgetbridge", class:"nodomain.freeyourgadget.gadgetbridge.activities.WakeActivity"}));
```

If the waking intent doesn't work then try sending it twice in a row. If that doesn't do it, make sure to add the Bangle.js as a trusted device in android settings for it to be able to bypass the lock screen. If it still doesn't work, try [re-adding the Bangle.js via Gadgetbridge with "CompanionDevice Pairing" activated](https://codeberg.org/Freeyourgadget/Gadgetbridge/wiki/Companion-Device-pairing).

The following type of information can be supplied for intents: `target`, `action`, `flags`, `categories`, `package`, `class`, `mimetype`, `data` and `extra`. Values to pass with the `target`-key are `"broadcastreceiver"`, `"activity"`, `"service"` or `"foregroundservice"` (falls back to `"service"` if below Android 8.0). Intents will default to being broadcast if no target is specified. To accommodate the different Gadgetbridge versions a special package-value, `"gadgetbridge"`, can be supplied with the `package`-key.

Template for initiating an intent from a Bangle.js app:

```
Bluetooth.println(JSON.stringify({t:"intent", target:"", action:"", flags:["flag1", "flag2",...], categories:["category1","category2",...], package:"", class:"", mimetype:"", data:"", extra:{someKey:"someValueOrString", anotherKey:"anotherValueOrString",...}}));
```

Key/value-pairs can be omitted if they are not needed.

*The main resource on android intents is the [android documentation intent reference](https://developer.android.com/reference/android/content/Intent). For inspiration search for "tasker intent" in your favourite search engine.*

#### Android -> Bangle

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

You can also get weather from Gadgetbridge. Install the [Weather Widget](https://banglejs.com/apps/?id=weather) and check out the [`Read more...` link on the app page](https://banglejs.com/apps/?id=weather&readme) for more information on the setup required. An additional app is required to forward the current weather into Gadgetbridge.

If you're using the Play Store 'Bangle.js Gadgetbridge' app, you need to set the package name to `com.espruino.gadgetbridge.banglejs`


### Sports Activity Sync

Activities recorded with the "Recorder" app can be synced to Gadgetbridge which will store, parse and display them in the app.

Activities with GPS data can be forwarded from Gadgetbridge to other apps via a GPX file. If there're no GPS coordinates logged at the beginning of the activity, the forwarded information will not include these first data points and the starting time will not be the same. To mitigate this make sure you have a GPS fix before starting to record on the watch (updated A-GPS data drastically improve the time to get a first fix).

More info at https://gadgetbridge.org/basics/features/sports/ .


How it works internally
--------------------------

### Messages sent to Bangle.js from Phone

Messages are wrapped in the text `"\x10" + "GB(...)\n"`, so that if they're
sent to a normal Espruino REPL the `GB` function will be executed with the
supplied data as the first argument.

Currently implemented messages are:

* `t:"notify", id:int, src,title,subject,body,sender,tel:string,reply`  - new notification
  * `id` is a unique ID for this noticiation
  * `src` is name of app sending notification
  * `reply:true` is present when it's possible to send a `{t:"notify", id:int, n:"REPLY", msg:"My Reply"}` response (Gadgetbridge 0.80 and later)
* `t:"notify-", id:int`  - delete notification
* `t:"alarm", d:[{h:int,m:int,rep:int,on:int},...]`  - set alarms
  * rep=binary mask of weekdays
  * `on` is optional, indicates whether the alarm is enabled (default) or disabled
* `t:"find", n:bool`  - findDevice
* `t:"vibrate", n:int`  - vibrate
* `t:"weather", temp,hi,lo,hum,rain,uv,code,txt,wind,wdir,loc`  - weather report _(current temp, days highest temp, days lowest temp, current humidity, rain/precip probability, UV Index, current condition code, current condition text, wind speed, wind direction)_
* `t:"musicstate", state:"play/pause",position,shuffle,repeat` - music play/pause/etc
* `t:"musicinfo", artist,album,track,dur,c(track count),n(track num)` - currently playing music track
* `t:"call", cmd:"accept/incoming/outgoing/reject/start/end", name: "name", number: "+491234"` - call
* `t:"act", hrm:bool, stp:bool, int:int`  - Enable realtime step counting, realtime heart rate. 'int' is the report interval in seconds
* `t:"actfetch", ts:long`  - The timestamp (milliseconds since 1970) of the last activity sample received - Bangle.js can then send any data Gadgetbridge might have missed. If set to 0, the Bangle will send all the data it has.
* `t:"listRecs", id:"YYYYMMDDx"  (e.g. 20240101a)` - fetch a list of `recorder` app log id's newer than the log with the supplied id (corresponding to the latest fetched log).
* `t:"fetchRec", id:"YYYYMMDDx"  (e.g. 20240101a)` - fetch the `recorder` app log with the supplied id.
* `t:"calendar", id:int, type:int, timestamp:seconds, durationInSeconds, title:string, description:string,location:string,calName:string.color:int,allDay:bool`  - Add a calendar event
* `t:"calendar-", id:int` - remove calendar event
* `t:"force_calendar_sync_start"` - cause Bangle.js to send a `force_calendar_sync`
* `t:"gps", lat, lon, alt, speed/*kph*/, course, time, satellites, hdop, externalSource:true` - a GPS reading once GPS is turned on with  `{ t:"gps_power", status: true }`
* `t:"is_gps_active"` - cause Bangle.js to send `{ t:"gps_power", status: bool }`
* `t:"nav",instr:"High St towards Null St",distance:966,action:"continue",eta:"08:39"` - Navigation (as of Play Store app 0.74.0)
* `t:"nav"` - Navigation stopped

Bangle.js Gadgetbridge also provides:

* `t:"http",resp:"......",[id:"..."]` - a response to an HTTP request (see below)
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
GB({"t":"call","cmd":"incoming","name":"name","number":"+441234123123"})
// Set a single alarm, 6:30am, every day of the week
GB({"t":"alarm", "d":[{"h":"6","m":"30:","rep":127}]})
// Send a GPS location
GB({"t":"gps","lat":51.509865,"lon":-0.118092,"alt":42,"speed":0,"course":123,"time":1684413470805,"satellites":11,"hdop":10.720000267028809,"externalSource":true,"gpsSource":"GPS"})
// Send a navigation message
GB({"t":"nav","instr":"High St towards Tollgate Rd","distance":"966yd","action":"continue","eta":"08:39"})

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
* `t:"ver", fw:string, hw:string` - firmware and hardware versions - sent at connect time
* `t:"act", ts:long, hrm:int, stp:int, mov:int, rt:int` - activity data - timestamp, heart rate, steps and movement intensity
  * `act` optional (added in Gadgetbridge 0.82.1) - the current activity type, one of `UNKNOWN,NOT_WORN,DEEP_SLEEP,LIGHT_SLEEP,REM_SLEEP,ACTIVITY,RUNNING,WALKING,SWIMMING,CYCLING,EXERCISE` from [ActivityKind.java](https://codeberg.org/Freeyourgadget/Gadgetbridge/src/branch/master/app/src/main/java/nodomain/freeyourgadget/gadgetbridge/model/ActivityKind.java)
  * `ts` is optional - in milliseconds since 1970. If not specified the current time is used
  * `rt` is optional - indicates whether the sample is realtime and therefore not to be stored in the database
* `t:"actTrksList", list:"a list of new non-fetched `recorder` app logs"`
* `t:"actTrk", log:"YYYYMMDDx"  (e.g. 20240101a), lines:"four lines of the log"/"erase", cnt: "the current packet count"`
* `t:"force_calendar_sync", ids:[int,int,...]` - Sends a list of Bangle's existing calendar IDs, and ask Gadgetbridge to add/remove any calendar items that are different
* `t:"intent", target:"...", action:"...", flags:["flag1", "flag2",...], categories:["category1","category2",...], package:"...", class:"...", mimetype:"...", data:"...", extra:{someKey:"someValueOrString", anotherKey:"anotherValueOrString",...}` - sends an Android Intent (which can be used to send data to other apps like Tasker)
* `t:"file", n:"a_filename", c:"contents as string", m:"a"/"w" (append/overWrite)`
* `t:"gps_power", status: bool` - Sends an update on whether Bangle.js wants GPS enabled or not

Bangle.js Gadgetbridge also provides:

* `t:"http", url:"https://pur3.co.uk/hello.txt"[,xpath:"­/html/body/p/div[3]/a"][,id:"..."][,insecure:true]` - make an HTTP/HTTPS request.
  * If `xpath` is supplied, the document is loaded as XML (not all HTML is XML!), the xpath is applied and the result returned instead
  * If `id` is supplied (as a string), the response returns the same `id` (so multiple HTTP requests can be in flight at once)
  * If `insecure` is supplied (as a boolean), TLS certificate validation is fully disabled and insecure connections are allowed - defaults to `false`

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


### Remote Debugging

You can also connect the Web IDE to Bangle.js *through your phone running Gadgetbridge*.

From Gadgetbridge, start the App Loader, then go to `More...` and click `Web IDE Remote`.

You'll see a UUID shown - copy this and 'share' it with yourself, so you can then go to
https://www.espruino.com/ide/ on your desktop, go to `Settings`, `Communications`, and paste it into the
box for `Remote Connection Bridge Peer ID`.

Refresh the Web IDE page and (as long as the App Loader stays open in Gadgetbridge after `Web IDE Remote` has been pressed)
you'll be able to connect via the Web IDE and see what Bangle.js is responding with as notifications/etc arrive.



Building Gadgetbridge
------------------------

If you want to build Gadgetbridge yourself there's proper documentation at https://codeberg.org/Freeyourgadget/Gadgetbridge/wiki/Developer-Documentation

