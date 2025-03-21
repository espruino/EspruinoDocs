/*
Copyright (c) 2025 Simon Sievert
SPDX-License-Identifier: MIT
*/

/*
Library for working with the [Quite Ok Audio Format (QOA)](https://qoaformat.org).
*/

let qoa = E.compiledC(`
//int SAMPLES_PER_FRAME()
//int ENCODED_FRAME_SIZE_BYTES()
//int MIN_FILESIZE()
//int DECODER_STATE_SIZE()
//void set_decoder_state_buf(int)
//void set_use_16_bit(bool)
//bool get_use_16_bit()
//int get_last_frame_len()
//void fill_with_silence(int, int)
//int decode_header(int, int)
//int get_sample_rate()
//int get_total_samples()
//int decode_frame(int, int, int)
//void copy_data(int, int, int)
//void clear_buf(int, int)

typedef signed char int8_t;
typedef unsigned char uint8_t;
typedef signed short int16_t;
typedef unsigned short uint16_t;
typedef signed int int32_t;
typedef unsigned int uint32_t;

typedef unsigned int size_t;

/*
 * Copyright (c) 2023, Dominic Szablewski - https://phoboslab.org
 * SPDX-License-Identifier: MIT
 *
 * QOA - The "Quite OK Audio" format for fast, lossy audio compression
 */


static const uint32_t QOA_MIN_FILESIZE = 16;
static const uint32_t QOA_MAX_CHANNELS = 8;

static const uint32_t QOA_SLICE_LEN = 20;
static const uint32_t QOA_SLICES_PER_FRAME = 256;
static const uint32_t QOA_FRAME_LEN = (QOA_SLICES_PER_FRAME * QOA_SLICE_LEN);
static const uint32_t QOA_LMS_LEN = 4;
static const uint32_t QOA_MAGIC = 0x716f6166; /* 'qoaf' */

uint32_t QOA_FRAME_SIZE(uint32_t channels, uint32_t slices) {
  return 8 + QOA_LMS_LEN * 4 * channels + 8 * slices * channels;
}

typedef struct {
  int history[QOA_LMS_LEN];
  int weights[QOA_LMS_LEN];
} qoa_lms_t;

typedef struct {
  unsigned int channels;
  unsigned int samplerate;
  unsigned int samples;
  qoa_lms_t lms[QOA_MAX_CHANNELS];
} qoa_desc;

unsigned int qoa_decode_header(const unsigned char *bytes, int size, qoa_desc *qoa);

unsigned int qoa_decode_frame(const unsigned char *bytes, unsigned int size, qoa_desc *qoa, short *sample_data, unsigned int *frame_len);


/* -----------------------------------------------------------------------------
    Implementation */

typedef unsigned long long qoa_uint64_t;

/* The dequant_tab maps each of the scalefactors and quantized residuals to
their unscaled & dequantized version.

Since qoa_div rounds away from the zero, the smallest entries are mapped to 3/4
instead of 1. The dequant_tab assumes the following dequantized values for each
of the quant_tab indices and is computed as:
float dqt[8] = {0.75, -0.75, 2.5, -2.5, 4.5, -4.5, 7, -7};
dequant_tab[s][q] <- round_ties_away_from_zero(scalefactor_tab[s] * dqt[q])

The rounding employed here is "to nearest, ties away from zero",  i.e. positive
and negative values are treated symmetrically.
*/

// note: this is a modified version that uses a quarter of the storage the original one used

static const int16_t qoa_dequant_tab[16][4] = {
  {  1,     3,    5,     7},
  {  5,    18,   32,    49},
  { 16,    53,   95,   147},
  { 34,   113,  203,   315},
  { 63,   210,  378,   588},
  { 104,  345,  621,   966},
  { 158,  528,  950,  1477},
  { 228,  760, 1368,  2128},
  { 316, 1053, 1895,  2947},
  { 422, 1405, 2529,  3934},
  { 548, 1828, 3290,  5117},
  { 696, 2320, 4176,  6496},
  { 868, 2893, 5207,  8099},
  {1064, 3548, 6386,  9933},
  {1286, 4288, 7718, 12005},
  {1536, 5120, 9216, 14336},
};


/* The Least Mean Squares Filter is the heart of QOA. It predicts the next
sample based on the previous 4 reconstructed samples. It does so by continuously
adjusting 4 weights based on the residual of the previous prediction.

The next sample is predicted as the sum of (weight[i] * history[i]).

The adjustment of the weights is done with a "Sign-Sign-LMS" that adds or
subtracts the residual to each weight, based on the corresponding sample from
the history. This, surprisingly, is sufficient to get worthwhile predictions.

This is all done with fixed point integers. Hence the right-shifts when updating
the weights and calculating the prediction. */

static int qoa_lms_predict(qoa_lms_t *lms) {
  int prediction = 0;
  for (int i = 0; i < QOA_LMS_LEN; i++) {
    prediction += lms->weights[i] * lms->history[i];
  }
  return prediction >> 13;
}

static void qoa_lms_update(qoa_lms_t *lms, int sample, int residual) {
  int delta = residual >> 4;
  for (int i = 0; i < QOA_LMS_LEN; i++) {
    lms->weights[i] += lms->history[i] < 0 ? -delta : delta;
  }

  for (int i = 0; i < QOA_LMS_LEN - 1; i++) {
    lms->history[i] = lms->history[i + 1];
  }
  lms->history[QOA_LMS_LEN - 1] = sample;
}

static inline int qoa_clamp(int v, int min, int max) {
  if (v < min) { return min; }
  if (v > max) { return max; }
  return v;
}

/* This specialized clamp function for the signed 16 bit range improves decode
performance quite a bit. The extra if() statement works nicely with the CPUs
branch prediction as this branch is rarely taken. */

static inline int qoa_clamp_s16(int v) {
  if ((unsigned int) (v + 32768) > 65535) {
    if (v < -32768) { return -32768; }
    if (v > 32767) { return 32767; }
  }
  return v;
}

static inline qoa_uint64_t qoa_read_u64(const unsigned char *bytes, unsigned int *p) {
  bytes += *p;
  *p += 8;
  return ((qoa_uint64_t) (bytes[0]) << 56) | ((qoa_uint64_t) (bytes[1]) << 48) | ((qoa_uint64_t) (bytes[2]) << 40) |
         ((qoa_uint64_t) (bytes[3]) << 32) | ((qoa_uint64_t) (bytes[4]) << 24) | ((qoa_uint64_t) (bytes[5]) << 16) |
         ((qoa_uint64_t) (bytes[6]) << 8) | ((qoa_uint64_t) (bytes[7]) << 0);
}


/* -----------------------------------------------------------------------------
    Decoder */

unsigned int qoa_decode_header(const unsigned char *bytes, int size, qoa_desc *qoa) {
  unsigned int p = 0;
  if (size < QOA_MIN_FILESIZE) {
    return 0;
  }


  /* Read the file header, verify the magic number ('qoaf') and read the
  total number of samples. */
  qoa_uint64_t file_header = qoa_read_u64(bytes, &p);

  if ((file_header >> 32) != QOA_MAGIC) {
    return 0;
  }

  qoa->samples = file_header & 0xffffffff;
  if (!qoa->samples) {
    return 0;
  }

  /* Peek into the first frame header to get the number of channels and
  the samplerate. */
  qoa_uint64_t frame_header = qoa_read_u64(bytes, &p);
  qoa->channels = (frame_header >> 56) & 0x0000ff;
  qoa->samplerate = (frame_header >> 32) & 0xffffff;

  if (qoa->channels == 0 || qoa->samples == 0 || qoa->samplerate == 0) {
    return 0;
  }

  return 8;
}

unsigned int qoa_decode_frame(const unsigned char *bytes, unsigned int size, qoa_desc *qoa, uint8_t *sample_data, unsigned int *frame_len, bool use16Bit) {
  unsigned int p = 0;
  *frame_len = 0;

  if (size < 8 + QOA_LMS_LEN * 4 * qoa->channels) {
    return 0;
  }

  /* Read and verify the frame header */
  qoa_uint64_t frame_header = qoa_read_u64(bytes, &p);
  unsigned int channels = (frame_header >> 56) & 0x0000ff;
  unsigned int samplerate = (frame_header >> 32) & 0xffffff;
  unsigned int samples = (frame_header >> 16) & 0x00ffff;
  unsigned int frame_size = (frame_header) & 0x00ffff;

  unsigned int data_size = frame_size - 8 - QOA_LMS_LEN * 4 * channels;
  unsigned int num_slices = data_size / 8;
  unsigned int max_total_samples = num_slices * QOA_SLICE_LEN;

  if (channels != qoa->channels || samplerate != qoa->samplerate || frame_size > size ||
      samples * channels > max_total_samples) {
    return 0;
  }


  /* Read the LMS state: 4 x 2 bytes history, 4 x 2 bytes weights per channel */
  for (unsigned int c = 0; c < channels; c++) {
    qoa_uint64_t history = qoa_read_u64(bytes, &p);
    qoa_uint64_t weights = qoa_read_u64(bytes, &p);
    for (int i = 0; i < QOA_LMS_LEN; i++) {
      qoa->lms[c].history[i] = ((signed short) (history >> 48));
      history <<= 16;
      qoa->lms[c].weights[i] = ((signed short) (weights >> 48));
      weights <<= 16;
    }
  }


  /* Decode all slices for all channels in this frame */
  for (unsigned int sample_index = 0; sample_index < samples; sample_index += QOA_SLICE_LEN) {
    for (unsigned int c = 0; c < channels; c++) {
      qoa_uint64_t slice = qoa_read_u64(bytes, &p);

      int scalefactor = (slice >> 60) & 0xf;
      slice <<= 4;

      int slice_start = sample_index * channels + c;
      int slice_end = qoa_clamp(sample_index + QOA_SLICE_LEN, 0, samples) * channels + c;

      for (int si = slice_start; si < slice_end; si += channels) {
        int predicted = qoa_lms_predict(&qoa->lms[c]);
        int quantized = (slice >> 61) & 0x7;
        int dequantized = qoa_dequant_tab[scalefactor][quantized / 2];
        if (quantized % 2 == 1) {
          dequantized = -dequantized;
        }
        int reconstructed = qoa_clamp_s16(predicted + dequantized);

        if (use16Bit) {
          uint16_t value = (uint16_t) reconstructed ^ 0x8000;
          ((uint16_t*)sample_data)[si] = value;
        } else {
          uint8_t value = ((uint16_t) reconstructed ^ 0x8000) >> 8;
          sample_data[si] = value;
        }
        slice <<= 3;

        qoa_lms_update(&qoa->lms[c], reconstructed, dequantized);
      }
    }
  }

  *frame_len = samples;
  return p;
}


/*
 * Wrapper for calling stuff from Espruino
 */

int SAMPLES_PER_FRAME() { return (int) QOA_FRAME_LEN; }

int ENCODED_FRAME_SIZE_BYTES() { return (int) QOA_FRAME_SIZE(1, QOA_SLICES_PER_FRAME); }

int MIN_FILESIZE() { return (int) QOA_MIN_FILESIZE; }

typedef struct decoder_state {
  qoa_desc qoaState{};
  bool use16Bit = false;
  unsigned int lastFrameLen = 0;
};

struct decoder_state *decoderState = 0;

int DECODER_STATE_SIZE() { return sizeof(struct decoder_state); }

void set_decoder_state_buf(uint8_t *buf) { decoderState = (struct decoder_state *) buf; }

void set_use_16_bit(bool use16Bit) {
  if (decoderState == 0) {
    return;
  }
  decoderState->use16Bit = use16Bit;
}

bool get_use_16_bit() {
  if (decoderState == 0) {
    return false;
  }
  return decoderState->use16Bit;
}

int get_last_frame_len() {
  if (decoderState == 0) {
    return -1;
  }
  return (int) (decoderState->lastFrameLen);
}

void fill_with_silence(uint8_t *bytes, int numSamples) {
  if (decoderState == 0) {
    return;
  }
  if (decoderState->use16Bit) {
    for (size_t i = 0; i < numSamples; i++) {
      ((uint16_t *) bytes)[i] = 1 << 15;
    }
  } else {
    for (size_t i = 0; i < numSamples; i++) {
      bytes[i] = 1 << 7;
    }
  }
}

int decode_header(const unsigned char *bytes, int size) {
  if (decoderState == 0) {
    return -1;
  }
  return (int) qoa_decode_header(bytes, size, &(decoderState->qoaState));
}

int get_sample_rate() {
  if (decoderState == 0) {
    return -1;
  }
  return (int) decoderState->qoaState.samplerate;
}

int get_total_samples() {
  if (decoderState == 0) {
    return -1;
  }
  return (int) decoderState->qoaState.samples;
}

int decode_frame(const unsigned char *bytes, unsigned int size, uint8_t *sample_data) {
  if (decoderState == 0) {
    return -1;
  }
  return (int) qoa_decode_frame(bytes, size, &(decoderState->qoaState), sample_data, &(decoderState->lastFrameLen),
                                decoderState->use16Bit);
}

void copy_data(uint8_t *dest, const uint8_t *src, const int numBytes) {
  for (int i = 0; i < numBytes; i++) {
    dest[i] = src[i];
  }
}

void clear_buf(uint8_t *buf, const int numBytes) {
  for (int i = 0; i < numBytes; i++) {
    buf[i] = 0;
  }
}
`);

