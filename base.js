define(function() {
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

  var Base = function(model, proto, properties) {
    this.model = model;
    this.properties = properties;

    // Copy prototype stuff, including getters and setters, to this
    copy(proto, this);
  };

  Base.create = function(base, values) {
    var instance = Object.create(base);

    each(base.properties, function(name, defaultValue) {
      (function(value) {
        Object.defineProperty(instance, name, {
          configurable: false,
          enumerable: false,
          get: function() {
            return value;
          },
          set: function(newValue) {
            this.model.persistence.onSet(this, name, newValue);
            value = newValue;
            this.model.persistence.afterSet(this, name, newValue);
          }
        });
      })(values.hasOwnProperty(name) ? values[name] : defaultValue);
    });

    each(values, function(name, value) {
      if (!instance.hasOwnProperty(name))
        instance[name] = value;
    });

    base.model.persistence.onCreate(instance);

    return instance;
  };

  Base.prototype.destroy = function() {
    console.log('destroy');
  };

  return Base;
});
