define(['./Utilities', './Iterator'], function(µ, Iterator) {
  var ObjectMap = function() {
    this.items = [];
  };

  ObjectMap.prototype.each = function(callback) {
    for (var index in this.items) {
      var entry = this.items[index];
      callback(entry[0], entry[1]);
    };
  };

  ObjectMap.prototype.has = function(key) {
    for (var index in this.items) {
      var entry = this.items[index];
      if (entry[0] === key)
        return true;
    };
    return false;
  };

  ObjectMap.prototype.get = function(key) {
    for (var index in this.items) {
      var entry = this.items[index];
      if (entry[0] === key)
        return entry[1];
    };
    return undefined;
  };

  ObjectMap.prototype.set = function(key, value) {
    for (var index in this.items) {
      var entry = this.items[index];
      if (entry[0] === key) {
        entry[1] = value;
        return;
      }
    }

    // No such key exists, so add new entry
    this.items.push([key, value]);
  };

  /**
   * The Transaction class.
   *
   * @class Transaction
   * @constructor
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  var Transaction = function() {
    this.reset();
  };

  Transaction.prototype.reset = function() {
    this.created = [];
    this.deleted = [];
    this.storedValues = new ObjectMap();
  };

  /**
   * @method commit
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Transaction.prototype.commit = function() {
    // Revert property values
    this.storedValues.each(function(instance, values) {
      for (var index in values)
        instance[index] = values[index];
    });

    // TODO Add created instances to model
    // TODO Remove delete instances from model

    this.reset();
  };

  /**
   * @method revert
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Transaction.prototype.revert = function() {
    this.reset();
  };

  /**
   * @method createInstance
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Transaction.prototype.createInstance = function(instance) {
    this.created.push(instance);
  };

  /**
   * @method createdInstances
   * @return {Iterator}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Transaction.prototype.createdInstances = function() {
    return new Iterator.Array(this.created);
  };

  /**
   * @method deletedInstances
   * @return {Iterator}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Transaction.prototype.deletedInstances = function() {
    return new Iterator.Array(this.deleted);
  };

  /**
   * @method hasValueFor
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Transaction.prototype.hasValueFor = function(instance, name) {
    if (!this.storedValues.has(instance))
      return false;

    var values = this.storedValues.get(instance);
    return values.hasOwnProperty(name);
  };

  /**
   * @method getValueFor
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Transaction.prototype.getValueFor = function(instance, name) {
    var values = this.storedValues.get(instance);
    return values[name];
  };

  /**
   * @method setValueFor
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Transaction.prototype.setValueFor = function(instance, name, value) {
    if (this.storedValues.has(instance)) {
      var values = this.storedValues.get(instance);
      values[name] = value;
    }
    else {
      var values = {};
      values[name] = value;
      this.storedValues.set(instance, values);
    }
  };

  return Transaction;
});
