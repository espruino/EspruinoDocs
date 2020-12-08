/* Copyright (c) 2020 OmegaRogue. See the file LICENSE for copying permission. */
/*
Graphics Functions based on the React Sci-Fi UI Framework Arwes
*/

var C = {
  cornerSize: 14,    // description
  cornerOffset: 3,   // description
  borderWidth: 1     // description
};

function Arwes(cornerSize, cornerOffset, borderWidth) {
  this.cornerSize = cornerSize;
  this.cornerOffset = cornerOffset;
  this.borderWidth = borderWidth;
}


/** 'public' constants here */
Arwes.prototype.C = {
  color: {
    primary: {
      base: "#26dafd",
      light: "#8bebfe",
      dark: "#029dbb"
    },
    secondary: {
      base: "#df9527",
      light: "#ecc180",
      dark: "#8b5c15"
    },
    header: {
      base: "#a1ecfb",
      light: "#fff",
      dark: "#3fd8f7"
    },
    control: {
      base: "#acf9fb",
      light: "#fff",
      dark: "#4bf2f6"
    },
    success: {
      base: "#00ff00",
      light: "#6f6",
      dark: "#090"
    },
    alert: {
      base: "#ff0000",
      light: "#f66",
      dark: "#900"
    },
    disabled: {
      base: "#999999",
      light: "#ccc",
      dark: "#666"
    }
  }
};


function drawTopLeftCorner(obj, x, y) {
  "compiled";

  g.setColor(obj.C.color.primary.base);
  const x1 = x - obj.cornerOffset;
  const y1 = y - obj.cornerOffset;
  g.fillRect(x1, y1, x1 + obj.cornerSize, y1 + obj.cornerSize);
  g.setColor("#000000");
  g.fillRect(x, y, x + obj.cornerSize - obj.cornerOffset, y + obj.cornerSize - obj.cornerOffset);
}

function drawTopRightCorner(obj, x, y) {
  "compiled";

  g.setColor(obj.C.color.primary.base);
  const x1 = x + obj.cornerOffset;
  const y1 = y - obj.cornerOffset;
  g.fillRect(x1, y1, x1 - obj.cornerSize, y1 + obj.cornerSize);
  g.setColor("#000000");
  g.fillRect(x, y, x - obj.cornerSize - obj.cornerOffset, y + obj.cornerSize - obj.cornerOffset);
}

function drawBottomLeftCorner(obj, x, y) {
  "compiled";

  g.setColor(obj.C.color.primary.base);
  const x1 = x - obj.cornerOffset;
  const y1 = y + obj.cornerOffset;
  g.fillRect(x1, y1, x1 + obj.cornerSize, y1 - obj.cornerSize);
  g.setColor("#000000");
  g.fillRect(x, y, x + obj.cornerSize - obj.cornerOffset, y - obj.cornerSize + obj.cornerOffset);
}

function drawBottomRightCorner(obj, x, y) {
  "compiled";

  g.setColor(obj.C.color.primary.base);
  const x1 = x + obj.cornerOffset;
  const y1 = y + obj.cornerOffset;
  g.fillRect(x1, y1, x1 - obj.cornerSize, y1 - obj.cornerSize);
  g.setColor("#000000");
  g.fillRect(x, y, x - obj.cornerSize + obj.cornerOffset, y - obj.cornerSize + obj.cornerOffset);
}


Arwes.prototype.drawFrame = function (x1, y1, x2, y2) {
  "compiled";

  drawTopLeftCorner(this, x1, y1);
  drawTopRightCorner(this, x2, y1);
  drawBottomLeftCorner(this, x1, y2);
  drawBottomRightCorner(this, x2, y2);
  this.drawFrameNoCorners(x1, y1, x2, y2);
}

Arwes.prototype.drawFrameBottomCorners = function (x1, y1, x2, y2) {
  "compiled";

  drawBottomLeftCorner(this, x1, y2);
  drawBottomRightCorner(this, x2, y2);
  this.drawFrameNoCorners(x1, y1, x2, y2);
}

Arwes.prototype.drawFrameTopCorners = function (x1, y1, x2, y2) {
  "compiled";

  drawTopLeftCorner(this, x1, y1);
  drawTopRightCorner(this, x2, y1);
  this.drawFrameNoCorners(x1, y1, x2, y2);
}

Arwes.prototype.drawFrameLeftCorners = function (x1, y1, x2, y2) {
  "compiled";

  drawTopLeftCorner(this, x1, y1);
  drawBottomLeftCorner(this, x1, y2);
  this.drawFrameNoCorners(x1, y1, x2, y2);
}

Arwes.prototype.drawFrameRightCorners = function (x1, y1, x2, y2) {
  "compiled";

  drawTopRightCorner(this, x2, y1);
  drawBottomRightCorner(this, x2, y2);
  this.drawFrameNoCorners(x1, y1, x2, y2);
}


Arwes.prototype.drawFrameNoCorners = function (x1, y1, x2, y2) {
  "compiled";

  g.setColor(this.C.color.primary.dark);
  g.drawRect(x1, y1, x2, y2);
  g.setColor("#000000");
  g.fillRect(x1 + C.borderWidth, y1 + C.borderWidth, x2 - C.borderWidth, y2 - C.borderWidth);
}


/** This is 'exported' so it can be used with `require('MOD123.js').connect(pin1,pin2)` */
exports.create = function (cornerSize, cornerOffset, borderWidth) {
  return new Arwes(cornerSize, cornerOffset, borderWidth);
};

exports.default = function () {
  return new Arwes(C.cornerSize, C.cornerOffset, C.borderWidth);
};