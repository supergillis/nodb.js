define([
    'iterators',
    './Utilities',
    './Eventable',
    './Instance',
    './Index'],
  function(Iterator, µ, Eventable, Instance, Index) {
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
   * @extends Eventable
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
  var Model = function(persistence, name, proto, properties, indexes) {
    Eventable.call(this);

    /**
     * @property persistence
     * @type {ActivePersistence}
     * @private
     *
     * @author Gillis Van Ginderachter
     * @since 1.0.0
     */
    this.persistence = persistence;

    /**
     * @property name
     * @type {String}
     * @private
     *
     * @author Gillis Van Ginderachter
     * @since 1.0.0
     */
    this.name = name;

    /**
     * @property instanceBase
     * @type {Instance}
     * @private
     *
     * @author Gillis Van Ginderachter
     * @since 1.0.0
     */
    this.instanceBase = new Instance(this, proto, properties);

    /**
     * @property instances
     * @type {Instance[]}
     * @private
     *
     * @author Gillis Van Ginderachter
     * @since 1.0.0
     */
    this.instances = [];

    /**
     * @property emptyIndex
     * @type {Index}
     * @private
     *
     * @author Gillis Van Ginderachter
     * @since 1.0.0
     */
    this.emptyIndex = new Index(this, null);

    /**
     * @property indexes
     * @type {Index[]}
     * @private
     *
     * @author Gillis Van Ginderachter
     * @since 1.0.0
     */
    this.indexes = {};

    µ.mapped(indexes || {}, this.indexes, µ.bind(this, function(name, hasher) {
      if (µ.isFunction(hasher))
        return new Index(this, hasher);

      return new Index(this, function(instance) {
        return instance[hasher];
      });
    }));
  };

  Model.prototype = Object.create(Eventable.prototype);
  Model.prototype.constructor = Model;

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
    var instance = Instance.create(this.instanceBase, values);

    // Track this instance
    this.instances.push(instance);

    // Notify callbacks
    this.emit({
      event: 'create',
      args: [instance]
    });

    return instance;
  };

  /**
   * @method all
   * @return {Iterator} An iterator for all the instances of this model.
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Model.prototype.all = function() {
    return Iterator.array(this.instances);
  };

  /**
   * @method index
   * @param name {String} The name of the index to return.
   * @return {Index} The index with name `name`. If no such index exists
   *   then an empty index is returned.
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Model.prototype.index = function(name) {
    return this.indexes[name] || this.emptyIndex;
  };

  return Model;
});
