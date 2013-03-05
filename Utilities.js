define(function() {
  var bind = function(caller, callback) {
    return function() {
      return callback.apply(caller, arguments);
    };
  };

  var copy = function(source, destination) {
    var keys = Object.keys(source);
    for (var index in keys) {
      var key = keys[index];
      var descriptor = Object.getOwnPropertyDescriptor(source, key);
      if (descriptor)
        Object.defineProperty(destination, key, descriptor);
      else
        destination[key] = source[key];
    }
  };

  var each = function(object, callback) {
    var last = undefined;
    var keys = Object.keys(object);
    for (var index in keys) {
      var key = keys[index];
      last = callback(key, object[key]);
    }
    return last;
  };

  var map = function(object, mapper) {
    var keys = Object.keys(object);
    for (var index in keys) {
      var key = keys[index];
      object[key] = mapper(key, object[key]);
    }
  };

  var mapped = function(source, mapper) {
    var destination = {};
    mappedIn(source, destination, mapper);
    return destination;
  };

  var mappedIn = function(source, destination, mapper) {
    var keys = Object.keys(source);
    for (var index in keys) {
      var key = keys[index];
      destination[key] = mapper(key, source[key]);
    }
  };

  var isDate = function(object) {
    return Object.prototype.toString.call(object) === '[object Date]';
  };

  var isFunction = function(object) {
    return Object.prototype.toString.call(object) ===
      '[object Function]';
  };

  var isInt = function(object) {
    return typeof object === 'number' && object % 1 == 0;
  };

  var isString = function(object) {
    return Object.prototype.toString.call(object) === '[object String]';
  };

  var getPropertyDescriptor = function(object, name) {
    if (!object)
      return undefined;

    var descriptor = Object.getOwnPropertyDescriptor(object, name);
    if (descriptor)
      return descriptor;

    return getPropertyDescriptor(Object.getPrototypeOf(object), name);
  };

  return {
    bind: bind,
    copy: copy,
    each: each,
    map: map,
    mapped: mapped,
    mappedIn: mappedIn,
    isDate: isDate,
    isFunction: isFunction,
    isString: isString,
    getPropertyDescriptor: getPropertyDescriptor
  };
});
