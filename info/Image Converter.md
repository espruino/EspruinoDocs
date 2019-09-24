<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Converting Bitmaps for Graphics
==========================================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Image+Converter. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: File,String,Bitmap,Image,Picture,Conversion,Graphics,Tools
* USES: Graphics

This page helps you to convert an image file into a JS object that can
be used with Espruino.

See the [Graphics](/Graphics) library page for more information.

<script src="/js/heatshrink.js"></script>
<input type="file" id="fileLoader"/><br/>
<input type="checkbox" id="compression" onchange="imageLoaded()">Use Compression?</input><br/>
Diffusion:
<select id="diffusion" onchange="imageLoaded()">
<option value="none" selected="selected">Flat</option>
<option value="random1">Random small</option>
<option value="random2">Random large</option>
<option value="error">Error Diffusion</option>
<option value="errorrandom">Randomised Error Diffusion</option>
</select>

<input type="range" id="brightness" min="-255" max="255" value="0" onchange="imageLoaded()">Brightness</input><br/>
<select id="colorStyle" onchange="imageLoaded()">
<option value="1bit" selected="selected">1 bit black/white</option>
<option value="1bitinverted">1 bit white/black</option>
<option value="4bit">4 bit RGBA</option>
<option value="4bitmac">4 bit Mac palette</option>
<option value="web">8 bit Web palette</option>
<option value="vga">8 bit VGA palette</option>
</select>

<canvas id="canvas" style="display:none;"></canvas>

<h2>Result</h2>
<p><span id="ressize">...</span></p>
<textarea id="resdata" style="display:none;"></textarea>

