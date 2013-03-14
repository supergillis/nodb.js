define([
      './Utilities',
      './Collection',
      './Eventable',
      './Model',
      './Revision',
      './Type'],
    function(µ, Collection, Eventable, Model, Revision, Type) {
  /**
   * @class ActivePersistence
   * @constructor
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  var ActivePersistence = function() {
    Eventable.call(this);

    var topRevision = new Revision();
    var currentRevision = topRevision;

    Object.defineProperties(this, {
      /**
       * @property models
       * @type {Collection}
       *
       * @author Gillis Van Ginderachter
       * @since 1.0.0
       */
      'models': {
        value: new Collection.LinkedList()
      },
      /**
       * @property top
       * @type {Revision}
       *
       * @author Gillis Van Ginderachter
       * @since 1.0.0
       */
      'top': {
        get: function() {
          return topRevision;
        }
      },
      /**
       * @property revision
       * @type {Revision}
       *
       * @author Gillis Van Ginderachter
       * @since 1.0.0
       */
      'revision': {
        get: function() {
          return currentRevision;
        }
      },
      /**
       * @property any
       * @type {Type}
       *
       * @author Gillis Van Ginderachter
       * @since 1.0.0
       */
      'any': {
        value: new Type.Any(this)
      },
      /**
       * @property boolean
       * @type {Type}
       *
       * @author Gillis Van Ginderachter
       * @since 1.0.0
       */
      'boolean': {
        value: new Type.Boolean(this)
      },
      /**
       * @property integer
       * @type {Type}
       *
       * @author Gillis Van Ginderachter
       * @since 1.0.0
       */
      'integer': {
        value: new Type.Integer(this)
      },
      /**
       * @property string
       * @type {Type}
       *
       * @author Gillis Van Ginderachter
       * @since 1.0.0
       */
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
    var model = new Model({
      persistence: this,
      name: args.name,
      proto: args.proto,
      properties: args.properties
    });

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

  var instance = new ActivePersistence();

  return instance;
});
