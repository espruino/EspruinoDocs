/*<!-- Copyright (c) 2018 Gordon Williams. See the file LICENSE for copying permission. -->
Pixl.js Multiplayer Pong Game
=============================

* KEYWORDS: Pong,Game,Bat,Multiplayer
* USES: Pixl.js,Graphics,BLE,Only BLE

[[https://youtu.be/2ehczLgUL-I]]

Based on [this Pong Game for Pixl.js](/Pixl.js+Pong), this code uses
the buttons instead of potentiometers, and adds wireless multiplayer
using two [Pixl.js](/Pixl.js) boards. See the video
above for full details.

This uses the [Bluetooth LE UART module](/Puck.js+BLE+UART) to
handle communications.

[Get connected to Espruino](http://www.espruino.com/Quick+Start) with the
Web IDE, copy and paste the following code into the right-hand side of the
IDE, and click the upload button!

*/
var BATSIZE = 8;
// Scores of players
var scorel = 0;
var scorer = 0;
// Bat and ball positions
var batl = 0;
var batr = 0;
var ball;
// Peripheral=the slave, Central=game host
var isPeripheral;
var isConnected;
// Bluetooth LE UART
var uart;

function newGame() {
  ball = {
    x : g.getWidth()/2,
    y : g.getHeight()/2,
    vx : ((Math.random()>0.5)?1:-1)*2,
    vy : (Math.random()-0.5)*4
  };
}

function status(text) {
  g.clear();
  g.setFontAlign(0,0);
  g.drawString(text,64,32);
  g.setFontAlign(-1,-1);
  g.flip();
}

function connect(device) {
  isPeripheral = false;
  isConnected = false;
  status("Connecting...");
  require("ble_uart").connect(device).then(function(u) {
    status("Connected!");
    isConnected = true;
    uart = u;
    uart.on('data', function(d) {
      uartd = d;
      batr = parseInt(d);
    });
    gameStart();
  }).catch(function(e) {
    print(e.toString());
    setTimeout(doScan, 4000);
  });
}

function waitConnect() {
  Pixl.menu();
  isPeripheral = true;
  Terminal.setConsole(1); // move the JS console out the way
  Bluetooth.on('data', function(d) {
    d = d.split(",");
    if (d.length==3) {
      ball.x = parseInt(d[0]);
      ball.y = parseInt(d[1]);
      batr = parseInt(d[2]);
    }
  });
  status("Waiting... ("+NRF.getAddress().substr(-5)+")");
}

function doScan() {
  Pixl.menu();
  status("Scanning...");
  NRF.findDevices(function (devices) {
    devices = devices.filter(x => x.name && x.name.substr(0,4)=="Pixl");
    var options = {
      "": {"title":"Select a device"},
      "Wait for connection": waitConnect,
      "Toggle Backlight": function() {
        LED.toggle();
      }
    };
    devices.forEach(function(dev) {
      options[dev.name] = function() {
        Pixl.menu();
        connect(dev);
      };
    });
    options["Rescan..."] = doScan;
    Pixl.menu(options);
  });
}

function onFrame() {
  if (BTN2.read()) resetGame();
  if (BTN1.read()) batl-=2;
  if (BTN4.read()) batl+=2;
  if (batl<BATSIZE) batl=BATSIZE;
  if (batl>g.getHeight()-BATSIZE) batl=g.getHeight()-BATSIZE;

  if (!isPeripheral) {
    ball.x += ball.vx;
    ball.y += ball.vy;
    if (ball.y<=0) ball.vy = Math.abs(ball.vy);
    if (ball.y>=g.getHeight()-1) ball.vy = -Math.abs(ball.vy);
    if (ball.x<5 &&
        ball.y>batl-BATSIZE && ball.y<batl+BATSIZE) {
      ball.vx = Math.abs(ball.vx);
    }
    if (ball.x>g.getWidth()-6  &&
        ball.y>batr-BATSIZE && ball.y<batr+BATSIZE) {
      ball.vx = -Math.abs(ball.vx);
    }
    if (ball.x<0) {
      scorer++;
      newGame();
    }
    if (ball.x>g.getWidth()-1) {
      scorel++;
      newGame();
    }
    uart.write(Math.round(128-ball.x)+","+Math.round(ball.y)+","+Math.round(batl));
  } else {
    if (isConnected) Bluetooth.print(batl);
  }

  g.clear();
  g.fillRect(0,batl-BATSIZE, 3,batl+BATSIZE);
  g.fillRect(g.getWidth()-4,batr-BATSIZE, g.getWidth()-1,batr+BATSIZE);
  g.fillRect(ball.x-1,ball.y-1,ball.x+1,ball.y+1);
  g.setFontAlign(-1,-1);
  g.drawString(scorel, 10,0);
  g.setFontAlign(1,-1);
  g.drawString(scorer, g.getWidth()-10,0);
  g.flip();
}

function gameStart() {
  scorel = 0;
  scorer = 0;
  newGame();
  setInterval(onFrame, 200);
}

function resetGame() {
  isConnected = false;
  if (uart) {
    uart.disconnect();
    uart = undefined;
  }
  status("Game Over");
  clearInterval(); // remove all intervals
  Bluetooth.removeAllListeners();
  if (isPeripheral) Terminal.setConsole(); // don't 'force' the console away any more
  doScan();
}

NRF.on('connect', function() {
  isConnected = true;
  gameStart();
});
NRF.on('disconnect', function() {
  isConnected = false;
  resetGame(); // when disconnected, leave the game
});

function onInit() {
  // at boot, re-enter scan mode
  doScan();
}

onInit();
