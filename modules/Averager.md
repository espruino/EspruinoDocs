<!--- Copyright (c) 2020 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Averager Library
==============

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Averager. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,Modules,Data,Storage,Average,Graph

This library allows you to store data that changes over time in a space-efficient
way, and retrieve it later. It's perfect for creating simple graphs of
values like temperature.

There are two main classes:

### Series

Instantiate this with a size (the number of buckets). You then call `Series.add(value, bucket)`
and the value supplied is kept as an average in that bucket.

The Averager assumes that you move linearly through bucket numbers when adding
values. When you move from a high bucket number to a lower bucket
number (eg if moving from the 31st of a month to the 1st of the next month) it
saves the current set of buckets, and also adds them to the average.

Averager maintains three lists. Assuming the 'day of month example':

* `buckets` - the current set of values (eg. data from this month)
* `last` - the last set of values (eg. complete data from last month)
* `avr` - an average of all values (eg. average for every day of every month)

### Averager

This stores several `Series` instances for common time-based recording:

* `hours` - A bucket every 15 minutes each day
* `days` - A bucket for each day of the month
* `months` - A bucket for each month of the year

Options
-------

When you instantiate `Series` or `Averager` you have an object of options for how
data is stored. This contains:

* `format` : optional type of array (default `Int16Array`)
* `scale` : optional scale to store data in the correct range for the array (default 1)
* `offset` : optional offset to store data correct range for the array (default 0)

For example:

* if you're storing temperature you might want to store it high res, so you could use the default `Int16Array` which stores values from -32768 to 32767, and then scale the temperature by 500, giving you roughly `-65` to `+65` range at 0.002 degree accuracy: `{scale:500}`
* or you might want to save space and store low resolution, so you could use `Int8Array` which stores values from -128 to 127, and then scale the temperature by 2, giving you roughly the same `-64` to `+64` range but at 0.5 degree accuracy, using half the RAM: `{format:Int8Array, scale:2}`


Usage
-----

```
var Averager = require("Averager").Averager;
var temperature = new Averager({scale:100});

setInterval(function() {
  // every 10 seconds add new temperature data
  temperature.add(E.getTemperature());
}, 10000);
```

You can use this with the [graph](/graph) library, so to plot the data so far today
you could do:

```
require("graph").drawLine(g, temperature.series.hours.getCurrent(), {
  axes : true,
  gridy : 5,
  gridx : 24,
  xlabel : x=>(x>>2)+":00"
});
```

Or for a bar graph of the average each month, you could do:

```
require("graph").drawBar(g, temperature.series.months.getAvr(), {
  axes : true,
  gridy : 5,
  gridx : 2,
  xlabel : x=>"Jan,Mar,May,Jul,Oct,Nov".split(",")[x/2]
});
```

You can also call `temperature.print()` when accessing Espruino remotely
in order to get a JSON-formatted version of the data, for instance:

```
{
  "hours": {
    "current": [ 0.452, 0.192, 0.488, 0.576, 0.044,  ... 0, 0, 0, 0, 0 ],
    "avr": [ 0.196, 0.22, 0.188, 0.176, 0.216,  ... 0.188, 0.196, 0.16, 0.188, 0.404 ],
    "last": [ 0.092, 0.64, 0.388, 0.316, 0.604,  ... 0.36, 0.4, 0.864, 0.676, 0.46 ]
   },
  "days": {
    "current": [ 0.536, 0.516, 0.444, 0.5, 0.488,  ... 0, 0, 0, 0, 0 ],
    "avr": [ 0.44, 0.448, 0.448, 0.432, 0.46,  ... 0.5, 0.484, 0.484, 0.496, 0.536 ],
    "last": [ 0.544, 0.448, 0.532, 0.544, 0.588,  ... 0.472, 0.512, 0.488, 0.508, 0.464 ]
   },
  months: {
    "current": [ 0.508, 0.5, 0.504, 0.488, 0.5, 0.508, 0.508, 0.5, 0.484, 0, 0, 0 ],
    "avr": [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.492 ],
    "last": [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.492 ]
   }
 }
```
