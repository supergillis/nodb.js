define(function() {
  var ActivePersistence = {};

  ActivePersistence.models = [];

  ActivePersistence.create = function(args) {
    var model = new Model(args);
    this.models.push(model);
    return model;
  };

  ActivePersistence.onCreate = function(instance) {
    for (var index in this.models) {
      this.models[index].onCreate(instance);
    }
  };

  ActivePersistence.onGet = function(instance, property) {
    for (var index in this.models) {
      this.models[index].onGet(instance, property);
    }
  };

  ActivePersistence.onSet = function(instance, property, value) {
    for (var index in this.models) {
      this.models[index].onSet(instance, property, value);
    }
  };

  ActivePersistence.afterSet = function(instance, property, value) {
    for (var index in this.models) {
      this.models[index].afterSet(instance, property, value);
    }
  };

  Object.defineProperty(Object.prototype, 'mapped', {
    value: function(mapper) {
      var result = {};
      for (var property in this)
        result[property] = mapper.call(this, this[property], property);
      return result;
    }
  });

  var Model = function(args) {
    Object.defineProperty(this, 'name', {
      value: args.name
    });

    Object.defineProperty(this, 'indexes', {
      value: (args.indexes || {}).mapped(function(value, property) {
        return new Index({
          property: property,
          generator: value
        });
      })
    });

    Object.defineProperty(this, 'instances', {
      value: []
    });

    Object.defineProperty(this, 'properties', {
      value: args.properties || {}
    });

    Object.defineProperty(this, 'proto', {
      value: new Instance({
        model: this,
        proto: args.proto
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
        ActivePersistence.onGet(this, property);
        return this['_' + property];
      },
      set: function(value) {
        ActivePersistence.onSet(this, property, value);
        this['_' + property] = value;
        ActivePersistence.afterSet(this, property, value);
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

    // Notify ActivePersistence
    ActivePersistence.onCreate(instance);

    return instance;
  };

  Model.prototype.onCreate = function(instance) {
    if (instance.model !== this)
      return;

    console.log('onCreate', instance);

    // Track this instance
    this.instances.push(instance);

    // Create indexes
    for (var i in this.indexes)
      this.indexes[i].put(instance);
  };

  Model.prototype.onGet = function(instance, property) {
  };

  Model.prototype.onSet = function(instance, property, value) {
    console.log('onSet', instance, property, value);

    // Updating indexes
    for (var i in this.indexes)
      this.indexes[i].pend(instance);
  };

  Model.prototype.afterSet = function(instance, property, value) {
    console.log('afterSet', instance, property, value);

    // Update indexes
    for (var i in this.indexes)
      this.indexes[i].update(instance);
  };

  var createArrayIterator = function(array) {
    var index = 0;
    return {
      hasNext: function() {
        return index < array.length;
      },
      next: function() {
        if (!this.hasNext())
          throw StopIteration;
        return array[index++];
      }
    };
  };

  Model.prototype.all = function() {
    return createArrayIterator(this.instances);
  };

  Model.prototype.get = function(indexName, value) {
    var index = this.indexes[indexName];
    var instances = index ? index.get(value) || [] : [];
    return createArrayIterator(instances);
  };

  Model.prototype.filter = function(filter) {
    // TODO
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

  var Index = function(args) {
    Object.defineProperty(this, 'property', {
      value: args.property
    });

    Object.defineProperty(this, 'generator', {
      value: args.generator
    });

    Object.defineProperty(this, 'values', {
      value: {}
    });

    Object.defineProperty(this, 'pending', {
      value: []
    });
  };

  Index.prototype.get = function(key) {
    return this.values[key] || [];
  };

  Index.prototype.put = function(instance) {
    this.__putAtKey(instance, this.generator.call(instance));
  };

  Index.prototype.pend = function(instance) {
    var key = this.generator.call(instance);
    this.pending.push([key, instance]);
  };

  Index.prototype.update = function(instance) {
    var newKey = this.generator.call(instance);
    for (var i in this.pending) {
      var entry = this.pending[i];
      if (entry[1] === instance) {
        var key = entry[0];
        if (key !== newKey) {
          // Remove value at previous key
          var index = this.values[key].indexOf(instance);
          this.values[entry[0]].splice(index, 1);

          // Insert value at new key
          this.__putAtKey(instance, newKey);
        }

        // Remove the updating element
        this.pending.splice(i, 1);
        return;
      }
    };

    // We shouldn't reach this code
    throw 'Instance is not in pending list!';
  };

  Index.prototype.__putAtKey = function(instance, key) {
    console.log('put', key, instance);
    if (this.values[key] === undefined)
      this.values[key] = [];
    this.values[key].push(instance);
  };

  return ActivePersistence;
});
