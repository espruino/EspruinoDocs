/* Copyright (c) 2017 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/* nRF52 low level library */

/** GPIO Tasks and Events
  ch can be between 0 and 7 for low power GPIO
  opts is {
    type : "event"/"task", // default is event
    pin : D0, // pin number to use,
    lo2hi : 0/1, // default 0, trigger on low-high transition
    hi2lo : 0/1, // default 0, trigger on high-low transition
    initialState : 0, // default 0, initial pin state when toggling states
  }
  returns {
    config,// address of config register
    tOut,  // task to set/toggle pin (lo2hi/hi2lo)
    tSet,  // task to set pin to 1
    tClr,  // task to set pin to 0
    eIn    // event when GPIO changes
  }
*/
exports.gpiote = function(ch, opts) { // NRF_GPIOTE_Type
  var addr = 0x40006000 + ch*4;
  var o = {
    config : addr+0x510,
    tOut : addr,
    tSet : addr+0x30,
    tClr : addr+0x60,
    eIn : addr+0x100
  };
  var v = (opts.type=="task"?3:1) |
    (new Pin(opts.pin).getInfo().num<<8) |
    ((opts.lo2hi?1:0)<<16) |
    ((opts.hi2lo?1:0)<<17) |
    ((opts.initialState?1:0)<<20);
  poke32(o.config, v);
  return o;
};

/** 32 bit timers
  ch can be 0..4
  opts is {
    mode : "counter"/"timer", // default = timer
    bits : 8/16/24/32, // default = 32
    prescaler : 0..9, // default = 0
    cc : [5,6,7,8,9,10], // 6 (or less) cpature/compare regs
    cc0clear : true, // if cc[0] matches, clear the timer
    cc3stop : true, // if cc[0] matches, stop the timer
    // for cc0..cc5
  };
  returns {
      shorts, // address of shortcut register
      mode, // address of mode register
      bitmode, // address of bitmode
      prescaler, // address of prescaler register
      cc, // array of 6 addresses of capture/compare registers
      tStart, // address of START task
      tStop, // address of STOP task
      tCount, // address of COUNT task
      tClear, // address of CLEAR task
      tShutdown, // address of SHUTDOWN task
      tCapture, // array of 6 addresses of capture tasks
      eCompare, // array of 6 addresses of compare events
  }
*/
exports.timer = function(ch, opts) { // NRF_TIMER_Type
  var addr = 0x40000000 + [8,9,10,0x1A,0x1B][ch]*0x1000;
  var o = {
    shorts : addr+0x200,
    mode : addr+0x504,
    bitmode : addr+0x508,
    prescaler : addr+0x510,
    cc : [
      addr+0x540,addr+0x544,addr+0x548,
      addr+0x54C,addr+0x550,addr+0x554],
    tStart : addr,
    tStop : addr+0x04,
    tCount : addr+0x08,
    tClear : addr+0x0C,
    tShutdown : addr+0x10,
    tCapture : [
      addr+0x40,addr+0x44,addr+0x48,
      addr+0x4C,addr+0x50,addr+0x54],
    eCompare : [
      addr+0x140,addr+0x144,addr+0x148,
      addr+0x14C,addr+0x150,addr+0x154]
  };
  poke32(o.mode, (opts.type=="counter")?2:0);
  poke32(o.bitmode, [16,8,24,32].indexOf(opts.bits)&3);
  poke32(o.prescaler, opts.prescaler); // default 0
  var shorts = 0;
  for (var i=0;i<6;i++) {
    if (opts.cc) poke32(o.cc[i],opts.cc[i]);
    if (opts["cc"+i+"clear"]) shorts |= 1<<i;
    if (opts["cc"+i+"stop"]) shorts |= 256<<i;
  }
  poke32(o.shorts,shorts);
  return o;
};


