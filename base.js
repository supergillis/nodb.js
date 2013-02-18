define(['utils'], function(µ) {
  var Base = function(model, proto, properties) {
    this.model = model;
    this.properties = properties;

    // Copy prototype stuff, including getters and setters, to this
    µ.copy(proto, this);
  };

  Base.create = function(base, values) {
    var instance = Object.create(base);
    var properties = {};

    // Find properties with values from values and default values
    µ.mapped(base.properties, properties, function(name, defaultValue) {
      return values.hasOwnProperty(name) ? values[name] : defaultValue;
    });

    // Define properties with the corresponding values
    µ.each(properties, function(name, value) {
      instance.defineProperty(name, value);
    });

    // Define untracked property values
    µ.each(values, function(name, value) {
      if (!instance.hasOwnProperty(name))
        instance[name] = value;
    });

    base.model.persistence.emit({
      event: 'create',
      args: [instance]
    });

    return instance;
  };

  Base.prototype.defineProperty = function(name, value) {
    Object.defineProperty(this, name, {
      configurable: false,
      enumerable: false,
      get: function() {
        return value;
      },
      set: function(newValue) {
        this.model.persistence.emit({
          event: 'set',
          args: [this, name, newValue],
          callback: function() {
            value = newValue;
          }
        });
      }
    });
  };

  Base.prototype.destroy = function() {
    console.log('destroy');
  };

  return Base;
});
