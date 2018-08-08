<!-- Copyright (c) 2018 Gordon Williams. See the file LICENSE for copying permission. -->
Pixl.js Simple Logger
======================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Pixl.js+Simple+Logger. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Log,Logging,Count,Counting,
* USES: Pixl.js,Graphics,graph,BLE,Only BLE,Puck.js

[[http://youtu.be/mnNcMEe7IXw]]

This example shows you how to build a simple device to let you
count things happening each day, graph (and export) the result.
Scroll down to see how to attach external sensors or use
Puck.js to modify the counter remotely.

Maybe you're growing Tomatoes and you want to count how many you
get off your plant each day, or maybe you're counting the amount
of times your coworker does something annoying.

To use this, just get a [Pixl.js](/Pixl.js), connect with the Espruino
IDE, copy the code below into the right-hand side of it, and click 'Upload'.

When it's running, you just use the right-hand upper and lower buttons to
increment or decrement the counter. Each day within an hour of
midnight, the counter is zeroed and another bar is added to the graph.

To export your data, connect again with the Web IDE and type `toCSV()`
in the left-hand pane. A comma-separated list of dates and numbers will
be printed which you can then copy and paste into Excel or the spreadsheet
of your choice.

Data Storage
------------

This code only keeps the data in RAM, so it will be lost if power is removed.
You could easily use the [Storage Module](/Reference#Storage) to store the
data when it changes, however since the current time will be lost, this could
be of limited use.

Other Boards
------------

It's pretty straightforward to run this code on non-[Pixl.js](/Pixl.js) boards.
Just ensure that a variable called `g` contains an instance of a Graphics
class set up for your display, and that `BTN2` and `BTN3` point to pins
attached to two buttons.

```
var days = [0];
var today = days.length-1;
var currentDay = (new Date()).getDay();

function count(dir) {
  days[today] += dir;
  if (days[today]<0) days[today]=0;
  draw();
}

function draw() {
  g.clear();
  var mid = 22;
  g.setFontAlign(0,-1);
  g.setFontVector(30);
  g.drawString(days[today],mid,15);
  g.setFontBitmap();
  g.drawString("Count",mid,10);
  g.drawString((new Date()).toString().substr(0,10).trim(),mid,50);
  require("graph").drawBar(g, days, {
    x : mid*2, y : 5,
    miny: 0,
    axes : true,
    gridy : 5
  });
  g.flip();
}

setWatch(x=>count(1), BTN2, {repeat:true});
setWatch(x=>count(-1), BTN3, {repeat:true});

function checkDay() {
  var day = (new Date()).getDay();
  if (currentDay != day) {
    days.push(0);
    today = days.length-1;
    currentDay = day;
    draw();
  }
}
setInterval(checkDay, 1000*60*60);

function toCSV() {
  var start = Date.now() - 1000*60*60*24*(days.length-1);
  for (var i=0;i<days.length;i++) {
    var date = new Date(start + i*1000*60*60*24);
    var dateStr = date.toString().substr(0,10).trim();
    console.log(dateStr + "," + days[i]);
  }
}

draw();
```

Triggering the counter
----------------------

In the example above, the counter is only triggered by the buttons
on the side of Pixl.js. However all you need to do to use an external
input is to call `count(1)` when you want to increase the counter.

[[http://youtu.be/QxQe_WsB44w]]

### Wired Pyroelectric sensor

Just wire a [Pyroelectric motion sensor](/Pyroelectric) up to `Vin` and `GND`
on your Pixl.js, and connect the signal wire to any input - the example uses
`A0`.

Then all you need to trigger the counter is to add the line:

```
setWatch(x=>count(1), A0, {repeat:true, edge:"rising"});
```

### Wireless Puck.js sensor

For wireless connections, you need to run the command `Bluetooth.setConsole(true)`
on the Pixl.js so that you don't get Bluetooth connection information written
to the LCD.

Then, get a [Puck.js](/Puck.js) and connect to it with the Web IDE. The following
code will connect to the Pixl.js when a button is pressed (remember to change
  `Pixl.js 6155` to your Pixl's name).

```
function count() {
  LED3.set();
  NRF.requestDevice({ filters: [{ name: 'Pixl.js 6155' }] }).then(function(device) {
    return require("ble_simple_uart").write(device, "count(1)\n");
  }).then(function() {
    LED3.reset();
    print('Done!');
  }).catch(function() {
    LED3.reset();
    digitalPulse(LED1, 1, 1000);
    setTimeout(count, 1000);
  });
}

setWatch(count, BTN, {repeat:true,edge:"rising"});
```

**Note:** Espruino can currently only handle a single active connection,
at a time, so you can't call `count()` before the previous call to
`count()` has finished (the Blue LED has gone out). To fix this, just
keep track of when Puck.js is busy in a variable.

You can use external inputs in the same way we did for Pixl.js above, or you
can (for example) use the following code [from this example](/Puck.js+Door+Light)
to use the Magnetometer:

```
var zero = Puck.mag();
var doorOpen = false;
function onMag(p) {
  p.x -= zero.x;
  p.y -= zero.y;
  p.z -= zero.z;
  var s = Math.sqrt(p.x*p.x + p.y*p.y + p.z*p.z);
  var open = s<1000;
  if (open!=doorOpen) {
    doorOpen = open;
    if (!open) count();
  }
}
Puck.on('mag', onMag);
Puck.magOn();
```
