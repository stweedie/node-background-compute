var parallel = require('../../lib/parallel');
var assert = require('assert');
var SampleObject = require('../SampleObject');
var util = require('../util');

var ARRAY_SIZE = 50000;

describe('map', function() {
  var sampleObjectArray = [];

  beforeEach(function() {
    for (var ii = 0, jj = ARRAY_SIZE; ii < jj; ii++) {
      sampleObjectArray[ii] = ii;
    }
  });

  describe('promise', function() {
    it('should resolve properly after iteration', function(done) {
      var timer = util.timer();
      return parallel.promise.map(sampleObjectArray, 50, mapFn)
        .then(function(result) {
          assert(timer.stop());
          assert(result.length && result.length === ARRAY_SIZE);
          assert(result[0].foo === 'bar');
          done();
        })
        .catch(done);
    });
  });

  describe('callback', function() {
    it('should callback properly after iteration', function(done) {
      var timer = util.timer();
      parallel.callback.map(sampleObjectArray, 50, mapFn, function(error, result) {
        assert(timer.stop());
        assert(result.length && result.length === ARRAY_SIZE);
        assert(result[0].foo === 'bar');
        done(error);
      });
    });
  });

  describe('event', function() {
    it('should emit event properly after iteration', function(done) {
      var timer = util.timer();
      var computation = parallel.event.map(sampleObjectArray, 50, mapFn);

      computation.on('done', function(result) {
        computation = null;
        assert(timer.stop());
        assert(result.length && result.length === ARRAY_SIZE);
        assert(result[0].foo === 'bar');
        done();
      });

      computation.on('error', done);
    });
  });
});

function mapFn(value, index) {
  return new SampleObject(index).modify();
}
