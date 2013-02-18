define(['utils'], function(µ) {
  var Base = function(model, proto, properties) {
    this.model = model;
    this.properties = properties;

    // Copy prototype stuff, including getters and setters, to this
    µ.copy(proto, this);
  };

  Base.create = function(base, values) {
    var instance = Object.create(base);

    µ.each(base.properties, function(name, defaultValue) {
      (function(value) {
        Object.defineProperty(instance, name, {
          configurable: false,
          enumerable: false,
          get: function() {
            return value;
          },
          set: function(newValue) {
            this.model.persistence.emit({
              event: 'set',
              callback: function() {
                value = newValue;
              },
              args: [this, name, newValue]
            });
          }
        });
      })(values.hasOwnProperty(name) ? values[name] : defaultValue);
    });

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

  Base.prototype.destroy = function() {
    console.log('destroy');
  };

  return Base;
});
