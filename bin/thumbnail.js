#!/usr/bin/env node
/* Copyright (c) 2026 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/*
Creates `PageName.thumb.jpg` thumbnail images (360x280, white background) for
Markdown pages (and `examples/*.js` files, which have Markdown in a comment at
the top) that have no picture to use as a thumbnail.

bin/build.js uses `PageName.thumb.png/jpg/svg`, `PageName.png/jpg` or the first
image in the page as the thumbnail. This tool draws an illustration for pages
that have none of those: a breakout board for devices, an icon and a code
snippet for modules, or just icons for other pages, with the title underneath.

Requires ImageMagick (`convert`, with SVG support) - the same as bin/build.js.

Usage:

  node bin/thumbnail.js [options] [files...]

  files...      Create thumbnails for these pages/examples (default: every one that
                has no thumbnail)
  --list        Just list the pages that have no thumbnail
  --force       Overwrite existing `.thumb.jpg` files
  --out=DIR     Write thumbnails into DIR instead of next to each page (for
                previewing). The SVG source is written there too.
  --help        Show this help

How a page is drawn comes from `bin/thumbnail-pages.json` if the page is listed
there. Otherwise the settings are guessed from the page (title from the heading,
icons from the KEYWORDS line, layout from the folder) - add an entry to
`bin/thumbnail-pages.json` to improve on the guess. Fields:

  `layout`  `"hw"` (device), `"code"` (icon + code snippet), `"icon"` (just icons),
            or `"photo"` (an existing image, resized onto a white background)
  `title`   Big text at the bottom
  `sub`     Smaller text under the title (optional)
  `icons`   List of icon names (1-3) from bin/thumbnail-icons.json
  `colors`  Background colour for each icon - a name from `COLORS` below, or `"#rrggbb"`
  `label`   `"hw"`: text on the chip/module    `"code"`: module name for `require`
  `look`    `"hw"` only: `chip` (default), `module`, `screen`, `matrix`, `touch`,
            `strip`, `motor`, `nixie`, `knob`, `bead`, `led`
  `board`   `"hw"` only: PCB colour - blue, green, purple, black, red, teal or `"#rrggbb"`
  `label2`  `"hw"` + `look:"module"`: second line of text on the module
  `stext`   `"hw"` + `look:"screen"`: text shown on the screen
  `screen`, `fg`  `"hw"` + `look:"screen"`: screen background and text colours
  `chart`   `"hw"` + `look:"screen"`: `false` to not draw a graph on the screen
  `on`      `"hw"` + `look:"matrix"`: colour of lit LEDs
  `code`    `"code"` only: list of code lines (default: first code block in the page)
  `photo`   `"photo"` only: image path, relative to the repository root
*/
var fs = require("fs");
var path = require("path");
var os = require("os");
var child_process = require("child_process");
var common = require("./common.js");

var BASEDIR = path.resolve(__dirname, "..");
var W = 360, H = 280;

// ---------------------------------------------------------------- arguments
var opts = { list: false, force: false, out: undefined, files: [] };
process.argv.slice(2).forEach(function(a) {
  if (a == "--list") opts.list = true;
  else if (a == "--force") opts.force = true;
  else if (a.startsWith("--out=")) opts.out = path.resolve(a.substr(6));
  else if (a == "--help" || a == "-h") {
    var src = fs.readFileSync(__filename, "utf8");
    var start = src.indexOf("/*\n") + 3;
    console.log(src.slice(start, src.indexOf("*/", start)).trim());
    process.exit(0);
  } else if (a.startsWith("--")) {
    console.error("Unknown option " + a + " (try --help)");
    process.exit(1);
  } else opts.files.push(a);
});

var ICONS = JSON.parse(fs.readFileSync(path.join(__dirname, "thumbnail-icons.json"), "utf8")).icons;
var PAGES = JSON.parse(fs.readFileSync(path.join(__dirname, "thumbnail-pages.json"), "utf8")).pages;

