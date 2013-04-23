define(function() {
  var µ = {
    bind: function(caller, callback) {
      return function() {
        return callback.apply(caller, arguments);
      };
    },
    copy: function(source, destination) {
      var keys = Object.keys(source);
      for (var index in keys) {
        var key = keys[index];
        var descriptor = Object.getOwnPropertyDescriptor(source, key);
        if (descriptor)
          Object.defineProperty(destination, key, descriptor);
        else
          destination[key] = source[key];
      }
    },
    each: function(object, callback) {
      var last = undefined;
      var keys = Object.keys(object);
      for (var index in keys) {
        var key = keys[index];
        last = callback(key, object[key]);
      }
      return last;
    },
    map: function(object, mapper) {
      var keys = Object.keys(object);
      for (var index in keys) {
        var key = keys[index];
        object[key] = mapper(key, object[key]);
      }
    },
    mapped: function(source, mapper) {
      var destination = {};
      mappedIn(source, destination, mapper);
      return destination;
    },
    mappedIn: function(source, destination, mapper) {
      var keys = Object.keys(source);
      for (var index in keys) {
        var key = keys[index];
        destination[key] = mapper(key, source[key]);
      }
    },
    isArray: function(object) {
      return Object.prototype.toString.call(object) === '[object Array]';
    },
    isDat: function(object) {
      return Object.prototype.toString.call(object) === '[object Date]';
    },
    isFunction: function(object) {
      return Object.prototype.toString.call(object) ===
        '[object Function]';
    },
    isInt: function(object) {
      return typeof object === 'number' && object % 1 == 0;
    },
    isString: function(object) {
      return Object.prototype.toString.call(object) === '[object String]';
    },
    getPropertyDescriptor: function(object, name) {
      if (!object)
        return undefined;

      var descriptor = Object.getOwnPropertyDescriptor(object, name);
      if (descriptor)
        return descriptor;

      return getPropertyDescriptor(Object.getPrototypeOf(object), name);
    },
    keys: function(object) {
      var keys = [];

      while (object) {
        result.concat(Object.keys(object));
        object = Object.getPrototypeOf(object);
      }

      return result;
    }
  };

  /**
   * The Iterator class.
   *
   * @class Iterator
   * @constructor
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  var Iterator = function() {
  };

  /**
   * @property defaultComparator
   * @private
   * @static
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Iterator.defaultComparator = function(a, b) {
    return a - b;
  };

  /**
   * @method hasNext
   * @return {Boolean}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Iterator.prototype.hasNext = function() {
    throw 'The function \'hasNext\' is not implemented in the subclass!';
  };

  /**
   * @method next
   * @return {Any}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Iterator.prototype.next = function() {
    throw 'The function \'next\' is not implemented in the subclass!';
  };

  /**
   * @method stop
   * @protected
   * @return {Any}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Iterator.prototype.stop = function() {
    if (typeof StopIteration !== 'undefined')
      throw StopIteration;

    throw 'There is no next!';
  };

  /**
   * @method collect
   * @return {Any[]}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Iterator.prototype.collect = function() {
    var result = [];
    while (this.hasNext())
      result.push(this.next());

    return result;
  };

  /**
   * @method concat
   * @return {Iterator}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Iterator.prototype.concat = function(other) {
    var wrapped = this;

    return Object.create(Iterator.prototype, {
      hasNext: {
        value: function() {
          return wrapped.hasNext() || other.hasNext();
        }
      },
      next: {
        value: function() {
          if (!this.hasNext())
            return this.stop();

          if (wrapped.hasNext())
            return wrapped.next();

          return other.next();
        }
      }
    });
  };

  /**
   * @method each
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Iterator.prototype.each = function(callback) {
    while (this.hasNext())
      callback(this.next());
  };

  /**
   * @method filter
   * @return {Iterator}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Iterator.prototype.filter = function(filter) {
    var wrapped = this;
    var current = null;
    var loaded = false;

    return Object.create(Iterator.prototype, {
      hasNext: {
        value: function() {
          if (loaded)
            return true;

          while (wrapped.hasNext()) {
            var value = wrapped.next();
            if (filter(value)) {
              current = value;
              loaded = true;
              return true;
            }
          }

          return false;
        }
      },
      next: {
        value: function() {
          if (!this.hasNext())
            return this.stop();

          loaded = false;
          return current;
        }
      }
    });
  };

  /**
   * @method fold
   * @return {Any}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Iterator.prototype.fold = function(seed, folder) {
    while (this.hasNext())
      seed = folder(seed, this.next());

    return seed;
  };

  /**
   * @method map
   * @return {Iterator}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Iterator.prototype.map = function(mapper) {
    var wrapped = this;

    return Object.create(Iterator.prototype, {
      hasNext: {
        value: function() {
          return wrapped.hasNext();
        }
      },
      next: {
        value: function() {
          if (!this.hasNext())
            return this.stop();

          return mapper(wrapped.next());
        }
      }
    });
  };

  /**
   * @method max
   * @return {Any}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Iterator.prototype.max = function(comparator) {
    comparator = comparator || Iterator.defaultComparator;

    return this.fold(undefined, function(max, value) {
      return max && comparator(max, value) > 0 ? max : value;
    });
  };

  /**
   * @method min
   * @return {Any}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Iterator.prototype.min = function(comparator) {
    comparator = comparator || Iterator.defaultComparator;

    return this.fold(undefined, function(min, value) {
      return min && comparator(min, value) < 0 ? min : value;
    });
  };

  /**
   * @method reduce
   * @return {Any}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Iterator.prototype.reduce = function(reducer) {
    return this.fold(this.next(), reducer);
  };

  /**
   * @method sort
   * @return {Iterator}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Iterator.prototype.sort = function(sorter) {
    var self = this;
    var wrapped = null;

    return Object.create(Iterator.prototype, {
      hasNext: {
        value: function() {
          if (!wrapped) {
            // Lazy load the sorted array
            var sorted = self.collect().sort(sorter);
            wrapped = Iterator.array(sorted);
          }

          return wrapped.hasNext();
        }
      },
      next: {
        value: function() {
          if (!this.hasNext())
            this.stop();

          return wrapped.next();
        }
      }
    });
  };

  /**
   * @method sum
   * @return {Any}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Iterator.prototype.sum = function() {
    return this.fold(0, function(sum, value) {
      return sum + value;
    });
  };

  /**
   * @method array
   * @static
   * @return {Iterator}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Iterator.array = function(array) {
    var index = 0;

    // Make shallow copy
    array = array.slice(0);

    return Object.create(Iterator.prototype, {
      hasNext: {
        value: function() {
          return index < array.length;
        }
      },
      next: {
        value: function() {
          if (!this.hasNext())
            return this.stop();

          return array[index++];
        }
      }
    });
  };

  /**
   * @method empty
   * @static
   * @return {Iterator}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Iterator.empty = function() {
    return Object.create(Iterator.prototype, {
      hasNext: {
        value: function() {
          return false;
        }
      },
      next: {
        value: function() {
          return this.stop();
        }
      }
    });
  };

  /**
   * @method range
   * @static
   * @return {Iterator}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Iterator.range = function(start, step, end) {
    start = start || 0;
    step = step || 1;

    return Object.create(Iterator.prototype, {
      hasNext: {
        value: function() {
          return !end || current < end;
        }
      },
      next: {
        value: function() {
          if (!this.hasNext())
            return this.stop();

          return current += step;
        }
      }
    });
  };

  /**
   * @method repeat
   * @static
   * @return {Iterator}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Iterator.repeat = function(value) {
    return Object.create(Iterator.prototype, {
      hasNext: {
        value: function() {
          return true;
        }
      },
      next: {
        value: function() {
          return value;
        }
      }
    });
  };
  
  /**
   * @class Collection
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  var Collection = function() {
  };

  /**
   * @method add
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Collection.prototype.add = function(object) {
    throw 'The function \'add\' is not implemented in the subclass!';
  };

  /**
   * @method remove
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Collection.prototype.remove = function(object) {
    throw 'The function \'remove\' is not implemented in the subclass!';
  };

  /**
   * @method iterator
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Collection.prototype.iterator = function() {
    throw 'The function \'iterator\' is not implemented in the subclass!';
  };

  /**
   * @method addAll
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Collection.prototype.addAll = function(object) {
    var self = this;

    if (µ.isArray(object)) {
      µ.each(object, function(_, value) {
        self.add(value);
      });
    }
    else if (Iterator.prototype.isPrototypeOf(object) ||
        Collection.prototype.isPrototypeOf(object)) {
      object.each(function(value) {
        self.add(value);
      });
    }

    return this;
  };

  /**
   * @method contains
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Collection.prototype.contains = function(object) {
    var iterator = this.iterator();
    while (iterator.hasNext()) {
      var value = iterator.next();
      if (value === object)
        return true;
    }
    return false;
  };

  /**
   * @method all
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Collection.prototype.all = function() {
    return this.iterator();
  };

  /**
   * @method collect
   * @return {Any[]}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Collection.prototype.collect = function() {
    return this.iterator().collect();
  };

    /**
   * @method each
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Collection.prototype.each = function(callback) {
    return this.iterator().each(callback);
  };

  /**
   * @method filter
   * @return {Iterator}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Collection.prototype.filter = function(filter) {
    return this.iterator().filter(filter);
  };

  /**
   * @method fold
   * @return {Any}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Collection.prototype.fold = function(seed, folder) {
    return this.iterator().fold(seed, folder);
  };

  /**
   * @method map
   * @return {Iterator}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Collection.prototype.map = function(mapper) {
    return this.iterator().map(mapper);
  };

  /**
   * @method max
   * @return {Any}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Collection.prototype.max = function(comparator) {
    return this.iterator().max(comparator);
  };

  /**
   * @method min
   * @return {Any}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Collection.prototype.min = function(comparator) {
    return this.iterator().min(comparator);
  };

  /**
   * @method reduce
   * @return {Any}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Collection.prototype.reduce = function(reducer) {
    return this.iterator().reduce(reducer);
  };

  /**
   * @method sort
   * @return {Iterator}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Collection.prototype.sort = function(sorter) {
    return this.iterator().sort(sorter);
  };

  /**
   * @method sum
   * @return {Any}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Collection.prototype.sum = function() {
    return this.iterator().sum();
  };

  /**
   * @method __iterator__
   * @private
   * @return {Iterator}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Collection.prototype.__iterator__ = function() {
    return this.iterator();
  };

  /**
   * @method array
   * @static
   * @return {Collection}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Collection.array = function() {
    var array = [];

    var collection = Object.create(Collection.prototype, {
      add: {
        value: function(object) {
          array.push(object);
          return this;
        }
      },
      remove: {
        value: function(object) {
          var index = array.indexOf(object);
          if (index !== -1)
            array.splice(index, 1);
          return this;
        }
      },
      contains: {
        value: function(object) {
          return array.indexOf(object) !== -1;
        }
      },
      iterator: {
        value: function() {
          return Iterator.array(array);
        }
      }
    });

    // Initialize the collection
    Collection.prototype.addAll.apply(collection, arguments);

    return collection;
  };

  /**
   * @method linkedList
   * @static
   * @return {Collection}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Collection.linkedList = function() {
    // First value is a dummy value
    var current = {};
    var last = current;

    var collection = Object.create(Collection.prototype, {
      add: {
        value: function(object) {
          last.next = {
            value: object,
            next: undefined
          };
          last = last.next;
          return this;
        }
      },
      remove: {
        value: function(value) {
          // Skip the dummy value
          var previous = current;
          var iterating = current.next;

          while (iterating) {
            if (iterating.value === object) {
              previous.next = iterating.next;
              break;
            }

            previous = iterating;
            iterating = iterating.next;
          }
          return this;
        }
      },
      removeAll: {
        value: function(value) {
          // Skip the dummy value
          var previous = current;
          var iterating = current.next;

          while (iterating) {
            if (iterating.value === object)
              previous.next = iterating.next;

            previous = iterating;
            iterating = iterating.next;
          }
          return this;
        }
      },
      iterator: {
        value: function() {
          var iterating = current.next;

          return Object.create(Iterator.prototype, {
            hasNext: {
              value: function() {
                return !!iterating;
              }
            },
            next: {
              value: function() {
                if (!this.hasNext())
                  throw StopIteration;

                var value = iterating.value;
                iterating = iterating.next;
                return value;
              }
            }
          });
        }
      }
    });

    // Initialize the collection
    Collection.prototype.addAll.apply(collection, arguments);

    return collection;
  };

  /**
   * @class Type
   * @constructor
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  var Type = function(persistence) {
    Object.defineProperty(this, 'persistence', {
      value: persistence
    });
  };

  Type.prototype.validate = function(instance, key, value) {
    throw 'The function \'validate\' is not implemented in the subclass!';
  };

  Type.prototype.initialize = function(instance, key, value) {
    if (!this.validate(instance, key, value))
      throw 'Invalid value for property \'' + key + '\' for model \'' +
        instance.model.name + '\'!';

    this.persistence.revision.setValueFor(instance, key, value);
  };

  Type.prototype.get = function(instance, key) {
    return this.persistence.revision.getValueFor(instance, key);
  };

  Type.prototype.set = function(instance, key, value) {
    if (!this.validate(instance, key, value))
      throw 'Invalid value for property \'' + key + '\' for model \'' +
        instance.model.name + '\'!';

    this.persistence.revision.setValueFor(instance, key, value);
  };

  /**
   * @class AnyType
   * @extends Type
   *
   * @constructor
   * @private
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  var AnyType = function(persistence) {
    Type.call(this, persistence);
  };

  AnyType.prototype = Object.create(Type.prototype);
  AnyType.prototype.constructor = AnyType;

  AnyType.prototype.validate = function(instance, key, value) {
    return true;
  };

  /**
   * @class BooleanType
   * @extends Type
   *
   * @constructor
   * @private
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  var BooleanType = function(persistence) {
    Type.call(this, persistence);
  };

  BooleanType.prototype = Object.create(Type.prototype);
  BooleanType.prototype.constructor = BooleanType;

  BooleanType.prototype.validate = function(instance, key, value) {
    return !value || !!value == value;
  };

  /**
   * @class IntegerType
   * @extends Type
   *
   * @constructor
   * @private
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  var IntegerType = function(persistence) {
    Type.call(this, persistence);
  };

  IntegerType.prototype = Object.create(Type.prototype);
  IntegerType.prototype.constructor = IntegerType;

  IntegerType.prototype.validate = function(instance, key, value) {
    return !value || µ.isInt(value);
  };

  /**
   * @class StringType
   * @extends Type
   *
   * @constructor
   * @private
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  var StringType = function(persistence) {
    Type.call(this, persistence);
  };

  StringType.prototype = Object.create(Type.prototype);
  StringType.prototype.constructor = StringType;

  StringType.prototype.validate = function(instance, key, value) {
    return !value || µ.isString(value);
  };

  /**
   * @class DateType
   * @extends Type
   *
   * @constructor
   * @private
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  var DateType = function(persistence) {
    Type.call(this, persistence);
  };

  DateType.prototype = Object.create(Type.prototype);
  DateType.prototype.constructor = DateType;

  DateType.prototype.validate = function(instance, key, value) {
    return !value || µ.isDate(value);
  };

  /**
   * @class OneType
   * @extends Type
   *
   * @constructor
   * @private
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  var OneType = function(persistence, model) {
    Type.call(this, persistence);

    Object.defineProperty(this, 'model', {
      value: model
    });
  };

  OneType.prototype = Object.create(Type.prototype);
  OneType.prototype.constructor = OneType;

  OneType.prototype.validate = function(instance, key, value) {
    // Allow null, undefined and instances of the given model
    return !value || this.model.isModelOf(value);
  };

  /**
   * @class ManyType
   * @extends Type
   *
   * @constructor
   * @private
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  var ManyType = function(persistence, model) {
    Type.call(this, persistence);

    Object.defineProperty(this, 'model', {
      value: model
    });
  };

  ManyType.prototype = Object.create(Type.prototype);
  ManyType.prototype.constructor = ManyType;

  ManyType.prototype.initialize = function(instance, key, value) {
    // Override default value with a collection
    Type.prototype.initialize.call(this, instance, key,
      Collection.array());
  };

  ManyType.prototype.set = function(instance, key, value) {
    throw 'Unable to change collection property \'' + key + '\'!';
  };

  ManyType.prototype.validate = function(instance, key, value) {
    // Allow collections with instances of the given model
    if (!(value instanceof Collection))
      return false;

    var iterator = value.iterator();
    while (iterator.hasNext()) {
      var subvalue = iterator.next();

      if (this.model.isModelOf(value))
        return false;
    }

    return true;
  };

  Type.Any = AnyType;
  Type.Boolean = BooleanType;
  Type.Date = DateType;
  Type.Integer = IntegerType;
  Type.String = StringType;

  Type.One = OneType;
  Type.Many = ManyType;

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
    __initialize(instancePrototype, args);
    return instancePrototype;
  };

  InstancePrototype.extend = function(args) {
    var extendedPrototype = Object.create(args.instancePrototype);
    __initialize(extendedPrototype, args);
    return extendedPrototype;
  };

  var __initialize = function(instancePrototype, args) {
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
  
    /**
   * The Revision class.
   *
   * @class Revision
   * @extends Collection
   * @constructor
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  var Revision = function(parent) {
    Object.defineProperties(this, {
      parent: {
        value: parent
      },
      created: {
        value: Collection.linkedList()
      },
      deleted: {
        value: Collection.linkedList()
      },
      reads: {
        value: new Map()
      },
      readKeys: {
        value: []
      },
      writes: {
        value: new Map()
      },
      writeKeys: {
        value: []
      }
    });
  };

  Revision.prototype = Object.create(Collection.prototype);
  Revision.prototype.constructor = Revision;

  var rootRevision = Object.create(new Revision(), {
    commit: {
      value: function() {
        throw 'CommitException: Cannot commit the root revision!';
      }
    },
    revert: {
      value: function() {
        throw 'CommitException: Cannot revert the root revision!';
      }
    }
  });

  var currentRevision = rootRevision;

  Object.defineProperties(Revision, {
    root: {
      get: function() {
        return rootRevision;
      }
    },
    current: {
      get: function() {
        return currentRevision;
      }
    }
  });

  /**
   * @method branch
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Revision.prototype.branch = function() {
    return new Revision(this);
  };

  /**
   * @method in
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Revision.prototype.in = function(callback) {
    var previous = currentRevision;
    currentRevision = this;
    callback();
    currentRevision = previous;
  };

  /**
   * @method commit
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Revision.prototype.commit = function() {
    // Implementation of algorithm described in section 5.5

    // Step 1 and 3 of the algorithm
    for (var index in this.readKeys) {
      var instance = this.readKeys[index];
      var instanceValues = this.reads.get(instance);

      // Step 1 of the algorithm
      for (var key in instanceValues) {
        if (this.parent.getValueFor(instance, key) !==
            instanceValues[key])
          throw 'CommitException: \'' + key + '\' is already committed '
            + 'to the parent by another child revision!';
      }

      // Step 3 of the algorithm
      if (!this.parent.reads.has(instance))
        this.parent.reads.set(instance, instanceValues);
      else
        µ.copy(instanceValues, this.parent.reads.get(instance));
    }

    // Step 2 of the algorithm
    for (var index in this.writeKeys) {
      var instance = this.writeKeys[index];
      var instanceValues = this.writes.get(instance);

      if (!this.parent.writes.has(instance))
        this.parent.writes.set(instance, instanceValues);
      else
        µ.copy(instanceValues, this.parent.writes.get(instance));
    }

    // Step 4 of the algorithm
    this.revert();
  };

  /**
   * @method revert
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Revision.prototype.revert = function() {
    this.created = Collection.linkedList();
    this.deleted = Collection.linkedList();

    this.reads = new Map();
    this.readKeys = [];

    this.writes = new Map();
    this.writeKeys = [];
  };

  /**
   * @method add
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Revision.prototype.add = function(instance) {
    this.created.add(instance);
  };

  /**
   * @method remove
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Revision.prototype.remove = function(instance) {
    if (this.created.contains(instance))
      this.created.remove(instance);
    else
      this.deleted.add(instance);
  };

  /**
   * @method iterator
   * @return {Iterator}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Revision.prototype.iterator = function() {
    var iterator = this.created.iterator();

    if (this.parent)
      iterator = iterator.concat(this.parent.iterator());

    return iterator.filter(µ.bind(this, function(instance) {
      return !this.deleted.contains(instance);
    }));
  };

  /**
   * @method getValueFor
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Revision.prototype.getValueFor = function(instance, key) {
    // Implementation of algorithm described in section 5.3

    // Step 1 of the algorithm
    var current = this;
    var result = undefined;

    while (current) {
      // Step 2 of the algorithm
      if (current.writes.has(instance)) {
        var instanceValues = current.writes.get(instance);
        if (instanceValues.hasOwnProperty(key)) {
          result = instanceValues[key];
          break;
        }
      }
      // Step 3 of the algorithm
      else if (current.reads.has(instance)) {
        var instanceValues = current.reads.get(instance);
        if (instanceValues.hasOwnProperty(key)) {
          result = instanceValues[key];
          break;
        }
      }

      // Step 4 of the algorithm
      current = current.parent;
    }

    // Step 5 of the algorithm
    if (current === this)
      return result;

    if (!this.reads.has(instance)) {
      // Step 6 of the algorithm
      var instanceValues = {}

      // Step 7 of the algorithm
      instanceValues[key] = result;

      this.reads.set(instance, instanceValues);
      this.readKeys.push(instance);
    }
    else {
      // Step 6 and 7 of the algorithm
      var instanceValues = this.reads.get(instance);
      if (!instanceValues.hasOwnProperty(key))
        instanceValues[key] = result;
    }

    return result;
  };

  /**
   * @method setValueFor
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Revision.prototype.setValueFor = function(instance, key, value) {
    // Implementation of algorithm described in section 5.2

    if (this.writes.has(instance)) {
      // Step 1 and 2 of the algorithm
      var instanceValues = this.writes.get(instance);
      instanceValues[key] = value;
    }
    else {
      // Step 1 of the algorithm
      var instanceValues = {};

      // Step 2 of the algorithm
      instanceValues[key] = value;

      this.writes.set(instance, instanceValues);
      this.writeKeys.push(instance);
    }
  };

  
  /**
   * @class NoDB
   * @constructor
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  var NoDB = function() {
    Object.defineProperties(this, {
      /**
       * @property models
       * @type {Collection}
       *
       * @author Gillis Van Ginderachter
       * @since 1.0.0
       */
      models: {
        value: Collection.linkedList()
      },
      /**
       * @property revision
       * @type {Revision}
       *
       * @author Gillis Van Ginderachter
       * @since 1.0.0
       */
      revision: {
        get: function() {
          return Revision.current;
        }
      },
      /**
       * @property any
       * @type {Type}
       *
       * @author Gillis Van Ginderachter
       * @since 1.0.0
       */
      any: {
        value: new Type.Any(this)
      },
      /**
       * @property boolean
       * @type {Type}
       *
       * @author Gillis Van Ginderachter
       * @since 1.0.0
       */
      boolean: {
        value: new Type.Boolean(this)
      },
      /**
       * @property integer
       * @type {Type}
       *
       * @author Gillis Van Ginderachter
       * @since 1.0.0
       */
      integer: {
        value: new Type.Integer(this)
      },
      /**
       * @property string
       * @type {Type}
       *
       * @author Gillis Van Ginderachter
       * @since 1.0.0
       */
      string: {
        value: new Type.String(this)
      },
      /**
       * @property eq
       * @type {Function}
       *
       * @author Gillis Van Ginderachter
       * @since 1.0.0
       */
      eq: {
        value: function(a, b) {
          return a === b;
        }
      },
      /**
       * @property eq
       * @type {Function}
       *
       * @author Gillis Van Ginderachter
       * @since 1.0.0
       */
      gt: {
        value: function(a, b) {
          return a > b;
        }
      },
      /**
       * @property gte
       * @type {Function}
       *
       * @author Gillis Van Ginderachter
       * @since 1.0.0
       */
      gte: {
        value: function(a, b) {
          return a >= b;
        }
      },
      /**
       * @property lt
       * @type {Function}
       *
       * @author Gillis Van Ginderachter
       * @since 1.0.0
       */
      lt: {
        value: function(a, b) {
          return a < b;
        }
      },
      /**
       * @property lte
       * @type {Function}
       *
       * @author Gillis Van Ginderachter
       * @since 1.0.0
       */
      lte: {
        value: function(a, b) {
          return a <= b;
        }
      },
      /**
       * @property startsWith
       * @type {Function}
       *
       * @author Gillis Van Ginderachter
       * @since 1.0.0
       */
      startsWith: {
        value: function(a, b) {
          return a && a.indexOf(b) === 0;
        }
      },
      /**
       * @property endsWith
       * @type {Function}
       *
       * @author Gillis Van Ginderachter
       * @since 1.0.0
       */
      endsWith: {
        value: function(a, b) {
          return a && a.indexOf(b) + 1 === a.length;
        }
      }
    });
  };

  /**
   * Creates a new model. See {{#crossLink "Model"}}{{/crossLink}}.
   *
   * @method create
   * @param args {Object}
   * @param args.name {String} The name of the model.
   * @param [args.proto] {Object} The properties for the instances of
   *   the model.
   * @param [args.properties] {Object} The prototype for the instances
   *   of the model.
   * @param [args.indexes] {Object} The indexes of the model.
   * @return {Model} A model with given name, prototype, properties and
   *   indexes.
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  NoDB.prototype.create = function(args) {
    var model = new Model({
      persistence: this,
      name: args.name,
      proto: args.proto,
      properties: args.properties
    });

    this.models.add(model);

    return model;
  };

  /**
   * @method transact
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  NoDB.prototype.transact = function(callback) {
    while (true) {
      var transactionRevision = this.revision.branch();

      transactionRevision.in(function() {
        callback();
      });

      try {
        transactionRevision.commit();
        break;
      }
      catch (exception) {}
    }
  };

  return new NoDB();
});
