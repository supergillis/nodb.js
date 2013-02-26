require.config({
  'packages': ['iterators', 'collections']
});

define(['./Model', './Property'], function(Model, Property) {
  /**
   * @class ActivePersistence
   * @constructor
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  var ActivePersistence = {};

  ActivePersistence.models = {};

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
  ActivePersistence.create = function(args) {
    return this.models[args.name] = new Model(this, args.name,
      args.proto, args.properties, args.indexes);
  };

  ActivePersistence.Model = Model;
  ActivePersistence.Property = Property;

  return ActivePersistence;
});
