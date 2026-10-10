/* Copyright (c) 2026 Jean-Philippe Rey. See the file LICENSE for copying permission. */
/* BTHome downlink: declare writable entries, serve them over GATT.

   Generated from espruino/BTHomeWritable.js in github.com/yerpj/bthome-writable, which carries
   the reasoning behind every line. Edit it there.

   BTHome has not assigned the object ID
   this uses to declare writable entries: see this module's page. */

/* Module for making BTHome objects writable: the device lists, in its BTHome advertising, the object types it accepts writes for, and serves each one on its own GATT characteristic. */

const DECL_ID = 0xFF; // declaration object, last in the packet (S2.2)
const CHALLENGE_LEN = 8;
const PKT_ID = 0x00; // BTHome packet id, always our first object
const REV_ID = 0x65; // BTHome settings revision (S3.2)
const DEV_INFO = 0x40; // BTHome v2, unencrypted, not trigger-based
const DEV_INFO_ENC = 0x41; // the same, encrypted
const WRITE_INFO = 0xFF; // device-info byte of a *write* nonce only (S5.1)
const READ_INFO = 0xFE; // device-info byte of a *read* nonce only (S5.1)
const MIC_LEN = 4; // BTHome v2's MIC
const ENC_OVERHEAD = 4 + MIC_LEN; // counter u32 LE and MIC, on top of the ciphertext
const BUDGET = 31 - 3 - 4; // adv payload - Flags AD - service data header (S2.4)
const UUID_TAIL = "-3B0B-4B1A-9E2A-B4C2952E62F2"; // provisional (D-001)
const SERVICE_UUID = "2FAA0000" + UUID_TAIL;
const COUNTER_UUID = "2FAA1000" + UUID_TAIL; /* the counter report (D-075), off unless `counterReport:true`. */
const TEXT_TYPES = { text:true }; // encoded by the BTHome module with a length byte
const EVENT_IDS = { 0x3A:true, 0x3C:true }; // button, dimmer: the value is an event code

const COMMAND_IDS = { 0x3B:true };

const SIGNED_IDS = { 0x02:true, 0x08:true, 0x3F:true, 0x45:true, 0x57:true, 0x58:true, 0x59:true, 0x5A:true, 0x5B:true, 0x5C:true, 0x5D:true, 0x62:true, 0x63:true };

const FORBIDDEN = { 0x00:true, 0x65:true, 0xFF:true, 0xF0:true, 0xF1:true, 0xF2:true };

function err(code, msg) { const e = new Error(msg); e.code = code; return e; }

/* Entry k (from 1) -> its characteristic UUID, k in hexadecimal (S4.1). */
function characteristicUuid(k) {
  return "2FAA" + ("000" + k.toString(16).toUpperCase()).slice(-4) + UUID_TAIL;
}

/* Entry object IDs -> [0xFF, n, id, id, ...] (S2.1). */
function encodeDeclaration(ids) {
  for (let i = 0; i < ids.length; i++)
    if (FORBIDDEN[ids[i]]) throw err("forbidden_entry", `entry ${i + 1} is 0x${ids[i].toString(16)}, which S2.1 forbids`);
  if (ids.length > 255) throw err("too_many_entries", `${ids.length} entries; the length byte holds 255`);
  return [DECL_ID, ids.length].concat(ids);
}

/* Assemble the service data. */
function buildServiceData(info, objs, entryIds, budget) {
  if (budget === undefined) budget = BUDGET;
  const b = [info];
  for (let i = 0; i < objs.length; i++) {
    b.push(objs[i].id);
    const v = objs[i].value;
    for (let j = 0; j < v.length; j++) b.push(v[j]);
  }
  if (entryIds) {
    const d = encodeDeclaration(entryIds);
    for (let i = 0; i < d.length; i++) b.push(d[i]);
  }
  if (b.length > budget) throw err("capacity_exceeded", `service data needs ${b.length} bytes, ${budget} available`);
  return b;
}