exports.SAMPLES_PER_FRAME = qoa.SAMPLES_PER_FRAME();
exports.ENCODED_FRAME_SIZE_BYTES = qoa.ENCODED_FRAME_SIZE_BYTES();
exports.MIN_FILESIZE = qoa.MIN_FILESIZE();

exports.DECODER_STATE_SIZE = qoa.DECODER_STATE_SIZE();

exports.initDecode = function (headerBuf, options) {
  options = options || {};

  let decoderStateBuf;
  // allow reusing decoder state buffer
  if (options.state !== undefined) {
    if (options.state.length != exports.DECODER_STATE_SIZE) {
      throw new Error("Passed decoder state buffer has wrong size");
    }
    decoderStateBuf = options.state;
  } else {
    decoderStateBuf = new Uint8Array(exports.DECODER_STATE_SIZE);
    if (decoderStateBuf === undefined) {
      throw new Error("Failed to allocate decoder state buffer");
    }
  }
  let decoderStateBufPtr = E.getAddressOf(decoderStateBuf, true);
  if (decoderStateBufPtr == 0) throw new Error("Failed to get pointer to decoder state buffer");
  qoa.clear_buf(decoderStateBufPtr, exports.DECODER_STATE_SIZE);
  qoa.set_decoder_state_buf(decoderStateBufPtr);

  let use16Bit = false;
  if (options.bits !== undefined) {
    use16Bit = options.bits == 16;
  }
  qoa.set_use_16_bit(use16Bit);

  let headerBufPtr = E.getAddressOf(headerBuf, true);
  if (headerBufPtr == 0) throw new Error("Failed to get pointer to header data buffer. Maybe not a flat string?");
  let firstFramePos = qoa.decode_header(headerBufPtr, headerBuf.length);
  if (firstFramePos <= 0) {
    throw new Error("Failed to decode header");
  }
  let sampleRate = qoa.get_sample_rate();
  let totalSamples = qoa.get_total_samples();
  let durationSeconds = totalSamples / sampleRate;
  return {
    state: decoderStateBuf,
    firstFramePos: firstFramePos,
    sampleRate: sampleRate,
    totalSamples: totalSamples,
    durationSeconds: durationSeconds
  };
};

