<!--- Copyright (c) 2026 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
SVG to Espruino Graphics Converter
====================================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/SVG+Converter. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: File,String,Vector,SVG,Image,Picture,Conversion,Graphics,Tools
* USES: Graphics

Converts an SVG image into a JS graphics calls that can be used with Espruino.

<style>
  .container {
  }
  .control-group {
      display: flex;
      align-items: center;
  }
  label { font-weight: bold; }
  input[type="number"], select {
      padding: 4px 6px;
      border: 1px solid black;
      border-radius: 4px;
  }
  input[type="number"] { width: 60px; }
  input[type="checkbox"] { cursor: pointer; }

  .pane {
      display: flex;
      flex-direction: column;
      border-radius: 8px;
      border: 1px solid black;
      padding: 12px;
      margin-top:8px;
      margin-bottom:8px;
  }
  textarea {
      flex: 1;
      min-height: 250px;
      border: 1px solid black;
      border-radius: 4px;
      padding: 10px;
      font-family: monospace;
      font-size: 0.8rem;
      resize: vertical;
      white-space: pre;
      overflow-x: auto;
  }
  button {
      border: none;
      padding: 6px 14px;
      border-radius: 4px;
      font-weight: bold;
      cursor: pointer;
      transition: opacity 0.2s;
  }
  button:hover { opacity: 0.8; }

  .preview-box {
      display: flex;
      justify-content: center;
      align-items: center;
      /* SVG Checkerboard pattern for dark/light contrast */
      background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><rect width="8" height="8" fill="%23707070"/><rect x="8" width="8" height="8" fill="%23C0C0C0"/><rect y="8" width="8" height="8" fill="%23C0C0C0"/><rect x="8" y="8" width="8" height="8" fill="%23707070"/></svg>');
      border-radius: 4px;
      padding: 10px;
      border: 1px solid black;
      overflow: auto;
      min-height: 180px;
  }
  canvas {
      border: 1px dashed black;
      image-rendering: pixelated;
      box-shadow: 0 4px 10px rgba(0,0,0,0.5);
  }
</style>

<div class="container">
<div class="control-group">
    <label>File:</label>
    <input type="file" id="fileInput" accept=".svg">
</div>

<div class="control-group">
    <label>Target Display:</label>
    <input type="number" id="canvasW" value="64" min="8" title="Canvas Width">x
    <input type="number" id="canvasH" value="64" min="8" title="Canvas Height">
</div>

<div class="control-group">
    <label>Auto-Fit:</label>
    <input type="checkbox" id="autoScale">
</div>

<div class="control-group" id="manualScaleGroup">
    <label>Scale:</label>
    <input type="number" id="scaleFactor" value="1.0" step="0.1" min="0.1">
</div>

<div class="control-group">
    <label>Center:</label>
    <input type="checkbox" id="autoCenter">
</div>

<div class="control-group">
    <label>Precision:</label>
    <input type="number" id="sampleRate" value="3" min="1" max="20" title="Sampling interval in pixels for curves">
</div>

<div class="control-group">
    <label>Format:</label>
    <select id="colorFormat">
        <option value="web">Hex ("#FF0000")</option>
        <option value="rgb">RGB (1, 0, 0)</option>
        <option value="rgb565">RGB565 (0xF800)</option>
    </select>
</div>

<!-- Input & Preview Pane -->
<div class="pane">
    <label for="svgInput">SVG Input:</label>
    <textarea id="svgInput" placeholder="Paste SVG markup here or upload an SVG file..."></textarea>
    <label>Preview:</label>
    <div class="preview-box">
        <canvas id="previewCanvas"></canvas>
    </div>
</div>

<!-- Generated Output Pane -->
<div class="pane">
    <div style="display: flex; justify-content: space-between; align-items: center;">
        <label for="jsOutput">Generated Code:</label>
        <button id="copyBtn">Copy Code</button>
    </div>
    <textarea id="jsOutput" readonly placeholder="Espruino output code will appear here..."></textarea>
</div>
</div>

