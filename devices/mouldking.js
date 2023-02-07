/* Copyright (C) 2023 Gordon Williams. See the file LICENSE for copying permission. */
/*
Support for Mould King / Bandra / AKOGD / MayD / etc Lego Power Functions Clones
*/

exports.DEVICE_ADDRESS = [193, 194, 195, 196, 197]; // from BluetoothDeviceBase
/*
function whitening_init(key) {
  var whitening = new Uint32Array(7);
  whitening[0] = 1;
  for (var i=0;i<6;i++) {
    whitening[i+1] = (key >> (5-i)) & 1;
  }
  return whitening;
}

function whitening_encode(data, whitening) {
  print(data.length);
  var r0,r1,r2,r3,r4,r5,r6;
  r0 = whitening[0];
  r1 = whitening[1];
  r2 = whitening[2];
  r3 = whitening[3];
  r4 = whitening[4];
  r5 = whitening[5];
  r6 = whitening[6];
  for (var j=0;j<data.length;j++) {
    var result = 0;
    for (var i=0;i<8;i++) {
      var t6 = r6;
      r6 = r5;
      r5 = r4;
      r4 = r3 ^ t6;
      r3 = r2;
      r2 = r1;
      r1 = r0;
      result |= ((data[j] >> i) & 1 ^ t6) << i;
      r0 = t6;
    }
    data[j] = result;
  }
  whitening[0] = r0;
  whitening[1] = r1;
  whitening[2] = r2;
  whitening[3] = r3;
  whitening[4] = r4;
  whitening[5] = r5;
  whitening[6] = r6;
}*/

// Instead, use precalculated data
function whitening_encode(data, whitening) {
  /*var whiteningB = whitening_init(0x3f);
  var whiteningA = whitening_init(0x25);
  var WHITENA = new Uint8Array(35);
  var WHITENB = new Uint8Array(17);
  whitening_encode(WHITENB,whiteningB);
  whitening_encode(WHITENA,whiteningA);*/
  for (var i in data)
    data[i] ^= whitening[i];
}

function check_crc16(A, B) {
  var crc = 0xffff;
  for (var n in A) {
    crc ^= A[(A.length-1) - n] << 8;
    for (var i=0;i<8;i++) {
      crc <<= 1;
      if (crc & 0x10000) crc ^= 0x11021;
    }
  }
  for (var v of B) {
    crc ^= E.reverseByte(v) << 8;
    for (var i=0;i<8;i++) {
      crc <<= 1;
      if (crc & 0x10000)
        crc ^= 0x11021;
    }
  }
  var r = 0;
  for (var i=0;i<16;i++) {
    if (1 << i & crc)
      r |= 1 << (16-i) -1;
  }
  return r ^ 0xffff;
}


function get_nrf_payload(addressData,commandData) {
  //var t = getTime();
  var data = new Uint8Array(32);
  /*var whiteningB = whitening_init(0x3f);
  var whiteningA = whitening_init(0x25);*/
  const whiteningA = new Uint8Array([141, 210, 87, 161, 61, 167, 102, 176, 117, 49, 17, 72, 150, 119, 248, 227, 70, 233, 171, 208, 158, 83, 51, 216, 186, 152, 8, 36, 203, 59, 252, 113, 163, 244, 85]);
  const whiteningB = new Uint8Array([199, 141, 210, 87, 161, 61, 167, 102, 176, 117, 49, 17, 72, 150, 119, 248, 227]);

  var payloadLength = addressData.length + 0x12 + commandData.length;
  var allocatedPayloadLength =  payloadLength + 2;
  data = new Uint8Array(allocatedPayloadLength);
  data[15] = 0x71;
  data[16] = 0xf;
  data[17] = 0x55;
  /* Copy in Address data, 18 uint8_ts in */
  for (var i=0;i<addressData.length;i++)
    data[i + 0x12] = addressData[addressData.length - (i+1)];
  // Why???
  for (var i=0;i<addressData.length+3;i++) {
    data[i + 15] = E.reverseByte(data[i + 15]);
  }
  /* Copy in command data, after that */
  for (var i=0;i<commandData.length;i++) {
    data[i+addressData.length+0x12] = commandData[i];
  }
  /* Add a CRC after the payload */
  //var z=getTime();print("first",z-t);t=z;
  var crc = check_crc16(addressData,commandData);
  data[payloadLength] = crc;
  data[payloadLength + 1] = (crc >> 8);
  //var z=getTime();print("crc",z-t);t=z;
  /* whiten all after 18 uint8_ts */
  // FIXME: actually if we XOR whiteningB in we only have to do one whiten
  whitening_encode(new Uint8Array(data.buffer,0x12,addressData.length + 2 + commandData.length),whiteningB);
  whitening_encode(data,whiteningA);
  //var z=getTime();print("whiten",z-t);t=z;
  /* Get actual array data address */
  return new Uint8Array(data.buffer, 15, addressData.length + commandData.length + 5);
}

/** Starts advertising with the default 'hello' message. This is needed
to pair with a just turned on remote control */
exports.start = function() {
  var commandData = new Uint8Array([173, 196, 189, 128, 128, 128, 0, 82]);
  var payload = get_nrf_payload(exports.DEVICE_ADDRESS,commandData);
  print(payload);
  NRF.setAdvertising({},{showName:false,manufacturer:65280,manufacturerData:payload,interval:20});
}

/** Set the state of the outputs on the device. o is an object with {a,b,c,d}
each of which can contain a number from -7 to 7.
*/
exports.set = function(o) {
  o = o||{};
  o.a = 0|E.clip(Math.round(o.a),-7,7);
  o.b = 0|E.clip(Math.round(o.b),-7,7);
  o.c = 0|E.clip(Math.round(o.c),-7,7);
  o.d = 0|E.clip(Math.round(o.d),-7,7);
  if (o.a<0) o.a = 8-o.a;
  if (o.b<0) o.b = 8-o.b;
  if (o.c<0) o.c = 8-o.c;
  if (o.d<0) o.d = 8-o.d;
  // 1..7 one way. (1..7)+8 the other
  var commandData = new Uint8Array([125, 196, 189, 0, 0, 0, 0, 0, 0, 130]);
  commandData[3]=(o.a<<4) | o.b;
  commandData[4]=(o.c<<4) | o.d;
  var payload = get_nrf_payload(exports.DEVICE_ADDRESS,commandData);
  NRF.setAdvertising({},{showName:false,manufacturer:65280,manufacturerData:payload,interval:20});
}
