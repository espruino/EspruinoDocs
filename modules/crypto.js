/* Copyright (c) 2016 Rhys Williams, @jumjum. See the file LICENSE for copying permission. */
/* Most boards have 'crypto' built in, but some don't. If they don't then
this module contains SHA1, which is needed for websocket support. */
exports.SHA1=function(msg){
  function f(s, x, y, z)  {
    if(s===0) return (x & y) ^ (~x & z);
    else if(s===1) return  x ^ y  ^  z;
    else if(s===2) return (x & y) ^ (x & z) ^ (y & z);
    else return x ^ y  ^  z;
  }
  function split(n){
    for(i=3; i>=0;i--){
      M.push((n>>(i*8)) & 0xff);
    }
  }
  var K,N,M,i,j,H0,H1,H2,H3,H4;
  var W,a,b,c,d,e,s,T;
  var flt = 0xffffffff;
  msg = E.toString(msg)+'\x80';
  K = new Int32Array([ 0x5a827999, 0x6ed9eba1, 0x8f1bbcdc, 0xca62c1d6 ]);
  N = Math.ceil((msg.length/4 + 2)/16);
  M = new Array(N);
  msg = E.toUint8Array(msg);
  for (i=0; i<N; i++) {
    a = i <<6;
    c = new Int32Array(16);
    for(j=0;j<16;j++){
      b = a +(j<<2);
      c[j] = (msg[b]<<24) | (msg[b+1]<<16) | (msg[b+2]<<8) | (msg[b+3]);
    }
    M[i] = c;
  }
  M[N-1][14] = ((msg.length-1)*8) / Math.pow(2, 32); M[N-1][14] = Math.floor(M[N-1][14]);
  M[N-1][15] = ((msg.length-1)*8) & flt;
  H0 = 0x67452301;H1 = 0xefcdab89;H2 = 0x98badcfe;H3 = 0x10325476;H4 = 0xc3d2e1f0;
  W = new Int32Array(80);
  for (i=0; i<N; i++) {
    for (j=0;  j<16; j++) W[j] = M[i][j];
    for (j=16; j<80; j++){
      a = W[j-3] ^ W[j-8] ^ W[j-14] ^ W[j-16];
      W[j] = (a<<1)|(a>>>31);
    }
    a = H0; b = H1; c = H2; d = H3; e = H4;
    for (j=0; j<80; j++) {
      s = Math.floor(j/20);
      T = (((a<<5) | (a>>>27)) + f(s,b,c,d) + e + K[s] + W[j]) & flt;
      e = d; d = c; c = (b<<30) | (b>>>2);b = a;a = T;
    }
    H0 = (H0 + a) & flt;H1 = (H1 + b) & flt; H2 = (H2 + c) & flt;
    H3 = (H3 + d) & flt;H4 = (H4 + e) & flt;
  }
  M = [];
  split(H0);split(H1);split(H2);split(H3);split(H4);
  return E.toUint8Array(M).buffer;
};
