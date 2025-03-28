exports = {};


exports.log = txt => console.log("LEGO>",txt);
exports.WEDO2_SERVICE = '00001523-1212-efde-1523-785feabcd123';

/** Class for controlling WeDo devices */
class WeDo {
  // Fires events:

/** emitted when the button is pressed or released */
//wedo.on("button", function(pressed) { ... });

/** emitted when a port is plugged in or not (device = unknown/motor/distance/tilt) */
//wedo.on("port", function(portNo, device) { ... });

/** emitted when data comes from a sensor */
//wedo.on("sensor", function(portNo, value) { ... });

  /** Given a connected Bluetooth device, attach all services */
  constructor(d) {
    this.device = d;
    this.service={};
    this.chars={};
    this.button=0;
  }

  attach() {
    exports.log("Connected");
    return this.device.gatt.getPrimaryService("00001523-1212-efde-1523-785feabcd123").then((s)=>{
      exports.log("Got LED service");
      this.service.led = s;
      return this.service.led.getCharacteristic("00001526-1212-efde-1523-785feabcd123");
    }).then((c)=>{
      this.chars.button = c;
      c.on('characteristicvaluechanged', (event)=>{
        var state = event.target.value.getUint8(0);
        if (state != this.button) {
          this.button = state;
          this.emit("button", state);
        }
      });
      return this.service.led.getCharacteristic("00001527-1212-efde-1523-785feabcd123");
    }).then((c)=>{
      this.chars.portType = c;
      c.on('characteristicvaluechanged', (event)=>{
        var v = event.target.value.buffer, typ = "unknown";
        //exports.log("Port Type: "+JSON.stringify(v));
        if (v == [v[0],0]) typ = "empty";
        if (v == [v[0],1,0,1,1,0,0,0,1,0,0,0]) typ = "motor";
        if (v == [v[0],1,1,35,0,0,0,16,0,0,0,16]) typ = "distance";
        if (v == [v[0],1,1,34,0,0,0,16,0,0,0,16]) {
          typ = "tilt";
          this.chars.inCmd.writeValue([1,2,v[0]/*ch*/,0x22,1,0,0,0,2,1]);
        }
        this.emit("port", v[0], typ);
      });
      return this.device.gatt.getPrimaryService("00004f0e-1212-efde-1523-785feabcd123");
    }).then((s)=>{
      exports.log("Got port service");
      this.service.port = s;
      return this.service.port.getCharacteristic("00001565-1212-efde-1523-785feabcd123");
    }).then((c)=>{
      this.chars.outCmd = c;
      return this.service.port.getCharacteristic("00001563-1212-efde-1523-785feabcd123");
    }).then((c)=>{
      this.chars.inCmd = c;
      return this.service.port.getCharacteristic("00001560-1212-efde-1523-785feabcd123");
    }).then((c)=>{
      this.chars.inVal = c;
      c.on('characteristicvaluechanged', (event)=>{
        var dv = event.target.value;
        //exports.log("Value: "+JSON.stringify(event.target.value.buffer));
        if (dv.getUint8(0)==4) {
          var port = dv.getUint8(1); // 1/2
          this.emit("sensor", dv.getUint8(1), dv.getFloat32(2,1));
        }
      });
      exports.log("Start Nofitications");
      return this.chars.inVal.startNotifications();
    }).then(() => this.chars.button.startNotifications())
    .then(() => this.chars.portType.startNotifications())
    .then(()=>{
      exports.log("Ready!");
      return this;
    });
  }

  /** Disconnect from the device */
  disconnect() {
    this.device.gatt.disconnect();
    this.device = undefined;
  }

    /** Set the LED to a specific color:

  off:0
  pink:1,
  purple:2,
  blue:3,
  cyan:4,
  light green:5,
  green:6,
  yellow:7,
  orange:8,
  red:9,
  light blue:10
  */
  setLED(col) {
    return this.chars.outCmd.writeValue([0x06,0x04,0x01,col]);
  }

