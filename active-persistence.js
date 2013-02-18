define(['model'], function(Model) {
  var ActivePersistence = {};

  ActivePersistence.models = [];

  ActivePersistence.create = function(args) {
    var model = new Model(this, args.name, args.proto || {}, args.properties || {}, args.indexes || {});
    this.models.push(model);
    return model;
  };

  ActivePersistence.onCreate = function(instance) {
    for (var i in this.models) {
      this.models[i].onCreate(instance);
    }
  };

  ActivePersistence.onGet = function(instance, property) {
    for (var i in this.models) {
      this.models[i].onGet(instance, property);
    }
  };

  ActivePersistence.onSet = function(instance, property, value) {
    for (var i in this.models) {
      this.models[i].onSet(instance, property, value);
    }
  };

  ActivePersistence.afterSet = function(instance, property, value) {
    for (var i in this.models) {
      this.models[i].afterSet(instance, property, value);
    }
  };

  return ActivePersistence;
});