var COLORS = {
  temperature: "#e5533d", humidity: "#2f8fe0", pressure: "#12a39a", light: "#f2a900", colour: "#9b59b6",
  magnetic: "#8e44ad", motion: "#f07c1e", air: "#3aa655", touch: "#d6457a", time: "#4a5bd4",
  memory: "#5d6d7e", radio: "#1e9e6a", display: "#34495e", power: "#e0a800", network: "#2a7fd4",
  crypto: "#6c4fc2", ui: "#e67e22", docs: "#16a085", warning: "#e74c3c", code: "#2c3e50", bluetooth: "#0a7cff"
};
var BOARD_COLORS = { blue: "#1f5fa8", green: "#23804a", purple: "#5b3a8c", black: "#2b2b2b", red: "#a8322d", teal: "#14787a" };
function colour(c, def) {
  if (!c) return def;
  return COLORS[c] || BOARD_COLORS[c] || c;
}

// ---------------------------------------------------------------- finding pages
/// Same order of checks as bin/build.js - returns the image it'd use, or undefined
function existingThumbnail(file) {
  var base = file.slice(0, -3);
  var found = [".thumb.png", ".thumb.jpg", ".thumb.svg", ".png", ".jpg"].find(function(e) {
    return fs.existsSync(path.join(BASEDIR, base + e));
  });
  if (found) return base + found;
  var match = fs.readFileSync(path.join(BASEDIR, file), "utf8").match(/!\[[^\]]*\]\(([^\)]*)\)/);
  if (!match) return;
  if (/^data:image\/\w+[^,]*;base64,/.test(match[1])) return match[1];
  var image = file.substr(0, file.lastIndexOf("/")+1) + match[1];
  if (fs.existsSync(path.join(BASEDIR, image))) return image;
}

/// Markdown pages, plus the example .js files that bin/build.js turns into pages
function allPages() {
  return common.getMarkdown(BASEDIR).map(function(f) {
    return path.relative(BASEDIR, f);
  }).concat(fs.readdirSync(path.join(BASEDIR, "examples")).filter(function(f) {
    return f.endsWith(".js");
  }).map(function(f) {
    return "examples/" + f;
  }));
}

function pagesWithoutThumbnail() {
  return allPages().filter(function(f) {
    return !existingThumbnail(f);
  }).sort();
}

// ---------------------------------------------------------------- guessing settings
// keyword (lower case, matched against KEYWORDS and title) -> [icon, colour]
var KEYWORD_ICONS = [
  [/temperature|thermo|celsius/, "thermo", "temperature"],
  [/humidity/, "drop", "humidity"],
  [/pressure|barometer/, "speed", "pressure"],
  [/altitude/, "terrain", "air"],
  [/colou?r sensor|\bcolou?r\b|\brgb\b/, "palette", "colour"],
  [/\blight\b|lux|luminosity|brightness/, "wb_sunny", "light"],
  [/accelerometer|acceleration/, "axes", "motion"],
  [/gyro/, "3d_rotation", "magnetic"],
  [/magnetometer|compass|magnetic/, "explore", "magnetic"],
  [/co2|carbon dioxide/, "co2", "air"],
  [/air quality|\bgas\b|voc/, "air", "air"],
  [/touch|capacitive/, "touch_app", "touch"],
  [/\brtc\b|real time clock|\bclock\b/, "schedule", "time"],
  [/\bdate\b|calendar/, "event", "time"],
  [/\btimer\b|\btime\b/, "timer", "time"],
  [/eeprom|storage|\bflash\b|\bfram\b|\bsd card\b/, "save", "memory"],
  [/wifi|esp8266|esp32/, "wifi", "network"],
  [/bluetooth|\bble\b/, "bluetooth", "bluetooth"],
  [/\bgsm\b|gprs|\blte\b|cellular|mobile/, "signal_cellular_alt", "radio"],
  [/lora|wireless|radio|transceiver|\brf\b/, "settings_input_antenna", "radio"],
  [/\bnfc\b/, "nfc", "bluetooth"],
  [/mqtt/, "device_hub", "air"],
  [/\bhttp|internet|web/, "public", "network"],
  [/cloud|\biot\b/, "cloud", "network"],
  [/database/, "storage", "network"],
  [/battery|lipo|fuel gauge/, "battery_charging_full", "air"],
  [/\bpower\b|energy|voltage|current/, "bolt", "power"],
  [/crypt|\baes\b|hash|password/, "enhanced_encryption", "crypto"],
  [/stepper|motor/, "rotate_right", "motion"],
  [/servo|pwm|potentiometer/, "tune", "ui"],
  [/haptic|vibrat/, "vibration", "touch"],
  [/\bled\b|matrix/, "grid_on", "warning"],
  [/\blcd\b|oled|display|graphics/, "text_fields", "display"],
  [/voice|microphone|speech/, "mic", "touch"],
  [/distance|ultrasonic|proximity|range finder/, "straighten", "pressure"],
  [/sound|audio|speaker|music/, "music_note", "colour"],
  [/camera/, "camera_alt", "display"],
  [/\bgps\b|location/, "gps_fixed", "network"],
  [/keyboard|keypad/, "keyboard", "ui"],
  [/game/, "sports_esports", "ui"],
  [/\bmenu\b/, "menu", "ui"],
  [/\bui\b|user interface/, "dashboard", "ui"],
  [/image|bitmap/, "image", "colour"],
  [/\badc\b|analog/, "show_chart", "pressure"],
  [/weigh|scales/, "balance", "pressure"],
  [/\busb\b/, "usb", "display"],
  [/printer/, "print", "display"],
  [/robot|\bcar\b/, "directions_car", "motion"],
  [/watch|bangle/, "watch", "display"],
  [/phone|android|\bios\b/, "smartphone", "display"],
  [/home automation|home assistant/, "home", "air"],
];

