require.config({
  'packages': ['iterators', 'collections']
});

define(['./Eventable', './Model', './Type'],
    function(Eventable, Model, Type) {
  /**
   * @class ActivePersistence
   * @constructor
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  var ActivePersistence = function() {
    Eventable.call(this);

    this.models = {};
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

    this.models[args.name] = model;
    
    // Define types
    model.One = new Type.One(model);
    model.Many = new Type.Many(model);

    // Notify callbacks
    this.emit({
      event: 'create',
      args: [model]
    });

    return model;
  };

  ActivePersistence.prototype.Any = new Type.Any;
  ActivePersistence.prototype.Boolean = new Type.Boolean;
  ActivePersistence.prototype.Integer = new Type.Integer;
  ActivePersistence.prototype.String = new Type.String;
  
  var instance = new ActivePersistence();

  return instance;
});
