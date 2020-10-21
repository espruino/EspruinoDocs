/* Copyright (c) 2020 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/* Module for the Melexis MLX90632 non-contact temperature sensor */
// based on https://github.com/melexis/mlx90632-library
var R = {
  CONTROL:0x3001,
  STATUS:0x3fff,
  PROD_CODE:0x2409,
  EE_VERSION:0x240b,
  RAM : (n,meas) => 0x4000 + (n-1) + (meas*3),
};
var C = {
  STAT_DATA_RDY : 1,
  STAT_CYCLE_POS : 0b1111100,
  REF_3 : 12.0,
  POW10 : 10000000000
};
var EE = {};

function MLX90632(options,r,w) {
  this.r = r;
  this.w = w;

  // check product/eeprom?
  if (r(0x24D5)!=0x1d) // (I2C address>>1)
    throw new Error("MLX90632 not connected");
}

/// signed read
MLX90632.prototype.rs = function(a) {
  var d = this.r(a);
  if (d&32768) d-=65536;
  return d;
}
/// signed read 32
MLX90632.prototype.rs32 = function(a) {
  // because we're using OR we're using 32 bit ints so we get the sign for free
  return this.r(a) | (this.r(a+1)<<16);
}


MLX90632.prototype.init = function() {
  this.w(R.CONTROL, (this.r(R.CONTROL)&~6) | 2); // sleeping step mode
  EE = {
    P_R:this.rs32(0x240c), /**< Calibration constant ambient reference register 32bit */
    P_G:this.rs32(0x240e), /**< Calibration constant ambient gain register 32bit */
    P_T:this.rs32(0x2410), /**< Calibration constant ambient tc2 register 32bit */
    P_O:this.rs32(0x2412), /**< Calibration constant ambient offset register 32bit */
    Ea:this.rs32(0x2424), /**< Ea calibration constant register 32bit */
    Eb:this.rs32(0x2426), /**< Eb calibration constant register 32bit */
    Fa:this.rs32(0x2428), /**< Fa calibration constant register 32bit */
    Fb:this.rs32(0x242a), /**< Fb calibration constant register 32bit */
    Ga:this.rs32(0x242c), /**< Ga calibration constant register 32bit */
    Gb:this.rs(0x242e), /**< Ambient Beta calibration constant 16bit */
    Ka:this.rs(0x242f), /**< IR Beta calibration constant 16bit */
    Ha:this.rs(0x2481), /**< Ha customer calibration value register 16bit */
    Hb:this.rs(0x2482) /**< Hb customer calibration value register 16bit */
  };
}

MLX90632.prototype.startMeasurement = function() {
  var status = this.r(R.STATUS);
  this.w(R.STATUS, status&~C.STAT_DATA_RDY);
  this.w(R.CONTROL, this.r(R.CONTROL) | 8); // SOC => force reading
  var tries=300;
  while (tries-- > 0) {
    status = this.r(R.STATUS);
    if (status & C.STAT_DATA_RDY)
      break;
  }
  if (tries<0) throw "Timeout";
  return (status & C.STAT_CYCLE_POS) >> 2;
}

MLX90632.prototype.readTempRaw = function() {
  var channel = this.startMeasurement();
  if (channel!=1 && channel!=2) throw "ch Wrong";
  var channel_old = (channel==1)?2:1;
  return {
    ambient_new_raw : this.rs(R.RAM(3,1)),
    ambient_old_raw : this.rs(R.RAM(3,2)),
    object_new_raw : (this.rs(R.RAM(2,channel)) + this.rs(R.RAM(1,channel)))/2,
    object_old_raw : (this.rs(R.RAM(2,channel_old)) + this.rs(R.RAM(1,channel_old)))/2
  };
}

MLX90632.prototype.calcTempAmbient = function(o) {
  var Asub, Bsub, Ablock, Bblock, Cblock;
  // mlx90632_preprocess_temp_ambient
  var kGb = EE.Gb / 1024.0;
  var VR_Ta = o.ambient_old_raw + kGb * (o.ambient_new_raw / (C.REF_3));
  var AMB = ((o.ambient_new_raw / (C.REF_3)) / VR_Ta) * 524288.0;
  // mlx90632_calc_temp_ambient
  Asub = EE.P_T / 17592186044416.0;
  Bsub = AMB - (EE.P_R / 256.0);
  Ablock = Asub * (Bsub * Bsub);
  Bblock = (Bsub / EE.P_G) * 1048576.0;
  Cblock = EE.P_O / 256.0;

  return Bblock + Ablock + Cblock;
}

MLX90632.prototype.calcTempObjectIteration = function(prev_object_temp, object, TAdut, emissivity) {
    var calcedGa, calcedGb, calcedFa, TAdut4, first_sqrt;
    // temp variables
    var KsTAtmp, Alpha_corr;
    var Ha_customer, Hb_customer;

    Ha_customer = EE.Ha / (16384.0);
    Hb_customer = EE.Hb / (1024.0);
    calcedGa = (EE.Ga * (prev_object_temp - 25)) / (68719476736.0);
    KsTAtmp = EE.Fb * (TAdut - 25);
    calcedGb = KsTAtmp / (68719476736.0);
    Alpha_corr = (((EE.Fa * C.POW10)) * Ha_customer * (1 + calcedGa + calcedGb)) /
                 (70368744177664.0);
    calcedFa = object / (emissivity * (Alpha_corr / C.POW10));
    TAdut4 = (TAdut + 273.15) * (TAdut + 273.15) * (TAdut + 273.15) * (TAdut + 273.15);

    first_sqrt = Math.sqrt(calcedFa + TAdut4);

    return Math.sqrt(first_sqrt) - 273.15 - Hb_customer;
}

MLX90632.prototype.getEmissivity = function() { return 1; }

MLX90632.prototype.calcTempObject = function(o) {
  // mlx90632_preprocess_temp_ambient
  var kGb = (EE.Gb) / 1024.0;
  var VR_Ta = o.ambient_old_raw + kGb * (o.ambient_new_raw / (C.REF_3));
  var pre_ambient = ((o.ambient_new_raw / (C.REF_3)) / VR_Ta) * 524288.0;
  // mlx90632_preprocess_temp_object
  var kKa = (EE.Ka) / 1024.0;
  var VR_IR = o.ambient_old_raw + kKa * (o.ambient_new_raw / (C.REF_3));
  var pre_object = ((((o.object_new_raw + o.object_old_raw) / 2) / (C.REF_3)) / VR_IR) * 524288.0;
  // mlx90632_calc_temp_object
  var temp = 25.0;
  var tmp_emi = this.getEmissivity();

  var kEa = (EE.Ea) / (65536.0);
  var kEb = (EE.Eb) / (256.0);
  var TAdut = ((pre_ambient) - kEb) / kEa + 25;
  for (var i = 0; i < 5; ++i) {
    temp = this.calcTempObjectIteration(temp, pre_object, TAdut, tmp_emi);
  }
  return temp;
}

/// Simply read the sensor - returns `{ambient,raw}` temperature in degrees C
MLX90632.prototype.read = function() {
  var o = this.readTempRaw();
  return {ambient:this.calcTempAmbient(o), object:this.calcTempObject(o)};
};

exports.connect = function(i2c, options) {
  options = options||{};
  var addr = options.addr || 0x3A;
  return new MLX90632(options, function(a,n) { // read
    i2c.writeTo({address:addr, stop:false},[a>>8,a]);
    var d = i2c.readFrom(addr,2);
    return d[1] | (d[0]<<8);
  }, function (a,d) { // write
    i2c.writeTo(addr,[a>>8,a,d>>8,d]);
  });
};