exports.decode = function (encoded, decoded, state, options) {
  options = options || {};

  if (state.length != exports.DECODER_STATE_SIZE) {
    throw new Error("Passed decoder state buffer has wrong size");
  }
  let statePtr = E.getAddressOf(state, true);
  if (statePtr == 0) throw new Error("Failed to get pointer to decoder state buffer");
  qoa.set_decoder_state_buf(statePtr);

  let fill = false;
  if (options.fill) {
    fill = true;
  }

  let encodedPtr = E.getAddressOf(encoded, true);
  if (encodedPtr == 0) throw new Error("Failed to get pointer to encoded data buffer. Maybe not a flat string?");
  let decodedPtr = E.getAddressOf(decoded, true);
  if (decodedPtr == 0) throw new Error("Failed to get pointer to decoded data buffer. Maybe not a flat string?");

  let bytesPerSample = qoa.get_use_16_bit() ? 2 : 1;
  if (decoded.length < exports.SAMPLES_PER_FRAME * bytesPerSample) throw new Error("Decoded data buffer is not big enough to hold one frame");

  let readBytes = qoa.decode_frame(encodedPtr, encoded.length, decodedPtr);
  if (readBytes < 0) throw new Error("Failed to decode frame");
  let writtenSamples = qoa.get_last_frame_len();
  if (fill && writtenSamples * bytesPerSample < decoded.length) {
    qoa.fill_with_silence(decodedPtr + writtenSamples * bytesPerSample, (decoded.length / bytesPerSample) - writtenSamples);
  }
  return {readBytes: readBytes, writtenSamples: writtenSamples};
};

