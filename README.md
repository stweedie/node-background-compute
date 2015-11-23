# Background Compute

Utilities to iterate through collections in the background in node. Use for cpu-intensive collection operations (
for instance, serializing large collections) to avoid blocking the event loop. API is promise-based.

### Operations
Currently, contains the most basic collection operations:
 * each(collection, chunkSize(optional), iteratorFunction)
 * map(collection, chunkSize(optional), mapFunction) returns array of transformed values
 * reduce(collection, chunkSize(optional), accumulatorFunction) returns accumulated value

 chunkSize optional parameter is how many times the array should be iterated before yielding to the event loop. The default value is 256. This means that the array will be iterated 256 times each tick of the event loop. For heavy operations, choose a lower value. For simpler operations, you can easily use a value in the thousands before you will see the event loop being delayed.

## Examples

(The following examples assume the use of an array called collection)

### Parallel
Useful for when you have multiple operations that can be completed at the same time.
```javascript
function logger(id) {
  return function(value, index) {
    console.log(['iterator', id, index].join(' '));
  }
}

var firstTask = logger(1);
var secondTask = logger(2);
var thirdTask = logger(3);

compute.parallel.each(collection, 1, firstTask);
compute.parallel.each(collection, 1, secondTask);
compute.parallel.each(collection, 1, thirdTask);

/*
prints
iterator 1 0
iterator 2 0
iterator 3 0
*/
```

### Sequential
Useful for when tasks must be completed sequentially
```javascript

function square(value, index) {
  return index * index;
}

function add(additionValue) {
  return function(value, index) {
    return index + additionValue;
  }
}

function multiply(multiplicationValue) {
  return function(value, index) {
    return multiplicationValue * index;
  }
}

// f(x) = 3 * (x + 2)^2
// could be implemented in one operation, but used here as an example
compute.parallel.map(collection, add(2))
  .then(function(addedCollection) {
  	return compute.parallel.map(addedCollection, square);
  })
  .then(function(squaredCollection) {
    return compute.parallel.map(squaredCollection, multiply(3));
  })
  .then(function(finalCollection) {
    for (var ii = 0, jj = 3; ii < jj; ii++) {
      console.log(['f(', ii, ') = ', finalCollection[ii]].join(''));
    }
  });
/*
prints
f(0) = 12
f(1) = 27
f(2) = 48
/*
```

Designed for node v0.12.7
