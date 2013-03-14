define(['./Utilities'], function(µ) {
  /**
   * This class is used as instance prototype for instances of a model.
   *
   * @class InstancePrototype
   *
   * @constructor
   * @param model {Model}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  var InstancePrototype = function(model, proto, properties) {
    Object.defineProperties(this, {
      'model': {
        value: model
      },
      '__proto': {
        value: proto || {}
      },
      '__properties': {
        value: properties || {}
      }
    });

    InstancePrototype.copyProto(this, this.__proto);
    InstancePrototype.copyProperties(this, this.__properties);

    // Prevent extensions to this instance prototype
    Object.freeze(this);
  };

  InstancePrototype.instantiate = function(instancePrototype, values) {
    var instance = Object.create(instancePrototype);

    var keys = Object.keys(instancePrototype.__properties);
    for (var index in keys) {
      var key = keys[index];
      var type = instancePrototype.__properties[key];
      type.initialize(instance, key, values[key]);
    }

    return instance;
  };

  InstancePrototype.extend = function(instancePrototype, proto, properties) {
    var extendedPrototype = Object.create(instancePrototype);
    InstancePrototype.copyProto(extendedPrototype, proto || {});
    InstancePrototype.copyProperties(extendedPrototype, properties || {});
    return extendedPrototype;
  };

  InstancePrototype.copyProto = function(instancePrototype, proto) {
    µ.copy(proto, instancePrototype);
  };

  InstancePrototype.copyProperties = function(instancePrototype, properties) {
    var Type = require('./Type');

    // Check if all values are instances of type
    µ.each(properties, function(_, value) {
      if (!(value instanceof Type))
        throw 'The property \'' + name + '\' must have a valid type!';
    });

    // Map properties to property descriptors
    var descriptors = µ.mapped(properties, function(name, type) {
      return {
        configurable: false,
        enumerable: true,
        type: type,
        get: function() {
          return type.get(this, name);
        },
        set: function(newValue) {
          type.set(this, name, newValue);
        }
      };
    });

    // Define the descriptors with getters and setters on this instance
    Object.defineProperties(instancePrototype, descriptors);
  };

  return InstancePrototype;
});
