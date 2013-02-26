define(['./Utilities', './Instance', 'collections'],
  function(µ, Instance, Collection) {
  /**
   * @class Property
   * @constructor
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  var Property = function() {
  };

  Property.prototype.initialize = function(instance, name, value) {
    Object.defineProperty(instance, '_' + name, {
      configurable: false,
      enumerable: false,
      writable: true,
      value: value
    });
  };

  Property.prototype.validate = function(instance, name, value) {
    throw 'The function \'validate\' is not implemented in the subclass!';
  };

  Property.prototype.get = function(instance, name) {
    return instance['_' + name];
  };

  Property.prototype.set = function(instance, name, value) {
    if (!this.validate(instance, name, value))
      throw 'Invalid value for property \'' + name + '\' for model \'' +
        this.model.name + '\'!';

    instance['_' + name] = value;
  };

  Property.any = function() {
    return new AnyProperty();
  };

  Property.collection = function(model) {
    return new CollectionProperty(model);
  };

  Property.date = function() {
    return new DateProperty();
  };

  Property.int = function(model) {
    return new IntProperty(model);
  };

  Property.one = function(model) {
    return new OneProperty(model);
  };

  Property.string = function() {
    return new StringProperty();
  };

  /**
   * @class AnyProperty
   * @extends Property
   *
   * @constructor
   * @private
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  var AnyProperty = function() {
    Property.call(this);
  };

  AnyProperty.prototype = Object.create(Property.prototype);
  AnyProperty.prototype.constructor = AnyProperty;

  AnyProperty.prototype.validate = function(instance, name, value) {
    return true
  };

  /**
   * @class IntProperty
   * @extends Property
   *
   * @constructor
   * @private
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  var IntProperty = function() {
    Property.call(this);
  };

  IntProperty.prototype = Object.create(Property.prototype);
  IntProperty.prototype.constructor = IntProperty;

  IntProperty.prototype.validate = function(instance, name, value) {
    return !value || µ.isInt(value);
  };

  /**
   * @class StringProperty
   * @extends Property
   *
   * @constructor
   * @private
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  var StringProperty = function() {
    Property.call(this);
  };

  StringProperty.prototype = Object.create(Property.prototype);
  StringProperty.prototype.constructor = StringProperty;

  StringProperty.prototype.validate = function(instance, name, value) {
    return !value || µ.isString(value);
  };

  /**
   * @class DateProperty
   * @extends Property
   *
   * @constructor
   * @private
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  var DateProperty = function() {
    Property.call(this);
  };

  DateProperty.prototype = Object.create(Property.prototype);
  DateProperty.prototype.constructor = DateProperty;

  DateProperty.prototype.validate = function(instance, name, value) {
    return !value || µ.isDate(value);
  };

  /**
   * @class OneProperty
   * @extends Property
   *
   * @constructor
   * @private
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  var OneProperty = function(model) {
    Property.call(this);

    this.model = model;
  };

  OneProperty.prototype = Object.create(Property.prototype);
  OneProperty.prototype.constructor = OneProperty;

  OneProperty.prototype.validate = function(instance, name, value) {
    return value && value instanceof Instance && value.model ===
      this.model;
  };

  /**
   * @class CollectionProperty
   * @extends Property
   *
   * @constructor
   * @private
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  var CollectionProperty = function(model) {
    Property.call(this);

    this.model = model;
  };

  CollectionProperty.prototype = Object.create(Property.prototype);
  CollectionProperty.prototype.constructor = CollectionProperty;

  CollectionProperty.prototype.initialize = function(instance, name) {
    // Use custom default value
    Property.prototype.initialize.call(this, instance, name,
      Collection.array());
  };

  CollectionProperty.prototype.get = function(instance, name) {
    return instance['_' + name];
  };

  CollectionProperty.prototype.set = function(instance, name, value) {
    throw 'Unable to change collection property \'' + name + '\'!';
  };

  return Property;
});
