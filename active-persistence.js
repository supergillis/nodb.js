define(['model'], function(Model) {
  /**
   * @class ActivePersistence
   * @uses Model
   * @constructor
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  var ActivePersistence = function() {
    this.models = {};
    this.onListeners = {};
    this.afterListeners = {};
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
  ActivePersistence.prototype.create = function(args) {
    return this.models[args.name] = new Model(this, args.name,
      args.proto, args.properties, args.indexes);
  };

  /**
   * Bind a callback that is called when an event occurs.
   *
   * @method on
   * @param args {Object}
   * @param args.event {String} The name of the event to bind.
   * @param args.callback {Function} The function to be executed when
   *   the event occurs.
   * @param [args.caller] {Object} The object to be bound to `this` in
   *   the callback function.
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  ActivePersistence.prototype.on = function(args) {
    this.onListeners[args.event] = {
      callback: args.callback,
      caller: args.caller,
      next: this.onListeners[args.event]
    };
  };

  /**
   * Bind a callback that is called after an event occurred.
   *
   * @method after
   * @param args {Object}
   * @param args.event {String} The name of the event to bind.
   * @param args.callback {Function} The function to be executed after
   *   the event occurred.
   * @param [args.caller] {Object} The object to be bound to `this` in
   *   the callback function.
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  ActivePersistence.prototype.after = function(args) {
    this.afterListeners[args.event] = {
      callback: args.callback,
      caller: args.caller,
      next: this.afterListeners[args.event]
    };
  };

  /**
   * Notify the corresponding callbacks that the event has occured. The
   * _on_ callbacks will always be called. The given `func` function
   * will automatically be executed. When it finishes successfully the
   * corresponding _after_ callbacks will be called.
   *
   * @method emit
   * @param args {Object}
   * @param args.event {String} The name of the event that occurred.
   * @param [args.args]* {Any} The arguments that will be passed to
   *   the callbacks.
   * @param [args.func] {Function} This function will automatically be
   *   executed. When it finished successfully the corresponding _after_
   *   callbacks will be called.
   * @param [args.caller] {Object} The object to be bound to `this` in
   *   the given `func`.
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  ActivePersistence.prototype.emit = function(args) {
    var onCurrent = this.onListeners[args.event];
    while (onCurrent) {
      onCurrent.callback.apply(onCurrent.caller, args.args || []);
      onCurrent = onCurrent.next;
    }

    if (!args.callback)
      return;

    args.func.call(args.caller);

    var afterCurrent = this.afterListeners[args.event];
    while (afterCurrent) {
      afterCurrent.callback.apply(afterCurrent.caller, args.args || []);
      afterCurrent = afterCurrent.next;
    }
  };

  return ActivePersistence;
});
