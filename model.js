define(['utils', 'prototype', 'index', 'iterator'], function(µ,
    Prototype, Index, Iterator) {
  /**
   * A model specifies a specific data type. It is currently possible to
   * specify its prototype, properties and indexes.
   *
   * The model tracks all the instances
   * {{#crossLink "Model/create:method"}}{{/crossLink}}d so we can
   * easily query {{#crossLink "Model/all:method"}}{{/crossLink}} the
   * created instances.
   *
   * @class Model
   * @constructor
   * @param persistence {ActivePersistence} The ActivePersistence object
   *   that is notified about creations, changes, ...
   * @param name {String} The name of the model.
   * @param [proto] {Object} The prototype to be used by instances
   *   created by this model.
   * @param [properties] {Object} An object containing the properties
   *   and their default values.
   * @param [indexes] {Object} An object containing the indexes defined
   *   on this model.
   *
   * @example In this example we define a model for a person. A person
   * has a first name, a last name and a parent. We create two indexes:
   * one index on the first name, and one on the first letter of the
   * first name. With those two indexes we can quickly
   * {{#crossLink "Model/find:method"}}{{/crossLink}} persons with
   * a specific first name or a specific first letter. Finally we define
   * the prototype. We could like to get the full name of a person. A
   * full name is just the combination of the first name and the last
   * name.
   *
   *     var Person = persistence.create({
   *       name: 'Person',
   *       properties: {
   *         firstName: '',
   *         lastName: '',
   *         parent: null
   *       },
   *       indexes: {
   *         firstName: 'firstName',
   *         firstLetter: function() {
   *           return this.firstName ? this.firstName[0] : null;
   *         }
   *       },
   *       proto: {
   *         get name() {
   *           return this.firstName + ' ' + this.lastName;
   *         },
   *         set name(value) {
   *           var spaceIndex = value.indexOf(' ');
   *           if (spaceIndex === -1) {
   *             this.firstName = value;
   *             this.lastName = '';
   *           }
   *           else {
   *             this.firstName = value.substr(0, spaceIndex);
   *             this.lastName = value.substr(spaceIndex + 1);
   *           }
   *         }
   *       }
   *     });
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  var Model = function(persistence, name, proto, properties, indexes) {
    this.persistence = persistence;
    this.name = name;
    this.proto = new Prototype(this, proto, properties);

    this.instances = [];
    this.indexes = {};

    µ.mapped(indexes || {}, this.indexes, function(name, hasher) {
      if (Object.prototype.toString.call(hasher) ===
            '[object Function]')
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

  /**
   * Create a new instance of this model. This instance will inherit the
   * prototype given as parameter to the model. You can specify initial
   * values for the instance being created.
   *
   * @method create
   * @param [values] {Object} Initial values for the instance being
   *   created.
   * @return {Instance} An instance of the model with the prototype of
   *   given as parameter to constructor of the model.
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Model.prototype.create = function(values) {
    return this.proto.create(values);
  };

  /**
   * @method all
   * @return {Iterator} An iterator for all the instances of this model.
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Model.prototype.all = function() {
    return Iterator.forArray(this.instances);
  };

  /**
   * @method find
   * @param index {Index|String} An index or a name of an index defined
   *   on the model.
   * @param value {Any} The value that the index must equal.
   * @return {Iterator} An iterator for all the instances of this model
   *   for which `index` is equal to `value`.
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Model.prototype.find = function(index, value) {
    if (!(index instanceof Index)) {
      index = this.indexes[index];
      if (!index)
        return Iterator.forNothing();
    }
    return index.find(value);
  };

  /**
   * This method is syntactic sugar for:
   *
   *     all().filter(filter);
   *
   * @method filter
   * @param filter {Function} A function that accepts one parameter,
   *   i.e. an instance of the model. Returns `true` if the iterator must
   *   include this instance, `false` if it must be skipped.
   * @return {Iterator} An iterator for all the instances of this model
   *   for which `filter` returns `true`.
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Model.prototype.filter = function(filter) {
    return this.all().filter(filter);
  };

  return Model;
});
