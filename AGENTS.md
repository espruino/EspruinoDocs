# AGENTS.md

Guidance for AI coding agents (and humans) adding to or editing EspruinoDocs.

This repository is the source for much of the [espruino.com](https://www.espruino.com) website and for
the JavaScript modules served to the Espruino Web IDE via `require(...)`. Markdown files are
**not** viewed directly: `bin/build.js` turns them into HTML, so follow the conventions below
exactly. See [README.md](README.md) for the full list of metadata tags.

## Repository layout

| Folder              | Contents |
| ------------------- | -------- |
| `tutorials/`        | Tutorials (`My Tutorial.md`) |
| `devices/`          | Drivers for external hardware: `CHIP.js` module + `CHIP.md` docs |
| `modules/`          | General-purpose (non-hardware) modules: `name.js` + `name.md` |
| `boards/`           | Pages for Espruino boards (pinouts, etc) |
| `info/`             | Reference/info pages (ADC, Graphics, debugging, ...) |
| `examples/`         | Self-contained `.js` examples - the leading comment becomes the page |
| `external_projects/`| Short pages linking to projects hosted elsewhere |
| `datasheets/`       | PDF datasheets |
| `files/`            | Misc files used by the site |
| `html/`             | Build output - never edit or commit |

The page URL comes from the filename, so `tutorials/Traffic Lights.md` becomes
`https://www.espruino.com/Traffic+Lights`. Filenames must be unique across the whole repo.
Keep them short and simple. Never rename an existing page without adding an
`OldName,/NewName` line to `RENAMED.csv`.

## Markdown page format

Every `.md` page (except `README.md`) **must** start with exactly these six lines -
`bin/check_docs.js` reports an error otherwise:

```
<!--- Copyright (c) 2026 Your Name. See the file LICENSE for copying permission. -->
Page Title
==========

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Page+Name. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

```

* Line 1: copyright comment (note the three dashes in `<!---`). Use the current year.
* Line 2-3: title, underlined with `===`.
* Line 5: the GitHub warning banner. `node bin/commenter.js` adds/updates it for all files, or
  copy it from another page and set the URL to the page name with spaces as `+`.

Then the metadata, each at the start of its own line:

```
* KEYWORDS: Comma,separated,search,words
* USES: Puck.js,Graphics
```

* Module pages (`devices/`, `modules/`) must have `Module` as the **first** keyword.
* `USES:` lists the hardware/libraries a tutorial uses - use the exact names other pages
  declare with `APPEND_USES:` (see "Common keywords" in [README.md](README.md)).
* Other useful tags: `APPEND_JSDOC: CHIP.js` (adds a reference section generated from `/** */`
  comments), `APPEND_USES: CHIP` (lists tutorials using this part), `APPEND_KEYWORD:`,
  `APPEND_TOC`, `APPLOADER_APP: appid`.

Other conventions:

* Use `Heading` + `-------` underlines for sections, as existing pages do.
* Link to other pages with relative paths to the `.md` file, eg. `[Pixl.js](../boards/Pixl.js.md)`.
  Link to modules as `[CHIP](CHIP.js)`.
* Don't add `([About Modules](../Modules.md))` after module links - the build adds it.
* Videos: `[[http://youtu.be/VIDEOID]]` on its own line.
* Wiring is usually given as a Markdown table (`| Device Pin | Espruino |`).
* Code blocks use plain ```` ``` ```` fences (no language tag needed).
* British English spelling is fine; both British and American dictionaries are accepted.

## Images and thumbnails

* Put images for `My Page.md` in a folder named after the page (`My Page/photo.jpg`) or
  alongside it, and reference them as `![Description](My Page/photo.jpg)`. Keep images to a
  sensible size (photos ~800px wide is plenty) - the build resizes for the site anyway.
* **Thumbnails**: add a file called `FILENAME.thumb.jpg` next to the page (eg.
  `tutorials/My Page.thumb.jpg` for `tutorials/My Page.md`, or `devices/CHIP.thumb.jpg`).
  It must be:
  * **360x280 pixels** (the site shows it at 180x140, so this is 2x resolution)
  * **JPEG**, with a **white background** (no transparency, no borders/rounded corners -
    the build adds those)
  * The subject centred and filling most of the frame
* If there's no `.thumb.*` file the build falls back to `FILENAME.png/jpg`, then the first image
  on the page. Some older pages use `.thumb.png`/`.thumb.svg` - new pages should use
  `.thumb.jpg`.

### Creating thumbnails with `bin/thumbnail.js`

Every new page should end up with a thumbnail. If it has no suitable photo or screenshot, use
`bin/thumbnail.js` (needs ImageMagick) to draw one: a breakout board for devices, an icon
plus a code snippet for modules, or icons for other pages, with the title underneath. It
writes a correctly sized `FILENAME.thumb.jpg` next to the page.

```
node bin/thumbnail.js --list                              # pages with no thumbnail
node bin/thumbnail.js devices/MyDevice.md                 # create one for a page
node bin/thumbnail.js --out=preview devices/MyDevice.md   # preview into ./preview (look at it!)
node bin/thumbnail.js --force devices/MyDevice.md         # recreate an existing one
node bin/thumbnail.js --help                              # all options and fields
```

* Pages not listed in `bin/thumbnail-pages.json` have their settings guessed from the title,
  `KEYWORDS` and folder. For a good result, add an entry for the page under `"pages"`
  (keyed by repo-relative path, eg. `"devices/MyDevice.md"`) and re-run with `--force`.
  Main fields: `layout` (`"hw"`, `"code"`, `"icon"` or `"photo"`), `title`, `sub`, `icons`
  (1-3 names from `bin/thumbnail-icons.json`), `colors`, `label`, and for `"hw"` `look`/`board`.
  Copy a similar existing entry and see `--help` for the rest.
* Use `layout: "photo"` with `photo: "path/to/image.jpg"` to turn an existing photo into a
  thumbnail on a white background.
* Only run it for the pages you are working on - running it with no files creates thumbnails
  for *every* page without one. Don't commit the `--out` preview folder.
* Always view the generated image to check the title fits and the icons make sense.

Alternatively, to make one by hand from a photo with ImageMagick:

```
convert input.jpg -resize 360x280 -background white -gravity center -extent 360x280 -flatten -quality 90 "tutorials/My Page.thumb.jpg"
```

## Writing modules (`devices/` and `modules/`)

Modules run on microcontrollers with very little RAM, so keep them small and simple.
Follow [tutorials/Writing Modules.md](tutorials/Writing%20Modules.md). In summary:

```js
/* Copyright (c) 2026 Your Name. See the file LICENSE for copying permission. */
/*
Quick description of my module...
*/
var C = { PRIVATE_CONST : 0x01 }; // private constants get folded by the minifier

function CHIP(i2c, options) {
  this.i2c = i2c;
}

/** Documented with JSDoc-style comments so APPEND_JSDOC picks them up */
CHIP.prototype.read = function() { /* ... */ };

/** Usage: `require("CHIP").connect(I2C1)` */
exports.connect = function(i2c, options) {
  return new CHIP(i2c, options);
};
```

* Code runs on Espruino, not Node.js. Avoid Node/browser APIs, large lookup tables and heavy
  ES6+ features. Define functions at the top level or on prototypes, not inside other functions.
* Put comments *outside* function bodies - Espruino stores function bodies verbatim.
* Modules are minified with Closure Compiler (SIMPLE). Add `@compilation_level ADVANCED_OPTIMIZATIONS`
  to the header comment only if the module is written to survive it.
* Every module needs a matching `.md` page with `Module` as the first keyword, wiring info,
  a usage example and usually `APPEND_JSDOC: CHIP.js`.
* `.js` files under `devices/`, `modules/` and `boards/` are all published as modules unless
  listed in `moduleignore`.

## Examples (`examples/`)

An example is a single `.js` file whose opening `/* ... */` comment is the Markdown page (same
header format as above, starting `/*<!-- Copyright ...`), followed by the code, which is
appended to the page as a code block.

## Checking your work

Before finishing, run:

```
npm install                 # once
npm run check:quick         # spelling, page format and internal links
node bin/check_docs.js "tutorials/My Page.md"   # just one file
npm run eslintdevices       # or eslintmodules / eslintboards, for .js changes
```

* Real words the spell checker doesn't know (part numbers, product names) go in
  `bin/spelling-wordlist.txt`. URLs that can't be checked go in `bin/link-ignore.txt`.
* `npm run build` then `npm start` renders the site locally at http://localhost:3040 (needs
  the `Espruino` and `EspruinoWebTools` repos checked out alongside - see README).
