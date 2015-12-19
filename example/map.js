var parallel = require('../lib/parallel');

var async;
try {
  async = require('async');
} catch (error) {
  console.log('you need to have the async npm library installed to perform this test. please run \'npm install async\'');
  process.exit(1);
}

var mapFn = function(object, index, array) {
  return JSON.parse(JSON.stringify({
    foo: 'bar',
    index: index,
    name: object.name,
    value: object.value
  }));
}

var currentYields = 0;

var asyncMapFn = function(object, done) {
  done(null, mapFn(object, 1));
}

var expectedIterationTime = 100;
var thresholdTime = 50;
var delayedTime = expectedIterationTime + thresholdTime;
var blockedTime = 5 * expectedIterationTime;

var lineOfDashes = '--------------------------------------------------------------------------------';

var timerTock, timerTick = Date.now();

function timerElapsed() {
  timerTock = Date.now();
  var elapsed = timerTock - timerTick;
  if (elapsed > blockedTime) {
    console.log('EVENT LOOP BLOCKED! timer elapsed in %sms, expected %sms', elapsed, expectedIterationTime);
  } else if (elapsed > delayedTime) {
    console.log('EVENT LOOP DELAYED! timer elapsed in %sms, expected %sms', elapsed, expectedIterationTime);
  }

  timerTick = timerTock;
  currentYields++;
}

var interval = setInterval(timerElapsed, expectedIterationTime);

var arraySize = 400000;
var array = new Array(arraySize);
for (var ii = 0; ii < arraySize; ii++) {
  array[ii] = {
    value: ii,
    name: ii.toString()
  };
}

// how many iterations of the map function should be applied before yielding 
var arrayChunkSize = 300;

runNativeTest();

function runNativeTest() {
  currentYields = 0;
  var tock, tick = Date.now();
  console.log(lineOfDashes);
  console.log('native array.map operation starting');
  var syncResult = array.map(mapFn);
  tock = Date.now();
  console.log('native array.map operation ended after %sms, yielded %s times.', tock - tick, currentYields);
  setImmediate(runAsyncTest);
}

function runAsyncTest() {
  currentYields = 0;
  var tock, tick = Date.now();
  console.log(lineOfDashes);
  console.log('async.map starting');
  async.map(array, asyncMapFn, function(error, result) {
    tock = Date.now();
    console.log('async.map operation ended after %sms, yielded %s times.', tock - tick, currentYields);
    setImmediate(runPromiseTest);
  });
}

function runPromiseTest() {
  currentYields = 0;
  var tock, tick = Date.now();
  console.log(lineOfDashes);
  console.log('parallel.map promise operation starting');
  return parallel.map(array, arrayChunkSize, mapFn)
    .then(function(asyncResult) {
      tock = Date.now();
      console.log('parallel.map promise operation ended after %sms, yielded %s times.', tock - tick, currentYields);
      runCallbackTest();
    });
}

function runCallbackTest() {
  currentYields = 0;
  var tock, tick = Date.now();
  console.log(lineOfDashes);
  console.log('parallel.map callback operation starting');
  parallel.map(array, arrayChunkSize, mapFn, function(error, asyncResult) {
    tock = Date.now();
    console.log('parallel.map callback operation ended after %sms, yielded %s times.', tock - tick, currentYields);
    runEventTest();
  });
}



function runEventTest() {
  currentYields = 0;
  var tock, tick = Date.now();
  console.log(lineOfDashes);
  console.log('parallel.map event operation starting');
  var event = parallel.event.map(array, arrayChunkSize, mapFn);

  event.on('done', function(asyncResult) {
    tock = Date.now();
    console.log('parallel.map event operation ended after %sms, yielded %s times.', tock - tick, currentYields);
    clearInterval(interval);

    console.log();
  });
}
