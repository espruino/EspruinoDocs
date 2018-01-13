<!--- Copyright (c) 2017 Juergen Marsch, Pur3 Ltd. See the file LICENSE for copying permission. -->
Extending Espruino 2 - Making a new Graphics class
================================================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Extending+Espruino+2. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Custom,C,C++,Extending,Extension,Native,Firmware

You might want to check out [this tutorial on making your own simple extensions](/Extending Espruino 1) first.

First of all, Espruino already has a built in [`Graphics class`](/Graphics), which supports lot of functions. By using the setup, most if not all LCD-screens can be supported by this class.
So why build a new one and not support existing one ? Hmm good question. Let me sum up:

- even simple animations are not part of Graphics
- standard on the market often have WS2812 like 8*8 matrix or 5-circle
- learning by doing is always a good starting point
- flexibilty of Graphics class also means, complex operations

__Prerequisite__: before you start with this, you should have your own development running, to compile your own version. Follow [the instructions on GitHub](https://github.com/espruino/Espruino/blob/master/README_Building.md) to get started.

Anyway, lets start with first step for our new graphics class.

* __Naming__ the name of the new class should not match existing classes, and give some information about the target. In our case the name is `LedMatrix`.
* __files__ we have to create at least 2 source files (.c and .h). To keep naming similiar to Espruino, we create `jswrap_LedMatrix.h` and `jswrap_LedMatrix.c`
* __header file__ as usual in C, we should start with some copyright and licence information. Next we add general lines

```C
#ifndef TARGETS_ESP8266_JSWRAP_LEDMATRIX_H_
#define TARGETS_ESP8266_JSWRAP_LEDMATRIX_H_
#include "jsvar.h"
.......
.......
#endif
```

To include jsvar.h is recommended. Its one of the main parts of Espruino, and you will need it in more than 90%.
__source file__ one more time copyright and licence information should be on top. C-beginners like me, often forget to include the header file.

```
#include "jswrap_LedMatrix.h"
```

Later on we will add some more includes, which are special to our new class.
__define local data__ up to now we have nothing in there for ou class, so lets start with a struct for general data.

```C
typedef struct {
  int width,height,cells,cellsLength;
  int red,green,blue;
} PACKED_FLAGS JsLedMatrixData;
```

width and height give the size of the matrix, cells and cellsLength are calculated based on that. And lets already add information for colors.

```C
typedef struct JsLedMatrix {
  JsVar *LedMatrixVar;
  JsLedMatrixData data;
} PACKED_FLAGS JsLedMatrix;
```

Together with a placeholder for the javascript object itself we have our struct for internal data. Obviously there are other ways to get a similiar result. For me, seperating between internal data and javascript data was helpful.


Handling of internal data
-------------------------

We already created a struct for internal data. Now we will initialize this data and add often used functions to handle.
__add includes__ we already included jsvar.h, now we add some more.

```C
#include "jsparse.h"
#include "jswrap_arraybuffer.h"
#include "jswrap_espruino.h"
```

If you want to know, which functions are added, please take alook to sourcecode by yourself. A list would be too big for this tutorial.
__initialize internal data__ JsLedMatrix is crinitilized this way

```C
static inline void LedMatrixStructInit(JsLedMatrix *lm){
  lm->data.width = 8;
  lm->data.height = 8;
  lm->data.cells = 64;
  lm->data.cellsLength = 192;
  lm->data.red = 32;
  lm->data.green = 32;
  lm->data.blue = 32;
}
```

cells could also be calculated and is width * height
cellsLength is cells multiplicated by 3, to hold three bytes for each pixel in WS2812

__store internal data and connect to javascript variable__

```C
void LedMatrixSetVar(JsLedMatrix *lm){
  JsVar *dataname = jsvFindChildFromString(lm->LedMatrixVar,JS_HIDDEN_CHAR_STR"lm",true);
  JsVar *data = jsvSkipName(dataname);
  if (!data) {
    data = jsvNewStringOfLength(sizeof(JsLedMatrixData));
    jsvSetValueOfName(dataname, data);
  }
  jsvUnLock(dataname);
  assert(data);
  jsvSetString(data, (char*)&lm->data, sizeof(JsLedMatrixData));
  jsvUnLock(data);
}
```

Internal data is stored and connected to javascriipt variable.
Between us, I cannot explain this part in detail. Anyway let me do my best. First we have a pointer to dataname, which is used next to skip over and ge a pointer to data itself. If we don't have data we have to create this data.
Never forget next line, jsvUnlock is important. Otherwise a memory leak is created which will sooner or later rsult in an error.
Now we set internal data connected to javascriptvariable and last not least one more jsvUnLock.

__read internal data and prepare for use__

```C
bool LedMatrixGetFromVar(JsLedMatrix *lm, JsVar *parent){
  lm->LedMatrixVar = parent;
  JsVar *data = jsvObjectGetChild(parent,JS_HIDDEN_CHAR_STR"lm",0);
  assert(data);
  if(data){
    jsvGetString(data, (char*)&lm->data, sizeof(JsLedMatrixData)+1);
    jsvUnLock(data);
    return true;
  } else
    return false;
}
```

One more time, let me do my best to explain. Start is to take the parent which usually is a javascript variable and read the connected internal data. If there is no data, return false, otherwise rerad the data and connect to parent.
__initialize internal data and create buffer__

```C
JsVar *jswrap_LedMatrix_createArrayBuffer(int width,int height){
  JsVar *parent = jspNewObject(0,"LedMatrix");
  JsLedMatrix lm;
  LedMatrixStructInit(&lm);
  lm.LedMatrixVar = parent;
  lm.data.width = width;
  lm.data.height = height;
  lm.data.cells = width * height;
  lm.data.cellsLength = width * height * 3;
  LedMatrixSetVar(&lm);
  JsVar *buf = jswrap_arraybuffer_constructor(lm.data.cellsLength);
  jsvUnLock2(jsvAddNamedChild(lm.LedMatrixVar,buf,"buffer"),buf);
  return parent;
}
```

We already created this function in previous introduction, now lets put some beef.
This is usually our starting point for LedMatrix. We 

- create the class with jsvNewObject
- read internal data
- assign size of the array
- store changed data
- and create  a buffer, which is also connected to our javascript variable.
- last not least unlock the data and return the class to javascript


Create a description for LedMatrix class
----------------------------------------

We just created a simple frame for our new class. Now we will add information about syntax and structure of Javascript commands.
This descriptions are added as comment in our source file. During compiling and linking this information will be used to create a additional lines in a file called jswrapper.c
Please have in mind, jswrapper.c is automatically created and used during compilation. You will not find it in sourcecode tree.
__create class__ first we create our class

```C
/*JSON{
  "type" : "class",
  "class" : "LedMatrix"
}
A class to support some simple drawings and animations (rotate and shift)
For a LED Matrix like the 8*8 WS2812 board
*/
```

In this simple description we have one part written in JSON syntax. This will be used internally to create objects. Therefore we have to follow guidelines for JSON.
Second part is free text and is used to create a description for Espruino Reference. Since we are writing our own class, description may not be neccessary, but its always good style.
__create initialize__ Now that we have our new class, lets describe how we build this class. We start with initialize and returning a pointer to the buffer.

```C
/*JSON{
  "type" : "staticmethod",
  "class" : "LedMatrix",
  "name" : "createArrayBuffer",
  "generate" : "jswrap_LedMatrix_createArrayBuffer",
  "params" :[
    ["width","int32","width"],
    ["height","int32","height"]
  ],
  "return" : ["JsVar","new LedMatrix object"],
  "return_object" : "LedMatrix"
}
Creates LEDMatrix object with an Arraybuffer for a LED-Matrix
This is tested with 8*8 WS2812 matrix. Others should work.
*/
JsVar *jswrap_LedMatrix_createArrayBuffer(int width,int height){
...
...
}
```

Now we have some more information so lets step through them.

* _type_ gives us information about the way, how wrapper for this command is created. Usually we will use staticmethod or method. There are a lot of other type, but come on, lets start with the easy part.
* _class_ this is the name of the class which will have this method
* _name_ is, surprise surprise the name of the method
* _generate_ is name of the c-function to be called from the javascript command
* _params_ is an array of params to describe, in our case, size of internal buffer. First we have the name, next c-type and last a description.
* _return\_object_ we return a class object, and the name is LedMatrix
* _return_ in this case we return a variable of type JsVar. JsVar is a main construct of Espruino and it describes storage and handling of variables

Next lines are description for reference
Last not least there is the body of the c-function. This need to match name in _generate_, one of the usual points of error ;-)

