define(['./Utilities'], function(µ) {

  /**
   * This class represents an instance of a model. It is used as
   * prototype for instances of models.
   *
   * @class Instance
   *
   * @constructor
   * @param model {Model}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  var Instance = function(model, proto, properties) {
    Object.defineProperty(this, 'model', {
      value: model
    });

    Object.defineProperty(this, 'properties', {
      value: properties || {}
    });

    // Copy prototype stuff, including getters and setters
    µ.copy(proto || {}, this);

    // Add properties
    µ.each(this.properties, µ.bind(this, function(name, property) {
      this.defineProperty(name, property);
    }));
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
  Instance.prototype.defineProperty = function(name, property) {
    Object.defineProperty(this, name, {
      configurable: false,
      enumerable: true,
      get: function() {
        return property.get(this, name);
      },
      set: function(newValue) {
        this.model.emit({
          event: 'set',
          args: [this, name, newValue],
          func: µ.bind(this, function() {
            property.set(this, name, newValue);
          })
        });
      }
    });
  };

  Instance.create = function(base, values) {
    values = values || {};

    var instance = Object.create(base);
    for (var index in base.properties) {
      var value = values.hasOwnProperty(index) ?
        values[index] : undefined;
      base.properties[index].initialize(instance, index, value);
    }

    return instance;
  };

  return Instance;
});
