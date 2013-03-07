define([
      './Utilities',
      './Collection',
      './Eventable',
      './Model',
      './Transaction',
      './Type'],
    function(µ, Collection, Eventable, Model, Transaction, Type) {
  /**
   * @class ActivePersistence
   * @constructor
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  var ActivePersistence = function() {
    Eventable.call(this);

    Object.defineProperties(this, {
      'models': {
        value: new Collection.LinkedList()
      },
      'transaction': {
        value: null,
        writeable: true
      },
      'any': {
        value: new Type.Any(this)
      },
      'boolean': {
        value: new Type.Boolean(this)
      },
      'integer': {
        value: new Type.Integer(this)
      },
      'string': {
        value: new Type.String(this)
      }
    });
  };

  ActivePersistence.prototype = Object.create(Eventable.prototype);
  ActivePersistence.prototype.constructor = ActivePersistence;

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
  ActivePersistence.prototype.create = function(args) {
    var model = new Model(this, args.name, args.proto, args.properties,
      args.indexes);

    // Track this model
    this.models.add(model);

    // Define association types
    Object.defineProperties(model, {
      'one': {
        value: new Type.One(this, model)
      },
      'many': {
        value: new Type.Many(this, model)
      }
    });

    // Notify callbacks
    this.emit({
      event: 'create',
      args: [model]
    });

    return model;
  };

  ActivePersistence.prototype.transact = function(callback) {
    var transaction = new Transaction();

    try {
      // Execute callback with transaction set
      this.transaction = transaction;
      callback();

      // Unset transaction and commit it
      this.transaction = null;
      transaction.commit();
    }
    catch (exception) {
      // Unset transaction and revert it
      this.transaction = null;
      transaction.revert();

      console.error('Exception in transaction:', exception);
    }
  };

  var instance = new ActivePersistence();

  return instance;
});