Simple operations on internal data and graphic buffer
-----------------------------------------------------

First simple function is __setting color__ for drawing functions.

```C
/*JSON{
  "type" : "method",
  "class" : "LedMatrix",
  "name" : "setColorHSB",
  "generate" : "jswrap_LedMatrix_setColorHSB",
  "params"   : [
    ["hue","float","hue"],
    ["sat","float","saturation"],
    ["bri","float","brightness"]
 ]   
}
Sets color for following drawings
Based on hue, saturation and brightness
Values are from 0 to 1
*/
```

Espruino is limited in number of args for functions. Therefore before we use a color, we have to set it. Another option would be to handover an object with 3 values for color, instead of 1 value for each color. May be in a later tutorial this will be added.
Anyway we need to add a JSON description, how function will be available in javascript. There is a new type of params. Values are given as float between 0 and 1.

```C
void jswrap_LedMatrix_setColorHSB(JsVar *parent, JsVarFloat hue, JsVarFloat sat, JsVarFloat bri){
  JsLedMatrix lm;
  if(!LedMatrixGetFromVar(&lm,parent)) return ;
  JsVarInt JsVarrgb = jswrap_espruino_HSBtoRGB(hue,sat,bri);
  int rgb = (int)JsVarrgb; lm.data.red = (char)rgb;
  rgb = (rgb >> 8); lm.data.green = (char)rgb;
  rgb = (rgb >> 8); lm.data.blue = (char)rgb;
  LedMatrixSetVar(&lm);
}
```

