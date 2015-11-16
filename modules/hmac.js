/* Copyright (c) 2015 Mikael Ganehag Brorsson. See the file LICENSE for copying permission. */
/*
Small module to add HMAC support. Depends on 'hashlib'.
*/

function hmac(key, message, digestmod) {
  if (digestmod == null) {
    digestmod = hashlib.sha256;
  }

  this.finished = false;
  this.inner = digestmod();
  this.outer = digestmod();

  var i, pad = new Uint8Array(this.inner.block_size);

  if (key.length > this.inner.block_size) {
    var h = (new digestmod()).update(k),
        ah = E.toBufferArray(h.digest());

    for(i = 0; i < ah.length; i++) {
      pad[i] = ah[i].charCodeAt(0);
    }
  }
  else {
    for (i = 0; i < key.length; i++) {
      pad[i] = key[i].charCodeAt(0);
    }
  }
      
  for (i = 0; i < pad.length; i++) {
    pad[i] ^= 0x36;
  }
  this.inner.update(String.fromCharCode.apply(null, pad));

  for (i = 0; i < pad.length; i++) {
    pad[i] ^= 0x36 ^ 0x5c;
  }
  this.outer.update(String.fromCharCode.apply(null, pad));

  for (i = 0; i < pad.length; i++) {
    pad[i] = 0;
  }

  if(message) {
    this.inner.update(message);
  }
}

hmac.prototype.update = function(m) {
  if(m) {
    this.finished = false;
    this.inner.update(m);  
  }
  return this;
};

hmac.prototype.digest = function() {
  if(!this.finished) {
    this.outer.update(this.inner.digest())
    this.finished = true;
  }
  return this.outer.digest();
};

hmac.prototype.hexdigest = function() {
  var i, v, s = "", h = this.digest();
  for(i = 0; i < h.length; i++)
    s += (256+h.charCodeAt(i)).toString(16).substr(-2);
  return s;
};

exports.create = function(key, message, digestmod) {
  return new hmac(key, message, digestmod);
}

/**
  compare_digest(a, b) -> bool
        
  Return 'a == b'.  This function uses an approach designed to prevent
  timing analysis, making it appropriate for cryptography.
  a and b must both be of the same type.
  
  Note: If a and b are of different lengths, or if an error occurs,
  a timing attack could theoretically reveal information about the
  types and lengths of a and b--but not their values.
*/
exports.compare_digest = function(a, b) {
  var match, i;

  if(a.length != b.length) {
    return false;
  }

  match = 0;
  for(i = 0; i < a.length; i++) {
    match |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return match == 0;
};
