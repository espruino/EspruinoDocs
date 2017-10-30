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
      (opts.pin<<8) |
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
