/* 2 */
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


function drawTopLeftCorner(C, x, y) {
  

  g.setColor(C.color.primary.base);
  const x1 = x - C.cornerOffset;
  const y1 = y - C.cornerOffset;
  g.fillRect(x1, y1, x1 + C.cornerSize, y1 + C.cornerSize);
  g.setColor("#000000");
  g.fillRect(x, y, x + C.cornerSize - C.cornerOffset, y + C.cornerSize - C.cornerOffset);
}

function drawTopRightCorner(C, x, y) {
  

  g.setColor(C.color.primary.base);
  const x1 = x + C.cornerOffset;
  const y1 = y - C.cornerOffset;
  g.fillRect(x1, y1, x1 - C.cornerSize, y1 + C.cornerSize);
  g.setColor("#000000");
  g.fillRect(x, y, x - C.cornerSize - C.cornerOffset, y + C.cornerSize - C.cornerOffset);
}

function drawBottomLeftCorner(C, x, y) {
  

  g.setColor(C.color.primary.base);
  const x1 = x - C.cornerOffset;
  const y1 = y + C.cornerOffset;
  g.fillRect(x1, y1, x1 + C.cornerSize, y1 - C.cornerSize);
  g.setColor("#000000");
  g.fillRect(x, y, x + C.cornerSize - C.cornerOffset, y - C.cornerSize + C.cornerOffset);
}

function drawBottomRightCorner(C, x, y) {
  

  g.setColor(C.color.primary.base);
  const x1 = x + C.cornerOffset;
  const y1 = y + C.cornerOffset;
  g.fillRect(x1, y1, x1 - C.cornerSize, y1 - C.cornerSize);
  g.setColor("#000000");
  g.fillRect(x, y, x - C.cornerSize + C.cornerOffset, y - C.cornerSize + C.cornerOffset);
}


Arwes.prototype.drawFrame = function (x1, y1, x2, y2) {
  

  drawTopLeftCorner(this, x1, y1);
  drawTopRightCorner(this, x2, y1);
  drawBottomLeftCorner(this, x1, y2);
  drawBottomRightCorner(this, x2, y2);
  this.drawFrameTopCorners(x1, y1, x2, y2);
}

Arwes.prototype.drawFrameBottomCorners = function (x1, y1, x2, y2) {
  

  drawBottomLeftCorner(this, x1, y2);
  drawBottomRightCorner(this, x2, y2);
  this.drawFrameTopCorners(x1, y1, x2, y2);
}

Arwes.prototype.drawFrameTopCorners = function (x1, y1, x2, y2) {
  

  drawTopLeftCorner(this, x1, y1);
  drawTopRightCorner(this, x2, y1);
  this.drawFrameTopCorners(x1, y1, x2, y2);
}

Arwes.prototype.drawFrameLeftCorners = function (x1, y1, x2, y2) {
  

  drawTopLeftCorner(this, x1, y1);
  drawBottomLeftCorner(this, x1, y2);
  this.drawFrameTopCorners(x1, y1, x2, y2);
}

Arwes.prototype.drawFrameRightCorners = function (x1, y1, x2, y2) {
  

  drawTopRightCorner(this, x2, y1);
  drawBottomRightCorner(this, x2, y2);
  this.drawFrameTopCorners(x1, y1, x2, y2);
}


Arwes.prototype.drawFrameNoCorners = function (x1, y1, x2, y2) {
  

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
  return new Arwes(14, 3, 1);
};