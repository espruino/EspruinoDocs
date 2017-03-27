<!--- Copyright (c) 2014 Spence Konde. See the file LICENSE for copying permission. -->
EasyVR Voice Recognition Board
========================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/EasyVR. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,EasyVR,Voice


Overview
------------------
The [[EasyVR.js]] module interfaces with EasyVR voice recognition board/shield. Presently, this support is very basic, and the module may change substantially. However, this is good enough to get started with EasyVR and the Espruino.

Hardware:
------------------
Connect Vcc and GND, 
Connect RX and TX of EasyVR to TX and RX of Espruino.
Set jumper to PC. 

Setup:
---------------------
Programming/training must be done using PC and the included software - support for that is not provided in this module. 

Using:

Use EasyVR.setRecognize(list,timeout) to start listening for SD commands from the specified option group, with the specified timeout option. 

You must supply three callbacks: 
onCom is called with two arguments, the option group, and the command returned, when a command is recognized.  
onTimeout is called with one argument, the option group, when the command times out. 
onErr is called with one argument, the option group, when a speach recognition error occurs (usually that the command was close, but not close enough). 

Example:
-------------

```
var ocm=function(menu,option) {
  console.log("menu:"+menu+" option: "+option);
  if (menu==0) { //handle top-level menu.
    if (option==0) {
      console.log("LIGHTS ON");
      //do lights on calls
    } else if (option==1) {
      console.log("LIGHTS OFF");
      //do lights off calls
    } else if (option==2) {
      console.log("SWITCH :");
      digitalWrite(LED1,1);
      return {type:2,timeout:15};
    } else if (option==3) {
      console.log("DESK :");
      digitalWrite(LED1,1);
      return {type:3,timeout:15};
    } else if (option==4) {
      console.log("NIXIE :");
      digitalWrite(LED1,1);
      return {type:4,timeout:15};
    }
  } else {
    if (menu==2) { // toggle a fargo or RF controlled device
      console.log("toggle device "+option);
      if (option < 8) {
        //do the turn device on/off thing. 
      } 
    } else if (menu==3) { // control desk lamp
      //do stuff based on the option number. 
    } else if (menu==4) { // control nixie clock
      //do stuff based on the option number. 
      } 
    }
    digitalWrite(LED1,0);
    return {type:1,timeout:0};
  }
  
};

var otm=function(){
  digitalWrite(LED1,0);
  this.setRecognize(1,0);
};



Serial4.setup(9600,{tx:C10,rx:C11});
    
var evr=require("easyvr").connect(Serial4,ocm,otm,otm);

```

