var parallel = {
  promise: {},
  callback: {},
  event: {}
};

parallel.promise.each = _each(_promise);
parallel.promise.map = _map(_promise);
parallel.promise.reduce = _reduce(_promise);

parallel.each = parallel.callback.each = _each(_callback);
parallel.map = parallel.callback.map = _map(_callback);
parallel.reduce = parallel.callback.reduce = _reduce(_callback);

parallel.event.each = _each(_event);
parallel.event.map = _map(_event);
parallel.event.reduce = _reduce(_event);

module.exports = parallel;

var DEFAULT_CHUNK_SIZE = 256;

function _each(respond) {
  return function(collection, chunkSize, iterator, cb) {
    if (typeof(chunkSize) === 'function') {
      cb = iterator;
      iterator = chunkSize;
      chunkSize = 0;
    }

    return respond(collection, chunkSize, cb, function(arraySlice, start, end) {
      for (var ii = 0, jj = arraySlice.length; ii < jj; ii++) {
        iterator(arraySlice[ii], start + ii);
      }
    });
  }
};

function _map(respond) {
  return function(collection, chunkSize, iterator, cb) {
    if (typeof(chunkSize) === 'function') {
      cb = iterator;
      iterator = chunkSize;
      chunkSize = 0;
    }

    var result = [];
    return respond(collection, chunkSize, cb, function(arraySlice, start, end) {
      for (var ii = 0, jj = arraySlice.length; ii < jj; ii++) {
        result.push(iterator(arraySlice[ii], start + ii, collection));
      }

      return result;
    });
  }
}

function _reduce(respond) {
  return function(collection, chunkSize, iterator, initial, cb) {
    if (typeof(chunkSize) === 'function') {
      cb = initial;
      initial = iterator;
      iterator = chunkSize;
      chunkSize = 0;
    }

    var accumulator = initial || 0;

    return respond(collection, chunkSize, cb, function(arraySlice, start, end) {
      for (var ii = 0, jj = arraySlice.length; ii < jj; ii++) {
        accumulator = iterator(accumulator, arraySlice[ii], start + ii, collection);
      }

      return accumulator;
    });
  }
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

      var result = operation(collection.slice(start, end), start, end);

      if (thisIteration++ > iterations) {
        resolve(result);
      } else {
        setImmediate(next);
      }
    });
  });
}

function _promise(collection, chunkSize, cb, operation) {
  return _schedule(collection, chunkSize, operation);
}

function _callback(collection, chunkSize, cb, operation) {

  // promise
  if (!(cb && typeof(cb === 'function'))) {
    return _schedule(collection, chunkSize, operation);
  }

  var response = _callbackResponse(cb);
  _schedule(collection, chunkSize, operation).then(response.onSuccess).catch(response.onFailure);
}

function _callbackResponse(cb) {
  var onSuccess = function(result) {
    cb(null, result);
  }

  var onFailure = function(error) {
    cb(error, null);
  }

  return {
    onSuccess: onSuccess,
    onFailure: onFailure
  };
}

var Computation = function() {}

function _event(collection, chunkSize, cb, operation) {
  var computation = new Computation();
  var handler = _eventHandler(computation);
  _schedule(collection, chunkSize, operation).then(handler.onSuccess).catch(handler.onFailure);
  return computation;
}

function _eventHandler(event) {
  var onSuccess = function(result) {
    event.emit('done', result);
  }

  var onFailure = function(error) {
    event.emit('error', error);
  }

  return {
    onSuccess: onSuccess,
    onFailure: onFailure
  }
}

var EventEmitter = require('events').EventEmitter;
Computation.prototype.emit = EventEmitter.prototype.emit.bind(Computation.prototype);
Computation.prototype.on = EventEmitter.prototype.on.bind(Computation.prototype);
