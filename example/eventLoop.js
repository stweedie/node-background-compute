var parallel = require('../lib/parallel');

var iterations = 10000000;
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
  console.log(['timer elapsed in', timerTock - timerTick, 'ms, expected', expectedIterationTime, 'ms'].join(' '));
  timerTick = timerTock;
}

var interval = setInterval(timerElapsed, expectedIterationTime);

var iteratorFunction = function(value, index, array) {
  // some expensive function
  var result = value * Math.random() * index + index;
  return result;
}

var syncTock, syncTick = Date.now();
console.log('synchronous operation starting');
array.forEach(iteratorFunction);
syncTock = Date.now();
syncOperationDone = true;
console.log('synchronous operation ending');
console.log(['synchronous operation took', syncTock - syncTick, 'ms'].join(' '));

var asyncTock, asyncTick = Date.now();
console.log('asynchronous operation starting');
parallel.each(array, 2000, iteratorFunction)
  .then(function() {
    asyncTock = Date.now();
    asyncOperationDone = true;
    console.log('asynchronous operation ending');
    console.log(['asynchronous operation took', asyncTock - asyncTick, 'ms'].join(' '));
    clearInterval(interval);
  });
