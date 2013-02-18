define(function() {
  var map = function(object, mapper) {
    for (var index in object)
      object[index] = mapper.call(object, index, object[index]);
  };

  var mapped = function(source, destination, mapper) {
    for (var index in source)
      destination[index] = mapper.call(source, index, source[index]);
  };

  var each = function(object, mapper) {
    for (var index in object)
      mapper.call(object, index, object[index]);
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

  return {
    map: map,
    mapped: mapped,
    each: each,
    copy: copy
  };
});
