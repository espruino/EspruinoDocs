<!--- Copyright (c) 2025 Simon Sievert. See the file LICENSE for copying permission. -->
QOA Library
==============

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/QOA. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,Modules,QOA,Audio,Sound
* USES: Waveform,Speaker

Library for working with the [Quite Ok Audio Format (QOA)](https://qoaformat.org).

QOA does reasonably fast lossy audio compression at 3.2 bits per sample.

This library currently supports decoding QOA-encoded audio on any board that you can upload inline C to.  
Sound can then be played back with the [[Waveform]] class.

Encode some audio
-----------------

To encode some audio, you can either use the form on this web page and let your browser do the heavy lifting,
or compile and use the [reference encoder](https://github.com/phoboslab/qoa).

Using the in-browser method is rather straightforward:  
Just select a file and a "download" popup should appear a moment later (everything runs locally in your browser).  
This downsamples your audio file to the selected sample rate (default is 8000 Hz), converts it to mono and encodes it.

<table>
    <tbody>
    <tr>
        <td><label for="fileInput">Audio File:</label></td>
        <td><input id="fileInput" type="file"></td>
    </tr>
    <tr>
        <td><label for="sampleRateInput">Sample Rate (Hz):</label></td>
        <td><input id="sampleRateInput" type="number" value="8000"></td>
    </tr>
    </tbody>
</table>

Using the reference encoder is a bit more work, mainly because you need to compile it
and downsample and covert your audio to mono before passing it to the encoder yourself.

Starting with an audio file "audio.mp3", you can create a QOA file,
using ffmpeg to do the downsampling and mono conversion,
like this:

```bash
ffmpeg -i audio.mp3 -ar 8000 -ac 1 audio.wav
./qoaconv audio.wav audio.qoa
```

Decoding and playback
---------------------

To play a file called "audio.qoa" from storage on Jolt.js, using the Waveform class, with a speaker connected to `H0` and `H1`, you can do:

```js
let qoa = require("QOA");
let handle = qoa.play("audio.qoa", {output: "waveform", outputOptions: {pin: H0, pin_neg: H1}});
```

The `handle` is an object of the form:
- `durationSeconds` - integer, duration of the audio in seconds
- `stop` - function, can be called to stop playback

You can also loop the file three times, and do something once playback finishes:

```js
let qoa = require("QOA");
let handle = qoa.play("audio.qoa", {loop:1, loopCount: 3, output: "waveform", outputOptions: {pin: H0, pin_neg: H1}, onFinish: () => {print("playback finished");}});
```

The `play()` function accepts the following arguments:
- `filename` - string, name of a file that can be read from storage
- `options` - object, containing additional options
  - `output` - string, name of the output method to use; currently only "waveform" is supported
  - `outputOptions` - object, additional options for the output method
    - in the case of `output: "waveform"`:
      - `pin`: pin, speaker pin; like for example `H0` on Jolt.js
      - `pin_neg`: pin, optional second speaker pin; like for example `H1` on Jolt.js
  - `loop` - boolean, whether to automagically restart playback at the beginning once it reaches the end of the file
  - `loopCount` - integer, optional number of times to loop the audio; minimum is one, default is to loop forever
  - `bytesPerSample` - integer, default is `1`, but you can also use `2` for 16 bits per sample mode (which might sound better, but will use more RAM)
  - `onFinish` - function, will be called when playback is done

You need to give it at least a filename, and a `pin`.

If something goes wrong, `play()` will throw an exception.

If you want to do the decoding yourself, for example to output audio using something other than the Waveform class, you are free to do so, but it's a tad more involved:

```js
let qoa = require("QOA");
let filename = "audio.qoa";

let play = function () {
    let bytesPerSample = 1;
    
    let bitsPerSample = bytesPerSample * 8;

    let s = require("Storage");
    
    let headerBuf = E.toFlatString(s.read(filename, 0, qoa.MIN_FILESIZE));
    if (headerBuf === undefined) throw new Error("Failed to allocate buffer for header data");
    let initResult = qoa.initDecode(headerBuf, {bits: bitsPerSample});
    headerBuf = undefined;
    
    let state = initResult.state;
    let firstFramePos = initResult.firstFramePos;
    let sampleRate = initResult.sampleRate;
    let durationSeconds = initResult.durationSeconds;

    // you are free to choose another buffer size,
    // but since QOA is decoded in frames with qoa.SAMPLES_PER_FRAME samples each,
    // sizing your buffer accordingly makes things slightly less complicated
    // hint: the qoa.play() function uses a different buffer size, to allow gapless looping
    let bufferSize = qoa.SAMPLES_PER_FRAME * bytesPerSample;
    let w = new Waveform(bufferSize, {doubleBuffer: true, bits: bitsPerSample});
    analogWrite(H0, 0.5, {freq: sampleRate * 10});
    analogWrite(H1, 0.5, {freq: sampleRate * 10});
    
    let p = firstFramePos;
    let nextBuffer = function (buf) {
        let encoded = E.toFlatString(s.read(filename, p, qoa.ENCODED_FRAME_SIZE_BYTES));
        // decode into buf, filling leftover space with silence
        let decodeResult = qoa.decode(encoded, buf, state, {fill: 1});
        p += decodeResult.readBytes;
        return decodeResult.writtenSamples;
    };

    // fill buffers with initial data
    nextBuffer(w.buffer);
    nextBuffer(w.buffer2);

    let stopOnNextBufferCallback = false;
    w.on("buffer", (buf) => {
        let decodedSamples = nextBuffer(buf);
        if (stopOnNextBufferCallback) {
            w.stop();
        }
        if (decodedSamples == 0) {
            stopOnNextBufferCallback = true;
        }
    });

    w.startOutput(H0, sampleRate, {pin_neg: H1, repeat: true});

    w.on("finish", () => {
        H0.read();
        H1.read();
    });
};

setWatch(function () {
    play();
}, BTN, {repeat: true});

play();
```

<!-- QOA encode/decode in js for encoding files in the browser -->
<script type="text/template" id="qoaModule">
    // Copyright (C) 2023-2024 Piotr Fusik
    // SPDX-License-Identifier: MIT
    // Source: https://github.com/pfusik/qoa-fu/blob/master/transpiled/QOA.js
    
    // Generated automatically with "fut". Do not edit.
    
    /**
     * Least Mean Squares Filter.
     */
    class LMS
    {
        history = new Int32Array(4);
        weights = new Int32Array(4);
    
        assign(source)
        {
            this.history.set(source.history);
            this.weights.set(source.weights);
        }
    
        predict()
        {
            return (this.history[0] * this.weights[0] + this.history[1] * this.weights[1] + this.history[2] * this.weights[2] + this.history[3] * this.weights[3]) >> 13;
        }
    
        update(sample, residual)
        {
            let delta = residual >> 4;
            this.weights[0] += this.history[0] < 0 ? -delta : delta;
            this.weights[1] += this.history[1] < 0 ? -delta : delta;
            this.weights[2] += this.history[2] < 0 ? -delta : delta;
            this.weights[3] += this.history[3] < 0 ? -delta : delta;
            this.history[0] = this.history[1];
            this.history[1] = this.history[2];
            this.history[2] = this.history[3];
            this.history[3] = sample;
        }
    }
    
    /**
     * Common part of the "Quite OK Audio" format encoder and decoder.
     */
    export class QOABase
    {
        frameHeader;
    
        /**
         * Maximum number of channels supported by the format.
         */
        static MAX_CHANNELS = 8;
    
        /**
         * Returns the number of audio channels.
         */
        getChannels()
        {
            return this.frameHeader >> 24;
        }
    
        /**
         * Returns the sample rate in Hz.
         */
        getSampleRate()
        {
            return this.frameHeader & 16777215;
        }
    
        static SLICE_SAMPLES = 20;
    
        static MAX_FRAME_SLICES = 256;
    
        /**
         * Maximum number of samples per frame.
         */
        static MAX_FRAME_SAMPLES = 5120;
    
        getFrameBytes(sampleCount)
        {
            let slices = (sampleCount + 19) / 20 | 0;
            return 8 + this.getChannels() * (16 + slices * 8);
        }
    
        static SCALE_FACTORS = new Int16Array([ 1, 7, 21, 45, 84, 138, 211, 304, 421, 562, 731, 928, 1157, 1419, 1715, 2048 ]);
    
        static dequantize(quantized, scaleFactor)
        {
            let dequantized;
            switch (quantized >> 1) {
                case 0:
                    dequantized = (scaleFactor * 3 + 2) >> 2;
                    break;
                case 1:
                    dequantized = (scaleFactor * 5 + 1) >> 1;
                    break;
                case 2:
                    dequantized = (scaleFactor * 9 + 1) >> 1;
                    break;
                default:
                    dequantized = scaleFactor * 7;
                    break;
            }
            return (quantized & 1) != 0 ? -dequantized : dequantized;
        }
    }
    
    /**
     * Encoder of the "Quite OK Audio" format.
     */
    export class QOAEncoder extends QOABase
    {
        constructor()
        {
            super();
            for (let _i0 = 0; _i0 < 8; _i0++) {
                this.#lMSes[_i0] = new LMS();
            }
        }
        #lMSes = new Array(8);
    
        /**
         * Writes the file header.
         * Returns <code>true</code> on success.
         * @param totalSamples File length in samples per channel.
         * @param channels Number of audio channels.
         * @param sampleRate Sample rate in Hz.
         */
        writeHeader(totalSamples, channels, sampleRate)
        {
            if (totalSamples <= 0 || channels <= 0 || channels > 8 || sampleRate <= 0 || sampleRate >= 16777216)
                return false;
            this.frameHeader = channels << 24 | sampleRate;
            for (let c = 0; c < channels; c++) {
                this.#lMSes[c].history.fill(0);
                this.#lMSes[c].weights[0] = 0;
                this.#lMSes[c].weights[1] = 0;
                this.#lMSes[c].weights[2] = -8192;
                this.#lMSes[c].weights[3] = 16384;
            }
            let magic = 1903124838n;
            return this.writeLong(magic << 32n | BigInt(totalSamples));
        }
    
        #writeLMS(a)
        {
            let a0 = BigInt(a[0]);
            let a1 = BigInt(a[1]);
            let a2 = BigInt(a[2]);
            return this.writeLong(a0 << 48n | (a1 & 65535n) << 32n | (a2 & 65535n) << 16n | BigInt(a[3] & 65535));
        }
    
        /**
         * Encodes and writes a frame.
         * @param samples PCM samples: <code>samplesCount * channels</code> elements.
         * @param samplesCount Number of samples per channel.
         */
        writeFrame(samples, samplesCount)
        {
            if (samplesCount <= 0 || samplesCount > 5120)
                return false;
            let header = BigInt(this.frameHeader);
            if (!this.writeLong(header << 32n | BigInt(samplesCount << 16) | BigInt(this.getFrameBytes(samplesCount))))
                return false;
            let channels = this.getChannels();
            for (let c = 0; c < channels; c++) {
                if (!this.#writeLMS(this.#lMSes[c].history) || !this.#writeLMS(this.#lMSes[c].weights))
                    return false;
            }
            const lms = new LMS();
            const bestLMS = new LMS();
            const lastScaleFactors = new Uint8Array(8);
            for (let sampleIndex = 0; sampleIndex < samplesCount; sampleIndex += 20) {
                let sliceSamples = Math.min(samplesCount - sampleIndex, 20);
                for (let c = 0; c < channels; c++) {
                    let bestRank = 9223372036854775807n;
                    let bestSlice = 0n;
                    for (let scaleFactorDelta = 0; scaleFactorDelta < 16; scaleFactorDelta++) {
                        let scaleFactor = (lastScaleFactors[c] + scaleFactorDelta) & 15;
                        lms.assign(this.#lMSes[c]);
                        let reciprocal = QOAEncoder.#WRITE_FRAME_RECIPROCALS[scaleFactor];
                        let slice = BigInt(scaleFactor);
                        let currentRank = 0n;
                        for (let s = 0; s < sliceSamples; s++) {
                            let sample = samples[(sampleIndex + s) * channels + c];
                            let predicted = lms.predict();
                            let residual = sample - predicted;
                            let scaled = (residual * reciprocal + 32768) >> 16;
                            if (scaled != 0)
                                scaled += scaled < 0 ? 1 : -1;
                            if (residual != 0)
                                scaled += residual > 0 ? 1 : -1;
                            let quantized = QOAEncoder.#WRITE_FRAME_QUANT_TAB[8 + Math.min(Math.max(scaled, -8), 8)];
                            let dequantized = QOAEncoder.dequantize(quantized, QOAEncoder.SCALE_FACTORS[scaleFactor]);
                            let reconstructed = Math.min(Math.max(predicted + dequantized, -32768), 32767);
                            let error = BigInt(sample - reconstructed);
                            currentRank += error * error;
                            let weightsPenalty = ((lms.weights[0] * lms.weights[0] + lms.weights[1] * lms.weights[1] + lms.weights[2] * lms.weights[2] + lms.weights[3] * lms.weights[3]) >> 18) - 2303;
                            if (weightsPenalty > 0)
                                currentRank += BigInt(weightsPenalty);
                            if (currentRank >= bestRank)
                                break;
                            lms.update(reconstructed, dequantized);
                            slice = slice << 3n | BigInt(quantized);
                        }
                        if (currentRank < bestRank) {
                            bestRank = currentRank;
                            bestSlice = slice;
                            bestLMS.assign(lms);
                        }
                    }
                    this.#lMSes[c].assign(bestLMS);
                    bestSlice <<= BigInt((20 - sliceSamples) * 3);
                    lastScaleFactors[c] = Number(bestSlice >> 60n);
                    if (!this.writeLong(bestSlice))
                        return false;
                }
            }
            return true;
        }
    
        static #WRITE_FRAME_RECIPROCALS = new Int32Array([ 65536, 9363, 3121, 1457, 781, 475, 311, 216, 156, 117, 90, 71, 57, 47, 39, 32 ]);
    
        static #WRITE_FRAME_QUANT_TAB = new Uint8Array([ 7, 7, 7, 5, 5, 3, 3, 1, 0, 0, 2, 2, 4, 4, 6, 6,
            6 ]);
    }
    
    /**
     * Decoder of the "Quite OK Audio" format.
     */
    export class QOADecoder extends QOABase
    {
        #buffer;
        #bufferBits;
    
        #readBits(bits)
        {
            while (this.#bufferBits < bits) {
                let b = this.readByte();
                if (b < 0)
                    return -1;
                this.#buffer = this.#buffer << 8 | b;
                this.#bufferBits += 8;
            }
            this.#bufferBits -= bits;
            let result = this.#buffer >> this.#bufferBits;
            this.#buffer &= (1 << this.#bufferBits) - 1;
            return result;
        }
        #totalSamples;
        #positionSamples;
    
        /**
         * Reads the file header.
         * Returns <code>true</code> if the header is valid.
         */
        readHeader()
        {
            if (this.readByte() != 113 || this.readByte() != 111 || this.readByte() != 97 || this.readByte() != 102)
                return false;
            this.#bufferBits = this.#buffer = 0;
            this.#totalSamples = this.#readBits(32);
            if (this.#totalSamples <= 0)
                return false;
            this.frameHeader = this.#readBits(32);
            if (this.frameHeader <= 0)
                return false;
            this.#positionSamples = 0;
            let channels = this.getChannels();
            return channels > 0 && channels <= 8 && this.getSampleRate() > 0;
        }
    
        /**
         * Returns the file length in samples per channel.
         */
        getTotalSamples()
        {
            return this.#totalSamples;
        }
    
        #getMaxFrameBytes()
        {
            return 8 + this.getChannels() * 2064;
        }
    
        #readLMS(result)
        {
            for (let i = 0; i < 4; i++) {
                let hi = this.readByte();
                if (hi < 0)
                    return false;
                let lo = this.readByte();
                if (lo < 0)
                    return false;
                result[i] = ((hi ^ 128) - 128) << 8 | lo;
            }
            return true;
        }
    
        /**
         * Reads and decodes a frame.
         * Returns the number of samples per channel.
         * @param samples PCM samples.
         */
        readFrame(samples)
        {
            if (this.#positionSamples > 0 && this.#readBits(32) != this.frameHeader)
                return -1;
            let samplesCount = this.#readBits(16);
            if (samplesCount <= 0 || samplesCount > 5120 || samplesCount > this.#totalSamples - this.#positionSamples)
                return -1;
            let channels = this.getChannels();
            let slices = (samplesCount + 19) / 20 | 0;
            if (this.#readBits(16) != 8 + channels * (16 + slices * 8))
                return -1;
            const lmses = new Array(8);
            for (let _i0 = 0; _i0 < 8; _i0++) {
                lmses[_i0] = new LMS();
            }
            for (let c = 0; c < channels; c++) {
                if (!this.#readLMS(lmses[c].history) || !this.#readLMS(lmses[c].weights))
                    return -1;
            }
            for (let sampleIndex = 0; sampleIndex < samplesCount; sampleIndex += 20) {
                for (let c = 0; c < channels; c++) {
                    let scaleFactor = this.#readBits(4);
                    if (scaleFactor < 0)
                        return -1;
                    scaleFactor = QOADecoder.SCALE_FACTORS[scaleFactor];
                    let sampleOffset = sampleIndex * channels + c;
                    for (let s = 0; s < 20; s++) {
                        let quantized = this.#readBits(3);
                        if (quantized < 0)
                            return -1;
                        if (sampleIndex + s >= samplesCount)
                            continue;
                        let dequantized = QOADecoder.dequantize(quantized, scaleFactor);
                        let reconstructed = Math.min(Math.max(lmses[c].predict() + dequantized, -32768), 32767);
                        lmses[c].update(reconstructed, dequantized);
                        samples[sampleOffset] = reconstructed;
                        sampleOffset += channels;
                    }
                }
            }
            this.#positionSamples += samplesCount;
            return samplesCount;
        }
    
        /**
         * Seeks to the given time offset.
         * Requires the input stream to be seekable with <code>SeekToByte</code>.
         * @param position Position from the beginning of the file.
         */
        seekToSample(position)
        {
            let frame = position / 5120 | 0;
            this.seekToByte(frame == 0 ? 12 : 8 + frame * this.#getMaxFrameBytes());
            this.#positionSamples = frame * 5120;
        }
    
        /**
         * Returns <code>true</code> if all frames have been read.
         */
        isEnd()
        {
            return this.#positionSamples >= this.#totalSamples;
        }
    }
</script>

<!-- glue code for taking an "uploaded" file, encoding it to qoa and presenting it as something that can be "downloaded" -->
<script type="module">
    // Copyright (c) 2025 Simon Sievert
    // SPDX-License-Identifier: MIT
    const qoa = await import(
        URL.createObjectURL(
            new Blob(
                [document.getElementById('qoaModule').innerText],
                {type: 'application/javascript'},
            )
        )
    );
    
    const fileInput = document.getElementById("fileInput");
    const sampleRateInput = document.getElementById("sampleRateInput");
    fileInput.addEventListener("change", async (event) => {
        // the base QOAEncoder doesn't know how to write data
        // extend it with something that does
        // (data is written to memory; can be fetched with "getData()" when done)
        class QOAEncoder extends qoa.QOAEncoder {
            constructor() {
                super();
            }

            #data = [];
            #dataSizeBytes = 0;
            #currentDataChunk = undefined;
            #currentDataChunkIndex = 0;

            writeByte(b) {
                if ((this.#currentDataChunk == undefined) || (this.#currentDataChunkIndex >= this.#currentDataChunk.length)) {
                    this.#currentDataChunk = new Uint8Array(1024);
                    this.#currentDataChunkIndex = 0;
                    this.#data.push(this.#currentDataChunk);
                }
                this.#currentDataChunk[this.#currentDataChunkIndex] = b;
                this.#currentDataChunkIndex++;
                this.#dataSizeBytes++;

            }

            writeLong(l) {
                for (let i = 0; i < 8; i++) {
                    let byte = Number(((l >> BigInt((7 - i) * 8))) & 0xffn);
                    this.writeByte(byte);
                }
                return true;
            }

            getData() {
                let buf = new Uint8Array(this.#dataSizeBytes);
                let writeIndex = 0;
                for (let dataBuf of this.#data) {
                    for (let byte of dataBuf) {
                        if (writeIndex >= this.#dataSizeBytes) {
                            return buf;
                        }
                        buf[writeIndex] = byte;
                        writeIndex++;
                    }
                }
                return buf;
            }
        }

        // our QOAEncoder class that writes data to memory
        let encoder = new QOAEncoder();

        const file = event.target.files[0];
        const fileBaseName = file.name.replace(/\.[^\.]*$/, '');
        const SAMPLERATE = Number(sampleRateInput.value);
        const offlineAudioContext = new OfflineAudioContext(1, SAMPLERATE * 10/*max buffer length*/, SAMPLERATE);

        const reader = new FileReader();
        reader.onload = (e) => {
            offlineAudioContext.decodeAudioData(e.target.result)
                .then(audioBuffer => {
                    const bufferLength = audioBuffer.length;
                    const numberOfChannels = audioBuffer.numberOfChannels;

                    // write header for mono audio
                    encoder.writeHeader(bufferLength, 1, SAMPLERATE);

                    // get the PCM data from the audio buffer
                    const pcmDataChannels = [];
                    for (let i = 0; i < numberOfChannels; i++) {
                        const pcmData = new Float32Array(bufferLength);
                        audioBuffer.copyFromChannel(pcmData, i, 0);
                        pcmDataChannels.push(pcmData);
                    }

                    // encode in frames with SAMPLES_PER_FRAME samples each
                    // except for the last frame
                    const SAMPLES_PER_FRAME = 5120;
                    const frameSamples = new Int16Array(SAMPLES_PER_FRAME);
                    let sampleIndex = 0;
                    while (sampleIndex < bufferLength) {
                        let frameStartIndex = sampleIndex;
                        let frameEndIndex = Math.min(frameStartIndex + SAMPLES_PER_FRAME - 1, bufferLength - 1) | 0;
                        let frameLength = (frameEndIndex - frameStartIndex + 1) | 0;
                        for (let i = 0; i < frameLength; i++) {
                            // average value from all channels
                            let avg = 0.0;
                            for (let pcmData of pcmDataChannels) {
                                avg += pcmData[frameStartIndex + i];
                            }
                            avg /= numberOfChannels;

                            // convert to 16 bit signed PCM
                            let v = Math.round(avg * 32767); // we expect this to wrap over negative->positive anyway
                            if (v < -32768) v = -32768;
                            if (v > 32767) v = 32767;
                            frameSamples[i] = v;
                        }
                        encoder.writeFrame(frameSamples, frameLength);
                        // advance to the next frame
                        sampleIndex = (frameEndIndex + 1) | 0;
                    }

                    // present encoded data as something that can be downloaded
                    const encodedData = encoder.getData();
                    const blob = new Blob([encodedData], {type: "audio/qoa"});
                    const downloadURL = URL.createObjectURL(blob);
                    const downloadElement = document.createElement("a");
                    downloadElement.href = downloadURL;
                    downloadElement.download = fileBaseName + ".qoa";
                    document.body.appendChild(downloadElement);
                    downloadElement.click();
                    document.body.removeChild(downloadElement);
                    URL.revokeObjectURL(downloadURL);
                })
                .catch(error => {
                    console.error("Error decoding audio data:", error);
                });
        };
        reader.readAsArrayBuffer(file);
    });
</script>
