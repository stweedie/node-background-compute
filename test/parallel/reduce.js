var parallel = require('../../lib/parallel');
var assert = require('assert');
var SampleObject = require('../SampleObject');
var util = require('../util');

var ARRAY_SIZE = 10000000;
var CHUNK_SIZE = 10000;

describe('reduce', function() {
  var sampleObjectArray = [];
  var expectedResult = 0;

  beforeEach(function() {
    for (var ii = 0, jj = ARRAY_SIZE; ii < jj; ii++) {
      sampleObjectArray[ii] = ii;
    }

    expectedResult = expectedResult || sampleObjectArray.reduce(sum, 0);
  });

  describe('promise', function() {
    it('should resolve properly after iteration', function(done) {
      var timer = util.timer();
      return parallel.promise.reduce(sampleObjectArray, CHUNK_SIZE, sum)
        .then(function(result) {
          assert(timer.stop());
          assert(expectedResult === result);
          done();
        })
        .catch(done);
    });
  });

  describe('callback', function() {
    it('should callback properly after iteration', function(done) {
      var timer = util.timer();
      parallel.callback.reduce(sampleObjectArray, CHUNK_SIZE, sum, 0, function(error, result) {
        assert(timer.stop());
        assert(expectedResult === result);
        done(error);
      });
    });
  });

  describe('event', function() {
    it('should emit event properly after iteration', function(done) {
      var timer = util.timer();
      var computation = parallel.event.reduce(sampleObjectArray, CHUNK_SIZE, sum, 0);

      computation.on('done', function(result) {
        assert(timer.stop());
        assert(expectedResult === result);
        done();
      });

      computation.on('error', done);
    });
  });
});

function sum(a, b) {
  return a + b;
}