Internally floating point values use a special type of jsvar, the JsVarFloat.
We get the parent, pointer to class, and read internal data from there. The HSB-values are converted to rgb values from 0 to 255 and set in internal data. At the end changes are set, and done.

Another often used function is __filling the buffer__ with one color.

```C
/*JSON{
 "type"     : "method",
 "class"    : "LedMatrix",
 "name"     : "fill",
 "generate" : "jswrap_LedMatrix_fill"  
}
Fills whole matrix with same color
*/
```

Color for fill is set with command in previous example. So we don't need any parameter.

```C
void jswrap_LedMatrix_fill(JsVar *parent){
  JsLedMatrix lm;
  if(!LedMatrixGetFromVar(&lm,parent)) return ;
  JsVar *buf = jsvObjectGetChild(parent,"buffer",false);
  LedMatrix_fill(buf,lm);
  jsvUnLock(buf);
}
```

For fill we need internal data like width, height and the buffer itself. So first we get internal data and next a pointer to the buffer. Whole filling is splitted into 2 functions, the first we have here is more general and closer to javascript.

```C
void LedMatrix_fill(JsVar *buf,JsLedMatrix lm){
  JsvArrayBufferIterator it;
  jsvArrayBufferIteratorNew(&it,buf,0);
  for(int i = 0; i < lm.data.cells; i++){
    jsvArrayBufferIteratorSetByteValue(&it,(char)lm.data.green);
    jsvArrayBufferIteratorNext(&it);
    jsvArrayBufferIteratorSetByteValue(&it,(char)lm.data.red);
    jsvArrayBufferIteratorNext(&it);
    jsvArrayBufferIteratorSetByteValue(&it,(char)lm.data.blue);
    jsvArrayBufferIteratorNext(&it);
  }
  jsvArrayBufferIteratorFree(&it);
}
```

Second one dooes the main job. Buffer is stored in an Espruino specific buffer. To walk through this buffer special iterators are used. Setting the data and walking from one item in the array to the next use special function.
At the end, never forget to free memory.

Arrays, use as params or return from function
---------------------------------------------

