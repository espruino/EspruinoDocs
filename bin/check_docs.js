#!/usr/bin/env node
/* Copyright (c) 2026 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/*
Checks the documentation in this repository for:

  * Spelling mistakes - in Markdown files and in the comments of JS files
    (code blocks, inline code, URLs, identifiers and acronyms are ignored).
    Words are accepted if they're valid British *or* American English, or
    are listed in bin/spelling-wordlist.txt
  * Broken internal links - relative links to files in this repository, plus
    the site-relative links the build script understands (`/modules/X.js`,
    `/Reference`, `/Page+Name`, `/files/...`)
  * Broken external links - http(s) URLs. URLs that were verified recently are
    stored in `.linkcache.json` so later runs are fast.

Usage:

  node bin/check_docs.js [options] [files...]

  files...            Only check these files (default: all tracked .md/.js files)
  --no-spelling       Don't check spelling
  --no-internal       Don't check internal links
  --no-external       Don't check external links
  --max-age=DAYS      Re-check external URLs verified more than DAYS ago (default 30)
  --refresh           Ignore the link cache and re-check every external URL
  --concurrency=N     Max simultaneous external requests (default 16, 2 per host)
  --timeout=SECONDS   Timeout for each external request (default 20)
  --strict-external   Treat 'maybe broken' external links (403, 429, 5xx,
                      timeouts) as errors rather than warnings
  --update-wordlist   Add every currently unknown word to the word list
  --no-suggest        Don't compute spelling suggestions (faster)
  --cache=FILE        Link cache file (default .linkcache.json)
  --fix               Interactively fix problems: for each spelling mistake or
                      link with a suggested fix, show the line (and the lines
                      either side) and ask whether to fix it. Broken external
                      URLs can be marked as OK in the link cache, or ignored

Exit code is 1 if any errors were found.
*/
"use strict";
const fs = require("fs");
const path = require("path");
const childProcess = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const WORDLIST_FILE = path.join(ROOT, "bin/spelling-wordlist.txt");
const LINK_IGNORE_FILE = path.join(ROOT, "bin/link-ignore.txt");
const RENAMED_FILE = path.join(ROOT, "RENAMED.csv");
const IN_GITHUB = !!process.env.GITHUB_ACTIONS;

// Directories whose .md / .js files we check
const SKIP_DIRS = ["node_modules", "html", ".git", "testing", ".github"];
// Translated pages (eg. Vizibles.es.md) - not spell checked
const TRANSLATED_FILE = /\.(es|de|fr|it|pt|nl|ru|zh|ja|ko|pl|cs)\.md$/;
// Pages that exist on espruino.com but aren't Markdown files here (see knownPageLinks in build.js)
const SITE_PAGES = ["Order", "Search", "Reference", "Download", "binaries"];
// Directories whose .js files are served as /modules/X.js
const MODULE_DIRS = ["modules", "devices", "boards"];
// Paths the build serves straight from the repository root
const ROOT_DIRS = ["files", "datasheets", "modules"];

// ---------------------------------------------------------------- Options
const opts = {
  spelling: true, internal: true, external: true,
  maxAge: 30, refresh: false, concurrency: 16, perHost: 2, timeout: 20,
  strictExternal: false, updateWordlist: false, suggest: true, fix: false,
  cache: path.join(ROOT, ".linkcache.json"),
  files: []
};
for (const arg of process.argv.slice(2)) {
  let m;
  if (arg == "--no-spelling") opts.spelling = false;
  else if (arg == "--no-internal") opts.internal = false;
  else if (arg == "--no-external") opts.external = false;
  else if (arg == "--refresh") opts.refresh = true;
  else if (arg == "--strict-external") opts.strictExternal = true;
  else if (arg == "--update-wordlist") opts.updateWordlist = true;
  else if (arg == "--no-suggest") opts.suggest = false;
  else if (arg == "--fix") opts.fix = true;
  else if ((m = arg.match(/^--max-age=(\d+(?:\.\d+)?)$/))) opts.maxAge = parseFloat(m[1]);
  else if ((m = arg.match(/^--concurrency=(\d+)$/))) opts.concurrency = parseInt(m[1]);
  else if ((m = arg.match(/^--timeout=(\d+)$/))) opts.timeout = parseInt(m[1]);
  else if ((m = arg.match(/^--cache=(.+)$/))) opts.cache = path.resolve(m[1]);
  else if (arg == "--help" || arg == "-h") {
    const src = fs.readFileSync(__filename, "utf8");
    const start = src.indexOf("Checks the");
    console.log(src.substring(start, src.indexOf("*/", start)));
    process.exit(0);
  } else if (arg.startsWith("--")) {
    console.error("Unknown option " + arg + " (try --help)");
    process.exit(2);
  } else opts.files.push(arg);
}

// ---------------------------------------------------------------- Issue reporting
const issues = []; // {file, line, severity:"error"|"warning", type, message, ...extra}
/* extra is used by --fix: {word} for spelling, {url, replacement} for links */
function report(file, line, severity, type, message, extra) {
  issues.push(Object.assign({ file, line, severity, type, message }, extra));
}

