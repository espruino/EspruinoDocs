<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Fractals
========

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Fractals. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Fractals,Fractal,Mandelbrot

You don't have to directly control hardware with Espruino - you can use it for calculations too.

Using the code below you can plot a mandelbrot fractal:

```
function mandelbrot(sizex,sizey) {
 for (var y=0;y<sizey;y++) {
  var line="";
  for (var x=0;x<sizex;x++) {
   var Xr=0;
   var Xi=0;
   var Cr=(4.0*x/sizex)-2.0;
   var Ci=(4.0*y/sizey)-2.0;
   var i=0;
   while ((i<16) && ((Xr*Xr+Xi*Xi)<4)) {
    var t=Xr*Xr - Xi*Xi + Cr;
    Xi=2*Xr*Xi+Ci;
    Xr=t;
    i++;
   }
   line += (i&1) ? "*" : " ";
  }
  print(line);
 }
}

mandelbrot(32,32);
```

It'll draw something like this on the console:

```
********************************
***********           **********
*********               ********
*******                   ******
******                     *****
*****                       ****
****     *******             ***
***   ******* ** **           **
***  ******  * *   *          **
** *******   ** **  **         *
** ******  * *   ** **         *
* *****  ***       * **         
****** ***         *****        
***  * * *          * **        
*   * *   *         * **        
*   **              * **        
*                  ** **        
*   **              * **        
*   * *   *         * **        
***  * * *          * **        
****** ***         *****        
* *****  ***       * **         
** ******  * *   ** **         *
** *******   ** **  **         *
***  ******  * *   *          **
***   ******* ** **           **
****     *******             ***
*****                       ****
******                     *****
*******                   ******
*********               ********
***********           **********
```
