define(['utils', 'base', 'index', 'iterator'], function(µ, Base, Index, Iterator) {
  var Model = function(persistence, name, proto, properties, indexes) {
    this.persistence = persistence;
    this.name = name;
    this.base = new Base(this, proto, properties);

    this.instances = [];
    this.indexes = {};

    µ.mapped(indexes, this.indexes, function(name, hasher) {
      if (Object.prototype.toString.call(hasher) === '[object Function]')
        return new Index(hasher);

      return new Index(function() {
        return this[hasher];
      });
    });

    this.persistence.on({
      event: 'create',
      caller: this,
      callback: function(instance) {
        if (instance.model !== this)
          return;

        // Insert index and add to instances
        for (var i in this.indexes)
          this.indexes[i].insert(instance);
        this.instances.push(instance);
      }
    });

    this.persistence.on({
      event: 'set',
      caller: this,
      callback: function(instance, property, value) {
        // Remove old index
        for (var i in this.indexes)
          this.indexes[i].remove(instance);
      }
    });

    this.persistence.after({
      event: 'set',
      caller: this,
      callback: function(instance, property, value) {
        // Insert new index
        for (var i in this.indexes)
          this.indexes[i].insert(instance);
      }
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

  Model.prototype.filter = function(filter) {
    return this.all().filter(filter);
  };

  return Model;
});