<script>
const fileInput = document.getElementById('fileInput');
const svgInput = document.getElementById('svgInput');
const jsOutput = document.getElementById('jsOutput');
const previewCanvas = document.getElementById('previewCanvas');
const ctx = previewCanvas.getContext('2d');

const canvasW = document.getElementById('canvasW');
const canvasH = document.getElementById('canvasH');
const autoScale = document.getElementById('autoScale');
const scaleFactor = document.getElementById('scaleFactor');
const manualScaleGroup = document.getElementById('manualScaleGroup');
const autoCenter = document.getElementById('autoCenter');
const sampleRateInput = document.getElementById('sampleRate');
const colorFormatSelect = document.getElementById('colorFormat');
const copyBtn = document.getElementById('copyBtn');

autoScale.addEventListener('change', () => {
    manualScaleGroup.style.display = autoScale.checked ? 'none' : 'flex';
    convertSVG();
});

[fileInput, svgInput, canvasW, canvasH, scaleFactor, autoCenter, sampleRateInput, colorFormatSelect].forEach(el => {
    el.addEventListener('input', convertSVG);
    el.addEventListener('change', convertSVG);
});

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
        svgInput.value = evt.target.result;
        convertSVG();
    };
    reader.readAsText(file);
});

copyBtn.addEventListener('click', () => {
    jsOutput.select();
    document.execCommand('copy');
    copyBtn.innerText = "Copied!";
    setTimeout(() => copyBtn.innerText = "Copy Code", 1500);
});

