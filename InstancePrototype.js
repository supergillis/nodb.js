define([
    './Utilities',
    './Type'],
  function(µ, Type) {
  /**
   * This class is used as prototype for instances of a model.
   *
   * @class InstancePrototype
   *
   * @constructor
   * @private
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  var InstancePrototype = function() {
  };

  InstancePrototype.prototype.isInstanceOf = function(model) {
    return model.isModelOf(this);
  };

  InstancePrototype.create = function(args) {
    var instancePrototype = new InstancePrototype();
    initialize(instancePrototype, args);
    return instancePrototype;
  };

  InstancePrototype.extend = function(args) {
    var extendedPrototype = Object.create(args.instancePrototype);
    initialize(extendedPrototype, args);
    return extendedPrototype;
  };

  var initialize = function(instancePrototype, args) {
    var model = args.model;
    var properties = args.properties || {};

    // Copy the given prototype to the instancePrototype
    µ.copy(args.proto || {}, instancePrototype);

    // Add a descriptor for each property
    µ.each(properties, function(name, type) {
      if (!(type instanceof Type))
        throw 'The property \'' + name + '\' must have a valid type!';

      // Define the descriptor with getters and setters
      Object.defineProperty(instancePrototype, name, {
        configurable: false,
        enumerable: true,
        get: function() { return type.get(this, name); },
        set: function(newValue) { type.set(this, name, newValue); }
      });
    });

    // Add an instatiate function that creates a new instance
    Object.defineProperty(instancePrototype, 'instantiate', {
      value: function(values, instance) {
        values = values || {};
        instance = instance || Object.create(this);

        var keys = Object.keys(properties);
        for (var index in keys) {
          var key = keys[index];
          var type = properties[key];

          type.initialize(instance, key,
            values.hasOwnProperty(key) ? values[key] : undefined);
        }

        // Call the instantiate of the parent InstancePrototype
        var parent = Object.getPrototypeOf(this);
        if (parent && parent.instantiate)
          parent.instantiate(values, instance);

        return instance;
      }
    });
  };

  return InstancePrototype;
});
