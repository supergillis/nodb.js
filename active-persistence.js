define(function() {
  var ActivePersistence = {};

  ActivePersistence.create = function(args) {
    return new Model(args);
  };

  var Model = function(args) {
    Object.defineProperty(this, 'name', {
      value: args.name
    });

    Object.defineProperty(this, 'properties', {
      value: args.properties || {}
    });

    Object.defineProperty(this, 'proto', {
      value: new Instance({
        model: this,
        proto: args.prototype
      })
    });

    for (var property in this.properties)
      this.defineProperty(property, this.properties[property]);
  };

  Model.prototype.defineProperty = function(property, defaultValue) {
    // Store default value in prototype
    Object.defineProperty(this.proto, '_' + property, {
      configurable: false,
      enumerable: false,
      writable: true,
      value: defaultValue
    });

    // Define getter and setter for property with _ prefix
    Object.defineProperty(this.proto, property, {
      configurable: false,
      enumerable: true,
      get: function() {
        return this['_' + property];
      },
      set: function(value) {
        this['_' + property] = value;
      }
    });
  };

  Model.prototype.hasProperty = function(property) {
    return this.proto.hasOwnProperty(property);
  };

  Model.prototype.create = function(values) {
    var instance = Object.create(this.proto);

    // Set initial values
    for (var property in values || []) {
      if (!this.hasProperty(property)) {
        // Non-model properties are stores with the real name
        instance[property] = values[property];
        continue;
      }

      // Model properties are stored with _ prefix
      Object.defineProperty(instance, '_' + property, {
        configurable: false,
        enumerable: false,
        writable: true,
        value: values[property]
      });
    }

    return instance;
  };

  var Instance = function(args) {
    Object.defineProperty(this, 'model', {
      value: args.model
    });

    // Shallow copy prototype properties
    for (var property in args.proto || []) {
      var descriptor = Object.getOwnPropertyDescriptor(args.proto, property);
      if (!descriptor) {
        this[property] = args.proto[property];
        continue;
      }

      // Copy the descriptor instead of only the value
      Object.defineProperty(this, property, descriptor);
    }
  };

  Instance.prototype.destroy = function() {
    console.log('destroy');
  };

  return ActivePersistence;
});
