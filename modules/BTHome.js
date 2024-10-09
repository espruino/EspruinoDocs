/* Copyright (c) 2023 Gordon Williams. See the file LICENSE for copying permission. */
/*
Module for creating BTHome.io compatible Advertisements

https://www.espruino.com/BTHome
*/

exports.packetId = 0;

exports.getAdvertisement = function(devices) {
  const b16 = (id,v)=>[id,v&255, (v>>8)&255];
  const b24 = (id,v)=>[id,v&255, (v>>8)&255, (v>>16)&255];
  const b32 = (id,v)=>[id,v&255, (v>>8)&255, (v>>16)&255, (v>>24)&255];

  const DEV = {
    battery : e => [ 1, E.clip(Math.round(e.v),0,100)], // 0..100, int
    temperature : e => b16(2, Math.round(e.v*100)),     // degrees C, floating point
    count : e => [ 0x0F, e.v],                          // 0..255, int
    count16 : e => b16(0x3D, e.v),                      // 0..65535, int
    count32 : e => b32(0x3E, e.v),                      // 0..0xFFFFFFFF, int
    current : e => b16(0x3D, Math.round(e.v*1000)),     // amps, floating point
    duration : e => b16(0x42, Math.round(e.v*1000)),    // seconds, floating point
    energy : e => b32(0x4D, Math.round(e.v*1000)),      // kWh, floating point
    gas : e => b32(0x4C, e.v),                          // gas (m3), int (32 bit version)
    humidity : e => [0x2E, Math.round(e.v)],            // humidity %, int
    humidity16 : e => b16(3, Math.round(e.v*100)),      // humidity %, floating point
    power : e => b24(0x0B, Math.round(e.v*100)),        // power (W), floating point
    pressure : e => b24(4, Math.round(e.v*100)),        // pressure (hPa), floating point
    voltage : e => b16(0x0C, Math.round(e.v*1000)),     // voltage (V), floating point
    co2 : e => b16(0x12, Math.round(e.v)),              // co2 (ppm), int, factor=1
    tvoc : e => b16(0x13, Math.round(e.v)),             // TVOC (ug/m3), int, factor=1
    text : e => { let t = ""+e.v; return [ 0x53, t.length ].concat(t.split("").map(c=>c.charCodeAt())); }, // text string
    button_event : e => {
      const events=["none","press","double_press","triple_press","long_press","long_double_press","long_triple_press"];
      if (!events.includes(e.v)) throw new Error(`Unknown event type ${E.toJS(e.v)}`);
      return [0x3A, events.indexOf(e.v)];
    },
    dimmer_event : e => {
      var n = 0;
      if (e.v<0) return [0x3C, 1, -e.v]; // left
      if (e.v>0) return [0x3C, 2, e.v]; // right
      return [0x3C, 0, 0];
    }
  };
  const BOOL = {
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
  adv = adv.concat.apply(adv,
    devices.map(dev => {
      if (dev.type in DEV) return DEV[dev.type](dev);
      if (dev.type in BOOL) return [BOOL[dev.type], dev.v?1:0];
      throw new Error(`Unknown device type ${E.toJS(dev.type)}`);
    }));
  return {
    0xFCD2 : adv
  };
};
