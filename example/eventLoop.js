var parallel = require('../lib/parallel');

var iterations = 20000000;
var expectedIterationTime = 10;
var syncOperationDone = false;
var asyncOperationDone = false;

var array = new Array(iterations);
for (var ii = 0, jj = array.length; ii < jj; ii++) {
  array[ii] = ii;
}

var timerTock, timerTick = Date.now();

function timerElapsed() {
  timerTock = Date.now();
  // console.log(['timer elapsed in', timerTock - timerTick, 'ms, expected', expectedIterationTime, 'ms'].join(' '));
  timerTick = timerTock;
}

var interval = setInterval(timerElapsed, expectedIterationTime);

var iteratorFunction = function(value, index) {
  // some expensive function
  var result = value * Math.random() * index + index - Math.atan2(0.5);
  return index;
}

var reduceFunction = function(accumulator, value, index, array) {
  return accumulator + index;
}

runSynchronousTest();

function runSynchronousTest() {
  var tock, tick = Date.now();
  console.log('synchronous operation starting');
  var syncResult = array.reduce(reduceFunction, 0);
  tock = Date.now();
  console.log(['synchronous operation ended in', tock - tick, 'with result of', syncResult].join(' '));
  runPromiseTest();
}

function runPromiseTest() {
  var tock, tick = Date.now();
  console.log('asynchronous promise operation starting');
  return parallel.reduce(array, 750, reduceFunction, 0).then(function(asyncResult) {
    tock = Date.now();
    console.log(['asynchronous promise operation ended in', tock - tick, 'with result of', asyncResult].join(' '));
    runCallbackTest();
  });
}

function runCallbackTest() {
  var tock, tick = Date.now();
  console.log('asynchronous callback operation starting');
  parallel.reduce(array, 750, reduceFunction, 0, function(error, asyncResult) {
    tock = Date.now();
    console.log(['asynchronous callback operation ended in', tock - tick, 'with result of', asyncResult].join(' '));
    runEventTest();
  });
}



function runEventTest() {
  var tock, tick = Date.now();
  console.log('asynchronous event operation starting');
  var event = parallel.event.reduce(array, 750, reduceFunction, 0);
  event.on('done', function(asyncResult) {
    tock = Date.now();
    console.log(['asynchronous event operation ended in', tock - tick, 'with result of', asyncResult].join(' '));
    clearInterval(interval);
  });
}
