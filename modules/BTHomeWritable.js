/* Copyright (c) 2026 Jean-Philippe Rey. See the file LICENSE for copying permission. */
/* BTHome downlink: declare writable entries, serve them over GATT.

   Generated from espruino/BTHomeWritable.js in github.com/yerpj/bthome-writable, which carries
   the reasoning behind every line. Edit it there.

   BTHome has not assigned the object ID
   this uses to declare writable entries: see this module's page. */

/* Module for making BTHome objects writable. */

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
function buildServiceData(info, objs, decl, budget) {
  if (budget === undefined) budget = BUDGET;
  const b = [info];
  for (let i = 0; i < objs.length; i++) {
    b.push(objs[i].id);
    const v = objs[i].value;
    for (let j = 0; j < v.length; j++) b.push(v[j]);
  }
  if (decl) for (let i = 0; i < decl.length; i++) b.push(decl[i]);
  if (b.length > budget) throw err("capacity_exceeded", `service data needs ${b.length} bytes, ${budget} available`);
  return b;
}

/* Parse a write for one entry and return its value bytes. */
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
  /* Not every type can be probed this way. */
  if (e.type === "raw" || EVENT_IDS[s.id] || COMMAND_IDS[s.id] || FORBIDDEN[s.id]) throw err("writable_needs_id", `entry ${k} ("${e.type}") needs id and length`);
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

/* Work out the packet and the writable entries once, at setup. */
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
  /* What the plan fixes, computed once (D-106). */
  p.decl = writable.length ? encodeDeclaration(p.entryIds) : null;
  p.pkt = { id:PKT_ID, value:[0] };
  p.rev = readable ? { id:REV_ID, value:[0] } : null;
  p.objs = stableSortByObjectId([p.pkt].concat(p.ordered).concat(p.rev ? [p.rev] : []));
  p.serviceDataLength = renderServiceData(p, 0, null, null, 0, 0).length;
  return p;
}

/* Service data for one advertisement. */
function renderServiceData(p, pid, enc, entries, now, revision) {
  p.pkt.value[0] = pid & 255;
  if (p.rev) p.rev.value[0] = (revision || 0) & 255;
  if (enc !== null) readDue(p, enc, entries, now);
  return buildServiceData(p.info, p.objs, p.decl, p.budget);
}

/* Read one advertised entry and keep its bytes. */
function readSensor(it, enc, entries, now) {
  const e = entries[it.entryIndex];
  const b = enc(e, e.get());
  if (b[0] !== it.id) throw err("layout_drift", `entry ${it.entryIndex} now encodes as 0x${b[0].toString(16)}, was 0x${it.id.toString(16)}`);
  it.lastRead = now;
  let moved = it.value.length !== b.length - 1;
  for (let i = 0; !moved && i < it.value.length; i++) moved = it.value[i] !== b[i + 1];
  if (moved) it.value = b.slice(1);
  return moved;
}

/* Re-read every advertised entry that is due, and say whether any bytes moved. */

function readDue(p, enc, entries, now) {
  let moved = false;
  for (let i = 0; i < p.ordered.length; i++) {
    const it = p.ordered[i];
    if (it.readInterval && now - it.lastRead < it.readInterval) continue;
    if (readSensor(it, enc, entries, now)) moved = true;
  }
  return moved;
}

/* ===== DIVIDER: everything below owns the radio ========================== */

let st = null;
let listening = false; // whether NRF connect/disconnect handlers are attached

const READ_SLACK = 100; /* ms added to every scheduled read (D-109). */

const CHANGE_HOLD = 250; /* ms that a burst of changed() calls is folded into: four announcements a second at most, a quarter of a second of notice at worst (S3.2, D-124). */

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

  if (typeof v === "number") return { w: v >>> 0, a: 0 };
  if (v && typeof v.w === "number") return { w: v.w >>> 0, a: (v.a || 0) >>> 0 };
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

/* Has `counter` reached `mark`, in the circular sense of S5.3? `counter >= mark` is wrong at the only moment that matters. */
function reachedMark(counter, mark, stride) {
  return ((counter - mark) >>> 0) < stride;
}