/** Low power comparator
  ch can be between 0 and 7 for low power GPIO
  opts is {
    pin : D0, // pin number to use,
    vref : 1, // reference voltage in 16ths of VDD (1..15), or D2/D3 to use those analog inputs
    hyst : true/false, // enable ~50mV hysteresis
  }
  returns { // addresses of
    result,  // comparator result
    enable,  // enable
    psel,    // pin select
    refsel,  // reference voltage
    extrefsel, // external reference select
    hyst,      // 50mv hysteresis
    shorts,  // shortcut register
    tStart,  //
    tStop,   // task to set pin to 1
    tSample, // task to set pin to 0
    eReady,  // sample ready
    eDown,eUp,eCross, // events for crossing
    sample() // samples the comparator and returns the result (0/1)
    cross() // return {up:bool,down:bool,cross:bool} since last cal;
  }
*/
exports.lpcomp = function(opts) {
  var addr = 0x40013000;
  var o = {
    result : addr+0x400,
    enable : addr+0x500,
    psel : addr+0x504,
    refsel : addr+0x508,
    extrefsel : addr+0x50C,
    hyst : addr+0x538,
    tStart : addr,
    tStop : addr+0x04,
    tSample : addr+0x08,
    eReady : addr+0x100,
    eDown : addr+0x104,
    eUp : addr+0x108,
    eCross : addr+0x10C,
    shorts : addr+0x200,
    sample : function() {
      poke32(o.tSample,1);return peek32(o.result);
    },
    cross : function() {
      var r = {
        up:peek32(o.eUp),
        down:peek32(o.eDown),
        cross:peek32(o.eCross)
      };
      poke32(o.eDown, 0);
      poke32(o.eUp, 0);
      poke32(o.eCross, 0);
      return r;
    }
  };
  poke32(o.tStop, 1);
  poke32(o.enable, 0);
  if (opts.vref instanceof Pin) {
    poke32(o.refsel, 7); // use external ref
    var p = opts.vref.getInfo().channel;
    if (p!==0 && p!==1) throw new Error("Invalid vref pin (must be analog0 or 1)");
    poke32(o.extrefsel, p);
  } else {
    var r = parseInt(opts.vref);
    if (r<1 || r>15) throw new Error("Invalid vref (1..15)");
    poke32(o.refsel, ((r-1)>>1) + (r&1)*8);
  }
  var p = new Pin(opts.pin).getInfo().channel;
  if (p===undefined) throw new Error("Invalid pin (must be capable of analog)");
  poke32(o.psel, p);
  poke32(o.hyst, opts.hyst?1:0);
  poke32(o.shorts, 1); // enable ready->sample short
  poke32(o.enable, 1);
  poke32(o.eReady, 0);
  poke32(o.eDown, 0);
  poke32(o.eUp, 0);
  poke32(o.eCross, 0);
  poke32(o.tStart, 1); // start sampling
  return o;
};


/** Successive approximation analog-to-digital converter
  opts is {
    channels : [ {
      pin : D0, // pin number to use,
      npin : D1, // pin to use for negative input (or undefined)
      pinpull : undefined / "down" / "up" / "vcc/2",   // pin internal resistor state
      npinpull : undefined / "down" / "up" / "vcc/2",  // npin internal resistor state
      gain : 1/6, 1/5, 1/4, 1/3, 1/2, 1(default), 2, 4, // input gain -
      refvdd : bool, // use VDD/4 as a reference (true) or internal 0.6v ref (false)
      tacq : 3(default),5,10,15,20,40 // acquisition time in us
    }, { ... } ] // up to 8 channels
    resolution : 8,10,12,14 // bits (14 default)
    oversample : 0..8, // take 2<<X samples, 0(default) is just 1 sample
    samplerate : 0(default), 80..2047 // Sample from sample task, or at 16MHz/X
    dma : { ptr, cnt } // enable DMA. cnt is in 16 bit words
      // DMA IS REQUIRED UNLESS YOU'RE JUST USING THE 'sample' function
  }
  returns {
    status, // 0=ready, 1=busy
    config, // address of config register
    enable,
    amount, // words transferred since last tStart
    tStart,  // Start ADC
    tSample,  // Start sampling
    tStop,   // Stop ADC
    tCalib,  // Start calibration
    eDone    // event when GPIO changes
    eEnd     // ADC has filled DMA buffer
    setDMA : function({ptr,cnt}) // set new DMA buffer
               // double-buffered so can be set again right after tStart
    sample : function(cnt) // Make `cnt*channels.length` readings and return the result. resets DMA
  }
*/
exports.saadc = function(opts) {
  var addr = 0x40007000;
  var o = {
    status : addr+0x400, // 0=ready, 1=busy
    enable : addr+0x500,
    amount : addr+0x634,
    tStart : addr,
    tSample : addr+0x4,
    tStop : addr+0x8,
    tCalib : addr+0xC,
    eResultDone : addr+0x10C, // result is ready
    eEnd : addr+0x104,
    setDMA : function(o) {
      o=o||{};
      poke32(addr+0x62C, 0|o.ptr);
      poke32(addr+0x630, 0|o.cnt);
    },
    sample : function(cnt) {
      cnt = cnt||1;
      if (cnt>1 && !opt.samplerate)
        throw "Can't do >1 sample with no samplerate specified";
      var buf = new Uint16Array(Math.max(cnt*opts.channels.length,32)); // make big enough to ensure a flat string
      var p = E.getAddressOf(buf,true);
      o.setDMA({ptr:p,cnt:cnt*opts.channels.length});
      poke32(o.eEnd,0);
      poke32(o.tStart,1);
      poke32(o.tSample,1);
      while (!peek32(o.eEnd));
      poke32(o.tStop,1);
      o.setDMA(); // don't try and write to this buffer now we're not using it any more
      return buf.slice(0,cnt*opts.channels.length);
    }
  };
  var pulls = [undefined, "down","up","vcc/2"];
  var gains = [1/6,1/5,1/4,1/3,1/2,1,2,4];
  var tacqs = [3,5,10,15,20,40];
  if (!opts.resolution) opts.resolution = 14;
  if (!opts.channels || opts.channels.length>8) throw "Invalid channels";
  poke32(o.enable, 0);
  // disable all ADC channels
  for (var i=0;i<8;i++)
    poke32(addr+0x510 + i*12, 0);
  // config those specified
  opts.channels.forEach(function(ch, idx) {
    var a = addr+0x510 + idx*12;
    if (!ch.gain) ch.gain=1;
    if (!ch.tacq) ch.tacq=3;
    if (pulls.indexOf(ch.pinpull)<0) throw "Invalid pinpull";
    if (pulls.indexOf(ch.npinpull)<0) throw "Invalid npinpull";
    if (gains.indexOf(ch.gain)<0) throw "Invalid gain";
    if (tacqs.indexOf(ch.tacq)<0) throw "Invalid tacq";
    var v = (pulls.indexOf(ch.pinpull)) |
      (pulls.indexOf(ch.npinpull)<<4) |
      (gains.indexOf(ch.gain)<<8) |
      ((!!ch.refvdd)<<12) |
      (tacqs.indexOf(ch.tacq)<<16) |
      ((ch.npin!==undefined)<<20) | // differential if npin is supplied
      ((!!opts.oversample)<<24);
    poke32(a+8, v); // options
    poke32(a, 0|(new Pin(ch.pin).getInfo().channel+1)); // pin pos -  undefined -> 0
    poke32(a+4, 0|((ch.npin&&new Pin(opts.npin).getInfo().channel)+1)); // pin neg - undefined -> 0
  });
  poke32(addr+0x5F0, (opts.resolution-8)>>1);
  poke32(addr+0x5F4, 0|opts.oversample);
  poke32(addr+0x5F8, opts.samplerate | ((!!opts.samplerate)<<12));
  o.setDMA(opts.dma);
  poke32(o.enable, 1);
  return o;
};