<script>
var PAL_VGA = [0x000000, 0x0000a8, 0x00a800, 0x00a8a8, 0xa80000, 0xa800a8, 0xa85400, 0xa8a8a8, 0x545454, 0x5454fc, 0x54fc54, 0x54fcfc, 0xfc5454, 0xfc54fc, 0xfcfc54, 0xfcfcfc, 0x000000, 0x141414, 0x202020, 0x2c2c2c, 0x383838, 0x444444, 0x505050, 0x606060, 0x707070, 0x808080, 0x909090, 0xa0a0a0, 0xb4b4b4, 0xc8c8c8, 0xe0e0e0, 0xfcfcfc, 0x0000fc, 0x4000fc, 0x7c00fc, 0xbc00fc, 0xfc00fc, 0xfc00bc, 0xfc007c, 0xfc0040, 0xfc0000, 0xfc4000, 0xfc7c00, 0xfcbc00, 0xfcfc00, 0xbcfc00, 0x7cfc00, 0x40fc00, 0x00fc00, 0x00fc40, 0x00fc7c, 0x00fcbc, 0x00fcfc, 0x00bcfc, 0x007cfc, 0x0040fc, 0x7c7cfc, 0x9c7cfc, 0xbc7cfc, 0xdc7cfc, 0xfc7cfc, 0xfc7cdc, 0xfc7cbc, 0xfc7c9c, 0xfc7c7c, 0xfc9c7c, 0xfcbc7c, 0xfcdc7c, 0xfcfc7c, 0xdcfc7c, 0xbcfc7c, 0x9cfc7c, 0x7cfc7c, 0x7cfc9c, 0x7cfcbc, 0x7cfcdc, 0x7cfcfc, 0x7cdcfc, 0x7cbcfc, 0x7c9cfc, 0xb4b4fc, 0xc4b4fc, 0xd8b4fc, 0xe8b4fc, 0xfcb4fc, 0xfcb4e8, 0xfcb4d8, 0xfcb4c4, 0xfcb4b4, 0xfcc4b4, 0xfcd8b4, 0xfce8b4, 0xfcfcb4, 0xe8fcb4, 0xd8fcb4, 0xc4fcb4, 0xb4fcb4, 0xb4fcc4, 0xb4fcd8, 0xb4fce8, 0xb4fcfc, 0xb4e8fc, 0xb4d8fc, 0xb4c4fc, 0x000070, 0x1c0070, 0x380070, 0x540070, 0x700070, 0x700054, 0x700038, 0x70001c, 0x700000, 0x701c00, 0x703800, 0x705400, 0x707000, 0x547000, 0x387000, 0x1c7000, 0x007000, 0x00701c, 0x007038, 0x007054, 0x007070, 0x005470, 0x003870, 0x001c70, 0x383870, 0x443870, 0x543870, 0x603870, 0x703870, 0x703860, 0x703854, 0x703844, 0x703838, 0x704438, 0x705438, 0x706038, 0x707038, 0x607038, 0x547038, 0x447038, 0x387038, 0x387044, 0x387054, 0x387060, 0x387070, 0x386070, 0x385470, 0x384470, 0x505070, 0x585070, 0x605070, 0x685070, 0x705070, 0x705068, 0x705060, 0x705058, 0x705050, 0x705850, 0x706050, 0x706850, 0x707050, 0x687050, 0x607050, 0x587050, 0x507050, 0x507058, 0x507060, 0x507068, 0x507070, 0x506870, 0x506070, 0x505870, 0x000040, 0x100040, 0x200040, 0x300040, 0x400040, 0x400030, 0x400020, 0x400010, 0x400000, 0x401000, 0x402000, 0x403000, 0x404000, 0x304000, 0x204000, 0x104000, 0x004000, 0x004010, 0x004020, 0x004030, 0x004040, 0x003040, 0x002040, 0x001040, 0x202040, 0x282040, 0x302040, 0x382040, 0x402040, 0x402038, 0x402030, 0x402028, 0x402020, 0x402820, 0x403020, 0x403820, 0x404020, 0x384020, 0x304020, 0x284020, 0x204020, 0x204028, 0x204030, 0x204038, 0x204040, 0x203840, 0x203040, 0x202840, 0x2c2c40, 0x302c40, 0x342c40, 0x3c2c40, 0x402c40, 0x402c3c, 0x402c34, 0x402c30, 0x402c2c, 0x40302c, 0x40342c, 0x403c2c, 0x40402c, 0x3c402c, 0x34402c, 0x30402c, 0x2c402c, 0x2c4030, 0x2c4034, 0x2c403c, 0x2c4040, 0x2c3c40, 0x2c3440, 0x2c3040, 0x000000, 0x000000, 0x000000, 0x000000, 0x000000, 0x000000, 0x000000, 0xFFFFFF];
var PAL_WEB = [0x000000,0x000033,0x000066,0x000099,0x0000cc,0x0000ff,0x003300,0x003333,0x003366,0x003399,0x0033cc,0x0033ff,0x006600,0x006633,0x006666,0x006699,0x0066cc,0x0066ff,0x009900,0x009933,0x009966,0x009999,0x0099cc,0x0099ff,0x00cc00,0x00cc33,0x00cc66,0x00cc99,0x00cccc,0x00ccff,0x00ff00,0x00ff33,0x00ff66,0x00ff99,0x00ffcc,0x00ffff,0x330000,0x330033,0x330066,0x330099,0x3300cc,0x3300ff,0x333300,0x333333,0x333366,0x333399,0x3333cc,0x3333ff,0x336600,0x336633,0x336666,0x336699,0x3366cc,0x3366ff,0x339900,0x339933,0x339966,0x339999,0x3399cc,0x3399ff,0x33cc00,0x33cc33,0x33cc66,0x33cc99,0x33cccc,0x33ccff,0x33ff00,0x33ff33,0x33ff66,0x33ff99,0x33ffcc,0x33ffff,0x660000,0x660033,0x660066,0x660099,0x6600cc,0x6600ff,0x663300,0x663333,0x663366,0x663399,0x6633cc,0x6633ff,0x666600,0x666633,0x666666,0x666699,0x6666cc,0x6666ff,0x669900,0x669933,0x669966,0x669999,0x6699cc,0x6699ff,0x66cc00,0x66cc33,0x66cc66,0x66cc99,0x66cccc,0x66ccff,0x66ff00,0x66ff33,0x66ff66,0x66ff99,0x66ffcc,0x66ffff,0x990000,0x990033,0x990066,0x990099,0x9900cc,0x9900ff,0x993300,0x993333,0x993366,0x993399,0x9933cc,0x9933ff,0x996600,0x996633,0x996666,0x996699,0x9966cc,0x9966ff,0x999900,0x999933,0x999966,0x999999,0x9999cc,0x9999ff,0x99cc00,0x99cc33,0x99cc66,0x99cc99,0x99cccc,0x99ccff,0x99ff00,0x99ff33,0x99ff66,0x99ff99,0x99ffcc,0x99ffff,0xcc0000,0xcc0033,0xcc0066,0xcc0099,0xcc00cc,0xcc00ff,0xcc3300,0xcc3333,0xcc3366,0xcc3399,0xcc33cc,0xcc33ff,0xcc6600,0xcc6633,0xcc6666,0xcc6699,0xcc66cc,0xcc66ff,0xcc9900,0xcc9933,0xcc9966,0xcc9999,0xcc99cc,0xcc99ff,0xcccc00,0xcccc33,0xcccc66,0xcccc99,0xcccccc,0xccccff,0xccff00,0xccff33,0xccff66,0xccff99,0xccffcc,0xccffff,0xff0000,0xff0033,0xff0066,0xff0099,0xff00cc,0xff00ff,0xff3300,0xff3333,0xff3366,0xff3399,0xff33cc,0xff33ff,0xff6600,0xff6633,0xff6666,0xff6699,0xff66cc,0xff66ff,0xff9900,0xff9933,0xff9966,0xff9999,0xff99cc,0xff99ff,0xffcc00,0xffcc33,0xffcc66,0xffcc99,0xffcccc,0xffccff,0xffff00,0xffff33,0xffff66,0xffff99,0xffffcc,0xffffff];
var PAL_MAC16 = [
  0x000000, 0x444444, 0x888888, 0xBBBBBB,
  0x996633, 0x663300, 0x006600, 0x00aa00,
  0x0099ff, 0x0000cc, 0x330099, 0xff0099,
  0xdd0000, 0xff6600, 0xffff00, 0xffffff
];
var TRANSPARENT_8BIT = 254;
function findColour(palette,r,g,b,a, no_transparent) {
  if (!no_transparent && a<128) return TRANSPARENT_8BIT;
  var maxd = 0xFFFFFF;
  var c = 0;
  palette.forEach(function(p,n) {
    var pr=p>>16;
    var pg=(p>>8)&255;
    var pb=p&255;
    var dr = r-pr;
    var dg = g-pg;
    var db = b-pb;
    var d = dr*dr + dg*dg + db*db;
    if (d<maxd) {
      c = n;
      maxd=d;
    }
  });
  return c;
}

  var COL_BPP = {
    "1bit":1,
    "4bit":4,
    "4bitmac":4,
    "vga":8,
    "web":8,
  };


  var COL_FROM_RGB = {
    "1bit":function(r,g,b) {
      var c = (r+g+b) / 3;
      var thresh = 128;
      return c>thresh;
    },
    "4bit":function(r,g,b,a) {
      var thresh = 128;
      return (
        ((r>thresh)?1:0) |
        ((g>thresh)?2:0) |
        ((b>thresh)?4:0) |
        ((a>thresh)?8:0));
    },
    "4bitmac":function(r,g,b,a) {
      return findColour(PAL_MAC16,r,g,b,a, true /* no transparency */);
    },
    "vga":function(r,g,b,a) {
      return findColour(PAL_VGA,r,g,b,a);
    },
    "web":function(r,g,b,a) {
      return findColour(PAL_WEB,r,g,b,a);
    },
  };
  var COL_TO_RGB = {
    "1bit":function(c) {
      return c ? 0xFFFFFF : 0;
    },
    "4bit":function(c,x,y) {
      if (!(c&8)) return ((((x>>2)^(y>>2))&1)?0xFFFFFF:0);
      return ((c&1 ? 0xFF0000 : 0) |
              (c&2 ? 0x00FF00 : 0) |
              (c&4 ? 0x0000FF : 0));
    },
    "4bitmac":function(c,x,y) {
      return PAL_MAC16[c];
    },
    "vga":function(c,x,y) {
      if (c==TRANSPARENT_8BIT) return ((((x>>2)^(y>>2))&1)?0xFFFFFF:0);
      return PAL_VGA[c];
    },
    "web":function(c,x,y) {
      if (c==TRANSPARENT_8BIT) return ((((x>>2)^(y>>2))&1)?0xFFFFFF:0);
      return PAL_WEB[c];
    },
  };

  function clip(x) {
    if (x<0) return 0;
    if (x>255) return 255;
    return x;
  }

  var img;
  function imageLoaded() {
    if (img === undefined) return;
    var diffusionSelect = document.getElementById("diffusion");
    var diffusionStyle = diffusionSelect.options[diffusionSelect.selectedIndex].value;
    compression = document.getElementById("compression").checked;
    var brightness = 0|document.getElementById("brightness").value;
    var colorSelect = document.getElementById("colorStyle");
    var colorStyle = colorSelect.options[colorSelect.selectedIndex].value;
    var inverted = false;
    var transparentCol = 0;
    if (colorStyle=="1bitinverted") {
      colorStyle="1bit";
      inverted=true;
    }
    if (colorStyle=="4bit")
      transparentCol=0;
    if (colorStyle=="vga" || colorStyle=="web")
      transparentCol=TRANSPARENT_8BIT;
    var bpp = COL_BPP[colorStyle];
    var canvas = document.getElementById("canvas")
    canvas.width = img.width*2;
    canvas.height = img.height;
    canvas.style = "display:block;border:1px solid black;margin:8px;"
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img,0,0);
    var imageData = ctx.getImageData(0, 0, img.width, img.height);
    var data = imageData.data;
    var bitData = new Uint8Array(((img.width*img.height)*bpp+7)/8);
    var er=0,eg=0,eb=0;
    var n = 0;
    for (var y=0; y<img.height; y++) {
      //var s = "";
      for (var x=0; x<img.width; x++) {
        var r = clip(data[n*4] + brightness + er);
        var g = clip(data[n*4+1] + brightness + eg);
        var b = clip(data[n*4+2] + brightness + eb);
        var a = data[n*4+3];

        if (diffusionStyle == "random1" || diffusionStyle == "errorrandom") {
          er += Math.random()*48 - 24;
          eg += Math.random()*48 - 24;
          eb += Math.random()*48 - 24;
        }
        if (diffusionStyle == "random2") {
          er += Math.random()*128 - 64;
          eg += Math.random()*128 - 64;
          eb += Math.random()*128 - 64;
        }
        if (inverted) {
          r=255-r;
          g=255-g;
          b=255-b;
        }
        r = clip(r + brightness + er);
        g = clip(g + brightness + eg);
        b = clip(b + brightness + eb);

        var c = COL_FROM_RGB[colorStyle](r,g,b,a);
        if (bpp==1) bitData[n>>3] |= 128>>(n&7);
        else if (bpp==4) bitData[n>>1] |= c<<((n&1)?0:4);
        else if (bpp==8) bitData[n] = c;
        else throw new Error("Unhandled BPP");
        var cr = COL_TO_RGB[colorStyle](c,x,y);
        var or = cr>>16;
        var og = (cr>>8)&255;
        var ob = cr&255;
        if (diffusionStyle.startsWith("error") && a>128) {
          er = r-or;
          eg = g-og;
          eb = b-ob;
        } else {
          er = 0;
          eg = 0;
          eb = 0;
        }
        data[n*4] = or;
        data[n*4+1]= og;
        data[n*4+2]= ob;
        data[n*4+3]=255;
        n++;
      }
      //console.log(s);
    }
    //console.log(bitData);

    var strCmd;
    if (compression) {
      bitData = heatshrink_compress(bitData);
      strCmd = 'require("heatshrink").decompress';
    } else {
      strCmd = 'E.toArrayBuffer';
    }
    var str = "";
    for (n=0; n<bitData.length; n++)
      str += String.fromCharCode(bitData[n]);
    var imgstr = "var img = {\n";
    imgstr += "  width : "+img.width+", height : "+img.height+", bpp : "+bpp+",\n";
    imgstr += "  transparent : "+transparentCol+",\n";
    imgstr += '  buffer : '+strCmd+'(atob("'+btoa(str)+'"))\n';
    imgstr += "};\n";
    ctx.putImageData(imageData,img.width,0);
    document.getElementById("ressize").innerHTML = str.length+" Characters";
    document.getElementById("resdata").innerHTML = imgstr;
    document.getElementById("resdata").style = "width:650px;height:300px;";
  }
  function handleFileSelect(event) {
      if (event.target.files.length != 1) return;
      var reader = new FileReader();
      reader.onload = function(event) {
        img = new Image();
        img.onload = imageLoaded;
        img.src = event.target.result;
      };
      reader.readAsDataURL(event.target.files[0]);
    };
    document.getElementById('fileLoader').addEventListener('change', handleFileSelect, false);
</script>
