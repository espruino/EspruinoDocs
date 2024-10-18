/*<!-- Copyright (c) 2024 Gordon Williams. See the file LICENSE for copying permission. -->
BLE Characteristic Scan
========================

* KEYWORDS: BLE,BLuetooth,Characteristic,Service,Scan,Dump
* USES: BLE,Only BLE

Sometimes you might want to see what services and characeristics a device provides.

You can do this using the `NRF Connect` app for Android/iOS but sometimes you might want to do it on Espruino too.

Run this code, changing the `id` at the top to match the device you're interested in (which you can get from `NRF.findDevices(print)`) and you'll see something like:

```
Connecting
Connected
Service 0x1800 (hdl=1=>9)
  Characteristic 0x2a00 (hdl=3,desc=2) {broadcast:false,read:true,writeWithoutResponse:false,write:false,notify:false,indicate:false,authenticatedSignedWrites:false}
  Characteristic 0x2a01 (hdl=5,desc=4) {broadcast:false,read:true,writeWithoutResponse:false,write:false,notify:false,indicate:false,authenticatedSignedWrites:false}
  Characteristic 0x2a04 (hdl=7,desc=6) {broadcast:false,read:true,writeWithoutResponse:false,write:false,notify:false,indicate:false,authenticatedSignedWrites:false}
  Characteristic 0x2aa6 (hdl=9,desc=8) {broadcast:false,read:true,writeWithoutResponse:false,write:false,notify:false,indicate:false,authenticatedSignedWrites:false}
Service 0x1801 (hdl=10=>10)
  No Characteristics
Service 6e400001-b5a3-f393-e0a9-e50e24dcca9e (hdl=11=>65535)
  Characteristic 6e400002-b5a3-f393-e0a9-e50e24dcca9e (hdl=13,desc=12) {broadcast:false,read:false,writeWithoutResponse:true,write:true,notify:false,indicate:false,authenticatedSignedWrites:false}
  Characteristic 6e400003-b5a3-f393-e0a9-e50e24dcca9e (hdl=15,desc=14) {broadcast:false,read:false,writeWithoutResponse:false,write:false,notify:true,indicate:false,authenticatedSignedWrites:false}
Disconnected
```

In this case we're scanning an Espruino device, so we see the `6e400001-b5a3-f393-e0a9-e50e24dcca9e` Nordic UART service and RX/TX characteristics in it.
*/

NRF.requestDevice({ filters: [{ id: "c9:7b:07:d0:9f:0e random" }] }).then(function(d) {
  device = d;
  console.log("Connecting");
  return device.gatt.connect();
}).then(function(g) {
  gatt = g;
  console.log("Connected");
  return gatt.getPrimaryServices();
}).then(function getServices(services) {
  if (services.length==0) return;
  let service = services.shift();
  print(`Service ${service.uuid} (hdl=${service.start_handle}=>${service.end_handle})`);
  return service.getCharacteristics().then(characteristics => {
    if (characteristics===undefined)
      print("  No Characteristics");
    else characteristics.forEach(char => {
      print(`  Characteristic ${char.uuid} (hdl=${char.handle_value},desc=${char.handle_decl}) ${E.toJS(char.properties)}`);
    });
    return Promise.resolve(services).then(getServices);
  });
}).then(function() {
  gatt.disconnect();
  console.log("Disconnected");
});