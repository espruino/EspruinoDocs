<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Stepper Motors
============

* KEYWORDS: Stepper,Motor,Steppermotor,Stepper motor

We'll assume you're using a standard stepper motor, with 4 coils. See [Wikipedia](http://en.wikipedia.org/wiki/Stepper_motor)

4 Step Control
------------

```JavaScript
var step = 0;
var steps = [0b0001,0b0010,0b0100,0b1000];
var stepperPins = [D9,D11,D14,D12];

function doStep() {
 step++;
 digitalWrite(stepperPins, steps[step % steps.length]);
}
var stepInterval = setInterval(doStep, 200);
```

8 Step Control
------------

Just copy the code from above, and while it's running, type:

```JavaScript
var steps = [0b0001,0b0011,0b0010,0b0110,0b0100,0b1100,0b1000,0b1001];
```

Change the Speed
--------------

This is really easy, just call changeInterval to update the speed at which setInterval works:

```JavaScript
changeInterval(stepInterval, 100);
```

Microstepping
-----------

You can even use the PWM analog outputs to [microstep](http://en.wikipedia.org/wiki/Stepper_motor#Microstepping)!

```JavaScript
function doStep() {
  step+=0.1;
  analogWrite(stepperPins[0], Math.sin(step));
  analogWrite(stepperPins[1], Math.sin(step + Math.PI*0.5));
  analogWrite(stepperPins[2], Math.sin(step + Math.PI));
  analogWrite(stepperPins[3], Math.sin(step + Math.PI*1.5));
}
```

Stepping to an exact location
-------------------------

The code below will step to an exact location, with dynamic speed control! Just set targetStep to the integer step number you require!

```JavaScript
var step = 0;
var targetStep = 0;
var steps = [0b0001,0b0011,0b0010,0b0110,0b0100,0b1100,0b1000,0b1001];
var stepperPins = [D9,D11,D14,D12];
var stepInterval = setInterval(doStep, 100);
var doStep = function () {    
 var d = step - targetStep;
 if (d < 0) 
   step++;                             
 else if (d > 0)
   step--;
 if (d==0) { // we're there - sleep
   changeInterval(stepInterval, 500);
   digitalWrite(stepperPins, 0);
 } else {
   var time = 100 - Math.abs(d)*4;
   if (time<10) time=10; 
   changeInterval(stepInterval, time);
   digitalWrite(stepperPins, steps[step%steps.length]);
 }
};
```
