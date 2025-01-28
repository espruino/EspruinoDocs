/* Copyright (c) 2023 Gordon Williams. See the file LICENSE for copying permission. */
/*
Module for creating BTHome.io compatible Advertisements

https://www.espruino.com/BTHome
*/

exports.packetId = 0;

exports.getAdvertisement = function(devices) {
  const b16 = (id,e,m)=>{let v=Math.round(e.v*(m||1));return [id,v&255, (v>>8)&255];};
  const b24 = (id,e,m)=>{let v=Math.round(e.v*(m||1));return [id,v&255, (v>>8)&255, (v>>16)&255];};
  const b32 = (id,e,m)=>{let v=Math.round(e.v*(m||1));return [id,v&255, (v>>8)&255, (v>>16)&255, (v>>24)&255];};
  const DEV = {
    battery : e => [ 1, E.clip(Math.round(e.v),0,100)], // 0..100, int
    temperature : e => b16(2, e, 100),     // degrees C, floating point
    count : e => [ 0x09, e.v],             // 0..255, int
    count16 : e => b16(0x3D, e, 1),        // 0..65535, int
    count32 : e => b32(0x3E, e, 1),        // 0..0xFFFFFFFF, int
    current : e => b16(0x5D, e, 1000),     // amps, floating point
    duration : e => b16(0x42, e, 1000),    // seconds, floating point
    energy : e => b32(0x4D, e, 1000),      // kWh, floating point
    gas : e => b32(0x4C, e, 1),            // gas (m3), int (32 bit version)
    humidity : e => [0x2E, e, 1],          // humidity %, int
    humidity16 : e => b16(3, e, 100),      // humidity %, floating point
    moisture : e => b16(0x14, e, 100),     // moisture %, floating point
    power : e => b24(0x0B, e, 100),        // power (W), floating point
    pressure : e => b24(4, e, 100),        // pressure (hPa), floating point
    rotation : e => b16(0x3F, e, 10),      // rotation in degrees, floating point (0.1 degree)
    volume : e => b16(0x4E, e, 10),        // volume (L), floating point (0 .. 6553.5)
    voltage : e => b16(0x0C, e, 1000),     // voltage (V), floating point
    co2 : e => b16(0x12, e, 1),            // co2 (ppm), int, factor=1
    tvoc : e => b16(0x13, e, 1),           // TVOC (ug/m3), int, factor=1
    text : e => { let t = ""+e.v; return [ 0x53, t.length ].concat(t.split("").map(c=>c.charCodeAt())); }, // text string
    button_event : e => {
      const events=["none","press","double_press","triple_press","long_press","long_double_press","long_triple_press"];
      if (!events.includes(e, 1)) throw new Error(`Unknown event type ${E.toJS(e, 1)}`);
      return [0x3A, events.indexOf(e, 1)];
    },
    dimmer_event : e => {
      var n = 0;
      if (e.v<0) return [0x3C, 1, -e.v]; // left
      if (e.v>0) return [0x3C, 2, e.v]; // right
      return [0x3C, 0, 0];
    }
  };
  const BOOL = {
    generic : 0x0F,
    battery_low : 0x15,
    battery_charge : 0x16,
    cold : 0x18,
    connected : 0x19,
    door : 0x1A,
    garage_door : 0x1B,
    boolean : 0x0F,
    heat : 0x1D,
    light : 0x1E,
    locked : 0x1F,
    motion : 0x21,
    moving : 0x22,
    occupancy : 0x23,
    opening : 0x11,
    power_on : 0x10,
    presence : 0x25,
    problem : 0x26,
    tamper : 0x2B,
    vibration : 0x2C
  };

  exports.packetId = (exports.packetId+1)&255;
  let adv = [
    /* BTHome Device Information
    bit 0: "Encryption flag"
    bit 1: "Reserved for future use"
    bit 2: Trigger based device flag (0 = we advertise all the time)
    bit 1: "Reserved for future use"
    bit 5-7: "BTHome Version" = 2 */
    0x40,
    /* Packet ID - by only changing this */
    0, exports.packetId,
  ];
  return {
    0xFCD2 : adv.concat.apply(adv, devices.map(dev => {
      if (dev.type in DEV) return DEV[dev.type](dev);
      if (dev.type in BOOL) return [BOOL[dev.type], dev.v?1:0];
      if (dev.type == "raw") return dev.v;
      throw new Error(`Unknown device type ${E.toJS(dev.type)}`);
    }).sort((a,b) => a[0]-b[0]))
  };
};