/** Real time counter
  You should only set on ch2 as 0 and 1 are used by Espruino/Bluetooth
  This function intentionally doesn't set state itself to allow you
  to still query RTC0/1 without modifying them.

  returns {
    counter // address of 24 bit counter register
    prescaler : // address of 12 bit prescaler
    cc : [..] // addresses of 4 compare registers
    tStart // start counting
    tStop // stop counting
    tClear // clear counter
    tOverflow // set counter to 0xFFFFF0 to force overflow in the near future
    eTick : // the RTC has 'ticked' (see enableEvent)
    eOverflow : // RTC (see enableEvent)
    eCmp0 : // cc[0]==counter (see enableEvent)
    eCmp1 : // cc[1]==counter (see enableEvent)
    eCmp2 : // cc[2]==counter (see enableEvent)
    eCmp3 : // cc[3]==counter (see enableEvent)
    enableEvent : function(evt) // enable "eTick","eOverflow","eCmp0","eCmp1","eCmp2" or "eCmp3"
    disableEvent : function(evt) // disable enable "eTick","eOverflow","eCmp0","eCmp1","eCmp2" or "eCmp3"
  }
*/
exports.rtc = function(ch) {
  var addr = 0x40000000 + [0x8,0x11,0x24][ch]*0x1000;
  var events = {"eTick":1,"eOverflow":2,"eCmp0":1<<16,"eCmp1":1<<17,"eCmp2":1<<18,"eCmp3":1<<19}
  return {
    counter : addr+0x504,
    prescaler : addr+0x508,
    cc : [addr+0x540,addr+0x544,addr+0x548,addr+0x54C],
    tStart : addr,
    tStop : addr+4,
    tClear : addr+8,
    tOverflow : addr+0xC,
    eTick : addr+0x100,
    eOverflow : addr+0x104,
    eCmp0 : addr+0x140,
    eCmp1 : addr+0x144,
    eCmp2 : addr+0x148,
    eCmp3 : addr+0x14C,
    enableEvent : function(evt) { poke32(addr+0x344, 0|events[evt]); }, // EVTENSET
    disableEvent : function(evt) { poke32(addr+0x348, 0|events[evt]); } // EVTENCLR
  };
};

/* Set up and enable a PPI channel (0..15) - give it the address of the
event and task required */
exports.ppiEnable = function(ch, event, task) {
  poke32(0x4001F510+(ch*8), event); // CH
  poke32(0x4001F514+(ch*8), task); // CH
  poke32(0x4001F504, 1<<ch); // CHENSET
}
/* Disable a PPI channel */
exports.ppiDisable = function(ch) {
  poke32(0x4001F508, 1<<ch); // CHENCLR
}
/* Check if a PPI channel is enabled */
exports.ppiIsEnabled = function(ch) {
  return (peek32(0x4001F500)>>ch)&1; // CHEN
}