In previous sections, we already used arguments for function. Sometimes it would be nice to use arrays to send more than one value as argument.
Sending data is one direction, sometimes you would like to return data as array. In this tutorial you will see, how to do this.
__Argument__
In our LedCircle example is an internal description for size of each circle. Depending on the way you wired the circles, this will not match anymore. Imagine to start from inner circle or from outer circle and you will see.
Standard number of Leds starts from outer circle, so it looks like [24,16,12,8,1]. Starting with inner circle, it should be [1,8,12,16,24].
Lets create a simple function to handle this, in our example the class is already available, named `lc`

```
lc.circleSize([1,8,12,16,24]);
```

To see how this is coded, lets start with definition in headerfile

```C
void jswrap_LedCircle_circleSize(JsVar *parent, JsVar *circleSizeArr);
```

So we have one argument only to set number of Leds for 5 circles.
Next lets see JSON description for Wrapper in c file

```C
/*JSON{
  "type" : "method",
  "class" : "LedCircle",
  "name" : "circleSize",
  "generate" : "jswrap_LedCircle_circleSize",
  "params"   : [
    ["circleSizeArr","JsVar","circleSizes"]
 ]   
}
Sets number of Leds for each circle
*/
```

To copy this data to the internal description is a simple loop using array iterator of Espruino.

```C
void jswrap_LedCircle_circleSize(JsVar *parent, JsVar *circleSizeArr){
  JsLedCircle lm; JsvIterator itcs; int i;
  if(!LedCircleGetFromVar(&lm,parent)) return ;
  jsvIteratorNew(&itcs, circleSizeArr);
  i = 0;
  while (jsvIteratorHasElement(&itcs)) {
    lm.data.circleSize[i] = (int)jsvIteratorGetIntegerValue(&itcs);
    jsvIteratorNext(&itcs);
	i++;
  }
  jsvIteratorFree(&itcs);
  LedCircleSetVar(&lm);
}
```

Iterator also supports floating arguments, take a closer look to jsvariterator.h to find a lot of other helpful functions.
__return an Array__
===================
Sometimes you want to get parts of the Led buffer to do some changes. Easy way is to return an array, which can be used for changes, and later on written back.
This time we take LedMatrix, where we want to get color of one pixel. It will be returned as an array of 3 bytes. To be correct, what we return is an arraybuffer ;-)
Lets start with the header file as above

```C
JsVar *jswrap_LedMatrix_getPixel(JsVar *parent, int row, int column);
```

Should not be a big problem to understand, lets take next step directly, which is the JSON description of the function.

```C
/*JSON{
  "type" : "method",
  "class" : "LedMatrix",
  "name" : "getPixel",
  "generate" : "jswrap_LedMatrix_getPixel",
  "params" : [
    ["row","int","row"],
    ["column","int","column"]
  ],
  "return" : ["JsVar","pixelBuffer"] 
}
Returns a buffer with color of pixel defined by row and column
*/
```

As you can see, return parameter is JsVar, not arraybuffer. JsVar is one of the major constructions in Espruino. We get a lot of benefit, using JsVar, there are a lot of supporting functions, last not least we don't have to take (much) care to waste memory.
Anyway next and last step is code itself

```C
JsVar *LedMatrix_getPixel(JsVar *buf,JsLedMatrix lm, int row,int column){
  JsvArrayBufferIterator it;int p;
  p = (row * lm.data.width + column) *3;
  jsvArrayBufferIteratorNew(&it,buf,p);
  char *ptr = 0;
  JsVar *bufa = jsvNewArrayBufferWithPtr(3,&ptr);
  JsvArrayBufferIterator itd;int pd;
  jsvArrayBufferIteratorNew(&itd,bufa,0);
  for(int i = 0; i < 3; i++){
    jsvArrayBufferIteratorSetByteValue(&itd,(char)jsvArrayBufferIteratorGetIntegerValue(&it));
    jsvArrayBufferIteratorNext(&it);
    jsvArrayBufferIteratorNext(&itd);
  }
  jsvArrayBufferIteratorFree(&it);
  jsvArrayBufferIteratorFree(&itd);
  return bufa;
}
```

Its interesting to see, how an iterator is used to walk through an array. In Simple functions, we already talked about Iterator. Therefor lets set the focus on general parts. First we create an Iterator pointing to the internal pixelbuffer. Next is to create a new array, length 3 bytes for retrun values. Copy form Pixelbuffer to Returnbuffer, free used iterators and return Returnbuffer, done.
In our next example we will see how to handle objects for arguments.

