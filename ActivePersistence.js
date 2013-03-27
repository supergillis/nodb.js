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
    Object.defineProperties(this, {
      /**
       * @property models
       * @type {Collection}
       *
       * @author Gillis Van Ginderachter
       * @since 1.0.0
       */
      models: {
        value: Collection.linkedList()
      },
      /**
       * @property revision
       * @type {Revision}
       *
       * @author Gillis Van Ginderachter
       * @since 1.0.0
       */
      revision: {
        get: function() {
          return Revision.current;
        }
      },
      /**
       * @property any
       * @type {Type}
       *
       * @author Gillis Van Ginderachter
       * @since 1.0.0
       */
      any: {
        value: new Type.Any(this)
      },
      /**
       * @property boolean
       * @type {Type}
       *
       * @author Gillis Van Ginderachter
       * @since 1.0.0
       */
      boolean: {
        value: new Type.Boolean(this)
      },
      /**
       * @property integer
       * @type {Type}
       *
       * @author Gillis Van Ginderachter
       * @since 1.0.0
       */
      integer: {
        value: new Type.Integer(this)
      },
      /**
       * @property string
       * @type {Type}
       *
       * @author Gillis Van Ginderachter
       * @since 1.0.0
       */
      string: {
        value: new Type.String(this)
      },
      /**
       * @property eq
       * @type {Function}
       *
       * @author Gillis Van Ginderachter
       * @since 1.0.0
       */
      eq: {
        value: function(a, b) {
          return a === b;
        }
      },
      /**
       * @property eq
       * @type {Function}
       *
       * @author Gillis Van Ginderachter
       * @since 1.0.0
       */
      gt: {
        value: function(a, b) {
          return a > b;
        }
      },
      /**
       * @property gte
       * @type {Function}
       *
       * @author Gillis Van Ginderachter
       * @since 1.0.0
       */
      gte: {
        value: function(a, b) {
          return a >= b;
        }
      },
      /**
       * @property lt
       * @type {Function}
       *
       * @author Gillis Van Ginderachter
       * @since 1.0.0
       */
      lt: {
        value: function(a, b) {
          return a < b;
        }
      },
      /**
       * @property lte
       * @type {Function}
       *
       * @author Gillis Van Ginderachter
       * @since 1.0.0
       */
      lte: {
        value: function(a, b) {
          return a <= b;
        }
      },
      /**
       * @property startsWith
       * @type {Function}
       *
       * @author Gillis Van Ginderachter
       * @since 1.0.0
       */
      startsWith: {
        value: function(a, b) {
          return a && a.indexOf(b) === 0;
        }
      },
      /**
       * @property endsWith
       * @type {Function}
       *
       * @author Gillis Van Ginderachter
       * @since 1.0.0
       */
      endsWith: {
        value: function(a, b) {
          return a && a.indexOf(b) + 1 === a.length;
        }
      }
    });
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
    var model = new Model({
      persistence: this,
      name: args.name,
      proto: args.proto,
      properties: args.properties
    });

    this.models.add(model);

    return model;
  };

  /**
   * @method transact
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  ActivePersistence.prototype.transact = function(callback) {
    while (true) {
      var transactionRevision = this.revision.sprout();

      transactionRevision.in(function() {
        callback();
      });

      try {
        transactionRevision.commit();
        break;
      }
      catch (exception) {}
    }
  };

  return new ActivePersistence();
});
