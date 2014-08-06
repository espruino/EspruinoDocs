/*
Distance Sensing Robot
======================

* KEYWORDS: Distance,Sensing,Robot,Ultrasonic,Motor
* USES: Robot,Ultrasonic,HC-SR04,L293D

![Distance Sensing Robot](distance_sensing_robot.jpg)

This [[Robot]] uses an [[HC-SR04]] Ultrasonic distance sensor, an Espruino board with an [[L293D]] motor driver IC soldered onto the surface mount prototyping area.

**Note:** This is an older code example that doesn't use the [[HC-SR04]] library.

Wiring Up
---------

Solder the [[L293D]] motor driver, and the [[HC-SR04]] Ultrasonic Distance sensor as described on their pages

Connect the motors as follows:

| L293D    | Connection |
|----------|------------|
| OUT1     | Motor 1 Black |
| OUT2     | Motor 1 Red |
| OUT3     | Motor 2 Black |
| OUT4     | Motor 2 Red |

*/

var TRIG = A0; // ultrasonic trigger
var ECHO = A1; // ultrasonic echo signal
var MOTORS = [A3,A2,B10,B11]; // pins for the motors

var t1 = 0;
var dist = 0;
var inManouver = false;

// Get the distance from the sensor
setWatch(function(e) { t1=e.time; }, ECHO, { repeat:true, edge:'rising'  });
setWatch(function(e) { var dt=e.time-t1; dist = (dt*1000000)/57.0; },  ECHO, { repeat:true, edge:'falling' });
// 20 times a second, trigger the distance sensor
setInterval("digitalPulse(TRIG,1, 10/1000.0)",50);

// reverse, turn, and go forwards again
function backup() {
  inManouver = true;
  digitalWrite(MOTORS, 5); // back
  setTimeout(function() {
    digitalWrite(MOTORS, 6); // turn
      setTimeout(function() {
        inManouver = false;
        digitalWrite(MOTORS, 6); // forward again
      }, 500);
  }, 500);
}

function forward() {
   digitalWrite(MOTORS, 10);
}

function stop() {
   digitalWrite(MOTORS, 0);
}

function onInit() {
  forward();
}

function step() {
  // if we detect we're getting too close, turn around
  if (dist < 20 && !inManouver) 
    backup();
}

setInterval(step, 100); // check every 100ms to see if we're too close
onInit(); // start going forwards
