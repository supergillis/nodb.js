define(['./Utilities', './Collection', './Instance'],
  function(µ, Collection, Instance) {
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

  Type.prototype.initialize = function(instance, name, value) {
    if (!this.validate(instance, name, value))
      throw 'Invalid value for property \'' + name + '\' for model \'' +
        this.model.name + '\'!';

    Object.defineProperty(instance, '_' + name, {
      configurable: false,
      enumerable: false,
      writable: true,
      value: value
    });
  };

  Type.prototype.validate = function(instance, name, value) {
    throw 'The function \'validate\' is not implemented in the subclass!';
  };

  Type.prototype.get = function(instance, name) {
    if (this.persistence.transaction &&
        this.persistence.transaction.hasValueFor(instance, name))
      return this.persistence.transaction.getValueFor(instance, name);

    return instance['_' + name];
  };

  Type.prototype.set = function(instance, name, value) {
    if (!this.validate(instance, name, value))
      throw 'Invalid value for property \'' + name + '\' for model \'' +
        this.model.name + '\'!';

    if (this.persistence.transaction)
      return this.persistence.transaction.setValueFor(instance, name,
        value);

    return instance['_' + name] = value;
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

  AnyType.prototype.validate = function(instance, name, value) {
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

  BooleanType.prototype.validate = function(instance, name, value) {
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

  IntegerType.prototype.validate = function(instance, name, value) {
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

  StringType.prototype.validate = function(instance, name, value) {
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

  DateType.prototype.validate = function(instance, name, value) {
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

  OneType.prototype.validate = function(instance, name, value) {
    // Allow null and undefined
    if (!value)
      return true;

    return value instanceof Instance && value.model === this.model;
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

  ManyType.prototype.initialize = function(instance, name, value) {
    // Override default value with a collection
    Type.prototype.initialize.call(this, instance, name,
      new Collection.Array());
  };

  ManyType.prototype.set = function(instance, name, value) {
    throw 'Unable to change collection property \'' + name + '\'!';
  };

  ManyType.prototype.validate = function(instance, name, value) {
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

      if (!(subvalue instanceof Instance) || subvalue.model !==
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