Object arguments for functions
------------------------------

Now that we used arrays, lets take next step and see how to use objects.
__Argument object__
There is at least one good reason to use objects. Espruino has a limitation in number of arguments. If we, for example, would like to set color of a specified pixel, we could use 5 params, x and y for location and r,g,b for color. This is too much for Espruino. Have in mind, we are talking about Javascript on very small devices, we have to live with some limitations.
Good part of the answer is, we have JsVar. And JsVar could also be an object. To take example above we could call setPixel like this

```
lc.setPixel({x:2,y:3},{red:88,green:12,blue:40});
```

We easily put location and color into an object. In above example we use 2 objects to split between location and color for better understanding. If you would like to put all args into one object, no problem, go on and do it. In our example code, we will use color only, to keep explanation short.
Calling a function with objects in our example is

```
lc.init({red:1,green:30,blue:3});
```

In Header file this looks like

```C
void jswrap_LedCircle_init(JsVar *parent, JsVar *options);
```

Decription for wrapper is as simple as for arrays

```C
/*JSON{
  "type" : "method",
  "class" : "LedCircle",
  "name" : "init",
  "generate" : "jswrap_LedCircle_init",
  "params"   : [
    ["options","JsVar","options"]
 ]   
}
Initializes color based on Javascript object.
*/
```

Coding is a bit complex, we have to create a description how to handle options.

```C
void jswrap_LedCircle_init(JsVar *parent, JsVar *options){
  JsLedCircle lm;
  if(!LedCircleGetFromVar(&lm,parent)) return ;
  jsvConfigObject configs[] = {
      {"red", JSV_INTEGER, &lm.data.red},
      {"green", JSV_INTEGER, &lm.data.green},
      {"blue", JSV_INTEGER, &lm.data.blue}
  };
  jsvReadConfigObject(options, configs, sizeof(configs) / sizeof(jsvConfigObject));
  LedCircleSetVar(&lm);
}
```

__return an object__
Now that we know, how to use an object for arguments, lets take the other direction. We want to read colors back in the same way.

```
lc.getColor();
```

In header file we add a small line only

```C
JsVar *jswrap_LedCircle_getColor(JsVar *parent);
```

Next step is, as usual, JSON descripton of command

```C
/*JSON{
  "type" : "method",
  "class" : "LedCircle",
  "name" : "getColor",
  "generate" : "jswrap_LedCircle_getColor",
  "return" : ["JsVar","color_Object"]   
}
returns actual color setting
*/
```

In previous tutorials we already got a lot of information, and there is nothing new. Lets directly go to sourcecode.

```C
JsVar *jswrap_LedCircle_getColor(JsVar *parent){
  JsLedCircle lm;
  if(!LedCircleGetFromVar(&lm,parent)) return false;
  JsVar *obj = jsvNewObject();
  jsvObjectSetChildAndUnLock(obj, "red", jsvNewFromInteger(lm.data.red));
  jsvObjectSetChildAndUnLock(obj, "green", jsvNewFromInteger(lm.data.green));
  jsvObjectSetChildAndUnLock(obj, "blue", jsvNewFromInteger(lm.data.blue));
  return obj;
}
```

Naming of functions in Espruino is perfect for understanding what we are going to do. In simple words, create an object assign children, one for each color and return the object. Done, even unlocking is part of exiting functions, we don't have to take care on that.


Integer or String, check args
-----------------------------

One of the big advantages in Javascript is the type of a variable. An variable can be a string, an integer, a function, a float, etc.
In Espruino we have a general struct for variables, called JsVar. This construct holds all information about the actual type of a variable.
Now imagine, you want to have a function that supports args as Integer or as String. It could be used to get information by index or by name. Creating 2 functions like getDataByInt and getDataByName would be one option. A general function like getData, that seperates inside based on actual arg could be better solution.
Lets first define this function in header file

```C
JsVar *jswrap_flash_getData(JsVar *dataVar);
```

As you can see, type of the argument is JsVar. This way, its not limited to any type.
Lets see definition of the function for Espruino in source file.