exports.play = function (filename, options) {
  options = options || {};

  let bytesPerSample = options.bytesPerSample !== undefined ? options.bytesPerSample : 1;
  if ((bytesPerSample != 1) && (bytesPerSample != 2)) {
    throw new Error("Invalid bytes per sample, can only be either 1 or 2, but you passed: " + bytesPerSample);
  }
  let loop = options.loop !== undefined ? options.loop : false;
  let loopCount = options.loopCount !== undefined ? options.loopCount : -1;

  let bitsPerSample = bytesPerSample * 8;

  let s = require("Storage");
  let headerBuf = E.toFlatString(s.read(filename, 0, exports.MIN_FILESIZE));
  if (headerBuf === undefined) throw new Error("Failed to allocate buffer for header data");

  let initResult = exports.initDecode(headerBuf, {bits: bitsPerSample});
  headerBuf = undefined;

  let state = initResult.state;
  let firstFramePos = initResult.firstFramePos;
  let sampleRate = initResult.sampleRate;
  let durationSeconds = initResult.durationSeconds;

  let p = firstFramePos;

  let decodedDataBuf = new Uint8Array(exports.SAMPLES_PER_FRAME * bytesPerSample);
  if (decodedDataBuf === undefined) throw new Error("Failed to allocate decoded data buffer");
  let decodedDataBufPtr = E.getAddressOf(decodedDataBuf, true);
  if (decodedDataBufPtr == 0) throw new Error("Failed to get address of decoded data buffer");
  let decodedDataBufSize = 0;
  let decodedDataBufIndex = 0;

  let decodeFrame = function () {
    let encoded = E.toFlatString(s.read(filename, p, exports.ENCODED_FRAME_SIZE_BYTES));
    let decodeResult = exports.decode(encoded, decodedDataBuf, state);
    p += decodeResult.readBytes;
    decodedDataBufSize = decodeResult.writtenSamples * bytesPerSample;
    decodedDataBufIndex = 0;
    return decodeResult.writtenSamples;
  };

  let nextBuffer = function (buf) {
    let bufPtr = E.getAddressOf(buf, true);
    if (bufPtr == 0) throw new Error("Failed to get address of decoded data buffer");
    let bufIndex = 0;
    let bufSizeBytes = buf.length * bytesPerSample;
    while (bufIndex < bufSizeBytes) {
      let alreadyDecodedBytes = decodedDataBufSize - decodedDataBufIndex;
      if (alreadyDecodedBytes > 0) {
        let neededBytes = bufSizeBytes - bufIndex;
        let copyBytes = alreadyDecodedBytes < neededBytes ? alreadyDecodedBytes : neededBytes;
        qoa.copy_data(bufPtr + bufIndex, decodedDataBufPtr + decodedDataBufIndex, copyBytes);
        decodedDataBufIndex += copyBytes;
        bufIndex += copyBytes;
      } else {
        let decodedSamples = decodeFrame();
        if (decodedSamples == 0) {
          // no more samples
          if (loopCount > 0) {
            loopCount--;
          }
          if (loop && (loopCount == 0)) {
            loop = false;
          }
          if (loop) {
            p = firstFramePos;
          } else {
            if (bufIndex < bufSizeBytes) {
              qoa.fill_with_silence(bufPtr + bufIndex, (bufSizeBytes - bufIndex) / bytesPerSample);
            }
            return bufIndex;
          }
        }
      }
    }
    return bufIndex;
  };

  let outputType = options.output !== undefined ? options.output : "waveform";
  let outputOptions = options.outputOptions || {};

  if (outputType == "waveform") {
    let w = new Waveform(2048 * bytesPerSample, {doubleBuffer: true, bits: bitsPerSample});
    if (outputOptions.pin == undefined) {
      throw new Error("missing output option: pin");
    }
    let outPin = outputOptions.pin;
    let outPinNeg = outputOptions.pin_neg !== undefined ? outputOptions.pin_neg : undefined;
    analogWrite(outPin, 0.5, {freq: sampleRate * 10});
    if (outPinNeg !== undefined) {
      analogWrite(outPinNeg, 0.5, {freq: sampleRate * 10});
    }

    nextBuffer(w.buffer);
    nextBuffer(w.buffer2);

    let stopOnNextBufferCallback = false;
    w.on("buffer", (buf) => {
      let writtenSamples = nextBuffer(buf);
      if (stopOnNextBufferCallback) {
        w.stop();
      }
      if (writtenSamples == 0) {
        stopOnNextBufferCallback = true;
      }
    });

    w.on("finish", () => {
      outPin.read();
      if (outPinNeg !== undefined) {
        outPinNeg.read();
      }
      if (options.onFinish !== undefined) {
        options.onFinish();
      }
    });

    w.startOutput(outPin, sampleRate, {pin_neg: outPinNeg, repeat: true});

    return {
      durationSeconds: durationSeconds,
      stop: () => {
        w.stop();
      }
    };
  } else {
    throw new Error("Unknown output type: " + outputType);
  }
};