/// Page name without folder or extension
function pageName(file) {
  return path.basename(file).slice(0, -3);
}

/// Returns {text, code, heading, keywords}. For example .js files `text` is the
/// Markdown from the comment at the top (as bin/build.js does) and `code` is the source
function readPage(file) {
  var text = fs.readFileSync(path.join(BASEDIR, file), "utf8"), code;
  if (file.endsWith(".js")) {
    var start = text.indexOf("/*"), end = text.indexOf("*/", start);
    if (start >= 0 && end >= 0) {
      code = text.substr(end+2).split("\n").filter(function(l) { return l.trim(); }).slice(0, 8);
      text = text.substring(start+2, end);
    }
  }
  var lines = text.split("\n");
  var heading = lines.find(function(l, i) {
    return l.trim() && !l.startsWith("<!--") && lines[i+1] && /^(===|---)/.test(lines[i+1]);
  }) || pageName(file);
  var kw = (text.match(/^\*\s*KEYWORDS:(.*)$/m) || [])[1] || "";
  return { text: text, code: code || firstCode(text), heading: heading.replace(/^#+\s*/, "").trim(), keywords: kw };
}

function guessSettings(file) {
  var page = readPage(file);
  var dir = file.split("/")[0];
  var e = {};
  // title / subtitle
  var heading = page.heading.replace(/\s*\([^)]*\)/g, "").trim();
  var m = heading.match(/^([A-Za-z0-9\-\/_.]*\d[A-Za-z0-9\-\/_.]*),?\s+(.+)$/); // "BME280 Environment sensor"
  if (m && /[A-Z]/.test(m[1])) {
    e.title = m[1].length > 16 ? m[1].split("/")[0] : m[1]; // "WS2811/WS2812/..." -> "WS2811"
    e.sub = m[2][0].toUpperCase() + m[2].substr(1);
  }
  else if (heading.length > 24 && /\s[-:]\s/.test(heading)) {
    var p = heading.split(/\s[-:]\s/); e.title = p[0]; e.sub = p.slice(1).join(" - ");
  } else e.title = heading;
  // icons from keywords, then title
  var haystack = (page.keywords + "," + page.heading).toLowerCase();
  e.icons = []; e.colors = [];
  KEYWORD_ICONS.forEach(function(k) {
    if (e.icons.length < 3 && k[0].test(haystack) && e.icons.indexOf(k[1]) < 0) {
      e.icons.push(k[1]); e.colors.push(k[2]);
    }
  });
  var name = pageName(file);
  if (dir == "devices") {
    e.layout = "hw";
    e.label = name.length <= 10 ? name : e.title.length <= 10 ? e.title : "";
    if (/\blcd\b|oled|display/.test(haystack)) { e.look = "screen"; e.stext = name; }
    else if (/matrix/.test(haystack) && /\bled/.test(haystack)) e.look = "matrix";
    e.board = ["blue", "green", "purple", "black", "teal"][name.length % 5];
    if (!e.icons.length) { e.icons = ["memory"]; e.colors = ["memory"]; }
    if (e.icons.length > 3) e.icons.length = 3;
  } else if (dir == "modules" || page.code.length) {
    e.layout = "code";
    e.label = name;
    if (!e.icons.length) { e.icons = [dir == "modules" ? "extension" : "code"]; e.colors = [dir == "modules" ? "network" : "code"]; }
    e.icons.length = Math.min(e.icons.length, 2);
  } else {
    e.layout = "icon";
    if (!e.icons.length) { e.icons = ["menu_book"]; e.colors = ["docs"]; }
  }
  return e;
}

// ---------------------------------------------------------------- SVG helpers
function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Advance widths (1/1000 em) of ASCII 32..126 in Noto Sans, so text can be shrunk to fit
var WIDTHS = {
  bold: [260,286,472,646,572,901,750,266,339,339,545,572,285,322,285,413,572,572,572,572,572,572,572,572,572,572,285,285,572,572,572,477,897,690,672,637,740,560,549,724,765,389,331,664,565,943,813,796,628,796,660,551,579,756,650,967,667,624,579,331,413,331,572,411,362,604,633,514,633,591,387,633,657,305,305,620,305,982,657,619,633,633,454,497,434,657,569,856,578,569,488,394,551,394,572],
  reg: [260,269,408,646,572,831,732,225,300,300,551,572,268,322,268,372,572,572,572,572,572,572,572,572,572,572,268,268,572,572,572,434,899,639,650,632,730,556,519,728,741,339,273,619,524,907,760,781,605,781,622,549,556,731,600,930,586,566,572,329,372,329,572,444,281,561,615,480,615,564,344,615,618,258,258,534,258,935,618,605,615,615,413,479,361,618,508,786,529,510,470,380,551,380,572]
};
function textWidth(txt, font, size) {
  var w = 0;
  for (var i = 0; i < txt.length; i++) {
    var c = txt.charCodeAt(i);
    w += font == "mono" ? 600 : (c >= 32 && c < 127) ? WIDTHS[font][c-32] : 600;
  }
  return w * size / 1000;
}

function text(txt, x, y, size, font, col, maxw) {
  font = font || "bold";
  if (maxw) while (size > 10 && textWidth(txt, font, size) > maxw) size--;
  var fam = font == "mono" ? "'Noto Sans Mono', 'DejaVu Sans Mono', monospace" : "'Noto Sans', 'DejaVu Sans', sans-serif";
  var weight = font == "reg" ? "normal" : "bold";
  return `<text x="${x}" y="${y}" font-family="${fam}" font-weight="${weight}" font-size="${size}" fill="${col||"#222"}" text-anchor="middle">${esc(txt)}</text>`;
}

function icon(name, cx, cy, size, col) {
  var paths = ICONS[name];
  if (!paths) throw new Error(`Unknown icon '${name}' (see bin/thumbnail-icons.json)`);
  var s = size/24;
  return `<g transform="translate(${(cx-size/2).toFixed(1)},${(cy-size/2).toFixed(1)}) scale(${s.toFixed(4)})">` +
    paths.map(function(p) {
      var d = Array.isArray(p) ? p[0] : p, a = Array.isArray(p) ? p[1] : 1;
      return `<path d="${d}" fill="${col||"#fff"}" fill-opacity="${a}"/>`;
    }).join("") + "</g>";
}

function badge(name, cx, cy, r, col) {
  return `<circle cx="${cx}" cy="${cy+2}" r="${r}" fill="#000" fill-opacity="0.12"/>` +
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${col}" stroke="#fff" stroke-width="3"/>` +
    icon(name, cx, cy, r*1.25);
}

// ---------------------------------------------------------------- hardware drawings
function pcb(x, y, w, h, col) {
  var o = [`<rect x="${x+3}" y="${y+5}" width="${w}" height="${h}" rx="10" fill="#000" fill-opacity="0.15"/>`,
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${col}"/>`,
    `<rect x="${x+4}" y="${y+4}" width="${w-8}" height="${h-8}" rx="7" fill="none" stroke="#fff" stroke-opacity="0.18" stroke-width="1.5"/>`];
  [[x+13, y+13], [x+w-13, y+13]].forEach(function(p) {
    o.push(`<circle cx="${p[0]}" cy="${p[1]}" r="7" fill="#d9b44a"/><circle cx="${p[0]}" cy="${p[1]}" r="4" fill="#fff"/>`);
  });
  var n = Math.max(4, Math.floor((w-30)/16)), sp = (w-30)/(n-1);
  for (var i = 0; i < n; i++) {
    var px = (x+15+i*sp).toFixed(1);
    o.push(`<circle cx="${px}" cy="${y+h-14}" r="5.5" fill="#d9b44a"/><circle cx="${px}" cy="${y+h-14}" r="2.6" fill="#333"/>`);
  }
  return o.join("");
}

function chip(cx, cy, w, h, label) {
  var o = [], n = Math.max(3, Math.floor(h/9));
  for (var i = 0; i < n; i++) {
    var py = cy-h/2+6+i*(h-12)/(n-1);
    o.push(`<rect x="${cx-w/2-6}" y="${(py-1.6).toFixed(1)}" width="${w+12}" height="3.2" fill="#c8c8c8"/>`);
  }
  o.push(`<rect x="${cx-w/2}" y="${cy-h/2}" width="${w}" height="${h}" rx="3" fill="#1b1b1b"/>`);
  o.push(`<circle cx="${cx-w/2+7}" cy="${cy-h/2+7}" r="2.5" fill="#555"/>`);
  if (label) o.push(text(label, cx, cy+5, 14, "mono", "#e8e8e8", w-8));
  return o.join("");
}

function smd(x, y, kind) {
  return `<rect x="${x}" y="${y}" width="12" height="6" fill="${kind == "cap" ? "#c9a26b" : "#222"}"/>` +
    `<rect x="${x}" y="${y}" width="3" height="6" fill="#ddd"/><rect x="${x+9}" y="${y}" width="3" height="6" fill="#ddd"/>`;
}

function boardLook(e) {
  var x = 30, y = 18, w = 190, h = 170, cx = x+w/2, cy = y+h/2-8;
  var look = e.look || "chip";
  var o = [pcb(x, y, w, h, colour(e.board, BOARD_COLORS.blue))];
  if (look == "chip") {
    o.push(chip(cx, cy, 92, 66, e.label || ""));
    o.push(smd(x+30, y+40, "cap"), smd(x+30, y+100, "res"), smd(x+w-44, y+40, "res"), smd(x+w-44, y+100, "cap"));
  } else if (look == "module") { // metal can module, eg. ESP32 or radio
    o.push(`<rect x="${cx-62}" y="${cy-50}" width="124" height="96" rx="4" fill="#cfd3d6" stroke="#9aa0a5" stroke-width="2"/>`);
    o.push(`<rect x="${cx-62}" y="${cy-50}" width="124" height="22" fill="#2b2b2b"/>`);
    o.push(`<path d="M${cx-52},${cy-44} h10 v10 h10 v-10 h10 v10 h10 v-10 h10 v10 h10 v-10 h10 v10" stroke="#d9b44a" stroke-width="2.5" fill="none"/>`);
    o.push(text(e.label || "", cx, cy+8, 20, "mono", "#555", 110));
    if (e.label2) o.push(text(e.label2, cx, cy+30, 12, "mono", "#777", 110));
  } else if (look == "screen") {
    var fg = e.fg || "#7fd8ff";
    o.push(`<rect x="${x+16}" y="${y+26}" width="${w-32}" height="${h-62}" rx="3" fill="#111"/>`);
    o.push(`<rect x="${x+22}" y="${y+32}" width="${w-44}" height="${h-74}" fill="${e.screen || "#0b1a2a"}"/>`);
    o.push(text(e.stext || e.label || "Hello", cx, e.chart === false ? y+88 : y+68, e.chart === false ? 28 : 22, "mono", fg, w-56));
    var pts = [8,16,10,24,18,30,22,34,26,20,28].map(function(v, i) { return `${x+30+i*12},${y+108-v}`; }).join(" ");
    if (e.chart !== false) o.push(`<polyline points="${pts}" stroke="${fg}" stroke-width="3" fill="none"/>`);
  } else if (look == "matrix") {
    var heart = ["01100110", "11111111", "11111111", "11111111", "01111110", "00111100", "00011000", "00000000"];
    var s = 15, mx = cx-4*s, my = y+14;
    o.push(`<rect x="${mx-6}" y="${my-6}" width="${8*s+12}" height="${8*s+12}" fill="#1a1a1a"/>`);
    for (var r = 0; r < 8; r++) for (var c = 0; c < 8; c++)
      o.push(`<circle cx="${mx+c*s+s/2}" cy="${my+r*s+s/2}" r="5.2" fill="${heart[r][c] == "1" ? (e.on || "#ff3b2f") : "#3a3a3a"}"/>`);
  } else if (look == "touch") {
    for (var i = 0; i < 4; i++)
      o.push(`<rect x="${x+22+i*40}" y="${y+28}" width="28" height="40" rx="6" fill="#d9b44a"/>`);
    o.push(chip(cx, cy+40, 72, 40, e.label || ""));
  } else throw new Error("Unknown look " + look);
  return o.join("");
}

var LOOKS = {
  strip: function() { // RGB LED strip
    var cols = ["#ff3b30", "#ff9500", "#ffcc00", "#4cd964", "#5ac8fa", "#007aff", "#5856d6", "#ff2d55"];
    return '<g transform="rotate(-12 180 100)"><rect x="5" y="70" width="350" height="56" rx="6" fill="#f2f2f2" stroke="#ccc" stroke-width="2"/>' +
      cols.map(function(c, i) {
        var x = 18+i*42;
        return `<circle cx="${x+14}" cy="98" r="22" fill="${c}" fill-opacity="0.25"/><rect x="${x}" y="84" width="28" height="28" rx="3" fill="#fff" stroke="#bbb"/><circle cx="${x+14}" cy="98" r="10" fill="${c}"/>`;
      }).join("") + "</g>";
  },
  motor: function() {
    return '<rect x="58" y="34" width="132" height="132" rx="14" fill="#3a3d41"/><rect x="64" y="40" width="120" height="120" rx="10" fill="#4b4f54"/>' +
      '<circle cx="124" cy="100" r="34" fill="#9aa0a5"/><circle cx="124" cy="100" r="12" fill="#ddd"/><rect x="120" y="58" width="8" height="42" fill="#ddd"/>' +
      [[76, 52], [172, 52], [76, 148], [172, 148]].map(function(p) { return `<circle cx="${p[0]}" cy="${p[1]}" r="5" fill="#222"/>`; }).join("") +
      ["#e74c3c", "#2c3e50", "#27ae60", "#2980b9"].map(function(c, i) {
        return `<path d="M${100+i*14},166 C${100+i*14},190 ${60+i*14},185 ${40+i*12},200" stroke="${c}" stroke-width="5" fill="none"/>`;
      }).join("");
  },
  nixie: function() {
    return ["1", "2"].map(function(d, i) {
      var x = 60+i*78;
      return `<rect x="${x}" y="22" width="64" height="150" rx="32" fill="#e8eef2" fill-opacity="0.7" stroke="#aab4bb" stroke-width="3"/>` +
        `<rect x="${x+6}" y="168" width="52" height="20" rx="3" fill="#333"/>` +
        `<text x="${x+32}" y="128" font-family="'Noto Sans', sans-serif" font-size="82" fill="#ff7a1a" text-anchor="middle" stroke="#ffb347" stroke-width="1">${d}</text>`;
    }).join("");
  },
  knob: function() { // rotary encoder
    var o = ['<rect x="54" y="50" width="140" height="120" rx="10" fill="#23804a"/><rect x="78" y="70" width="92" height="80" rx="4" fill="#c0c4c8"/>',
      '<circle cx="124" cy="110" r="42" fill="#2b2b2b"/><circle cx="124" cy="110" r="32" fill="#444"/>'];
    for (var i = 0; i < 18; i++) {
      var a = i*Math.PI*2/18;
      o.push(`<line x1="${(124+33*Math.cos(a)).toFixed(1)}" y1="${(110+33*Math.sin(a)).toFixed(1)}" x2="${(124+41*Math.cos(a)).toFixed(1)}" y2="${(110+41*Math.sin(a)).toFixed(1)}" stroke="#666" stroke-width="3"/>`);
    }
    o.push('<rect x="120" y="80" width="8" height="24" rx="3" fill="#ddd"/>');
    o.push('<path d="M60,40 A80,80 0 0 1 188,40" stroke="#888" stroke-width="4" fill="none" marker-end="url(#arr)"/>');
    for (i = 0; i < 5; i++) o.push(`<rect x="${80+i*20}" y="166" width="6" height="24" fill="#bbb"/>`);
    return o.join("");
  },
  bead: function() { // thermistor
    return '<path d="M110,120 L90,205 M138,120 L158,205" stroke="#aaa" stroke-width="5" fill="none"/>' +
      '<ellipse cx="124" cy="92" rx="34" ry="40" fill="#2f5d9e"/><ellipse cx="114" cy="80" rx="10" ry="14" fill="#fff" fill-opacity="0.3"/>';
  },
  led: function() { // single RGB LED
    return '<circle cx="124" cy="80" r="70" fill="url(#rgbglow)"/>' +
      '<path d="M96,140 v-60 a28,28 0 0 1 56,0 v60 z" fill="#fff" fill-opacity="0.85" stroke="#ccc" stroke-width="2"/>' +
      '<rect x="90" y="138" width="68" height="10" rx="2" fill="#e8e8e8" stroke="#ccc"/>' +
      [0, 1, 2, 3].map(function(i) { return `<rect x="${102+i*14}" y="148" width="5" height="${i == 1 ? 42 : 52}" fill="#aaa"/>`; }).join("");
  }
};

// ---------------------------------------------------------------- code window
var CODE_COLS = { kw: "#c678dd", str: "#98c379", num: "#d19a66", fn: "#61afef", txt: "#d7dae0", com: "#7f848e" };
var TOKEN = /(\/\/.*$)|("[^"]*"?|'[^']*'?)|\b(var|let|const|function|return|new|if|else|for|while|require|true|false|this)\b|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)(?=\()|([^"'\/\w]+|\w+|\/)/g;
function highlight(line) {
  var out = [], m;
  TOKEN.lastIndex = 0;
  while ((m = TOKEN.exec(line))) {
    var type = m[1] ? "com" : m[2] ? "str" : m[3] ? "kw" : m[4] ? "num" : m[5] ? "fn" : "txt";
    out.push(`<tspan fill="${CODE_COLS[type]}">${esc(m[0])}</tspan>`);
  }
  return out.join("");
}

function firstCode(text) {
  var out = [], inBlock = false, lines = text.split("\n");
  for (var i = 0; i < lines.length && out.length < 8; i++) {
    if (/^\s*(```|~~~)/.test(lines[i])) {
      if (inBlock && out.length) break;
      inBlock = !inBlock;
    } else if (inBlock && lines[i].trim()) out.push(lines[i]);
  }
  return out;
}

function codeWindow(lines, x, y, w, h) {
  var o = [`<rect x="${x+3}" y="${y+5}" width="${w}" height="${h}" rx="9" fill="#000" fill-opacity="0.15"/>`,
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="9" fill="#282c34"/>`,
    `<path d="M${x},${y+9} a9,9 0 0 1 9,-9 h${w-18} a9,9 0 0 1 9,9 v13 h-${w} z" fill="#3b4048"/>`];
  ["#ff5f56", "#ffbd2e", "#27c93f"].forEach(function(c, i) {
    o.push(`<circle cx="${x+13+i*13}" cy="${y+11}" r="4" fill="${c}"/>`);
  });
  var fs = 11.5, maxch = Math.floor((w-16)/(fs*0.6));
  lines.slice(0, Math.floor((h-34)/16)).forEach(function(l, i) {
    l = l.replace(/\s+$/, "").replace(/\t/g, "  ");
    if (l.length > maxch) l = l.substr(0, maxch-1) + "…";
    o.push(`<text x="${x+9}" y="${y+40+i*16}" font-family="'Noto Sans Mono', 'DejaVu Sans Mono', monospace" font-size="${fs}" xml:space="preserve">${highlight(l)}</text>`);
  });
  return o.join("");
}

// ---------------------------------------------------------------- page
function pageSVG(file, e) {
  var body = [], icons = e.icons || [], cols = e.colors || [];
  function col(i) { return colour(cols[Math.min(i, cols.length-1)], COLORS.network); }
  var pos;
  if (e.layout == "hw") {
    var look = e.look || "chip";
    body.push(LOOKS[look] ? LOOKS[look](e) : boardLook(e));
    pos = [[], [[285, 100, 46]], [[285, 62, 38], [285, 148, 38]], [[270, 52, 32], [318, 104, 32], [270, 156, 32]]][Math.min(icons.length, 3)];
    pos.forEach(function(p, i) { body.push(badge(icons[i], p[0], p[1], p[2], col(i))); });
  } else if (e.layout == "code") {
    var code = e.code || readPage(file).code;
    if (!code.length) code = [`var m = require("${e.label || pageName(file)}");`];
    body.push(codeWindow(code, 150, 20, 196, 170));
    body.push(badge(icons[0] || "extension", 82, 100, 60, col(0)));
    if (icons.length > 1) body.push(badge(icons[1], 132, 158, 26, col(1)));
  } else if (e.layout == "icon") {
    pos = [[], [[180, 100, 72]], [[115, 100, 58], [245, 100, 58]], [[70, 105, 48], [180, 95, 56], [290, 105, 48]]][Math.min(icons.length, 3)];
    pos.forEach(function(p, i) { body.push(badge(icons[i], p[0], p[1], p[2], col(i))); });
  } else throw new Error(`Unknown layout '${e.layout}' for ${file}`);
  if (e.sub) {
    body.push(text(e.title, 180, 236, 32, "bold", "#222", 340));
    body.push(text(e.sub, 180, 264, 17, "reg", "#666", 344));
  } else body.push(text(e.title, 180, 248, 32, "bold", "#222", 340));
  var defs = '<defs><marker id="arr" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto">' +
    '<path d="M0,0 L10,5 L0,10 z" fill="#888"/></marker>' +
    '<radialGradient id="rgbglow"><stop offset="0" stop-color="#ff40c0" stop-opacity="0.7"/>' +
    '<stop offset="0.5" stop-color="#40a0ff" stop-opacity="0.35"/><stop offset="1" stop-color="#40ff80" stop-opacity="0"/></radialGradient></defs>';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${defs}` +
    `<rect width="${W}" height="${H}" fill="#fff"/>${body.join("")}</svg>`;
}

function createThumbnail(file, tmpDir) {
  var e = PAGES[file] || guessSettings(file);
  var dst = opts.out ? path.join(opts.out, file.slice(0, -3).replace(/[\/ ]/g, "_") + ".jpg")
                     : path.join(BASEDIR, file.slice(0, -3) + ".thumb.jpg");
  if (e.layout == "photo") {
    child_process.execFileSync("convert", [path.join(BASEDIR, e.photo), "-resize", `${W}x${H}`, "-background", "white",
      "-gravity", "center", "-extent", `${W}x${H}`, "-strip", "-quality", "88", dst]);
  } else {
    var svgFile = opts.out ? dst.replace(/\.jpg$/, ".svg") : path.join(tmpDir, "thumb.svg");
    fs.writeFileSync(svgFile, pageSVG(file, e));
    child_process.execFileSync("convert", ["-background", "white", svgFile, "-flatten", "-strip", "-quality", "88", dst]);
  }
  console.log(`${PAGES[file] ? "THUMBNAIL" : "THUMBNAIL (guessed)"} ${file} --> ${path.relative(process.cwd(), dst)}`);
}

// ---------------------------------------------------------------- main
var files;
if (opts.files.length) {
  files = opts.files.map(function(f) {
    var rel = path.relative(BASEDIR, path.resolve(f));
    if (allPages().indexOf(rel) < 0) {
      console.error("Not a Markdown file or example in this repository: " + f);
      process.exit(1);
    }
    return rel;
  });
} else files = pagesWithoutThumbnail();

if (opts.list) {
  files.forEach(function(f) {
    var t = existingThumbnail(f);
    if (t && t.startsWith("data:")) t = "an image embedded in the page";
    console.log(t ? `${f}  (has ${t})` : f);
  });
  process.exit(0);
}

if (opts.out) fs.mkdirSync(opts.out, { recursive: true });
var tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "thumbnail-"));
var made = 0, skipped = 0;
try {
  files.forEach(function(f) {
    if (!opts.out && !opts.force && fs.existsSync(path.join(BASEDIR, f.slice(0, -3) + ".thumb.jpg"))) {
      console.log(`SKIPPING ${f} - ${f.slice(0, -3)}.thumb.jpg exists (use --force to overwrite)`);
      skipped++;
      return;
    }
    createThumbnail(f, tmpDir);
    made++;
  });
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
console.log(`${made} thumbnail(s) created` + (skipped ? `, ${skipped} skipped` : ""));
