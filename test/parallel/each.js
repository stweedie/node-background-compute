var parallel = require('../../lib/parallel');
var assert = require('assert');
var SampleObject = require('../SampleObject');
var util = require('../util');

var ARRAY_SIZE = 50000;

describe('each', function() {
  var sampleObjectArray = [];

  beforeEach(function() {
    for (var ii = 0, jj = ARRAY_SIZE; ii < jj; ii++) {
      sampleObjectArray[ii] = new SampleObject(ii);
    }
  });

  describe('promise', function() {
    it('should resolve properly after iteration', function(done) {
      var timer = util.timer();
      return parallel.promise.each(sampleObjectArray, 50, eachFn)
        .then(function() {
          assert(timer.stop());
          assert(sampleObjectArray.length && sampleObjectArray.length === ARRAY_SIZE);
          assert(sampleObjectArray[0].foo === 'bar');
          done();
        })
        .catch(done);
    });
  });

  describe('callback', function() {
    it('should callback properly after iteration', function(done) {
      var timer = util.timer();
      parallel.callback.each(sampleObjectArray, 50, eachFn, function(error) {
        assert(timer.stop());
        assert(sampleObjectArray.length && sampleObjectArray.length === ARRAY_SIZE);
        assert(sampleObjectArray[0].foo === 'bar');
        done(error);
      });
    });
  });

  describe('event', function() {
    it('should emit event properly after iteration', function(done) {
      var timer = util.timer();
      var computation = parallel.event.each(sampleObjectArray, 50, eachFn);

      computation.on('done', function() {
        assert(timer.stop());
        assert(sampleObjectArray.length && sampleObjectArray.length === ARRAY_SIZE);
        assert(sampleObjectArray[0].foo === 'bar');
        computation = null;
        done();
      });

      computation.on('error', done);
    });
  });
});

function eachFn(sampleObject, index) {
  sampleObject.modify();
}

function errorFn(sampleObject, index) {
  sampleObject.createError();
}