/* Parse a write for one entry, {id, length} or {id, variable:true}, and return its value bytes. */
function parseWrite(pl, w) {
  if (!pl.length) throw err("truncated", "empty write");

  if (pl[0] !== w.id) throw err("objectid_mismatch", `object 0x${pl[0].toString(16)} written to entry ${w.entry}, expected 0x${w.id.toString(16)}`);
  let n;
  if (w.command) {


    if (pl.length < 2) throw err("truncated", "missing argument length");
    n = 2 + (pl[1] & 0x1F);
  } else if (w.variable) {
    if (pl.length < 2) throw err("truncated", "missing length byte");
    n = 1 + pl[1];
  } else n = w.length;
  if (pl.length < 1 + n) throw err("truncated", `object needs ${n} value bytes, write has ${pl.length - 1}`);
  if (pl.length > 1 + n) throw err("trailing_bytes", `${pl.length - 1 - n} unexpected trailing bytes`);
  return pl.slice(1);
}

function readUint(bytes, from, to) {
  let v = 0;
  for (let i = to - 1; i >= from; i--) v = v * 256 + bytes[i];
  return v;
}

/* Value bytes -> the JS value handed to set(), per the entry's codec. */
function decodeValue(value, w) {
  switch (w.codec) {
    case "text": {
      let s = "";
      for (let i = 1; i < value.length; i++) s += String.fromCharCode(value[i]);
      return s;
    }
    case "binary": return value[0] !== 0;
    case "event": return value.length === 1 ? value[0] : value;
    case "command": {


      const rest = value.slice(1);
      return rest.length === 1 ? rest[0] : rest;
    }
    case "number": {
      let raw = readUint(value, 0, value.length);
      const full = Math.pow(256, value.length);
      if (w.signed && raw >= full / 2) raw -= full;
      return raw / w.scale;
    }
    default: return value;
  }
}

/* Work out how a writable entry is written, once, at setup. */
function writableSpec(e, enc, k) {
  if (e.id !== undefined) {


    if (COMMAND_IDS[e.id]) return { id:e.id, command:true, codec:"command" };
    if (!e.variable && !(e.length > 0)) throw err("writable_without_length", `entry ${k} declares id 0x${e.id.toString(16)} but no length`);
    return { id:e.id, length:e.length, variable:e.variable === true, codec:EVENT_IDS[e.id] ? "event" : "bytes" };
  }
  if (TEXT_TYPES[e.type]) return { id:enc(e, "")[0], variable:true, codec:"text" };
  let one, two;
  try { one = enc(e, 1); two = enc(e, 2); }
  catch (x) { throw err("unsupported_writable_type", `entry ${k} ("${e.type}") cannot be encoded (${x.message}); declare it with id and length`); }
  const s = { id:one[0], length:one.length - 1, variable:false };
  if (s.length === 1 && one[1] === 1 && two[1] === 1) { s.codec = "binary"; return s; }
  const scale = readUint(one, 1, one.length);
  if (!scale) { s.codec = "bytes"; return s; }
  s.codec = "number";
  s.scale = scale;
  s.signed = e.signed !== undefined ? e.signed === true : SIGNED_IDS[s.id] === true;
  return s;
}

/* Stable insertion sort by object id. */
function stableSortByObjectId(items) {
  const s = [];
  for (let i = 0; i < items.length; i++) {
    let j = s.length;
    while (j > 0 && s[j-1].id > items[i].id) { s[j] = s[j-1]; j--; }
    s[j] = items[i];
  }
  return s;
}

/* Work out the packet and the writable entries once, at setup - not at write time: a device that discovers it does not fit while advertising is a device in the field. */
function planPacket(entries, enc, defRead, encrypted, limit) {
  if (defRead === undefined) defRead = 0;
  if (limit === undefined) limit = BUDGET;
  const sensors = [], writable = [];
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    const hasSet = typeof e.set === "function", hasGet = typeof e.get === "function";
    if (!hasSet && !hasGet) throw err("entry_without_accessor", `entry ${i} ("${e.type}") has neither get() nor set()`);
    if (hasSet) {
      const k = writable.length + 1;
      const w = writableSpec(e, enc, k);
      if (FORBIDDEN[w.id]) throw err("forbidden_entry", `entry ${k} is 0x${w.id.toString(16)}, which S2.1 forbids`);
      w.entry = k;
      w.uuid = characteristicUuid(k);
      w.entryIndex = i;

      w.readable = hasGet;
      writable.push(w);
      continue;
    }
    const b = enc(e, e.get());
    sensors.push({
      id : b[0],
      value : b.slice(1),
      entryIndex : i,
      readInterval : e.interval === undefined ? defRead : e.interval,
      inheritsInterval : e.interval === undefined,
      lastRead : 0
    });
  }
  const readable = writable.some(w => w.readable);
  const p = {
    ordered : stableSortByObjectId(sensors),
    writable : writable,
    entryIds : writable.map(w => w.id),
    settingsRevision : readable,
    info : encrypted ? DEV_INFO_ENC : DEV_INFO,

    budget : limit - (encrypted ? ENC_OVERHEAD : 0)
  };
  p.serviceDataLength = renderServiceData(p, 0, null, null, 0, 0).length;
  return p;
}

