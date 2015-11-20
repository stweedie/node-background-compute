module.exports = {
  each: _each,
  map: _map,
  reduce: _reduce
};

var DEFAULT_CHUNK_SIZE = 256;

function _each(collection, chunkSize, iterator) {
  if (typeof(chunkSize) === 'function') {

    iterator = chunkSize;
    chunkSize = 0;
  }

  return new Promise(function(resolve, reject) {
    return _schedule(collection, chunkSize, function(arraySlice, start, end) {
      for (var ii = 0, jj = arraySlice.length; ii < jj; ii++) {
        iterator(arraySlice[ii], start + ii);
      }
    }).then(resolve);
  });
};

function _map(collection, chunkSize, iterator) {
  if (typeof(chunkSize) === 'function') {
    iterator = chunkSize;
    chunkSize = 0;
  }

  return new Promise(function(resolve, reject) {
    var result = [];
    return _schedule(collection, chunkSize, function(arraySlice, start, end) {
      for (var ii = 0, jj = arraySlice.length; ii < jj; ii++) {
        result.push(iterator(arraySlice[ii], start + ii, collection));
      }
    }).then(function() {
      resolve(result);
    });
  });
}

function _reduce(collection, chunkSize, iterator, initial) {
  if (typeof(chunkSize) === 'function') {
    initial = iterator;
    iterator = chunkSize;
    chunkSize = 0;
  }

  return new Promise(function(resolve, reject) {
    var accumulator = initial;
    return _schedule(collection, chunkSize, function(arraySlice, start, end) {
      for (var ii = 0, jj = arraySlice.length; ii < jj; ii++) {
        accumulator = iterator(accumulator, arraySlice[ii], start + ii, collection);
      }
    }).then(function() {
      resolve(accumulator);
    });
  });
}

function _schedule(collection, chunkSize, operation) {
  return new Promise(function(resolve, reject) {
    var length = collection.length;
    chunkSize = chunkSize || DEFAULT_CHUNK_SIZE;
    var iterations = Math.ceil(length / chunkSize);
    var thisIteration = 0;

    setImmediate(function next() {
      var start = thisIteration * chunkSize;
      var end = start + chunkSize;
      end = end >= length ? length : end;

      operation(collection.slice(start, end), start, end);

      if (thisIteration++ > iterations) {
        return resolve();
      } else {
        setImmediate(next);
      }
    });
  });
}