```C
/*JSON{
  "type" : "staticmethod",
  "class" : "myClass",
  "name" : "getData",
  "generate" : "jswrap_myClass_getData",
  "params" : [
    ["dataVar","JsVar","Id(integer) or name(string)"]
  ],
  "return" : ["JsVar","myClass string"],
}
*/
```

Definition for JavaScript is similiar to header file. Argument is of type JsVar. Please have in mind to change class name to name of your class ;-)
Now we have to switch between type of arg, int or string.

```C
int i;
if(jsvIsInt(dataVar)){
  i = callHandleInt(dataVar)
}
else{
  i = callHandleString(dataVar);
}
callYourFunction(i);
```

First of all, lets assume, that we need a pointer to an array instead of dataVar.
First we test is dataVar an int and we calculate the pointer.
If it is not an int, we assume its a string. It would be better style to make sure, its a string by calling jsvIsString. You can find more `jsvIs...` in file `src/jsvar.h`, take the one which matches your needs.


Emit events
-----------

Events are welknown in JavaScript. They are called onClick, onChange, etc in your browser.
Espruino also has some events, around http you will find a lot. In this tutorial we will see how to create our own events.
For this tutorial we will create a Schmitt Trigger. If you want to know in detail wath this is, take a look to [wikipedia](https://en.wikipedia.org/wiki/Schmitt_trigger).
In short, Schmitt Trigger has an analog input and a binary output. Inside it is a 2 level comparator. If input is greater than **high**, out put changes to true, and to false if it is less than **low**. If input is between **low** and **high** there is no change. In most cases it is important to recognize changes of output only.
Lets start with javascript code that we would like to call

```
var st = new SchmittTrigger(3,5);
st.on("change",function(state{console.log(state);});
st.set(4); // is between low and high, no change
st.set(8); // is > high, change to true
st.set(4);
st.set(2);
```

In console we should see 2 lines, one for switching to true and one for switching to false.

This tutorial is focused on events, if you want to see full source code, its available on [github](https://github.com/jumjum123/EspruinoExtensions/tree/master/Flash). As usual lets start with header file.

```C
JsVar *jswrap_SchmittTrigger_constructor(JsVarFloat low,JsVarFloat high);
bool jswrap_SchmittTrigger_set(JsVar *parent,JsVarFloat value);
```

There is nothing really new in that, may be constructor is not that known, in source you will see, we handled this already in a former tutorial.
Next lets see, how the description for JavaScript looks like.

```C
/*JSON{
  "type"  : "class",
  "class" : "SchmittTrigger"
}
This is the built-in class for Schmitt Trigger
*/
/*JSON{
  "type" : "event",
  "class" : "SchmittTrigger",
  "name" : "onChanged"
}
This event is called when status of Schmitt Trigger changes.
*/
```

We have to define a class first and next we see definition of an event. Both lines are mainly used to create documentation.
We don't see definition for both lines we had in header file, as mentioned above take a look to github if you want to know more about them.
In jswrap_SchmittTrigger_set are the calls to emit an event.

```C
if(value < st.data.low){
  st.data.status = false;
  emitOnChange(parent,false);
}
```

Important is the line where we emit the change event.
Now we only have to see whats inside `emitOnChange`

```C
void emitOnChange(JsVar *parent,bool status){
  JsVar *args[1];
  args[0] = jsvNewFromBool(status);
  JsVar *eventName = jsvNewFromString(JS_EVENT_PREFIX"change");
  JsVar *callback = jsvSkipNameAndUnLock(jsvFindChildFromVar(parent, eventName, 0));
  jsvUnLock(eventName);
  if (callback) jsiQueueEvents(parent, callback, args, 1);
  jsvUnLock(callback);
  jsvUnLockMany(1, args);
}
```

This looks a little bit more interesting, lets go through all lines.
First we create an array of JsVar and assign a value for status. Size of the array is one, since we return only a value for status.
Next we create an eventName, at the end we only get a string "#onchange".
Now lets see, is there some code defined for the change event ?
There is no need for eventName any more, lets free the JsVar.
If callback is not undefined, means, there is something defined, queue the event in an internal list.
And done, lets free memory for callback and args array.
Anything else to call the queue, and to call it only once, etc is already available in Espruino.
