<!--- Copyright (c) 2019 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
DIY Smart Meter
===============

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Smart+Meter. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Home Automation,Home,Smart Meter,Electricity Meter
* USES: Puck.js,LDR

[[http://youtu.be/_SsZ3zILFn8]]

Pretty much all Digital Electricity meters (smart or not) have a light that blinks every time a certain amount of energy is used - often once for every Watt-hour (Usually labelled as `1000 imp/kWh`).

You can easily detect this with a simple [Light Dependent Resistor](/LDR) and use it to measure and record your energy usage over time.


You'll Need
-----------

* A [Puck.js](/Puck.js)
* A standard [Light Dependent Resistor](/LDR) (eg. GL5537)
* Some double sided tape (VHB tape works great)


Wiring
-------

Just solder the LDR between pins D1 and D2, so that it can go through a hole in the back of the Puck.js case.

See the video for more information.


Simple Pulse Counter
--------------------

This is the code used in the video - it measures the number of pulses and reports that over [Bluetooth LE Advertising](/BLE+Advertising).

Simply copy & paste this to the right-hand side of the Web IDE and click the 'Upload' button.


```JavaScript
var counter = 0;

// Update BLE advertising
function update() {
  var a = new ArrayBuffer(4);
  var d = new DataView(a);
  d.setUint32(0, counter, false/*big endian*/);
  NRF.setAdvertising({},{
    name: "Puck.js \xE2\x9A\xA1",
    manufacturer:0x0590,
    manufacturerData:a,
    interval: 600 // default is 375 - save a bit of power
  });
}

// Set up pin states
D1.write(0);
pinMode(D2,"input_pullup");
// Watch for pin changes
setWatch(function(e) {
 counter++;
 update();
 digitalPulse(LED1,1,1); // show activity
}, D2, { repeat:true, edge:"falling" });
```


Pulse Counter and usage history
-------------------------------

However, you can easily go a bit further and can store historical energy usage data on the Puck.js itself.

This code uses exactly the same detection code as before,
but adds a class called `Counter` that stores historical
energy usage data.

Once connected to a Web Bluetooth website, the data can then be read and displayed on a graph.

To use this:

* Go into the Web IDE settings, `Communications` and ensure that `Set Current Time` is ticked.
* Copy & paste the code below to the right-hand side of the Web IDE
* Click the 'Upload' button
* Type `save()` on the left-hand side of the IDE. You're now ready to go.

```JavaScript
/** Create a new counter. Contains the following:
{
  totals : {
    count // Overall count
    year  // each month of the year (0..11)
    week  // each day of the week (0..6)
    month // each day of the month (0..31)
    day : // each hour (0..23)
  },
  history // last 96 hours, newest last (0..95)
}
*/
function Counter() {
  this.clear();
};
/// Clear the counters back to zero
Counter.prototype.clear = function() {
  this.totals = {
    count : 0,                // Overall count
    year : new Uint32Array(12), // each month of the year (0..11)
    week : new Uint32Array(7), // each day of the week (0..6)
    month : new Uint32Array(31), // each day of the month (0..31)
    day : new Uint32Array(24) // each hour (0..23)
  };
  this.historyPeriod = 60*60*1000; // 1 hour in milliseconds
  this.history = new Uint32Array(96); // last 96 hours
  this.historyTime = 0;
  this.lastUpdate = new Date.now();
};
///
Counter.prototype.inc = function(n) {
  if (n===undefined) n=1;
  var d = new Date();
  var t = this.totals;
  // Totals by time period
  t.count+=n;  
  t.year[d.getMonth()]+=n;
  t.week[d.getDay()]+=n;
  t.month[d.getDate()-1]+=n;
  t.day[d.getHours()]+=n;
  // Rolling history
  this.historyTime += d.getTime()-this.lastUpdate;
  this.lastUpdate = d.getTime();
  var steps = Math.floor(this.historyTime / this.historyPeriod);
  if (steps>=0) {
    this.historyTime -= steps*this.historyPeriod;
    var h = this.history;
    h.set(new Uint32Array(h.buffer, 4*steps), 0);
    h.fill(0, h.length-steps);
    h[h.length-1]+=n;
  }
};
var c = new Counter();

// Update BLE advertising
function update() {
  var a = new ArrayBuffer(4);
  var d = new DataView(a);
  d.setUint32(0, c.totals.count, false/*big endian*/);
  NRF.setAdvertising({},{
    name: "Puck.js \xE2\x9A\xA1",
    manufacturer:0x0590,
    manufacturerData:a,
    interval: 600 // default is 375 - save a bit of power
  });
}

function onInit() {
  clearWatch();
  D1.write(0);
  pinMode(D2,"input_pullup");
  setWatch(function(e) {
    c.inc(1);
    update();
    digitalPulse(LED1,1,1); // show activity
  }, D2, { repeat:true, edge:"falling" });
  update();
}
```

Now you have the Puck.js set up, you can use the Web Bluetooth website below (or can modify it for your needs).

To try it, just click the `Try Me!` button in the bottom right of the code sample below. To make your own version, follow the instructions for creating a GitHub page at the top of the [Web Bluetooth tutorial](/Web+Bluetooth)

```HTML_demo_link
<html>
 <head>
  <title>Dashboard</title>
  <meta name="viewport" content="width=620, initial-scale=1">
 </head>
 <body style="width:620px;height:800px">
  <link href="https://espruino.github.io/TinyDash/tinydash.css" rel="stylesheet">
  <script src="https://espruino.github.io/TinyDash/tinydash.js"></script>
  <script src="https://www.puck-js.com/puck.js"></script>  
  <script>
  function connectDevice() {    
    // connect, issue Ctrl-C to clear out any data that might have been left in REPL
    Puck.write("\x03", function() {
      setTimeout(function() {
        // After a short delay ask for the battery percentage
        Puck.eval("{bat:E.getBattery()}", function(d,err) {
          if (!d) {
            alert("Web Bluetooth connection failed!\n"+(err||""));
            return;
          }
          // remove the 'connect' window
          elements.modal.remove();
          // update battery meter
          elements.bat.setValue(d.bat);
          // Get all our data - it can take a while
          // so we do it in stages
          Puck.eval("c.totals", function(d,err) {
            elements.total.setValue(d.count);
            elements.year.setData(d.year);
            elements.week.setData(d.week);
            elements.month.setData(d.month);
            elements.day.setData(d.day);
            // Get the 96 hour history last
            Puck.eval("c.history", function(d) {
              elements.history.setData(d);
            });
          });
        }, 500);
      });
    });
  }
  // Set up the controls we see on the screen    
  var elements = {
    heading : TD.label({x:10,y:10,width:190,height:50,label:"Electricity meter"}),
    total : TD.value({x:10,y:70,width:190,height:60,label:"Total Usage",value:0}),
    bat : TD.gauge({x:10,y:140,width:190,height:220,label:"Battery Level",value:0,min:0,max:100}),
    history : TD.graph({x:210,y:10+160*0,width:400,height:150,label:"96 hr history"}),
    day : TD.graph({x:210,y:10+160*1,width:400,height:150,label:"Day"}),
    month : TD.graph({x:210,y:10+160*2,width:400,height:150,label:"Month"}),
    week : TD.graph({x:210,y:10+160*3,width:400,height:150,label:"Week"}),
    year : TD.graph({x:210,y:10+160*4,width:400,height:150,label:"Year"}),
    modal: TD.modal({x:10,y:10,width:600,height:790,label:"Click to connect",onchange:connectDevice})
  }
  for (var i in elements)
    document.body.appendChild(elements[i]);
  </script>
 </body>
</html>
```

Notes
-----

* While this example doesn't do it, your current power consumption can be calculated by measuring the time between pulses - it'd be a good addition to the advertising data.
* Web Bluetooth websites can't read advertising data (yet) so cannot display any electricity data without connecting. However another Espruino device like [Pixl.js](/Pixl.js) could do that easily.
* The resistance of the LDR varies with the light on it. On a standard LDR like a GL5537 complete darkness has a resistance of around 2 M Ohms, so the power usage from the coin cell (against the 40k internal pullup) is very low. However the more ambient light that gets into the sensor the lower the resistance and so the lower the battery life - so it's worth trying to fit the sensor as snugly as possible.
