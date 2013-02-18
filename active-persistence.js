define(['model'], function(Model) {
  var ActivePersistence = function() {
    this.models = {};
    this.onListeners = {};
    this.afterListeners = {};
  };

  ActivePersistence.prototype.create = function(args) {
    var model = new Model(this, args.name, args.proto || {}, args.properties || {}, args.indexes || {});
    this.models[args.name] = model;
    return model;
  };

  ActivePersistence.prototype.on = function(args) {
    this.onListeners[args.event] = {
      callback: args.callback,
      caller: args.caller,
      next: this.onListeners[args.event]
    };
  };

  ActivePersistence.prototype.after = function(args) {
    this.afterListeners[args.event] = {
      callback: args.callback,
      caller: args.caller,
      next: this.afterListeners[args.event]
    };
  };

  ActivePersistence.prototype.emit = function(args) {
    var onCurrent = this.onListeners[args.event];
    var afterCurrent = this.afterListeners[args.event];
    if (!onCurrent && !afterCurrent)
      return;

    while (onCurrent) {
      onCurrent.callback.apply(onCurrent.caller, args.args);
      onCurrent = onCurrent.next;
    }

    if (!args.callback)
      return;

    // Call function
    args.callback.call(args.caller);

    while (afterCurrent) {
      afterCurrent.callback.apply(afterCurrent.caller, args.args);
      afterCurrent = afterCurrent.next;
    }
  };

  return ActivePersistence;
});