/* Service data for one advertisement. */
function renderServiceData(p, pid, enc, entries, now, revision) {
  if (now === undefined) now = 0;
  const objs = [{ id:PKT_ID, value:[pid & 255] }];
  for (let i = 0; i < p.ordered.length; i++) {
    const it = p.ordered[i];


    if (enc === null || (it.readInterval && now - it.lastRead < it.readInterval)) {
      objs.push({ id:it.id, value:it.value });
      continue;
    }
    const e = entries[it.entryIndex];
    const b = enc(e, e.get());
    if (b[0] !== it.id) throw err("layout_drift", `entry ${it.entryIndex} now encodes as 0x${b[0].toString(16)}, was 0x${it.id.toString(16)}`);
    it.value = b.slice(1);
    it.lastRead = now;
    objs.push({ id:it.id, value:it.value });
  }
  if (p.settingsRevision) objs.push({ id:REV_ID, value:[(revision || 0) & 255] });
  return buildServiceData(p.info, stableSortByObjectId(objs), p.writable.length ? p.entryIds : null, p.budget);
}

/* ===== DIVIDER: everything below owns the radio ========================== */

let st = null;
let listening = false; // whether NRF connect/disconnect handlers are attached

const CTR_FILE = ".bwctr"; // the persisted counter high-water marks
const CTR_STRIDE = 64; // persist every this many accepted writes, not each one
const CTR_WINDOW = 0x80000000; /* how far ahead a write counter may jump (S5.3). */
const ADV_STRIDE = 1000000; /* and every this many sealed advertisements. */

/* "aa:bb:.." -> the six bytes, in the order BTHome puts them in the nonce. */
function macBytes() {
  const hex = NRF.getAddress().split(" ")[0].split(":");
  const b = new Uint8Array(6);
  for (let i = 0; i < 6; i++) b[i] = parseInt(hex[i], 16);
  return b;
}

/* nonce = mac || 0xD2 0xFC || device-info || counter u32 LE (S5.1). */
function nonceFor(info, counter) {
  const n = new Uint8Array(13);
  n.set(st.mac, 0);
  n[6] = 0xD2; n[7] = 0xFC; n[8] = info;
  for (let i = 0; i < 4; i++) n[9 + i] = (counter >>> (8 * i)) & 255;
  return n;
}

/* plaintext -> ciphertext || counter u32 LE || MIC, under direction `info`. */
function seal(pt, info) {
  const counter = st.advCounter;
  st.advCounter = (st.advCounter + 1) >>> 0;
  noteAdvCounter(st.advCounter);
  const r = require("AESCCM").encrypt(new Uint8Array(pt), st.key, nonceFor(info, counter), MIC_LEN);
  const out = [];
  for (let i = 0; i < r.data.length; i++) out.push(r.data[i]);
  for (let i = 0; i < 4; i++) out.push((counter >>> (8 * i)) & 255);
  for (let i = 0; i < MIC_LEN; i++) out.push(r.mic[i]);
  return out;
}

/* [0x41] || sealed objects (S5.2). */
function sealAdvertising(sd) {
  return [DEV_INFO_ENC].concat(seal(sd.slice(1), DEV_INFO_ENC));
}

