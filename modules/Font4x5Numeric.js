/* Copyright (c) 2018 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/* Basic 4x5 font - only './0123456789', variable width */
/*var font = Graphics.createImage(`
    #

   ##
  #
##

#####
#   #
#####

#####

# ###
# # #
### #

# # #
# # #
#####

###
  #
#####

### #
# # #
# ###

#####
# # #
# ###

#
#
#####

#####
# # #
#####

### #
# # #
#####
`).buffer;
var widths = E.toString([2,4,4,2,4,4,4,4,4,4,4,4]);
this.setFontCustom(font, 46, widths, 5);
*/

exports.add = function(graphics) {
  graphics.prototype.setFont4x5Numeric = function() {
    this.setFontCustom(atob("CAZMA/H4PgvXoK1+DhPg7W4P1uCEPg/X4O1+AA=="), 46, atob("AgQEAgQEBAQEBAQE"), 5);
  }
}
