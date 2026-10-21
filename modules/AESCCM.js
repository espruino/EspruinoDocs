/* Copyright (c) 2026 Jean-Philippe Rey. See the file LICENSE for copying permission. */
/* AES-CCM, from the firmware's own where there is one.

   Generated from espruino/AESCCM.js in github.com/yerpj/bthome-writable, which carries
   the reasoning behind every line. Edit it there. */

/* AES-CCM authenticated encryption, built from Espruino's native AES. Some builds expose `AES.ccmEncrypt`/`AES.ccmDecrypt` directly (guarded by USE_AES_CCM); Puck.js is not one of them. */

/* global AES */
/* Espruino's own, and the only thing outside this file it depends on. */

/* Whether this firmware implements CCM itself. */
function native() {
  return typeof AES !== "undefined"
    && typeof AES.ccmEncrypt === "function"
    && typeof AES.ccmDecrypt === "function";
}

function bytes(v) {
  return v instanceof Uint8Array ? v : new Uint8Array(v);
}

/* The firmware's result, normalised to this module's {data, mic}. */
function fromNative(r) {
  var tag = r && (r.tag !== undefined ? r.tag : r.mic);
  if (!r || r.data === undefined || tag === undefined) {
    throw new Error("AES.ccmEncrypt returned " + JSON.stringify(r) + ", expected {data, tag}");
  }
  return { data: bytes(r.data), mic: bytes(tag) };
}

/* Which path a board is taking, so a device can say so rather than be guessed about. */
exports.usingNative = native;

var CHUNK = 32; // bytes per AES call: two blocks, small enough to be reliable
var buf = new Uint8Array(CHUNK); // built once, while the heap is unfragmented
var ZERO = new Uint8Array(16);

/* One AES call, with the failure the docs do not mention made explicit. */
function aes(data, key, options) {
  var r = AES.encrypt(data, key, options);
  if (r === undefined) throw new Error("AES returned nothing: no contiguous memory");
  return new Uint8Array(r);
}

/* Fill `slot` of the scratch buffer with block `index` of B0 || plaintext. */
function macBlock(slot, index, pt, nonce, M, L) {
  var at = slot * 16, i;
  buf.fill(0, at, at + 16); // native: a JS loop over 16 bytes costs more than the AES
  if (index === 0) {
    buf[at] = ((M - 2) / 2) << 3 | (L - 1);
    buf.set(nonce, at + 1);
    for (i = 0; i < L; i++) buf[at + 15 - i] = (pt.length >> (8 * i)) & 255;
  } else {
    var start = (index - 1) * 16;
    buf.set(pt.subarray(start, Math.min(start + 16, pt.length)), at);
  }
}

/* The CBC-MAC over B0 || padded plaintext, in chunks, chaining through the IV. */
function tagOf(key, pt, nonce, M, L) {
  var total = Math.ceil(pt.length / 16) + 1;
  var carry = ZERO, index = 0;
  while (index < total) {
    var count = Math.min(2, total - index);
    for (var slot = 0; slot < count; slot++) {
      macBlock(slot, index + slot, pt, nonce, M, L);
    }
    var out = aes(buf.subarray(0, count * 16), key, {iv: carry, mode: "CBC"});
    carry = out.subarray(out.length - 16);
    index += count;
  }
  return carry;
}

/* E(A_index) .. */
function counters(key, nonce, L, index, count) {
  for (var slot = 0; slot < count; slot++) {
    var at = slot * 16, i;
    buf.fill(0, at, at + 16);
    buf[at] = L - 1;
    buf.set(nonce, at + 1);
    for (i = 0; i < L; i++) buf[at + 15 - i] = ((index + slot) >> (8 * i)) & 255;
  }
  return aes(buf.subarray(0, count * 16), key, {mode: "ECB"});
}

/* XOR the keystream over `data`, and hand back E(A_0) for the tag mask. */
function stream(data, source, key, nonce, L) {
  var blocks = Math.ceil(source.length / 16), s0 = null, index = 0;
  while (index <= blocks) {
    var count = Math.min(2, blocks + 1 - index);
    var s = counters(key, nonce, L, index, count);
    for (var slot = 0; slot < count; slot++) {
      if (index + slot === 0) { s0 = s.subarray(0, 16); continue; }
      var start = (index + slot - 1) * 16;
      var end = Math.min(start + 16, source.length);
      for (var j = start; j < end; j++) data[j] = source[j] ^ s[slot * 16 + j - start];
    }
    index += count;
  }
  return s0;
}

exports.encrypt = function (pt, key, nonce, M) {
  if (M === undefined) M = 4;
  if (native()) return fromNative(AES.ccmEncrypt(pt, key, nonce, M));
  var L = 15 - nonce.length;
  var tag = tagOf(key, pt, nonce, M, L);
  var data = new Uint8Array(pt.length);
  var s0 = stream(data, pt, key, nonce, L);
  var mic = new Uint8Array(M);
  for (var i = 0; i < M; i++) mic[i] = tag[i] ^ s0[i];
  return { data: data, mic: mic };
};

/* Returns the plaintext, or null if the MIC does not match. */
exports.decrypt = function (ct, key, nonce, mic) {
  if (native()) {
    var answer = AES.ccmDecrypt(ct, key, nonce, mic);

    return answer === null || answer === undefined ? null : bytes(answer);
  }
  var M = mic.length, L = 15 - nonce.length, i;

  var pt = new Uint8Array(ct.length);
  var s0 = stream(pt, ct, key, nonce, L);
  var tag = tagOf(key, pt, nonce, M, L);

  var diff = 0;
  for (i = 0; i < M; i++) diff |= (tag[i] ^ s0[i]) ^ mic[i];
  return diff ? null : pt;
};