/* Both counters, kept coarsely in flash. */
function loadMarks() {
  const v = require("Storage").readJSON(CTR_FILE, true);
  if (typeof v === "number") return { w: v, a: 0 };
  if (v && typeof v.w === "number") return { w: v.w, a: v.a || 0 };
  return { w: 0, a: 0 };
}

function saveMarks() {
  require("Storage").writeJSON(CTR_FILE, { w: st.writeMark, a: st.advMark });
}

/* The counter report (D-075). */
function counterCharacteristic() {
  return {
    readable : true,
    writable : true,



    maxLen : CHALLENGE_LEN + 4 + ENC_OVERHEAD,
    value : [],
    onWrite : evt => {
      if (evt.data.length !== CHALLENGE_LEN) {
        if (st.onError) st.onError(err("challenge_length", `challenge is ${evt.data.length} bytes, expected ${CHALLENGE_LEN}`));
        return;
      }


      setTimeout(() => {
      try {
        const pt = [];
        for (let i = 0; i < CHALLENGE_LEN; i++) pt.push(evt.data[i]);
        for (let i = 0; i < 4; i++) pt.push((st.writeCounter >>> (8 * i)) & 255);
        const svc = {}, chr = {};
        chr[COUNTER_UUID] = { value : seal(pt, READ_INFO) };
        svc[SERVICE_UUID] = chr;
        NRF.updateServices(svc);
      } catch (e) {


        if (st.onError) st.onError(err("counter_report_failed", "" + e));
      }
      }, 0);
    }
  };
}

/* Is `counter` ahead of `last`, in the circular sense of S5.3? */
function counterIsAhead(counter, last) {
  const ahead = (counter - last) >>> 0;
  return ahead !== 0 && ahead <= CTR_WINDOW;
}

function noteWriteCounter(counter) {
  st.writeCounter = counter;
  if (counter >= st.writeMark) {



    st.writeMark = (counter + CTR_STRIDE) >>> 0;
    saveMarks();
  }
}

function noteAdvCounter(counter) {
  if (counter >= st.advMark) {
    st.advMark = counter + ADV_STRIDE;
    saveMarks();
  }
}

/* Unseal a write, or return null having reported why. */
function openWrite(pl) {
  if (pl.length <= ENC_OVERHEAD) {
    if (st.onError) st.onError(err("truncated", `encrypted write is ${pl.length} bytes, shorter than its own framing`));
    return null;
  }
  const n = pl.length - ENC_OVERHEAD;
  let counter = 0;
  for (let i = 0; i < 4; i++) counter += pl[n + i] * Math.pow(256, i);

  if (!counterIsAhead(counter, st.writeCounter)) {
    if (st.onError) st.onError(err("counter_not_increasing", `write counter ${counter} is not ahead of ${st.writeCounter}`));
    return null;
  }
  const ct = new Uint8Array(n), mic = new Uint8Array(MIC_LEN);
  for (let i = 0; i < n; i++) ct[i] = pl[i];
  for (let i = 0; i < MIC_LEN; i++) mic[i] = pl[n + 4 + i];
  const pt = require("AESCCM").decrypt(ct, st.key, nonceFor(WRITE_INFO, counter), mic);
  if (pt === null) {
    if (st.onError) st.onError(err("mic_mismatch", "the write did not authenticate"));
    return null;
  }
  noteWriteCounter(counter);
  const out = [];
  for (let i = 0; i < pt.length; i++) out.push(pt[i]);
  return out;
}

/* Encode one object via the upstream BTHome module, whose tables are local to getAdvertisement() and not exported - so the only way to reuse them rather than duplicate them is to encode a one-object advertisement and take the object back out. */
function encodeOne(e, v) {
  const BTHome = require("BTHome"); // lazily, so this file loads under Node
  const n = BTHome.packetId;
  const adv = BTHome.getAdvertisement([{ type:e.type, v:v }]);
  BTHome.packetId = n;
  return adv[0xFCD2].slice(3);
}

