define([
    './Utilities',
    './Collection',
    './Iterator'],
  function(µ, Collection, Iterator) {
  /**
   * The Revision class.
   *
   * @class Revision
   * @extends Collection
   * @constructor
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  var Revision = function(parent) {
    Object.defineProperties(this, {
      parent: {
        value: parent
      },
      created: {
        value: Collection.linkedList()
      },
      deleted: {
        value: Collection.linkedList()
      },
      reads: {
        value: new Map()
      },
      readKeys: {
        value: []
      },
      writes: {
        value: new Map()
      },
      writeKeys: {
        value: []
      }
    });
  };

  Revision.prototype = Object.create(Collection.prototype);
  Revision.prototype.constructor = Revision;

  var rootRevision = Object.create(new Revision(), {
    commit: {
      value: function() {
        throw 'CommitException: Cannot commit the root revision!';
      }
    },
    revert: {
      value: function() {
        throw 'CommitException: Cannot revert the root revision!';
      }
    }
  });

  var currentRevision = rootRevision;

  Object.defineProperties(Revision, {
    root: {
      get: function() {
        return rootRevision;
      }
    },
    current: {
      get: function() {
        return currentRevision;
      }
    }
  });

  /**
   * @method branch
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Revision.prototype.branch = function() {
    return new Revision(this);
  };

  /**
   * @method in
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Revision.prototype.in = function(callback) {
    var previous = currentRevision;
    currentRevision = this;
    callback();
    currentRevision = previous;
  };

  /**
   * @method commit
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Revision.prototype.commit = function() {
    // Implementation of algorithm described in section 5.5

    // Step 1 and 3 of the algorithm
    for (var index in this.readKeys) {
      var instance = this.readKeys[index];
      var instanceValues = this.reads.get(instance);

      // Step 1 of the algorithm
      for (var key in instanceValues) {
        if (this.parent.getValueFor(instance, key) !==
            instanceValues[key])
          throw 'CommitException: \'' + key + '\' is already committed '
            + 'to the parent by another child revision!';
      }

      // Step 3 of the algorithm
      if (!this.parent.reads.has(instance))
        this.parent.reads.set(instance, instanceValues);
      else
        µ.copy(instanceValues, this.parent.reads.get(instance));
    }

    // Step 2 of the algorithm
    for (var index in this.writeKeys) {
      var instance = this.writeKeys[index];
      var instanceValues = this.writes.get(instance);

      if (!this.parent.writes.has(instance))
        this.parent.writes.set(instance, instanceValues);
      else
        µ.copy(instanceValues, this.parent.writes.get(instance));
    }

    // Step 4 of the algorithm
    this.revert();
  };

  /**
   * @method revert
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Revision.prototype.revert = function() {
    this.created = Collection.linkedList();
    this.deleted = Collection.linkedList();

    this.reads = new Map();
    this.readKeys = [];

    this.writes = new Map();
    this.writeKeys = [];
  };

  /**
   * @method add
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Revision.prototype.add = function(instance) {
    this.created.add(instance);
  };

  /**
   * @method remove
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Revision.prototype.remove = function(instance) {
    if (this.created.contains(instance))
      this.created.remove(instance);
    else
      this.deleted.add(instance);
  };

  /**
   * @method iterator
   * @return {Iterator}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Revision.prototype.iterator = function() {
    var iterator = this.created.iterator();

    if (this.parent)
      iterator = iterator.concat(this.parent.iterator());

    return iterator.filter(µ.bind(this, function(instance) {
      return !this.deleted.contains(instance);
    }));
  };

  /**
   * @method getValueFor
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Revision.prototype.getValueFor = function(instance, key) {
    // Implementation of algorithm described in section 5.3

    // Step 1 of the algorithm
    var current = this;
    var result = undefined;

    while (current) {
      // Step 2 of the algorithm
      if (current.writes.has(instance)) {
        var instanceValues = current.writes.get(instance);
        if (instanceValues.hasOwnProperty(key)) {
          result = instanceValues[key];
          break;
        }
      }
      // Step 3 of the algorithm
      else if (current.reads.has(instance)) {
        var instanceValues = current.reads.get(instance);
        if (instanceValues.hasOwnProperty(key)) {
          result = instanceValues[key];
          break;
        }
      }

      // Step 4 of the algorithm
      current = current.parent;
    }

    // Step 5 of the algorithm
    if (current === this)
      return result;

    if (!this.reads.has(instance)) {
      // Step 6 of the algorithm
      var instanceValues = {}

      // Step 7 of the algorithm
      instanceValues[key] = result;

      this.reads.set(instance, instanceValues);
      this.readKeys.push(instance);
    }
    else {
      // Step 6 and 7 of the algorithm
      var instanceValues = this.reads.get(instance);
      if (!instanceValues.hasOwnProperty(key))
        instanceValues[key] = result;
    }

    return result;
  };

  /**
   * @method setValueFor
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Revision.prototype.setValueFor = function(instance, key, value) {
    // Implementation of algorithm described in section 5.2

    if (this.writes.has(instance)) {
      // Step 1 and 2 of the algorithm
      var instanceValues = this.writes.get(instance);
      instanceValues[key] = value;
    }
    else {
      // Step 1 of the algorithm
      var instanceValues = {};

      // Step 2 of the algorithm
      instanceValues[key] = value;

      this.writes.set(instance, instanceValues);
      this.writeKeys.push(instance);
    }
  };

  return Revision;
});
