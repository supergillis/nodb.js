define(function() {
  var bind = function(caller, callback) {
    return function() {
      return callback.apply(caller, arguments);
    };
  };

  var copy = function(source, destination) {
    for (var name in source) {
      var descriptor = Object.getOwnPropertyDescriptor(source, name);
      if (descriptor)
        Object.defineProperty(destination, name, descriptor);
      else
        destination[name] = source[name];
    }
  };

  var each = function(object, mapper) {
    for (var index in object)
      mapper(index, object[index]);
  };

  var map = function(object, mapper) {
    for (var index in object)
      object[index] = mapper(index, object[index]);
  };

  var mapped = function(source, destination, mapper) {
    for (var index in source)
      destination[index] = mapper(index, source[index]);
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

  return {
    bind: bind,
    copy: copy,
    each: each,
    map: map,
    mapped: mapped,
    isDate: isDate,
    isFunction: isFunction,
    isString: isString
  };
});