  /** Set the LED to an RGB color - r/g/b all 0..255 */
  setRGB(r,g,b) { // 0..255
    this.chars.outCmd.writeValue([6,4,3,r,g,b]);
  }

  /** Set the speed of Motor 1 from -100 ... 100 */
  setMotor1(speed) {
    return this.chars.outCmd.writeValue([1/*port*/,1,1,E.clip(speed,-100,100)/*speed 0-100*/]);
  }

  /** Set the speed of Motor 2 from -100 ... 100 */
  setMotor2(speed) {
    return this.chars.outCmd.writeValue([2/*port*/,1,1,E.clip(speed,-100,100)/*speed 0-100*/]);
  }

  /** Make a beep - doesn't work right now */
 /* beep() {
     return this.chars.outCmd.writeValue([5,2,4,6,1,0xf4,1]);
  }*/
}


/** Find a WeDo device and connect - returns a WeDo device via a promise  */
exports.connect = function() {
  var device; // search for LED button service
  return NRF.requestDevice({ filters: [{ services: [exports.WEDO2_SERVICE] }] }).then(function(d) {
    device = d;
    return device.gatt.connect();
  }).then(() => {
    var wedo = new WeDo(device);
    return wedo.attach();
  });
};

/** Given a connected Bluetooth device, attach all services - returns a WeDo device via a promise */
exports.attachDevice = function(device) {
  var wedo = new WeDo(device);
  return wedo.attach();
};




var wedo;
exports.connect().then(w => {
  wedo=w;
  wedo.on("port", (port,dev) => print("Port",port,dev));
  wedo.on("sensor", (port,dev) => print("Sensor",port,dev));
  wedo.on("button", (b) => {
    print("Button",b);
    wedo.setMotor1(100); // set motor 1 max forward
    setTimeout(function() {
      wedo.setMotor1(0); // set motor 1 stopped
    }, 1000);
  });
});





