define([
    './Utilities',
    './Collection',
    './InstancePrototype',
    './Iterator',
    './Type'],
  function(µ, Collection, InstancePrototype, Iterator, Type) {
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

    // If an instance prototype is given, then we extend it
    var instancePrototype = args.instancePrototype ?
      InstancePrototype.extend({
        model: this,
        proto: args.proto,
        properties: args.properties,
        instancePrototype: args.instancePrototype
      }):
      InstancePrototype.create({
        model: this,
        proto: args.proto,
        properties: args.properties
      });

    Object.defineProperties(this, {
      /**
       * @property persistence
       * @type {ActivePersistence}
       *
       * @author Gillis Van Ginderachter
       * @since 1.0.0
       */
      persistence: {
        value: args.persistence
      },
      /**
       * @property name
       * @type {String}
       *
       * @author Gillis Van Ginderachter
       * @since 1.0.0
       */
      name: {
        value: args.name
      },
      /**
       * @property proto
       * @type {Object}
       *
       * @author Gillis Van Ginderachter
       * @since 1.0.0
       */
      proto: {
        value: args.proto
      },
      /**
       * @property properties
       * @type {String[]}
       *
       * @author Gillis Van Ginderachter
       * @since 1.0.0
       */
      properties: {
        value: args.properties
      },
      /**
       * @property parent
       * @type {Model}
       *
       * @author Gillis Van Ginderachter
       * @since 1.0.0
       */
      parent: {
        value: args.parent
      },
      /**
       * @property one
       * @type {Type}
       *
       * @author Gillis Van Ginderachter
       * @since 1.0.0
       */
      one: {
        value: new Type.One(args.persistence, this)
      },
      /**
       * @property many
       * @type {Type}
       *
       * @author Gillis Van Ginderachter
       * @since 1.0.0
       */
      many: {
        value: new Type.Many(args.persistence, this)
      },
      /**
       * Create a new instance of this model. This instance will inherit
       * from the given prototype. You can specify initial values for
       * the instance being created.
       *
       * @method create
       * @param [values] {Object} Initial values for the instance being
       *   created.
       * @return {Instance} An instance of the model with the prototype
       *   of given as parameter to constructor of the model.
       *
       * @author Gillis Van Ginderachter
       * @since 1.0.0
       */
      create: {
        value: function(values) {
          var instance = instancePrototype.instantiate(values);

          // Track this instance
          this.persistence.revision.add(instance);

          return instance;
        }
      },
      /**
       * @method extend
       *
       * @author Gillis Van Ginderachter
       * @since 1.0.0
       */
      extend: {
        value: function(args) {
          return new Model({
            persistence: this.persistence,
            name: args.name,
            proto: args.proto,
            properties: args.properties,
            parent: this,
            instancePrototype: instancePrototype
          });
        }
      },
      /**
       * @method isModelOf
       *
       * @author Gillis Van Ginderachter
       * @since 1.0.0
       */
      isModelOf: {
        value: function(instance) {
          return instancePrototype.isPrototypeOf(instance);
        }
      },
      /**
       * @method iterator
       * @return {Iterator} An iterator for all the instances of this
       *   model.
       *
       * @author Gillis Van Ginderachter
       * @since 1.0.0
       */
      iterator: {
        value: function() {
          return this.persistence.revision.filter(function(instance) {
            return instancePrototype.isPrototypeOf(instance);
          });
        }
      }
    });
  };

  Model.prototype = Object.create(Collection.prototype);
  Model.prototype.constructor = Model;

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
   * @method select
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Model.prototype.select = function(key) {
    return this.iterator().map(function(instance) {
      return instance[key];
    });
  };

  /**
   * @method where
   * @return {Iterator}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Model.prototype.where = function(key, cmp, value) {
    var conditions = [];

    var filter = function(instance) {
      for (var index in conditions) {
        var condition = conditions[index];
        if (!condition.cmp(instance[condition.key], condition.value))
          return false;
      }
      return true;
    };

    var base = this.iterator().filter(filter);
    var iterator = Object.create(base, {
      and: {
        value: function(key, cmp, value) {
          conditions.push({
            key: key,
            cmp: arguments.length == 2 ? model.persistence.eq : cmp,
            value: arguments.length == 2 ? operator : value
          });
          return this;
        }
      }
    });

    if (arguments.length === 2)
      return iterator.and(key, cmp);

    return iterator.and(key, cmp, value);
  };

  return Model;
});
