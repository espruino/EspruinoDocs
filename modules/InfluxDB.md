<!--- Copyright (c) 2017 Moncef AOUDIA, Gordon Williams. See the file LICENSE for copying permission. -->
Espruino InfluxDB module
=========================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/InfluxDB. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,API,InfluxDB,Database,Client,HTTP

Simple [InfluxDB] wrapper for [Espruino].

InfluxDB is an open-source time series database developed by InfluxData. It is written in Go and optimized for fast, high-availability storage and retrieval of time series data in fields such as operations monitoring, application metrics, Internet of Things sensor data, and real-time analytics. It also has support for processing data from Graphite.

Requirement
-----------
1- InfluxDB working server, see [installation] guide.

Usage
-----
1- Configuration
```
 // InfluxDB configuration
 var influxDBParams = {
    influxDBHost: "localhost",          // Host IP address or URL without "http://".
    influxPort: 8086,                   // InfluxDB server port.
    influxDBName: "testDataBase",       // Database name (measurement).
    influxUserName: "toto",             // User name account (must have write permission).
    influxPassword: "root",             // User password.
    influxAgentName: "ESPRUINO"         // Device name in HTTP headers.
   };

// Import and setup InfluxDB module
var influxDB = require("InfluxDB").setup(influxDBParams);
```

2- [Write] (insert) data to InfluxDB database:
```
//     Measurement name |tag key = name| field key = value| timestamp (optional)
var data = "temperature ,device=ESP0001, value=20.000000000 14340555620000000\n";
influxDB.write(data);
```

3- [Read] (query) data from InfluxDB database:
```
var query = "q=SELECT \"value\" FROM \"measurement\" WHERE \"device\"='ESP0001'\n";
var data = influxDB.query(query);
console.log(data);
```
4- Send query to InfluxDB server (create new database):
```
var query = "q=CREATE DATABASE newDataBaseName\n";
influxDB.query(query);
console.log("Database created");
```

Example
-------
1- Setup InfluxDB on Espruino.

2- Create a new InfluxDB database (from Espruino).

3- Use MQ135 gas sensor to write (multiple points writing) data to InfluxDB.

4- Read data from InfluxDB.


```js
  // Import and connect MQ135 module
  var mq135 = require("MQ135").connect(A0);

  // InfluxDB configuration
  var influxDBParams = {
      influxDBHost: "localhost",
      influxPort: 8086,
      influxDBName: "testDataBase",
      influxUserName: "toto",
      influxPassword: "root",
      influxAgentName: "ESPRUINO"
  };

  // Import and setup InfluxDB module
  var influxDB = require("InfluxDB").setup(influxDBParams);

  // Create new influxDb database called "smoke" (if it's not already exists)
  var queryNewDB = "q=CREATE DATABASE smoke\n";
  try {
      influxDB.query(queryNewDB);
      console.log("Database was created");
  } catch (e) {
      console.log("Failed, unable to create the database");
  }

  // Write data to InfluxDB database every 10 seconds.
  var writeInterval = setInterval(function() {
      var data = "";
      try {
          // Multiple points writing (important: separator "\n").
          for (var i = 0; i < 3; i++) {
              var smoke = mq135.getPPM();
              data += "smoke, device=ESP0001, value=" + smoke + "\n";
          }

          influxDB.write(data);
          return true;
      } catch (e) {
          console.log(e);
      }
  }, 10000);

  // Get data to InfluxDB database every hour.
  var readInterval = setInterval(function() {
      try {
          var query = "q=SELECT \"value\" FROM \"measurement\"\n";
          var data = influxDB.query(query);
          console.log(data);
      } catch (e) {
          console.log(e);
      }
  }, 3600000);
```




[Write]:<https://docs.influxdata.com/influxdb/v1.3/guides/writing_data/>

[Read]:<https://docs.influxdata.com/influxdb/v1.3/guides/querying_data/>

[InfluxDB]:<https://www.influxdata.com/>

[Espruino]:<https://www.espruino.com/>

[installation]:<https://docs.influxdata.com/influxdb/v1.3/introduction/installation/>
