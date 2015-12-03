function SampleObject(index) {
  this.index = index;
  this.name = 'SampleObject';
}

SampleObject.prototype.modify = function() {
  this.foo = 'bar';
  return this;
}

SampleObject.prototype.createError = function() {
  throw new Error('SampleObject threw an error');
}

module.exports = SampleObject;
