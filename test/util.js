var sum = function(accumulator, value, index) {
  return accumulator + value;
}

var timer = function() {
  var tock, tick = Date.now();
  var maxElapsedTime = 0;
  var expectedTime = 30;

  function onElapsed() {
    tock = Date.now();
    var difference = tock - tick;
    if (difference > expectedTime) throw new Error(['timer elapsed in', difference, 'expected <=', expectedTime].join(' '));

    maxElapsedTime = maxElapsedTime < difference ? difference : maxElapsedTime;
    tick = tock;
  }

  var interval = setInterval(onElapsed, expectedTime);

  return {
    stop: function() {
      clearInterval(interval);
      return maxElapsedTime <= expectedTime;
    }
  };
}

module.exports = {
  sum: sum,
  timer: timer
}