// ---------------------------------------------------------------- Files to check
function listFiles() {
  let files;
  try { // Prefer tracked files so local scratch files aren't checked
    files = childProcess.execSync("git ls-files -z --cached --others --exclude-standard", { cwd: ROOT, maxBuffer: 64 << 20 })
      .toString().split("\0").filter(Boolean);
  } catch (e) {
    files = [];
    (function walk(dir) {
      for (const f of fs.readdirSync(path.join(ROOT, dir))) {
        const rel = dir ? dir + "/" + f : f;
        if (fs.statSync(path.join(ROOT, rel)).isDirectory()) walk(rel);
        else files.push(rel);
      }
    })("");
  }
  return files.filter(f => (f.endsWith(".md") || f.endsWith(".js")) &&
    !SKIP_DIRS.includes(f.split("/")[0]) &&
    !(f.endsWith(".js") && (f.split("/").length < 2 || f.startsWith("bin/"))) && // build scripts, app.js
    !f.endsWith(".min.js") &&
    fs.existsSync(path.join(ROOT, f)));
}
const allFiles = listFiles();
const filesToCheck = opts.files.length ?
  opts.files.map(f => path.relative(ROOT, path.resolve(f)).split(path.sep).join("/")) : allFiles;

// Page name -> file, for `/Page+Name` style links
const pageNames = {};
allFiles.forEach(f => {
  if (f.endsWith(".md") || f.startsWith("examples/"))
    pageNames[path.basename(f).slice(0, -3)] = f;
});
const renamedPages = {};
if (fs.existsSync(RENAMED_FILE)) fs.readFileSync(RENAMED_FILE, "utf8").split("\n").forEach(l => {
  const m = l.match(/^([^#,][^,]*),(.*)$/);
  if (m) renamedPages[m[1].trim()] = m[2].trim();
});

// ---------------------------------------------------------------- Text extraction
/* Returns [{text, line}] - the parts of a file that are Markdown. For .md it's
the whole file, for .js it's the block comments. */
function getMarkdownChunks(file, contents) {
  if (file.endsWith(".md")) return [{ text: contents, line: 1 }];
  const chunks = [];
  const add = (text, start) => {
    const line = contents.substring(0, start).split("\n").length;
    if (text.startsWith("*")) // JSDoc - strip leading ' * '
      text = text.substring(1).split("\n").map(l => l.replace(/^\s*\*(?!\*) ?/, "")).join("\n");
    chunks.push({ text, line });
  };
  try {
    require("acorn").parse(contents, {
      ecmaVersion: 2019, sourceType: "script", allowReturnOutsideFunction: true,
      allowHashBang: true, allowReserved: true, allowAwaitOutsideFunction: true,
      onComment: (block, text, start) => { if (block) add(text, start); }
    });
  } catch (e) { // unparseable (newer syntax?) - fall back to a regex
    chunks.length = 0;
    const re = /\/\*([\s\S]*?)\*\//g;
    let m;
    while ((m = re.exec(contents))) add(m[1], m.index);
  }
  return chunks;
}

/* Scan a Markdown chunk. Calls onLink(url, line) and onProse(text, line)
for the non-code parts of each line. */
function scanMarkdown(text, firstLine, onLink, onProse) {
  const lines = text.split("\n");
  let fence = null, inComment = false, inPre = false;
  let prevBlank = true, inIndentedCode = false, lastWasList = false;
  lines.forEach((rawLine, idx) => {
    const lineNo = firstLine + idx;
    let line = rawLine.replace(/\r$/, "");
    // fenced code
    const fm = line.match(/^\s*(`{3,}|~{3,})/);
    if (fence) {
      if (fm && fm[1][0] == fence[0] && fm[1].length >= fence.length) fence = null;
      return;
    }
    if (fm) { fence = fm[1]; return; }
    // indented code (4 spaces after a blank line, not continuing a list)
    const blank = !line.trim();
    if (/^( {4}|\t)/.test(line) && !blank && (inIndentedCode || (prevBlank && !lastWasList))) {
      inIndentedCode = true;
      return;
    }
    if (!blank) {
      inIndentedCode = false;
      if (!/^\s/.test(line)) lastWasList = /^([*+-]|\d+\.)\s/.test(line);
    }
    prevBlank = blank;
    // multi-line HTML comments and <pre>/<script>/<style> blocks
    if (inComment) {
      const e = line.indexOf("-->");
      if (e < 0) return;
      inComment = false;
      line = line.substring(e + 3);
    }
    line = line.replace(/<!--.*?-->/g, " ");
    const cs = line.indexOf("<!--");
    if (cs >= 0) { inComment = true; line = line.substring(0, cs); }
    if (inPre) {
      const e = line.search(/<\/(pre|script|style|code)>/i);
      if (e < 0) return;
      inPre = false;
      line = line.substring(e).replace(/^<\/\w+>/, "");
    }
    line = line.replace(/<(pre|script|style|code)\b[^>]*>[\s\S]*?<\/\1>/gi, " ");
    const ps = line.search(/<(pre|script|style|code)\b/i);
    if (ps >= 0) { inPre = true; line = line.substring(0, ps); }
    // inline code
    line = line.replace(/(`+)[\s\S]*?\1/g, " ");
    // ---- links
    // [[http://youtube...]] videos, and old-style [[Page Name]] links
    line = line.replace(/\[\[([^\[\]]+)\]\]/g, (all, inner) => {
      if (/^https?:\/\//.test(inner)) onLink(inner.trim(), lineNo);
      else onLink("[[" + inner.trim() + "]]", lineNo);
      return " ";
    });
    // reference-style definitions: [id]: url "title"
    const rd = line.match(/^\s{0,3}\[[^\]]+\]:\s*<?([^\s>]+)>?/);
    if (rd) { onLink(rd[1], lineNo); return; }
    // inline links/images: ](dest "title") - dest may contain spaces and balanced brackets
    let out = "", i = 0, j;
    while ((j = line.indexOf("](", i)) >= 0) {
      out += line.substring(i, j + 1);
      let k = j + 2, depth = 0;
      for (; k < line.length; k++) {
        if (line[k] == "(") depth++;
        else if (line[k] == ")") { if (!depth) break; depth--; }
      }
      if (k >= line.length) { i = j + 1; continue; } // not a link
      let dest = line.substring(j + 2, k).trim();
      if (dest.startsWith("<") && dest.indexOf(">") > 0) dest = dest.substring(1, dest.indexOf(">"));
      else dest = dest.replace(/\s+("[^"]*"|'[^']*'|\([^)]*\))$/, "");
      if (dest) onLink(dest, lineNo);
      out += " ";
      i = k + 1;
    }
    line = out + line.substring(i);
    // * BUYFROM: price,price,link1,link2|name,link3
    const bf = line.match(/^\s*\*\s+BUYFROM:(.*)$/);
    if (bf) {
      bf[1].split(",").slice(2).forEach(l => { l = l.split("|")[0].trim(); if (l) onLink(l, lineNo); });
      return;
    }
    // HTML attributes
    line = line.replace(/\b(?:href|src)\s*=\s*(["'])(.*?)\1/gi, (all, q, url) => { onLink(url, lineNo); return " "; });
    // autolinks and bare URLs
    line = line.replace(/<(https?:\/\/[^>\s]+)>/g, (all, url) => { onLink(url, lineNo); return " "; });
    line = line.replace(/\bhttps?:\/\/[^\s<>"'`\]\[]+/g, url => {
      url = url.replace(/[.,;:!?*_]+$/, "");
      if (url.endsWith(")") && !url.includes("(")) url = url.replace(/\)+$/, "");
      onLink(url, lineNo);
      return " ";
    });
    // ---- prose
    if (/^\s*\*\s+[A-Z_]+:/.test(line)) return; // * KEYWORDS: etc
    onProse(line.replace(/<[^>]*>/g, " ").replace(/&\w+;/g, " "), lineNo);
  });
}

// ---------------------------------------------------------------- Spelling
let spellers = null, customWords = new Set(), customWordsExact = new Set();
function loadSpelling() {
  const nspell = require("nspell");
  const load = pkg => {
    const dir = path.join(ROOT, "node_modules", pkg);
    return nspell(fs.readFileSync(path.join(dir, "index.aff")), fs.readFileSync(path.join(dir, "index.dic")));
  };
  spellers = [load("dictionary-en-gb"), load("dictionary-en")];
  if (fs.existsSync(WORDLIST_FILE))
    fs.readFileSync(WORDLIST_FILE, "utf8").split("\n").forEach(w => {
      w = w.replace(/#.*$/, "").trim();
      if (!w) return;
      // lowercase entries match any case, capitalised entries must match case
      if (w == w.toLowerCase()) customWords.add(w);
      else customWordsExact.add(w);
    });
}

const wordCache = new Map();
function isWordOk(word) {
  if (wordCache.has(word)) return wordCache.get(word);
  const lower = word.toLowerCase();
  // lowercase entries match any case, capitalised entries (eg. 'Espruino') must match case
  const ok = customWords.has(lower) || customWordsExact.has(word) || spellers.some(s => s.correct(word));
  wordCache.set(word, ok);
  return ok;
}

const unknownWords = new Map(); // word -> count
function checkProse(file, text, line) {
  text = text
    .replace(/[‘’]/g, "'")
    .replace(/\b[\w.+-]+@[\w-]+\.[\w.]+\b/g, " ") // emails
    .replace(/[\w$]*[\w$\])](?:[._:/\\#]+[\w$]+)+[\w$]*\(?/g, " ") // a.b, foo_bar, a/b, E.on(, Puck.js
    .replace(/[\w$]+\(/g, " ") // function calls
    .replace(/[$#@%\\][\w$]+/g, " "); // $var #hash @user %20
  const re = /[\p{L}\d]+(?:'[\p{L}]+)*/gu;
  let m;
  while ((m = re.exec(text))) {
    let word = m[0].replace(/'s$/i, "");
    if (word.length < 2) continue;
    if (/\d/.test(word)) continue; // numbers, part numbers
    if (/[^\x00-\x7f]/.test(word)) continue; // non-English words
    if (word == word.toUpperCase()) continue; // acronyms
    if (/.[A-Z]/.test(word)) continue; // camelCase / WiFi / mAh
    // ignore anything that's directly attached to code-ish characters
    const before = text[m.index - 1], after = text[m.index + m[0].length];
    if (before == "_" || after == "_" || before == "=" || after == "=") continue;
    if (isWordOk(word)) continue;
    unknownWords.set(word, (unknownWords.get(word) || 0) + 1);
    report(file, line, "error", "spelling", word, { word });
  }
}

// ---------------------------------------------------------------- Internal links
/* Does a path on espruino.com (eg 'Web+IDE', 'modules/MQTT.js') come from a file in this repo? */
function sitePageExists(p) {
  p = p.replace(/\/$/, "");
  const mm = p.match(/^modules\/([^/]+?)(?:\.min)?\.js$/);
  return !!(SITE_PAGES.includes(p) || pageNames[p.replace(/\+/g, " ")] ||
    (mm && MODULE_DIRS.some(d => fs.existsSync(path.join(ROOT, d, mm[1] + ".js")))) ||
    (ROOT_DIRS.includes(p.split("/")[0]) && fs.existsSync(path.join(ROOT, p))));
}
function checkInternalLink(file, line, url) {
  const relTo = f => path.relative(path.dirname(file), f).split(path.sep).join("/");
  if (url.startsWith("[[")) { // old style [[Page Name]]
    const name = url.slice(2, -2).split("|")[0].trim();
    if (!pageNames[name] && !SITE_PAGES.includes(name))
      report(file, line, "error", "link", `${url} - no page called ${JSON.stringify(name)}`, { url });
    else {
      const replacement = `[${name}](${pageNames[name] ? relTo(pageNames[name]) : "https://www.espruino.com/" + name})`;
      report(file, line, "warning", "link", `${url} - old-style link, use ${replacement} so it works on GitHub too`, { url, replacement });
    }
    return;
  }
  let target = url.replace(/[#?].*$/, "");
  if (!target) return; // anchor on the same page
  try { target = decodeURI(target); } catch (e) { }
  let ok;
  if (target.startsWith("/")) { // site-relative link
    const p = target.substring(1).replace(/\/$/, "");
    const pageName = p.replace(/\+/g, " ");
    if (renamedPages[pageName]) {
      const newPage = renamedPages[pageName].replace(/^\//, "").replace(/\+/g, " ");
      const replacement = pageNames[newPage] ? relTo(pageNames[newPage]) : renamedPages[pageName];
      report(file, line, "error", "link", `${url} - page was renamed to ${renamedPages[pageName]}`, { url, replacement });
      return;
    }
    ok = sitePageExists(p);
  } else {
    const rel = path.join(path.dirname(file), target);
    ok = fs.existsSync(path.join(ROOT, rel)) ||
      fs.existsSync(path.join(ROOT, target)) && ROOT_DIRS.includes(target.split("/")[0]);
    if (ok && path.relative(ROOT, path.join(ROOT, rel)).startsWith("..")) ok = false; // outside repo
  }
  if (!ok) {
    let msg = `${url} - file not found`;
    // try and suggest a fix
    const base = path.basename(target).replace(/\+/g, " ");
    const name = base.replace(/\.md$/, "");
    let hit = pageNames[name] || allFiles.find(f => path.basename(f) == base);
    if (!hit) {
      const lname = name.toLowerCase();
      hit = Object.keys(pageNames).find(n => n.toLowerCase() == lname);
      if (hit) hit = pageNames[hit];
    }
    let replacement;
    if (hit) {
      replacement = relTo(hit) + url.substring(url.search(/[#?]|$/)); // keep any #anchor
      msg += ` - did you mean ${replacement}?`;
    }
    report(file, line, "error", "link", msg, { url, replacement });
  }
}

// ---------------------------------------------------------------- External links
function loadIgnores() {
  const res = [
    /^https?:\/\/(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|0\.0\.0\.0|\[)/i, // local/private
    /^https?:\/\/([^/]*\.)?(example\.(com|org|net)|espruino\.local|mydomain\.com|myserver\.com)([/:]|$)/i,
    /[{}$<>]|\.\.\.|%s/ // templated URLs in examples
  ];
  if (fs.existsSync(LINK_IGNORE_FILE))
    fs.readFileSync(LINK_IGNORE_FILE, "utf8").split("\n").forEach(l => {
      l = l.trim();
      if (l && !l.startsWith("#")) res.push(new RegExp(l));
    });
  return res;
}

/* Cache file format:
  { version:1,
    urls : { url : "ISO date it was last verified OK" },
    warnings : { url : { checked : "ISO date", message : "HTTP 403 ..." } } // servers that block bots, etc
  }
URLs that are definitely broken are never cached, so they're re-checked every time. */
function loadCache() {
  const empty = { urls: {}, warnings: {} };
  if (opts.refresh || !fs.existsSync(opts.cache)) return empty;
  try {
    const c = JSON.parse(fs.readFileSync(opts.cache, "utf8"));
    return { urls: c.urls || {}, warnings: opts.strictExternal ? {} : (c.warnings || {}) };
  } catch (e) { console.warn("Couldn't read link cache " + opts.cache + ": " + e); return empty; }
}
function saveCache(cache) {
  const sort = o => { const r = {}; Object.keys(o).sort().forEach(k => r[k] = o[k]); return r; };
  fs.writeFileSync(opts.cache, JSON.stringify({ version: 1, urls: sort(cache.urls), warnings: sort(cache.warnings) }, null, 1) + "\n");
}

const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36 EspruinoDocs-link-check";
async function request(url, method) {
  const res = await fetch(url, {
    method, redirect: "follow",
    signal: AbortSignal.timeout(opts.timeout * 1000),
    headers: { "User-Agent": UA, "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8", "Accept-Language": "en" }
  });
  if (res.body) res.body.cancel().catch(() => { }); // we only need the status
  return res.status;
}

/* Is this error a sign the whole server is down/unreachable (rather than just one page)? */
const isHostDown = err => !!err && (err.code ? err.code != "UND_ERR_SOCKET" : (err.status >= 520 && err.status <= 530));
const deadHosts = {}; // host -> error, so we don't wait for timeouts on every URL of a dead server

/* Returns {ok:true} or {severity, message} */
async function checkUrl(url, host) {
  let lastErr = deadHosts[host] || null;
  for (let attempt = 0; attempt < 2 && !deadHosts[host]; attempt++) {
    for (const method of ["HEAD", "GET"]) {
      try {
        const status = await request(url, method);
        if (status < 400) return { ok: true };
        lastErr = { status };
        if (status >= 500) break; // lots of servers don't like HEAD so we try GET too - but not if the server is broken
      } catch (e) {
        const cause = e.cause || e;
        lastErr = e.name == "TimeoutError" ? { code: "TimeoutError", message: `no response in ${opts.timeout}s` } :
          { code: cause.code || e.name, message: cause.message || e.message };
        break; // connection-level failure - GET won't help
      }
    }
    // only retry if the server says try again later
    if (!(lastErr.status == 429 || lastErr.status == 503 || lastErr.code == "UND_ERR_SOCKET")) break;
    await new Promise(r => setTimeout(r, 3000));
  }
  if (isHostDown(lastErr)) deadHosts[host] = lastErr;
  if (lastErr.status) {
    if (lastErr.status == 404 || lastErr.status == 410)
      return { severity: "error", message: `HTTP ${lastErr.status}` };
    return { severity: opts.strictExternal ? "error" : "warning", message: `HTTP ${lastErr.status} (may be temporary, or blocking automated requests)` };
  }
  if (lastErr.code == "ENOTFOUND")
    return { severity: "error", message: "domain does not exist" };
  return { severity: opts.strictExternal ? "error" : "warning", message: `${lastErr.code}: ${lastErr.message}` };
}

let linkCache = null; // so --fix can modify it
async function checkExternalLinks(externalLinks) {
  const cache = linkCache = loadCache();
  const maxAgeMs = opts.maxAge * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const fresh = date => { const t = date && Date.parse(date); return t && now - t < maxAgeMs; };
  let cachedWarnings = 0;
  const toCheck = Object.keys(externalLinks).filter(url => {
    if (fresh(cache.urls[url])) return false;
    const w = cache.warnings[url];
    if (w && fresh(w.checked)) { // still report it, but don't re-fetch
      cachedWarnings++;
      externalLinks[url].forEach(({ file, line }) => report(file, line, "warning", "external", `${url} - ${w.message} (cached ${w.checked.substring(0, 10)})`, { url }));
      return false;
    }
    return true;
  });
  console.log(`External links: ${Object.keys(externalLinks).length} unique URLs, ${Object.keys(externalLinks).length - toCheck.length - cachedWarnings} recently verified, ${cachedWarnings} cached warnings, ${toCheck.length} to check...`);
  // Spread requests across hosts so we don't hammer any one server
  const hostOf = u => { try { return new URL(u).host; } catch (e) { return u; } };
  const queue = toCheck.slice();
  const hostActive = {};
  let active = 0, done = 0, sinceSave = 0;
  const saveNow = () => { saveCache(cache); sinceSave = 0; };
  process.on("SIGINT", () => { console.log("\nInterrupted - saving link cache"); saveNow(); process.exit(130); });

  await new Promise(resolve => {
    if (!queue.length) return resolve();
    function next() {
      while (active < opts.concurrency && queue.length) {
        const idx = queue.findIndex(u => (hostActive[hostOf(u)] || 0) < opts.perHost);
        if (idx < 0) break;
        const url = queue.splice(idx, 1)[0], host = hostOf(url);
        hostActive[host] = (hostActive[host] || 0) + 1;
        active++;
        checkUrl(url, host).then(result => {
          delete cache.urls[url];
          delete cache.warnings[url];
          if (result.ok) cache.urls[url] = new Date().toISOString();
          else if (result.severity == "warning") cache.warnings[url] = { checked: new Date().toISOString(), message: result.message };
          if (++sinceSave >= 25) saveNow();
          if (!result.ok) {
            externalLinks[url].forEach(({ file, line }) => report(file, line, result.severity, "external", `${url} - ${result.message}`, { url }));
          }
        }).finally(() => {
          hostActive[host]--;
          active--;
          done++;
          if (process.stdout.isTTY) process.stdout.write(`\r  ${done}/${toCheck.length} checked`);
          else if (done % 100 == 0) console.log(`  ${done}/${toCheck.length} checked`);
          if (!active && !queue.length) resolve(); else next();
        });
      }
    }
    next();
  });
  if (process.stdout.isTTY && toCheck.length) process.stdout.write("\n");
  saveNow();
}

function addToWordlist(newWords) {
  const existing = fs.existsSync(WORDLIST_FILE) ? fs.readFileSync(WORDLIST_FILE, "utf8") : "";
  const header = existing.split("\n").filter(l => l.startsWith("#"));
  const words = new Set(existing.split("\n").filter(l => l.trim() && !l.startsWith("#")).map(l => l.trim()));
  newWords.forEach(w => {
    words.add(w);
    if (w == w.toLowerCase()) customWords.add(w); else customWordsExact.add(w);
    wordCache.delete(w);
  });
  fs.writeFileSync(WORDLIST_FILE, header.concat([...words].sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" }) || a.localeCompare(b))).join("\n") + "\n");
}

// ---------------------------------------------------------------- Interactive fixing (--fix)
const C = process.stdout.isTTY ?
  { dim: "\x1b[2m", bold: "\x1b[1m", red: "\x1b[31;1m", green: "\x1b[32m", cyan: "\x1b[36m", reset: "\x1b[0m" } :
  { dim: "", bold: "", red: "", green: "", cyan: "", reset: "" };

async function fixIssues(fixable, suggestFor) {
  const rl = require("readline").createInterface({ input: process.stdin, output: process.stdout });
  // queue lines ourselves, so answers typed ahead aren't lost and Ctrl-C/Ctrl-D quit cleanly
  const pending = [], waiting = [];
  let quit = false, closed = false;
  rl.on("line", l => waiting.length ? waiting.shift()(l) : pending.push(l));
  rl.on("close", () => { closed = true; while (waiting.length) waiting.shift()("q"); });
  rl.on("SIGINT", () => { quit = true; rl.close(); });
  const ask = q => {
    if (closed) return Promise.resolve("q");
    process.stdout.write(q);
    if (pending.length) { const l = pending.shift(); console.log(l); return Promise.resolve(l.trim()); }
    return new Promise(r => waiting.push(r)).then(l => l.trim());
  };

  const fileLines = {}; // file -> array of lines (we write the file after each change)
  const getLines = f => fileLines[f] || (fileLines[f] = fs.readFileSync(path.join(ROOT, f), "utf8").split("\n"));
  const saveLines = f => fs.writeFileSync(path.join(ROOT, f), fileLines[f].join("\n"));
  const escRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const wordRe = w => new RegExp(`(?<![\\p{L}\\d_'])${escRe(w)}(?![\\p{L}\\d_])`, "gu");
  /* Replace whole-word 'word' in a line, but not inside `code`, URLs or link destinations */
  const replaceWord = (line, word, to) => line.split(/(`+[^`]*`+|https?:\/\/\S+|\]\([^)]*\))/)
    .map((part, i) => i & 1 ? part : part.replace(wordRe(word), to)).join("");
  const lineHas = (file, line, re) => { re.lastIndex = 0; return re.test(getLines(file)[line - 1] || ""); };
  function showContext(file, line, highlight) {
    const lines = getLines(file);
    for (let l = Math.max(1, line - 1); l <= Math.min(lines.length, line + 1); l++) {
      let text = lines[l - 1].replace(/\r$/, "");
      if (l == line && highlight) text = text.replace(highlight, m => C.red + m + C.reset);
      console.log(`${l == line ? C.bold + ">" : C.dim + " "}${String(l).padStart(5)} | ${text}${C.reset}`);
    }
  }
  const stats = { fixed: 0, words: 0, cached: 0, ignored: 0 };
  const skipWords = new Set(), allFixes = new Map(); // word -> replacement for every occurrence
  const doneUrls = new Set();

  for (let n = 0; n < fixable.length && !quit; n++) {
    const issue = fixable[n];
    const where = `${C.cyan}[${n + 1}/${fixable.length}] ${issue.file}:${issue.line}${C.reset}`;

    if (issue.type == "spelling") {
      const word = issue.word, re = wordRe(word);
      if (skipWords.has(word) || isWordOk(word) || !lineHas(issue.file, issue.line, re)) { issue.resolved = isWordOk(word); continue; }
      const lines = getLines(issue.file);
      if (allFixes.has(word)) {
        lines[issue.line - 1] = replaceWord(lines[issue.line - 1], word, allFixes.get(word));
        saveLines(issue.file); stats.fixed++; issue.resolved = true;
        continue;
      }
      const sugg = suggestFor(word);
      console.log(`\n${where}  Unknown word ${C.red}${word}${C.reset}`);
      showContext(issue.file, issue.line, re);
      console.log("  " + (sugg.length ? sugg.map((s, i) => `${C.green}${i + 1}${C.reset}) ${s}`).join("   ") +
        `   ${C.dim}(add ! to fix every occurrence in this run, eg. 1!)${C.reset}` : `${C.dim}(no suggestions)${C.reset}`));
      for (;;) {
        const a = await ask(`  ${C.green}a${C.reset}) add to word list  ${C.green}e${C.reset}) enter replacement  ${C.green}s${C.reset}) skip  ${C.green}S${C.reset}) skip all "${word}"  ${C.green}q${C.reset}) quit > `);
        const m = a.match(/^(\d+)(!?)$/);
        let to = null, all = false;
        if (m && sugg[m[1] - 1]) { to = sugg[m[1] - 1]; all = !!m[2]; }
        else if (a == "e" || a == "e!") { to = await ask("  Replace with: "); all = a == "e!"; if (!to) continue; }
        else if (a == "a") { addToWordlist([word]); stats.words++; issue.resolved = true; console.log(`  Added "${word}" to ${path.relative(ROOT, WORDLIST_FILE)}`); break; }
        else if (a == "s" || a == "") break;
        else if (a == "S") { skipWords.add(word); break; }
        else if (a == "q") { quit = true; break; }
        else { console.log("  ?"); continue; }
        lines[issue.line - 1] = replaceWord(lines[issue.line - 1], word, to);
        saveLines(issue.file); stats.fixed++; issue.resolved = true;
        if (all) allFixes.set(word, to);
        break;
      }

    } else if (issue.type == "link") {
      const lines = getLines(issue.file);
      if (!lines[issue.line - 1].includes(issue.url)) continue;
      console.log(`\n${where}  ${issue.message}`);
      showContext(issue.file, issue.line, issue.url);
      for (;;) {
        const a = await ask(`  ${C.green}y${C.reset}) replace with ${C.bold}${issue.replacement}${C.reset}  ${C.green}e${C.reset}) enter replacement  ${C.green}s${C.reset}) skip  ${C.green}q${C.reset}) quit > `);
        let to = null;
        if (a == "y") to = issue.replacement;
        else if (a == "e") { to = await ask("  Replace with: "); if (!to) continue; }
        else if (a == "s" || a == "") break;
        else if (a == "q") { quit = true; break; }
        else { console.log("  ?"); continue; }
        lines[issue.line - 1] = lines[issue.line - 1].split(issue.url).join(to);
        saveLines(issue.file); stats.fixed++; issue.resolved = true;
        break;
      }

    } else if (issue.type == "external") {
      if (doneUrls.has(issue.url)) continue;
      doneUrls.add(issue.url);
      const uses = fixable.filter(i => i.type == "external" && i.url == issue.url);
      console.log(`\n${where}  ${issue.message}`);
      showContext(issue.file, issue.line, issue.url);
      if (uses.length > 1) console.log(`  ${C.dim}Also used in: ${uses.slice(1).map(i => i.file + ":" + i.line).join(", ")}${C.reset}`);
      for (;;) {
        const a = await ask(`  ${C.green}c${C.reset}) mark as OK in link cache  ${C.green}i${C.reset}) add to ${path.relative(ROOT, LINK_IGNORE_FILE)}  ${C.green}e${C.reset}) replace URL${uses.length > 1 ? " everywhere" : ""}  ${C.green}s${C.reset}) skip  ${C.green}q${C.reset}) quit > `);
        if (a == "c") {
          linkCache.urls[issue.url] = new Date().toISOString();
          delete linkCache.warnings[issue.url];
          saveCache(linkCache); stats.cached++;
          console.log(`  Marked as OK for ${opts.maxAge} days in ${path.relative(ROOT, opts.cache)}`);
        } else if (a == "i") {
          fs.appendFileSync(LINK_IGNORE_FILE, "^" + escRe(issue.url) + "$\n");
          stats.ignored++;
        } else if (a == "e") {
          const to = await ask("  Replace with: ");
          if (!to) continue;
          uses.forEach(i => {
            const l = getLines(i.file);
            l[i.line - 1] = l[i.line - 1].split(issue.url).join(to);
            saveLines(i.file);
          });
          stats.fixed += uses.length;
        } else if (a == "s" || a == "") break;
        else if (a == "q") { quit = true; break; }
        else { console.log("  ?"); continue; }
        uses.forEach(i => i.resolved = true);
        break;
      }
    }
  }
  rl.close();
  console.log(`\n${stats.fixed} fixed, ${stats.words} words added to the word list, ${stats.cached} URLs marked OK, ${stats.ignored} URLs ignored`);
}

// ---------------------------------------------------------------- Main
async function main() {
  if (opts.fix && !process.stdin.isTTY) {
    console.error("--fix needs an interactive terminal");
    process.exit(2);
  }
  if (opts.spelling) loadSpelling();
  const ignores = loadIgnores();
  const externalLinks = {}; // url -> [{file,line}]
  let linkCount = 0;

  for (const file of filesToCheck) {
    if (!fs.existsSync(path.join(ROOT, file))) { console.warn("No such file " + file); continue; }
    const contents = fs.readFileSync(path.join(ROOT, file), "utf8");
    for (const chunk of getMarkdownChunks(file, contents)) {
      scanMarkdown(chunk.text, chunk.line, (url, line) => {
        linkCount++;
        if (url.startsWith("//")) url = "https:" + url;
        if (/^https?:\/\//i.test(url)) {
          if (!opts.external || ignores.some(r => r.test(url))) return;
          url = url.replace(/#.*$/, "");
          // links to espruino.com pages generated from this repo don't need fetching
          const em = url.match(/^https?:\/\/(?:www\.)?espruino\.com\/([^?]*)$/i);
          if (em) {
            let p = em[1];
            try { p = decodeURI(p); } catch (e) { }
            if (p == "" || sitePageExists(p)) return;
          }
          (externalLinks[url] = externalLinks[url] || []).push({ file, line });
        } else if (/^[a-z][a-z0-9+.-]*:/i.test(url)) {
          // mailto:, data:, javascript:, chrome: etc - ignore
        } else if (opts.internal) {
          checkInternalLink(file, line, url);
        }
      }, (text, line) => {
        if (opts.spelling && !TRANSLATED_FILE.test(file)) checkProse(file, text, line);
      });
    }
  }
  console.log(`Checked ${filesToCheck.length} files, ${linkCount} links`);
  if (opts.external) await checkExternalLinks(externalLinks);

  // ---- Output
  issues.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
  const esc = s => String(s).replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A");
  const escProp = s => esc(s).replace(/:/g, "%3A").replace(/,/g, "%2C");
  const suggestions = new Map();
  const suggestFor = word => {
    if (!suggestions.has(word)) suggestions.set(word, spellers[0].suggest(word).slice(0, opts.fix ? 5 : 3));
    return suggestions.get(word);
  };
  const suggest = word => {
    if (!opts.suggest || !spellers) return "";
    const s = suggestFor(word);
    return s.length ? ` (did you mean ${s.join(", ")}?)` : "";
  };
  // with --fix, we only list issues that we can't offer to fix
  const canFix = i => opts.fix && (i.type == "spelling" || (i.type == "link" && i.replacement) ||
    (i.type == "external" && i.severity == "error"));
  for (const i of issues) {
    if (canFix(i)) continue;
    const msg = i.type == "spelling" ? `Unknown word ${JSON.stringify(i.message)}${suggest(i.message)}` : i.message;
    if (IN_GITHUB)
      console.log(`::${i.severity} file=${escProp(i.file)},line=${i.line},title=${escProp(i.type)}::${esc(msg)}`);
    else
      console.log(`${i.file}:${i.line}: ${i.severity} [${i.type}] ${msg}`);
  }

  const count = (sev, type) => issues.filter(i => i.severity == sev && (!type || i.type == type)).length;
  const summary = [
    `Spelling: ${opts.spelling ? count("error", "spelling") + " unknown words (" + unknownWords.size + " unique)" : "skipped"}`,
    `Internal links: ${opts.internal ? count("error", "link") + " broken, " + count("warning", "link") + " warnings" : "skipped"}`,
    `External links: ${opts.external ? count("error", "external") + " broken, " + count("warning", "external") + " warnings" : "skipped"}`
  ];
  console.log("\n" + summary.join("\n"));
  if (unknownWords.size && !opts.updateWordlist)
    console.log(`\nIf these words are correct, add them to ${path.relative(ROOT, WORDLIST_FILE)} (or run with --update-wordlist to add them all)`);

  if (process.env.GITHUB_STEP_SUMMARY) {
    let md = "## Documentation check\n\n" + summary.map(s => "* " + s).join("\n") + "\n";
    if (unknownWords.size) {
      md += "\n### Unknown words\n\nIf these are correct, add them to `bin/spelling-wordlist.txt`\n\n| Word | Count |\n|---|---|\n";
      [...unknownWords].sort((a, b) => b[1] - a[1]).slice(0, 200).forEach(([w, c]) => md += `| ${w} | ${c} |\n`);
    }
    const bad = issues.filter(i => i.type != "spelling" && i.severity == "error");
    if (bad.length) {
      md += "\n### Broken links\n\n| File | Line | Problem |\n|---|---|---|\n";
      bad.slice(0, 500).forEach(i => md += `| ${i.file} | ${i.line} | ${i.message.replace(/\|/g, "\\|")} |\n`);
    }
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, md);
  }

  if (opts.updateWordlist && unknownWords.size) {
    addToWordlist([...unknownWords.keys()]);
    console.log(`Added ${unknownWords.size} words to ${path.relative(ROOT, WORDLIST_FILE)}`);
    issues.splice(0, issues.length, ...issues.filter(i => i.type != "spelling"));
  }

  const fixable = issues.filter(canFix);
  if (fixable.length) await fixIssues(fixable, suggestFor);

  process.exit(issues.some(i => i.severity == "error" && !i.resolved) ? 1 : 0);
}

main().catch(e => { console.error(e); process.exit(2); });
