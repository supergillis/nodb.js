define(['./Utilities'], function(µ) {
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
    // Committing clears the transaction
    this.commit();
  };

  /**
   * @method commit
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Transaction.prototype.commit = function() {
    this.createdInstances = [];
    this.deletedInstances = [];
    this.storedValues = new ObjectMap();
  };

  /**
   * @method revert
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Transaction.prototype.revert = function() {
    // TODO Undelete deleted instances
    // TODO Uncreate created instances

    // Revert property values
    this.storedValues.each(function(instance, values) {
      for (var index in values)
        instance[index] = values[index];
    });

    // Committing clears the transaction
    this.commit();
  };

  /**
   * @method trackCreatedInstance
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Transaction.prototype.trackCreatedInstance = function(instance) {
    this.createdInstances.push(instance);
  };

  /**
   * @method trackDeletedInstance
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Transaction.prototype.trackDeletedInstance = function(instance) {
    this.deletedInstances.push(instance);
  };

  /**
   * This method stores the given value for given instance and property
   * name. If a value for that instance and property name already
   * exists, it will not be replaced. In other words, the oldest value
   * is stored.
   *
   * @method storeValue
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Transaction.prototype.storeValue = function(instance, name, value) {
    if (this.storedValues.has(instance)) {
      var values = this.storedValues.get(instance);

      // Don't replace value if we already have one
      if (!values.hasOwnProperty(name))
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
