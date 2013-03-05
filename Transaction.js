define(['./Utilities'], function(µ) {
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
    this.createdInstances = [];
    this.deletedInstances = [];

    this.updatedInstanceId = 0;
    this.updatedInstances = {};
    this.updatedInstanceValues = {};
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

    // Commit property updates
    for (var id in this.updatedInstanceValues) {
      var instance = this.updatedInstances[id];
      var values = this.updatedInstanceValues[id];
      for (var index in values)
        instance[index] = values[index];

      // Remove transaction property
      delete instance.__transactionId;
    }

    this.updatedInstanceId = 0;
    this.updatedInstances = {};
    this.updatedInstanceValues = {};
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
    this.createdInstances = [];
    this.deletedInstances = [];

    this.updatedInstanceId = 0;
    this.updatedInstances = {};
    this.updatedInstanceValues = {};
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
   * @method hasValueFor
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Transaction.prototype.hasValueFor = function(instance, name) {
    if (instance.__transactionId === undefined)
      return false;

    var values = this.updatedInstanceValues[instance.__transactionId];
    return values && values.hasOwnProperty(name);
  };

  /**
   * @method getValueFor
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Transaction.prototype.getValueFor = function(instance, name) {
    if (instance.__transactionId === undefined)
      return undefined;

    return this.updatedInstanceValues[instance.__transactionId][name];
  };

  /**
   * @method setValueFor
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Transaction.prototype.setValueFor = function(instance, name, value) {
    var transactionId = instance.__transactionId;

    // Create a transaction id if not set
    if (transactionId === undefined) {
      instance.__transactionId = transactionId =
        this.updatedInstanceId++;
      this.updatedInstances[transactionId] = instance;
    }

    // Create values for this instance
    var values = this.updatedInstanceValues[transactionId];
    if (!values)
      this.updatedInstanceValues[transactionId] = values = {};

    // Update value for this instance
    return values[name] = value;
  };

  return Transaction;
});