/*
Service 0x1800 1=>7
  Characteristic 0x2a00 3 (desc=2) {broadcast:false,read:true,writeWithoutResponse:false,write:false,notify:false,indicate:false,authenticatedSignedWrites:false}
  Characteristic 0x2a01 5 (desc=4) {broadcast:false,read:true,writeWithoutResponse:false,write:false,notify:false,indicate:false,authenticatedSignedWrites:false}
  Characteristic 0x2ac9 7 (desc=6) {broadcast:false,read:true,writeWithoutResponse:false,write:false,notify:false,indicate:false,authenticatedSignedWrites:false}
Service 0x1801 8=>8
  No Characteristics
Service 00001523-1212-efde-1523-785feabcd123 9=>44
  Characteristic 00001524-1212-efde-1523-785feabcd123 11 (desc=10) {broadcast:false,read:true,writeWithoutResponse:false,write:true,notify:false,indicate:false,authenticatedSignedWrites:false}
  Characteristic 00001526-1212-efde-1523-785feabcd123 14 (desc=13) {broadcast:false,read:true,writeWithoutResponse:false,write:false,notify:true,indicate:false,authenticatedSignedWrites:false}
  Characteristic 00001527-1212-efde-1523-785feabcd123 18 (desc=17) {broadcast:false,read:false,writeWithoutResponse:false,write:false,notify:true,indicate:false,authenticatedSignedWrites:false}
  Characteristic 00001528-1212-efde-1523-785feabcd123 22 (desc=21) {broadcast:false,read:true,writeWithoutResponse:false,write:false,notify:true,indicate:false,authenticatedSignedWrites:false}
  Characteristic 00001529-1212-efde-1523-785feabcd123 26 (desc=25) {broadcast:false,read:true,writeWithoutResponse:false,write:false,notify:true,indicate:false,authenticatedSignedWrites:false}
  Characteristic 0000152a-1212-efde-1523-785feabcd123 30 (desc=29) {broadcast:false,read:true,writeWithoutResponse:false,write:false,notify:true,indicate:false,authenticatedSignedWrites:false}
  Characteristic 0000152b-1212-efde-1523-785feabcd123 34 (desc=33) {broadcast:false,read:false,writeWithoutResponse:false,write:true,notify:false,indicate:false,authenticatedSignedWrites:false}
  Characteristic 0000152c-1212-efde-1523-785feabcd123 37 (desc=36) {broadcast:false,read:true,writeWithoutResponse:false,write:true,notify:false,indicate:false,authenticatedSignedWrites:false}
  Characteristic 0000152d-1212-efde-1523-785feabcd123 40 (desc=39) {broadcast:false,read:true,writeWithoutResponse:false,write:false,notify:false,indicate:false,authenticatedSignedWrites:false}
  Characteristic 0000152e-1212-efde-1523-785feabcd123 43 (desc=42) {broadcast:false,read:false,writeWithoutResponse:false,write:true,notify:false,indicate:false,authenticatedSignedWrites:false}
Service 00004f0e-1212-efde-1523-785feabcd123 45=>59
  Characteristic 00001560-1212-efde-1523-785feabcd123 47 (desc=46) {broadcast:false,read:true,writeWithoutResponse:false,write:false,notify:true,indicate:false,authenticatedSignedWrites:false}
  Characteristic 00001561-1212-efde-1523-785feabcd123 51 (desc=50) {broadcast:false,read:false,writeWithoutResponse:false,write:false,notify:true,indicate:false,authenticatedSignedWrites:false}
  Characteristic 00001563-1212-efde-1523-785feabcd123 55 (desc=54) {broadcast:false,read:false,writeWithoutResponse:true,write:true,notify:false,indicate:false,authenticatedSignedWrites:false}
  Characteristic 00001565-1212-efde-1523-785feabcd123 58 (desc=57) {broadcast:false,read:false,writeWithoutResponse:true,write:true,notify:false,indicate:false,authenticatedSignedWrites:false}
Service 0x180a 60=>66
  Characteristic 0x2a26 62 (desc=61) {broadcast:false,read:true,writeWithoutResponse:false,write:false,notify:false,indicate:false,authenticatedSignedWrites:false}
  Characteristic 0x2a28 64 (desc=63) {broadcast:false,read:true,writeWithoutResponse:false,write:false,notify:false,indicate:false,authenticatedSignedWrites:false}
  Characteristic 0x2a29 66 (desc=65) {broadcast:false,read:true,writeWithoutResponse:false,write:false,notify:false,indicate:false,authenticatedSignedWrites:false}
Service 0x180f 67=>70
  Characteristic 0x2a19 69 (desc=68) {broadcast:false,read:true,writeWithoutResponse:false,write:false,notify:true,indicate:false,authenticatedSignedWrites:false}


Name Char 0x000e read+write       00001524-1212-efde-1523-785feabcd123
Button Char 0x0011 notify+read    00001526-1212-efde-1523-785feabcd123
Port Type Char 0x0015 notify      00001527-1212-efde-1523-785feabcd123
Low Voltage alert 0x0019 notify+read
High Current alert 0x001d notify+read
Low Signal alert 0x0021 notify+read
Turn off device 0x0025 write
Vcc port control 0x0028 read+write
Battery type Indicator 0x002b read
Disconnect Char 0x002e write

https://ofalcao.pt/blog/series/wedo-2-0-reverse-engineering
https://github.com/pybricks/technical-info/blob/master/assigned-numbers.md
https://github.com/cpseager/WeDo2-BLE-Protocol/blob/master/wedo2_summary.txt
https://github.com/scratchfoundation/scratch-flash/issues/1040
*/
// set tilt sensor mode
// chars.inCmd.writeValue([1,2,1/*ch*/,0x22,1,0,0,0,2,1]);
