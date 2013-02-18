define(['index', 'instance', 'iterator'], function(Index, Instance, Iterator) {
  var each = function(object, mapper) {
    for (var index in object)
      mapper.call(object, index, this[index]);
  };

  var mapped = function(source, destination, mapper) {
    for (var index in source)
      destination[index] = mapper.call(source, index, source[index]);
  };

  var Model = function(persistence, name, proto, properties, indexes) {
    var model = this;

    this.persistence = persistence;
    this.name = name;
    this.proto = new Instance(this, proto);

    this.instances = [];

    this.properties = {};
    this.indexes = {};

    mapped(indexes, this.indexes, function(name, hasher) {
      if (Object.prototype.toString.call(hasher) === '[object Function]')
        return new Index(hasher);

      return new Index(function() {
        return this[hasher];
      });
    });

    each(properties, function(name, defaultValue) {
      model.defineProperty(name, defaultValue);
    });
  };

  Model.prototype.defineProperty = function(name, defaultValue) {
    var persistence = this.persistence;

    // Store default value in prototype
    Object.defineProperty(this.proto, '_' + name, {
      configurable: false,
      enumerable: false,
      writable: true,
      value: defaultValue
    });

    // Define getter and setter for property with _ prefix
    Object.defineProperty(this.proto, name, {
      configurable: false,
      enumerable: true,
      get: function() {
        persistence.onGet(this, name);
        return this['_' + name];
      },
      set: function(value) {
        persistence.onSet(this, name, value);
        this['_' + name] = value;
        persistence.afterSet(this, name, value);
      }
    });
  };

  Model.prototype.hasProperty = function(name) {
    return this.proto.hasOwnProperty(name);
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
    this.persistence.onCreate(instance);

    return instance;
  };

  Model.prototype.all = function() {
    return Iterator.forArray(this.instances);
  };

  Model.prototype.find = function(indexName, value) {
    var index = this.indexes[indexName];
    if (!index)
      return Iterator.forNothing();
    return index.find(value);
  };

  Model.prototype.onCreate = function(instance) {
    if (instance.model !== this)
      return;

    console.log('onCreate', instance);

    // Track this instance
    this.instances.push(instance);

    // Create __indexes
    for (var i in this.indexes)
      this.indexes[i].insert(instance);
  };

  Model.prototype.onGet = function(instance, property) {
  };

  Model.prototype.onSet = function(instance, property, value) {
    console.log('onSet', instance, property, value);

    // Pend __indexes
    for (var i in this.indexes)
      this.indexes[i].remove(instance);
  };

  Model.prototype.afterSet = function(instance, property, value) {
    console.log('afterSet', instance, property, value);

    // Update __indexes
    for (var i in this.indexes)
      this.indexes[i].insert(instance);
  };

  return Model;
});
