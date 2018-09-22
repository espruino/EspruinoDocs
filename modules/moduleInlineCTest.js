//moduleInlineCTest.js
//Fri 2018.09.21

//http://www.espruino.com/InlineC



var c = E.compiledC(`
// double lookup(int)

double lut[8] = {
 41,42,43,44,45,46,47,48
};
double lookup(unsigned int x)
{
  return lut[x&7];
}
`);

exports = c;



//[eof]