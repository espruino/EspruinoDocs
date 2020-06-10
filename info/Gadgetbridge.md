<!--- Copyright (c) 2019 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Gadgetbridge for Android
=========================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Gadgetbridge. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Gadgetbridge,Gadget bridge,Android,Notifications
* USES: Bangle.js

[Gadgetbridge](https://gadgetbridge.org/) is an Android application that allows you to use smartwatch-style notifications and health monitoring without the need for a proprietary application or web service.

*If you like Gadgetbridge, [please consider donating](https://liberapay.com/Gadgetbridge/donate)
to help support its continued development*

We've added a 'Bangle.js' device to Gadgetbridge which allows you to connect
your phone to [Bangle.js](/Bangle.js) (or any Bluetooth-capable Espruino).


Messages sent to Bangle.js from Phone
--------------------------------------

Messages are wrapped in the text `"\x10" + "GB(...)\n"`, so that if they're
sent to a normal Espruino REPL the `GB` function will be executed with the
supplied data as the first argument.

Currently implemented messages are:

* `t:"notify", id:int, src,title,subject,body,sender,tel:string`  - new notification
* `t:"notify-", id:int`  - delete notification
* `t:"alarm", d:[{h,m},...]`  - set alarms
* `t:"find", n:bool`  - findDevice
* `t:"vibrate", n:int`  - vibrate
* `t:"weather", temp,hum,txt,wind,loc`  - weather report
* `t:"musicstate", state:"play/pause",position,shuffle,repeat` - music play/pause/etc
* `t:"musicinfo", artist,album,track,dur,c(track count),n(track num)` - currently playing music track
* `t:"call", cmd:"accept/incoming/outgoing/reject/start/end", name: "name", number: "+491234"` - call

### Examples

```
GB({"t":"notify","id":1575479849,"src":"Hangouts","title":"A Name","body":"message contents"})
GB({"t":"musicstate","state":"play","position":0,"shuffle":1,"repeat":1})
GB({"t":"musicinfo","artist":"..","album":"..","track":"..","dur":241,"c":2,"n":2})
GB({"t":"call","cmd":"accept","name":"name","number":"+491234"})
```

Messages from Bangle.js to Phone
--------------------------------

Any line beginning with `{` will be parsed as JSON by Gadgetbridge, so to
send a command, simply use `Bluetooth.println(JSON.stringify(json))`.

Available message types are:

* `t:"info", msg:"..."`
* `t:"warn", msg:"..."`
* `t:"error", msg:"..."`
* `t:"status", bat:0..100, volt:float(voltage)` - status update
* `t:"findPhone", n:bool`
* `t:"music", n:"play/pause/next/previous/volumeup/volumedown"`
* `t:"call", n:"ACCEPT/END/INCOMING/OUTGOING/REJECT/START/IGNORE"`
* `t:"notify", id:int, n:"DISMISS,DISMISS_ALL/OPEN/MUTE/REPLY", `
  * if `REPLY` can use `tel:string(optional), msg:string`

For example:

```
Bluetooth.println(JSON.stringify({t:"info", msg:"Hello World"}))
```

will display a message on your phone's screen.


Building Gadgetbridge
----------------------

There's proper documentation at https://codeberg.org/Freeyourgadget/Gadgetbridge/wiki/Developer-Documentation

Once you have the Android development tools on your system, all you need to do to build is:

```Bash
./gradlew assembleDebug
adb install app/build/outputs/apk/debug/app-debug.apk
```
