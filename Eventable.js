define(function() {
  /**
   * The Eventable class.
   *
   * @class Eventable
   * @constructor
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  var Eventable = function() {
    Object.defineProperties(this, {
      onListeners: {
        value: {}
      },
      afterListeners: {
        value: {}
      }
    });
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
  Eventable.prototype.on = function(args) {
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
  Eventable.prototype.after = function(args) {
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
  Eventable.prototype.emit = function(args) {
    try {
      var onCurrent = this.onListeners[args.event];
      while (onCurrent) {
        onCurrent.callback.apply(onCurrent.caller, args.args || []);
        onCurrent = onCurrent.next;
      }
    }
    catch(exception) {}

    if (!args.func)
      return;

    try {
      args.func.call(args.caller);

      var afterCurrent = this.afterListeners[args.event];
      while (afterCurrent) {
        afterCurrent.callback.apply(afterCurrent.caller, args.args || []);
        afterCurrent = afterCurrent.next;
      }
    }
    catch(exception) {}
  };

  return Eventable;
});