function noteAdvCounter(counter) {
  if (reachedMark(counter, st.advMark, ADV_STRIDE)) {
    st.advMark = (counter + ADV_STRIDE) >>> 0;
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
  const counter = readUint(pl, n, n + 4);

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

/* Encode one object via the upstream BTHome module. */
function encodeOne(e, v) {
  const BTHome = require("BTHome"); // lazily, so this file loads under Node
  const n = BTHome.packetId;
  const adv = BTHome.getAdvertisement([{ type:e.type, v:v }]);
  BTHome.packetId = n;
  return adv[0xFCD2].slice(3);
}

/* The advertising options. */
function advOptions() {
  return { interval:st.advInterval, connectable:true, discoverable:true, whenConnected:st.whenConnected, showName:st.showName };
}

/* Hand the radio a packet, and keep the bytes it accepted (D-108). */
function publish(sd) {
  const opts = advOptions();
  try {
    NRF.setAdvertising({ 0xFCD2:sd }, opts);
    st.lastSd = sd;
  } catch (e) {

    let small = [st.plan.info, PKT_ID, st.packetId & 255];

    if (st.key) small = sealAdvertising(small);
    NRF.setAdvertising({ 0xFCD2:small }, Object.assign({}, opts, { showName:false }));

    st.lastSd = small;
    throw err("advertising_rejected", `the radio refused ${sd.length} bytes of service data: ${e.message}`);
  }
}

/* Rebuild and publish sensors, settings revision and declaration. */
function refreshAdvertising(cached) {
  st.packetId = (st.packetId + 1) & 255;
  let sd = renderServiceData(st.plan, st.packetId, cached ? null : encodeOne, st.entries, getTime() * 1000, st.revision);
  if (st.key) sd = sealAdvertising(sd);
  publish(sd);
}

/* Publish the packet already on air, at whatever rate is now set (D-108). */
function republishRate() {
  if (st.lastSd === null) refreshAdvertising();
  else publish(st.lastSd);
}

/* How long until the next advertised entry falls due, in milliseconds. */
function nextDue(now) {
  const ord = st.plan.ordered;
  let wait = null;
  for (let i = 0; i < ord.length; i++) {
    const it = ord[i];
    /* A clock that moved backwards leaves lastRead in the future. */
    if (it.lastRead > now) it.lastRead = now;
    const due = it.lastRead + (it.readInterval || st.interval) - now;
    if (wait === null || due < wait) wait = due;
  }
  return wait;
}

/* Arm the read timer for the next entry that falls due, or leave none armed. */
function schedule() {
  if (st.timer !== undefined) { clearTimeout(st.timer); st.timer = undefined; }
  const wait = nextDue(getTime() * 1000);
  if (wait === null) return;
  st.timer = setTimeout(wake, (wait > 0 ? wait : 0) + READ_SLACK);
}

/* What the timer calls, so that a wake always arms the next one. */
function wake() {
  try {
    tick();
  } catch (e) {

    if (st.onError) st.onError(e);
    st.timer = setTimeout(wake, st.interval + READ_SLACK);
  }
}

/* The periodic rebuild (D-106). */
function tick() {
  const moved = readDue(st.plan, encodeOne, st.entries, getTime() * 1000);
  if (moved) refreshAdvertising(true);

  schedule();
  return moved;
}

/* What a read of entry `w` returns. */
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

/* Run a reaction to a connection without letting it throw. */
function guarded(fn) {
  try { fn(); } catch (e) { if (st && st.onError) st.onError(e); }
}

/* Advertise fast while someone is plainly interacting. */
function goFast() {
  if (st.fastTimer !== undefined) { clearTimeout(st.fastTimer); st.fastTimer = undefined; }
  if (st.advInterval === st.fastInterval) return false;
  st.advInterval = st.fastInterval;
  return true;
}

function onConnect() {
  if (goFast()) republishRate();
}

function goIdleAfterTimeout() {
  if (st.fastTimer !== undefined) clearTimeout(st.fastTimer);
  st.fastTimer = setTimeout(() => {
    st.fastTimer = undefined;
    st.advInterval = st.interval;
    republishRate();
  }, st.fastTimeout);
}

/* Apply a write to entry k (S4.2). */
function handleWrite(k, pl) {
  const w = st.plan.writable[k - 1];

  if (!w) {
    if (st.onError) st.onError(err("entry_not_declared", `entry ${k} is not declared`));
    return;
  }

  let refused = null;
  try {
    st.entries[w.entryIndex].set(decodeValue(parseWrite(pl, w), w));
  } catch (e) {
    refused = e;
  }

  if (w.readable) setTimeout(() => { guarded(() => publishRead(w)); }, 0);
  if (refused) { if (st.onError) st.onError(refused); return; }

  guarded(() => {
    const faster = goFast();
    if (!tick() && faster) republishRate();
  });
}

/* The radio clamps anything outside 20..10000 silently. */
function checkInterval(name, v) {
  if (v < 20 || v > 10000) throw err("interval_out_of_range", `${name} is ${v}ms; the radio accepts 20 to 10000`);
  return v;
}

/* "231d.." or a 16-byte array -> the key. */
function toKey(v) {
  if (v === undefined || v === null) return null;

  if (typeof v !== "string") { const a = new Uint8Array(v); if (a.length !== 16) throw err("bindkey_length", `bindkey is ${a.length} bytes, expected 16`); return a; }
  if (v.length !== 32) throw err("bindkey_length", `bindkey is ${v.length} hex characters, expected 32`);
  for (let i = 0; i < 32; i++) {
    const c = v.charCodeAt(i) | 32; // folds A-F onto a-f and leaves 0-9 alone
    if (!((c >= 48 && c <= 57) || (c >= 97 && c <= 102)))
      throw err("bindkey_not_hex", `bindkey character ${i} ("${v[i]}") is not hexadecimal`);
  }
  const k = new Uint8Array(16);
  for (let i = 0; i < 16; i++) k[i] = parseInt(v.substr(i * 2, 2), 16);
  return k;
}

function setup(opts) {
  const entries = opts.advertise;
  const iv = checkInterval("interval", opts.interval || 2000);
  const key = toKey(opts.bindkey);
  const marks = key ? loadMarks() : { w: 0, a: 0 };
  /* The device's new state, built whole before the old one is let go. */
  const next = {
    entries : entries,
    key : key,
    mac : key ? macBytes() : null,

    advCounter : marks.a,
    advMark : (marks.a + ADV_STRIDE) >>> 0,

    writeCounter : marks.w,
    writeMark : marks.w,
    plan : planPacket(entries, encodeOne, iv, key !== null, opts.maxServiceData),

    revision : Math.floor(Math.random() * 256),
    showName : opts.showName !== false,
    packetId : 0,
    interval : iv,
    fastInterval : Math.max(100, checkInterval("fastInterval", opts.fastInterval || 100)),
    fastTimeout : opts.fastTimeout === undefined ? 30000 : opts.fastTimeout,
    maxWriteLength : opts.maxWriteLength || 128,
    whenConnected : opts.whenConnected !== false,
    onError : opts.onError || null,

    timer : undefined,
    fastTimer : undefined,

    changeTimer : undefined,
    advInterval : iv,

    lastSd : null
  };
  /* Only now, because everything above can throw (D-114). */
  if (st) {
    if (st.timer !== undefined) clearTimeout(st.timer);
    if (st.fastTimer !== undefined) clearTimeout(st.fastTimer);
    if (st.changeTimer !== undefined) clearTimeout(st.changeTimer);
  }
  st = next;
  /* Claim the stride now rather than when the counter reaches it. */
  if (key) saveMarks();
  if (st.plan.writable.length) {
    const chars = {}, svcs = {};

    if (opts.counterReport === true && key) chars[COUNTER_UUID] = counterCharacteristic();
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
  try {
    refreshAdvertising();
  } finally {
    /* Even when the radio refused that packet. */
    schedule();
    if (!listening) {
      NRF.on("connect", () => guarded(onConnect));
      NRF.on("disconnect", () => guarded(goIdleAfterTimeout));
      listening = true;
    }
  }
  return exports;
}

/* Re-read every sensor and re-advertise now. */
function update() {
  const ord = st.plan.ordered;
  for (let i = 0; i < ord.length; i++) ord[i].lastRead = 0;
  refreshAdvertising();
  schedule();
}

/* What the end of a burst of changed() calls does (D-124). */
function publishChange() {

  st.changeTimer = undefined;
  st.revision = (st.revision + 1) & 255;
  st.plan.writable.forEach(w => { if (w.readable) publishRead(w); });
  refreshAdvertising();
  schedule();
}

/* A writable value changed without a write - a knob, a button, a schedule. */
function changed() {

  if (!st.plan.settingsRevision) throw err("not_readable", "no writable entry has get(); nothing for a receiver to re-read");
  if (st.changeTimer !== undefined) return;
  st.changeTimer = setTimeout(() => guarded(publishChange), CHANGE_HOLD);
}

/* Change the advertising interval without re-running setup(). */
function setAdvertisingInterval(ms) {
  st.interval = checkInterval("interval", ms);
  const ord = st.plan.ordered;
  for (let i = 0; i < ord.length; i++) if (ord[i].inheritsInterval) ord[i].readInterval = st.interval;

  schedule();
  if (st.fastTimer === undefined && st.advInterval !== st.fastInterval) {
    st.advInterval = st.interval;
    republishRate();
  }
  return st.interval;
}

/* Change how long the fast window lasts. */
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
exports.DEVICE_INFO_PLAIN = DEV_INFO;
exports.DEVICE_INFO_ENCRYPTED = DEV_INFO_ENC;
exports.SERVICE_DATA_BUDGET = BUDGET;
exports.encodeDeclaration = encodeDeclaration;
exports.buildServiceData = buildServiceData;
exports.parseWrite = parseWrite;
exports.decodeValue = decodeValue;
exports.writableSpec = writableSpec;
exports.planPacket = planPacket;
exports.renderServiceData = renderServiceData;
exports.readSensor = readSensor;
exports.counterIsAhead = counterIsAhead;
exports.reachedMark = reachedMark;
exports.COUNTER_WINDOW = CTR_WINDOW;
