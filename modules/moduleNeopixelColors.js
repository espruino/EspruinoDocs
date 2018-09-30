// NeopixelColors.js
// Sat 2018.09.22



//Table of X11 colors [X11COLORS] supported by popular browsers
//Extended color keywords by color name


//https://www.w3.org/TR/css-color-3/
//https://www.w3schools.com/cssref/css_colors.asp


var RGB = {
//  Red    : "FF0000",
  Orange : "AB5500",
//  Yellow : "ABAB00",
  Green  : "00FF00",
  
//  Aqua   : "00AB55",
//  Blue   : "0000FF",
//  Purple : "550055",
  Pink   : "AB0055",
  
  // The above are gamma adjusted rainbow colors
  
  
  AliceBlue  : "F0F8FF",
  AntiqueWhite : "FAEBD7",
  Aqua       : "00FFFF",
  Aquamarine : "7FFFD4",
  Azure      : "F0FFFF",
  
  Beige      : "F5F5DC",
  Bisque     : "FFE4C4",
  Black      : "000000",
  BlanchedAlmond : "FFEBCD",
  Blue       : "0000FF",
  BlueViolet : "8A2BE2",
  Brown      : "A52A2A",
  BurlyWood  : "DEB887",

  CadetBlue  : "5F9EA0",
  Chartreuse : "7FFF00",
  Chocolate  : "D2691E",
  Coral      : "FF7F50",
  CornflowerBlue : "6495ED",
  Cornsilk   : "FFF8DC",
  Crimson 	 : "DC143C",
  Cyan       : "00FFFF",
  DarkBlue   : "00008B",
  DarkCyan   : "008B8B",


  DarkGoldenRod : "B8860B",
  DarkGray   : "A9A9A9",
  DarkGrey   : "A9A9A9",
  DarkGreen  : "006400",
  DarkKhaki  : "BDB76B",
  DarkMagenta : "8B008B",
  DarkOliveGreen : "556B2F",
  DarkOrange : "FF8C00",
  DarkOrchid : "9932CC",
  DarkRed    : "8B0000",





  
  
  
  
  
  
  PowderBlue : "B0E0E6",
  Purple     : "800080",
  RebeccaPurple : "663399",
  Red        : "FF0000",
  RosyBrown  : "BC8F8F",
  RoyalBlue  : "4169E1",

  SaddleBrown : "8B4513",
  Salmon     : "FA8072",
  SandyBrown : "F4A460",
  SeaGreen   : "2E8B57",
  SeaShell   : "FFF5EE",
  Sienna     : "A0522D",
  Silver     : "C0C0C0",
  SkyBlue    : "87CEEB",
  SlateBlue  : "6A5ACD",
  SlateGray  : "708090",
  SlateGrey  : "708090",
  Snow       : "FFFAFA",
  SpringGreen : "00FF7F",
  SteelBlue  : "4682B4",
  Tan        : "D2B48C",
  Teal       : "008080",
  Thistle    : "D8BFD8",
  Tomato     : "FF6347",
  Turquoise  : "40E0D0",

  Violet     : "EE82EE",
  Wheat      : "F5DEB3",
  White      : "FFFFFF",
  WhiteSmoke : "F5F5F5",
  Yellow     : "FFFF00",
  YellowGreen : "9ACD32"
};

exports = RGB;





