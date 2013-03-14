define([
    './Utilities',
    './Collection',
    './InstancePrototype'],
  function(µ, Collection, InstancePrototype) {
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
        this.model.name + '\'!';

    this.persistence.revision.setValueFor(instance, key, value);
  };

  Type.prototype.get = function(instance, key) {
    return this.persistence.revision.getValueFor(instance, key);
  };

  Type.prototype.set = function(instance, key, value) {
    if (!this.validate(instance, key, value))
      throw 'Invalid value for property \'' + key + '\' for model \'' +
        this.model.name + '\'!';

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
    return !!value == value;
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
    // Allow null and undefined
    if (!value)
      return true;

    return value instanceof InstancePrototype && value.model === this.model;
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
      new Collection.Array());
  };

  ManyType.prototype.set = function(instance, key, value) {
    throw 'Unable to change collection property \'' + key + '\'!';
  };

  ManyType.prototype.validate = function(instance, key, value) {
    // Allow null and undefined
    if (!value)
      return true;

    if (!(value instanceof Collection))
      return false;

    var iterator = value.iterator();
    while (iterator.hasNext()) {
      var subvalue = iterator.next();

      // Allow null and undefined
      if (!subvalue)
        continue;

      if (!(subvalue instanceof InstancePrototype) || subvalue.model !==
          this.model)
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

  return Type;
});