/* Rebuild and publish sensors, settings revision and declaration. */
function refreshAdvertising() {
  st.packetId = (st.packetId + 1) & 255;
  let sd = renderServiceData(st.plan, st.packetId, encodeOne, st.entries, Date.now(), st.revision);
  if (st.key) sd = sealAdvertising(sd);

  const opts = { interval:st.advInterval, connectable:true, discoverable:true, whenConnected:st.whenConnected, showName:st.showName };
  try {
    NRF.setAdvertising({ 0xFCD2:sd }, opts);
  } catch (e) {



    let small = [st.plan.info, PKT_ID, st.packetId & 255];




    if (st.key) small = sealAdvertising(small);
    NRF.setAdvertising({ 0xFCD2:small }, Object.assign({}, opts, { showName:false }));
    throw err("advertising_rejected", `the radio refused ${sd.length} bytes of service data: ${e.message}`);
  }
}

/* What a read of entry `w` returns: its object, sealed when encrypted (S4.3). */
function readValue(w) {
  const e = st.entries[w.entryIndex];
  const obj = e.id !== undefined ? [w.id].concat(e.get()) : encodeOne(e, e.get());
  return st.key ? seal(obj, READ_INFO) : obj;
}

function publishRead(w) {
  const svc = {}, chr = {};
  chr[w.uuid] = { value:readValue(w) };
  svc[SERVICE_UUID] = chr;
  NRF.updateServices(svc);
}

/* Advertise fast while someone is plainly interacting, from connect until fastTimeout after disconnect. */
/* Run a reaction to a connection without letting it throw into the Bluetooth stack's own callback. */
function guarded(fn) {
  try { fn(); } catch (e) { if (st && st.onError) st.onError(e); }
}

function goFast() {
  if (st.fastTimer !== undefined) { clearTimeout(st.fastTimer); st.fastTimer = undefined; }
  st.advInterval = st.fastInterval;
  refreshAdvertising();
}

function goIdleAfterTimeout() {
  if (st.fastTimer !== undefined) clearTimeout(st.fastTimer);
  st.fastTimer = setTimeout(() => {
    st.fastTimer = undefined;
    st.advInterval = st.interval;
    refreshAdvertising();
  }, st.fastTimeout);
}

/* Apply a write to entry k (S4.2). */
function handleWrite(k, pl) {
  const w = st.plan.writable[k - 1];
  let value;
  try {
    value = parseWrite(pl, w);
  } catch (e) {
    if (st.onError) st.onError(e);
    return false;
  }
  st.entries[w.entryIndex].set(decodeValue(value, w));







  if (w.readable) setTimeout(() => { guarded(() => publishRead(w)); }, 0);



  try { goFast(); }
  catch (e) { if (st.onError) st.onError(e); }  // a refused packet must not escape into onWrite
  return true;
}

/* The radio clamps anything outside 20..10000 silently, which is the kind of thing that costs an afternoon. */
function checkInterval(name, v) {
  if (v < 20 || v > 10000) throw err("interval_out_of_range", `${name} is ${v}ms; the radio accepts 20 to 10000`);
  return v;
}

/* "231d.." or a 16-byte array -> the key. */
function toKey(v) {
  if (v === undefined || v === null) return null;
  if (typeof v !== "string") return new Uint8Array(v);
  if (v.length !== 32) throw err("bindkey_length", `bindkey is ${v.length} hex characters, expected 32`);
  const k = new Uint8Array(16);
  for (let i = 0; i < 16; i++) k[i] = parseInt(v.substr(i * 2, 2), 16);
  return k;
}

