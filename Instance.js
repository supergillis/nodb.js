define(['./Utilities'], function(µ) {
  /**
   * This class represents an instance of a model. It is used as
   * prototype for instances of models.
   *
   * @class Instance
   *
   * @constructor
   * @param model {Model}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  var Instance = function(model, proto, properties) {
    Object.defineProperties(this, {
      'model': {
        value: model
      },
      'proto': {
        value: proto || {}
      },
      'properties': {
        value: properties || {}
      }
    });

    // Copy prototype stuff, including getters and setters
    µ.copy(this.proto, this);

    // Add properties
    µ.each(this.properties, µ.bind(this, function(name, type) {
      var Type = require('./Type');
      if (!(type instanceof Type))
        throw 'The property \'' + name + '\' must have a valid type!';

      Instance.defineProperty(this, name, type);
    }));
  };

  Instance.defineProperty = function(instance, name, type) {
    Object.defineProperty(instance, name, {
      configurable: false,
      enumerable: true,
      get: function() {
        return type.get(this, name);
      },
      set: function(newValue) {
        this.model.emit({
          event: 'set',
          args: [this, name, newValue],
          func: µ.bind(this, function() {
            type.set(this, name, newValue);
          })
        });
      }
    });
  };

  Instance.create = function(base, values) {
    values = values || {};

    var instance = Object.create(base);
    for (var index in base.properties) {
      var value = values.hasOwnProperty(index) ?
        values[index] : undefined;

      base.properties[index].initialize(instance, index, value);
    }

    return instance;
  };

  return Instance;
});