/*


Color Name	HEX	Color	Shades	Mix


DarkSalmon 	#E9967A	 	Shades	Mix
DarkSeaGreen 	#8FBC8F	 	Shades	Mix
DarkSlateBlue 	#483D8B	 	Shades	Mix
DarkSlateGray 	#2F4F4F	 	Shades	Mix
DarkSlateGrey 	#2F4F4F	 	Shades	Mix
DarkTurquoise 	#00CED1	 	Shades	Mix
DarkViolet 	#9400D3	 	Shades	Mix
DeepPink 	#FF1493	 	Shades	Mix
DeepSkyBlue 	#00BFFF	 	Shades	Mix
DimGray 	#696969	 	Shades	Mix
DimGrey 	#696969	 	Shades	Mix
DodgerBlue 	#1E90FF	 	Shades	Mix
FireBrick 	#B22222	 	Shades	Mix
FloralWhite 	#FFFAF0	 	Shades	Mix
ForestGreen 	#228B22	 	Shades	Mix
Fuchsia 	#FF00FF	 	Shades	Mix
Gainsboro 	#DCDCDC	 	Shades	Mix
GhostWhite 	#F8F8FF	 	Shades	Mix
Gold 	#FFD700	 	Shades	Mix
GoldenRod 	#DAA520	 	Shades	Mix
Gray 	#808080	 	Shades	Mix
Grey 	#808080	 	Shades	Mix
Green 	#008000	 	Shades	Mix
GreenYellow 	#ADFF2F	 	Shades	Mix
HoneyDew 	#F0FFF0	 	Shades	Mix
HotPink 	#FF69B4	 	Shades	Mix
IndianRed  	#CD5C5C	 	Shades	Mix
Indigo  	#4B0082	 	Shades	Mix
Ivory 	#FFFFF0	 	Shades	Mix
Khaki 	#F0E68C	 	Shades	Mix
Lavender 	#E6E6FA	 	Shades	Mix
LavenderBlush 	#FFF0F5	 	Shades	Mix
LawnGreen 	#7CFC00	 	Shades	Mix
LemonChiffon 	#FFFACD	 	Shades	Mix
LightBlue 	#ADD8E6	 	Shades	Mix
LightCoral 	#F08080	 	Shades	Mix
LightCyan 	#E0FFFF	 	Shades	Mix
LightGoldenRodYellow 	#FAFAD2	 	Shades	Mix
LightGray 	#D3D3D3	 	Shades	Mix
LightGrey 	#D3D3D3	 	Shades	Mix
LightGreen 	#90EE90	 	Shades	Mix
LightPink 	#FFB6C1	 	Shades	Mix
LightSalmon 	#FFA07A	 	Shades	Mix
LightSeaGreen 	#20B2AA	 	Shades	Mix
LightSkyBlue 	#87CEFA	 	Shades	Mix
LightSlateGray 	#778899	 	Shades	Mix
LightSlateGrey 	#778899	 	Shades	Mix
LightSteelBlue 	#B0C4DE	 	Shades	Mix
LightYellow 	#FFFFE0	 	Shades	Mix
Lime 	#00FF00	 	Shades	Mix
LimeGreen 	#32CD32	 	Shades	Mix
Linen 	#FAF0E6	 	Shades	Mix
Magenta 	#FF00FF	 	Shades	Mix
Maroon 	#800000	 	Shades	Mix
MediumAquaMarine 	#66CDAA	 	Shades	Mix
MediumBlue 	#0000CD	 	Shades	Mix
MediumOrchid 	#BA55D3	 	Shades	Mix
MediumPurple 	#9370DB	 	Shades	Mix
MediumSeaGreen 	#3CB371	 	Shades	Mix
MediumSlateBlue 	#7B68EE	 	Shades	Mix
MediumSpringGreen 	#00FA9A	 	Shades	Mix
MediumTurquoise 	#48D1CC	 	Shades	Mix
MediumVioletRed 	#C71585	 	Shades	Mix
MidnightBlue 	#191970	 	Shades	Mix
MintCream 	#F5FFFA	 	Shades	Mix
MistyRose 	#FFE4E1	 	Shades	Mix
Moccasin 	#FFE4B5	 	Shades	Mix
NavajoWhite 	#FFDEAD	 	Shades	Mix
Navy 	#000080	 	Shades	Mix
OldLace 	#FDF5E6	 	Shades	Mix
Olive 	#808000	 	Shades	Mix
OliveDrab 	#6B8E23	 	Shades	Mix
Orange 	#FFA500	 	Shades	Mix
OrangeRed 	#FF4500	 	Shades	Mix
Orchid 	#DA70D6	 	Shades	Mix
PaleGoldenRod 	#EEE8AA	 	Shades	Mix
PaleGreen 	#98FB98	 	Shades	Mix
PaleTurquoise 	#AFEEEE	 	Shades	Mix
PaleVioletRed 	#DB7093	 	Shades	Mix
PapayaWhip 	#FFEFD5	 	Shades	Mix
PeachPuff 	#FFDAB9	 	Shades	Mix
Peru 	#CD853F	 	Shades	Mix
Pink 	#FFC0CB	 	Shades	Mix
Plum 	#DDA0DD	 	Shades	Mix



*/