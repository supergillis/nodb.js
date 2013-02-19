define(['Utilities'], function(µ) {
  /**
   * This class represents the prototype of an instance of a model.
   *
   * @class Prototype
   * @constructor
   * @param model {Model}
   * @param [proto] {Object}
   * @param [properties] {Object}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  var Prototype = function(model, proto, properties) {
    this.model = model;
    this.properties = properties || {};
    this.base = new Instance(model);

    // Copy prototype stuff, including getters and setters
    µ.copy(proto || {}, this.base);
  };

  /**
   * Create an instance of this prototype.
   *
   * @method create
   * @param values {Object}
   * @return {Instance}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Prototype.prototype.create = function(values) {
    var instance = Object.create(this.base);
    var properties = {};

    // Find properties with values from values and default values
    µ.mapped(this.properties, properties, function(name, defaultValue) {
      // TODO: Make a copy of the defaultValue
      return values.hasOwnProperty(name) ? values[name] : defaultValue;
    });

    // Define properties with the corresponding values
    µ.each(properties, function(name, value) {
      instance.defineProperty(name, value);
    });

    µ.each(values, function(name) {
      if (!properties.hasOwnProperty(name))
        throw 'The extra property \'' + name + '\' is not allowed!';
    });

    // Don't allow extra properties on this instance
    Object.freeze(instance);

    this.model.emit({
      event: 'create',
      args: [instance]
    });

    return instance;
  };

  /**
   * This class represents an instance of a model. It is used as
   * prototype for instances of models.
   *
   * @class Instance
   * @constructor
   * @param model {Model}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  var Instance = function(model) {
    /**
     * @property model
     * @type {Model}
     */
    this.model = model;
  };

  /**
   * Define a property that will be tracked by the
   * {{#crossLink "ActivePersistence"}}{{/crossLink}} of the
   * {{#crossLink "Model"}}{{/crossLink}}.
   *
   * @method defineProperty
   * @private
   * @param name {String}
   * @param value {Any}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Instance.prototype.defineProperty = function(name, value) {
    Object.defineProperty(this, name, {
      configurable: false,
      enumerable: false,
      get: function() {
        return value;
      },
      set: function(newValue) {
        this.model.emit({
          event: 'set',
          args: [this, name, newValue],
          func: function() {
            value = newValue;
          }
        });
      }
    });
  };

  return Prototype;
});
