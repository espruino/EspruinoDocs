<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Morse Code Texting
================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Morse+Code+Texting. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Morse,Code,Beep,Buzz
* USES: KeyPad,Espruino Board,Speaker,PWM

Introduction
-----------

If you're a proper [amateur radio](http://en.wikipedia.org/wiki/Amateur_radio) enthusiast then you probably know [morse code](http://en.wikipedia.org/wiki/Morse_code) off by heart... But what if you had to fake it and all you could do was text really fast on a numeric keypad? Espruino is here to help!

This code will make a little device that lets you type out your message like a non-T9 text message, and will then convert it into morse code, which it'll beep out of a speaker for you...

You'll Need
----------

* An [Espruino Board](/Original) 
* A [[KeyPad]]
* A [[Speaker]]

Wiring Up
--------

* Wire up the [[Speaker]] between GND and pin A1.
* Wire up the [[Keypad]] as described [here](/KeyPad)

Software
-------

Just copy and paste this into the right-hand window, then click the ```Send to Espruino``` button.

```
// list of letters that each key on the keypad represents
var letters = {"0":" 0","1":" 1","2":"ABC2","3":"DEF3","4":"GHI4","5":"JKL5","6":"MNO6","7":"PQRS7","8":"TUV8","9":"WXYZ9"};
// the morse code for each latter
var morse = {
  "A":".-", "B":"-...", "C":"-.-.", "D":"-..", "E":".",
  "F":"..-.", "G":"--.", "H":"....", "I":"..", "J":".---",
  "K":"-.-", "L":".-..", "M":"--", "N":"-.", "O":"---",
  "P":".--.", "Q":"--.-", "R":".-.", "S":"...", "T":"-",
  "U":"..-", "V":"...-", "W":".--", "X":"-..-", "Y":"-.--",
  "Z":"--..", 
  "0":"-----", "1":".---", "2":"..---", "3":"...--", "4":"....-",
  "5":".....", "6":"-....", "7":"--...", "8":"---..", "9":"----."
};
// where we connected the speaker
var SPEAKER = A1;

// Morse code to output
var morseInProgress = "";
// Output beeps for the morse code
function doMorseCode(str) {
  // if we're already doing something, just append our extra code and return
  if (morseInProgress.length>0) {
    morseInProgress += str+" ";
    return;
  }
  // otherwise start beeping...
  morseInProgress = str+" ";
  // do a beep and move onto the next character
  var beeper = function () {
    var time = 0;
    // look at first character to see what beep to use
    if (morseInProgress[0]==".") time = 100; // short beep
    else if (morseInProgress[0]=="-") time = 400; // long beep
    // a character of ' ' just leaves a pause
    if (time>0) {
      // start beeping
      analogWrite(SPEAKER,0.5,{freq:500});
      // turn speaker off after a time
      setTimeout(function() {
        digitalRead(A1); 
      }, time);
    }
    // remove the first character
    morseInProgress = morseInProgress.substr(1);
    // if there's anything left, carry on
    if (morseInProgress.length>0)
      setTimeout(beeper,500);
  };
  beeper();
}

function finalChar(ch) {
  var code = morse[ch];
  console.log("Chosen '"+ch+"' -> '"+code+"'");
  if (code!==undefined)
    doMorseCode(code);
}

var charTimeout; // timeout after a key is pressed
var charCurrent; // current character (index in letters)
var charIndex; // index in letters[charCurrent]

function newCharacter(ch) {
  console.log("newCharacter "+ch);
  // send the old one
  if (charCurrent!==undefined)
    finalChar(letters[charCurrent][charIndex]);
  // reset our values
  charCurrent = ch;
  charIndex = 0;
}

function onKeyPad(key) {
  // remove the timeout if we had one
  if (charTimeout!==undefined) {
    clearTimeout(charTimeout);
    charTimeout = undefined;
  }
  // work out which char was pressed
  var ch = "123A456B789C*0#D"[key];
  if (ch==charCurrent) {
    charIndex = (charIndex+1) % letters[charCurrent].length;
  } else {
    newCharacter(ch);
  }
  console.log("... '"+letters[charCurrent][charIndex]+"'");
  // set a timeout
  charTimeout = setTimeout(function() {
    charTimeout = undefined;
    newCharacter();
  }, 1500);
}

require("KeyPad").connect([B2,B3,B4,B5],[B6,B7,B8,B9], onKeyPad);
```

Now, press the number keys on the Key Pad. Just like text-messaging on an old telephone you'll cycle through letters.

If you want to type `Espruino`, you'd type: `37777 wait 7 wait 7778844466 wait 666`.

As a character is selected (1.5 seconds after you finish pressing a button, or when you press a different button), Espruino will beep out the morse code for that letter.