function convertSVG() {
    const rawSvg = svgInput.value.trim();
    const width = parseInt(canvasW.value) || 240;
    const height = parseInt(canvasH.value) || 240;

    previewCanvas.width = width;
    previewCanvas.height = height;

    // Clear preview (leave transparent so container checkerboard shows through)
    ctx.clearRect(0, 0, width, height);

    if (!rawSvg) {
        jsOutput.value = '';
        return;
    }

    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.visibility = 'hidden';
    container.innerHTML = rawSvg;
    document.body.appendChild(container);

    const svgEl = container.querySelector('svg');
    if (!svgEl) {
        jsOutput.value = '// Invalid SVG markup';
        document.body.removeChild(container);
        return;
    }

    const sampleStep = Math.max(1, parseFloat(sampleRateInput.value) || 3);
    const elements = svgEl.querySelectorAll('path, rect, circle, ellipse, polygon, polyline, line');

    let rawShapes = [];
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    elements.forEach(el => {
        const style = window.getComputedStyle(el);
        const fill = el.getAttribute('fill') || style.fill;
        const stroke = el.getAttribute('stroke') || style.stroke;
        let points = [];

        if (el.tagName === 'path') {
            const totalLen = el.getTotalLength();
            for (let l = 0; l <= totalLen; l += sampleStep) {
                const p = el.getPointAtLength(l);
                points.push(p.x, p.y);
            }
        } else if (el.tagName === 'rect') {
            const x = parseFloat(el.getAttribute('x') || 0);
            const y = parseFloat(el.getAttribute('y') || 0);
            const w = parseFloat(el.getAttribute('width') || 0);
            const h = parseFloat(el.getAttribute('height') || 0);
            points = [x, y, x + w, y, x + w, y + h, x, y + h];
        } else if (el.tagName === 'polygon' || el.tagName === 'polyline') {
            for (let i = 0; i < el.points.numberOfItems; i++) {
                const p = el.points.getItem(i);
                points.push(p.x, p.y);
            }
        } else if (el.tagName === 'line') {
            points = [
                parseFloat(el.getAttribute('x1') || 0), parseFloat(el.getAttribute('y1') || 0),
                parseFloat(el.getAttribute('x2') || 0), parseFloat(el.getAttribute('y2') || 0)
            ];
        }

        if (points.length >= 4) {
            for (let i = 0; i < points.length; i += 2) {
                minX = Math.min(minX, points[i]);
                maxX = Math.max(maxX, points[i]);
                minY = Math.min(minY, points[i + 1]);
                maxY = Math.max(maxY, points[i + 1]);
            }
            rawShapes.push({ fill, stroke, points });
        }
    });

    document.body.removeChild(container);

    if (rawShapes.length === 0) {
        jsOutput.value = '// No drawable geometry found in SVG';
        return;
    }

    const bboxW = maxX - minX || 1;
    const bboxH = maxY - minY || 1;

    let scale = parseFloat(scaleFactor.value) || 1.0;
    if (autoScale.checked) {
        const scaleX = width / bboxW;
        const scaleY = height / bboxH;
        scale = Math.min(scaleX, scaleY) * 0.95;
    }

    let offsetX = -minX * scale;
    let offsetY = -minY * scale;

    if (autoCenter.checked) {
        const scaledW = bboxW * scale;
        const scaledH = bboxH * scale;
        offsetX = (width - scaledW) / 2 - (minX * scale);
        offsetY = (height - scaledH) / 2 - (minY * scale);
    }

    let outputLines = [];
    let currentColor = null;

    function parseCSSColor(colorStr) {
        if (!colorStr || colorStr === 'none' || colorStr === 'transparent') return null;
        const temp = document.createElement('div');
        temp.style.color = colorStr;
        document.body.appendChild(temp);
        const comp = window.getComputedStyle(temp).color;
        document.body.removeChild(temp);
        const m = comp.match(/\d+/g);
        return m ? { r: parseInt(m[0]), g: parseInt(m[1]), b: parseInt(m[2]) } : null;
    }

    function formatColorForEspruino(rgb) {
        const fmt = colorFormatSelect.value;
        if (fmt === 'rgb') {
            return `${(rgb.r / 255).toFixed(2)}, ${(rgb.g / 255).toFixed(2)}, ${(rgb.b / 255).toFixed(2)}`;
        } else if (fmt === 'rgb565') {
            const r5 = (rgb.r >> 3) & 0x1F;
            const g6 = (rgb.g >> 2) & 0x3F;
            const b5 = (rgb.b >> 3) & 0x1F;
            return `0x${((r5 << 11) | (g6 << 5) | b5).toString(16).toUpperCase()}`;
        } else {
            const hex = "#" + ((1 << 24) + (rgb.r << 16) + (rgb.g << 8) + rgb.b).toString(16).slice(1);
            return `"${hex}"`;
        }
    }

    function drawPolygonOnCanvas(pts, fillColor, strokeColor) {
        if (pts.length < 4) return;
        ctx.beginPath();
        ctx.moveTo(pts[0], pts[1]);
        for (let i = 2; i < pts.length; i += 2) {
            ctx.lineTo(pts[i], pts[i + 1]);
        }
        ctx.closePath();
        if (fillColor) {
            ctx.fillStyle = `rgb(${fillColor.r}, ${fillColor.g}, ${fillColor.b})`;
            ctx.fill();
        }
        if (strokeColor) {
            ctx.strokeStyle = `rgb(${strokeColor.r}, ${strokeColor.g}, ${strokeColor.b})`;
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    }

    rawShapes.forEach(shape => {
        const transformedPts = [];
        for (let i = 0; i < shape.points.length; i += 2) {
            const px = Math.round(shape.points[i] * scale + offsetX);
            const py = Math.round(shape.points[i + 1] * scale + offsetY);
            transformedPts.push(px, py);
        }

        const fillRGB = parseCSSColor(shape.fill);
        const strokeRGB = parseCSSColor(shape.stroke);

        drawPolygonOnCanvas(transformedPts, fillRGB, strokeRGB);

        if (fillRGB && transformedPts.length >= 6) {
            const col = formatColorForEspruino(fillRGB);
            if (col !== currentColor) {
                currentColor = col;
                outputLines.push(`g.setColor(${currentColor});`);
            }
            outputLines.push(`g.fillPoly([${transformedPts.join(',')}]);`);
        }

        if (strokeRGB) {
            const col = formatColorForEspruino(strokeRGB);
            if (col !== currentColor) {
                currentColor = col;
                outputLines.push(`g.setColor(${currentColor});`);
            }
            outputLines.push(`g.drawPoly([${transformedPts.join(',')}]);`);
        }
    });

    jsOutput.value = outputLines.length ? outputLines.join('\n') : '// No printable output';
}
</script>