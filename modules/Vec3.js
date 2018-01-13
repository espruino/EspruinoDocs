/** Create a new vector 

* Either with an object: new Vec3({x:1, y:2, z:3});
* 3 values: new Vec3(1,2,3);
* or nothing, for 0,0,0: new Vec3(); */
function Vec3(x,y,z) {
  if ("object"==typeof x)
    this.set(x.x, x.y, x.z);
  else if ("number"==typeof x)
    this.set(x, y, z);
  else
    this.set(0, 0, 0);
}

/** Set the value of this vector */
Vec3.prototype.set = function(x,y,z) {
  this.x=+x;
  this.y=+y;
  this.z=+z;
}

/** Return a new vector made by adding the argument to this */
Vec3.prototype.add = function(v) {
  return new Vec3(this.x+v.x, this.y+v.y, this.z+v.z);
};

/** Return a new vector made by subtracting the argument from this */
Vec3.prototype.sub = function(v) {
  return new Vec3(this.x-v.x, this.y-v.y, this.z-v.z);
};

/** Multiply this vector by the scalar argument */
Vec3.prototype.mul = function(v) {
  return new Vec3(this.x*v, this.y*v, this.z*v);
};

/** Return the Dot product of this vector with the argument */
Vec3.prototype.dot = function(v) {
  return this.x*v.x + this.y*v.y + this.z*v.z;
};

/** Return the Cross product of this vector with the argument */
Vec3.prototype.cross = function(v) {
  return new Vec3(
    this.y*v.z - this.z*v.y, 
    this.z*v.x - this.x*v.z, 
    this.x*v.y - this.y*v.x);
};

/** Return the Magnitude of this vector */
Vec3.prototype.mag = function() {
  return Math.sqrt(this.dot(this));
};

/** Return a vector containing the minimum XYZ components of this and the parameter */
Vec3.prototype.min = function(v) {
  return new Vec3(
    Math.min(this.x,v.x), 
    Math.min(this.y,v.y), 
    Math.min(this.z,v.z));
};

/** Return a vector containing the maximum XYZ components of this and the parameter */
Vec3.prototype.max = function(v) {
  return new Vec3(
    Math.max(this.x,v.x), 
    Math.max(this.y,v.y), 
    Math.max(this.z,v.z));
};

exports = Vec3;