function setup(opts) {
  const entries = opts.advertise;
  const iv = checkInterval("interval", opts.interval || 2000);
  const key = toKey(opts.bindkey);
  const marks = key ? loadMarks() : { w: 0, a: 0 };
  st = {
    entries : entries,
    key : key,
    mac : key ? macBytes() : null,



    advCounter : key ? marks.a : 0,
    advMark : key ? marks.a + ADV_STRIDE : 0,

    writeCounter : key ? marks.w : 0,
    writeMark : key ? marks.w : 0,
    plan : planPacket(entries, encodeOne, iv, key !== null, opts.maxServiceData),

    revision : Math.floor(Math.random() * 256),
    showName : opts.showName !== false,
    packetId : 0,
    interval : iv,
    fastInterval : Math.max(100, checkInterval("fastInterval", opts.fastInterval || 100)),
    fastTimeout : opts.fastTimeout === undefined ? 30000 : opts.fastTimeout,
    maxWriteLength : opts.maxWriteLength || 128,


    counterReport : opts.counterReport === true && key !== null,
    whenConnected : opts.whenConnected !== false,
    onError : opts.onError || null,
    timer : undefined,
    fastTimer : undefined,
    advInterval : iv
  };
  /* Claim the stride now rather than when the counter reaches it. */
  if (key) saveMarks();
  if (st.plan.writable.length) {
    const chars = {}, svcs = {};
    if (st.counterReport) chars[COUNTER_UUID] = counterCharacteristic();
    st.plan.writable.forEach(w => {
      const c = {
        writable : true,
        maxLen : st.maxWriteLength,
        onWrite : evt => {
          let pl = [];
          for (let i = 0; i < evt.data.length; i++) pl.push(evt.data[i]);
          if (st.key) pl = openWrite(pl);
          if (pl !== null) handleWrite(w.entry, pl);
        }
      };
      if (w.readable) { c.readable = true; c.value = readValue(w); }
      chars[w.uuid] = c;
    });
    svcs[SERVICE_UUID] = chars;

    NRF.setServices(svcs);
  }
  refreshAdvertising();

  if (st.timer !== undefined) clearInterval(st.timer);
  st.timer = setInterval(refreshAdvertising, st.interval);



  if (!listening) {
    NRF.on("connect", () => guarded(goFast));
    NRF.on("disconnect", () => guarded(goIdleAfterTimeout));
    listening = true;
  }
  return exports;
}

/* Re-read every sensor and re-advertise, without waiting for the next interval. */
function update() { refreshAdvertising(); }

/* A writable value changed without a write - a knob, a button, a schedule. */
function changed() {
  if (!st.plan.settingsRevision) throw err("not_readable", "no writable entry has get(); nothing for a receiver to re-read");
  st.revision = (st.revision + 1) & 255;
  st.plan.writable.forEach(w => { if (w.readable) publishRead(w); });
  refreshAdvertising();
}

/* Change the advertising interval without re-running setup(). */
function setAdvertisingInterval(ms) {
  st.interval = checkInterval("interval", ms);
  const ord = st.plan.ordered;
  for (let i = 0; i < ord.length; i++) if (ord[i].inheritsInterval) ord[i].readInterval = st.interval;
  if (st.timer !== undefined) clearInterval(st.timer);
  st.timer = setInterval(refreshAdvertising, st.interval);
  if (st.fastTimer === undefined && st.advInterval !== st.fastInterval) {
    st.advInterval = st.interval;
    refreshAdvertising();
  }
  return st.interval;
}

/* Change how long the device keeps advertising fast after a disconnect, without re-running setup(). */
function setFastTimeout(ms) {
  if (ms < 0) throw err("fast_timeout_negative", `fastTimeout is ${ms}ms`);
  st.fastTimeout = ms;
  return st.fastTimeout;
}

exports.setup = setup;
exports.update = update;
exports.changed = changed;
exports.setAdvertisingInterval = setAdvertisingInterval;
exports.setFastTimeout = setFastTimeout;
exports.SERVICE_UUID = SERVICE_UUID;
exports.characteristicUuid = characteristicUuid;
exports.plan = () => st && st.plan;

/* The pure half, exported for the unit tests. */
exports.DECLARATION_OBJECT_ID = DECL_ID;
exports.PACKET_ID_OBJECT_ID = PKT_ID;
exports.SETTINGS_REVISION_OBJECT_ID = REV_ID;
exports.DEVICE_INFO_PLAIN = DEV_INFO;
exports.DEVICE_INFO_ENCRYPTED = DEV_INFO_ENC;
exports.SERVICE_DATA_BUDGET = BUDGET;
exports.encodeDeclaration = encodeDeclaration;
exports.buildServiceData = buildServiceData;
exports.parseWrite = parseWrite;
exports.decodeValue = decodeValue;
exports.writableSpec = writableSpec;
exports.stableSortByObjectId = stableSortByObjectId;
exports.planPacket = planPacket;
exports.renderServiceData = renderServiceData;
exports.handleWrite = handleWrite;
exports.counterIsAhead = counterIsAhead;
exports.COUNTER_WINDOW = CTR_WINDOW;
