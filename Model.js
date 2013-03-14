define([
    './Utilities',
    './Collection',
    './Index',
    './InstancePrototype',
    './Iterator'],
  function(µ, Collection, Index, InstancePrototype, Iterator) {
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
   * @extends Collection
   *
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
  var Model = function(args) {
    Collection.call(this);
    
    // Create a new instance prototyp if none is given
    var instancePrototype = args.instancePrototype ? args.instancePrototype :
      new InstancePrototype(this, args.proto, args.properties);

    Object.defineProperties(this, {
      /**
       * @property persistence
       * @type {ActivePersistence}
       *
       * @author Gillis Van Ginderachter
       * @since 1.0.0
       */
      'persistence': {
        value: args.persistence
      },
      /**
       * @property name
       * @type {String}
       *
       * @author Gillis Van Ginderachter
       * @since 1.0.0
       */
      'name': {
        value: args.name
      },
      /**
       * @property __instancePrototype
       * @type {InstancePrototype}
       * @private
       *
       * @author Gillis Van Ginderachter
       * @since 1.0.0
       */
      '__instancePrototype': {
        value: instancePrototype
      }
    });
  };

  Model.prototype = Object.create(Collection.prototype);
  Model.prototype.constructor = Model;

  Model.prototype.extend = function(args) {
    return new Model({
      persistence: this.persistence,
      name: args.name,
      instancePrototype: InstancePrototype.extend(this.__instancePrototype,
        args.proto, args.properties)
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
    var instance = InstancePrototype.instantiate(this.__instancePrototype,
      values);

    // Track this instance
    this.persistence.revision.add(instance);

    return instance;
  };

  /**
   * @method add
   * @protected
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Model.prototype.add = function(object) {
    throw 'You can not manually add an instance to a model!';
  };

  /**
   * @method remove
   * @protected
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Model.prototype.remove = function(object) {
    throw 'You can not manually remove an instance from a model!';
  };

  /**
   * @method iterator
   * @return {Iterator} An iterator for all the instances of this model.
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Model.prototype.iterator = function() {
    var model = this;
    return this.persistence.revision.filter(function(instance) {
      return instance.model === model;
    });
  };

  /**
   * @method index
   * @param name {String} The name of the index to return.
   * @return {Index|undefined} The index with name `name`.
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Model.prototype.index = function(name) {
    return this.indexes[name];
  };

  /**
   * @method find
   * @param name {String} The name of the index to search.
   * @param key {Any}
   * @return {Iterator}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Model.prototype.find = function(name, key) {
    var index = this.index(name);
    if (!index)
      return new Iterator.Empty();

    return index.find(key);
  };

  return Model;
});
