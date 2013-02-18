define(['base', 'index', 'iterator'], function(Base, Index, Iterator) {
  var mapped = function(source, destination, mapper) {
    for (var index in source)
      destination[index] = mapper.call(source, index, source[index]);
  };

  var Model = function(persistence, name, proto, properties, indexes) {
    this.persistence = persistence;
    this.name = name;
    this.base = new Base(this, proto, properties);

    this.instances = [];
    this.indexes = {};

    mapped(indexes, this.indexes, function(name, hasher) {
      if (Object.prototype.toString.call(hasher) === '[object Function]')
        return new Index(hasher);

      return new Index(function() {
        return this[hasher];
      });
    });
  };

  Model.prototype.create = function(values) {
    return Base.create(this.base, values);
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
