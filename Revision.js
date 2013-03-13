define([
    './Utilities',
    './Collection',
    './Iterator',
    './Map'],
    function(µ, Collection, Iterator, Map) {
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
    Object.defineProperty(this, 'parent', {
      value: parent
    });
    Object.defineProperty(this, 'created', {
      value: new Collection.LinkedList()
    });
    Object.defineProperty(this, 'deleted', {
      value: new Collection.LinkedList()
    });
    Object.defineProperty(this, 'values', {
      value: new Map()
    });
  };
  
  Revision.prototype = Object.create(Collection.prototype);
  Revision.prototype.constructor = Revision;

  /**
   * @method sprout
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Revision.prototype.sprout = function() {
    return new Revision(this);
  };

  /**
   * @method commit
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Revision.prototype.commit = function() {
  };

  /**
   * @method revert
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Revision.prototype.revert = function() {
    this.created = new Collection.LinkedList();
    this.deleted = new Collection.LinkedList();
    this.values = new Map();
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
   * @method hasOwnValueFor
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Revision.prototype.hasOwnValueFor = function(instance, key) {
    if (!this.values.has(instance))
      return false;

    var instanceValues = this.values.get(instance);
    return instanceValues.hasOwnProperty(key);
  };

  /**
   * @method getOwnValueFor
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Revision.prototype.getOwnValueFor = function(instance, key) {
    if (this.hasOwnValueFor(instance, key)) {
      var instanceValues = this.values.get(instance);
      return instanceValues[key];
    }

    return undefined;
  };

  /**
   * @method getValueFor
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Revision.prototype.getValueFor = function(instance, key) {
    if (this.hasOwnValueFor(instance, key)) {
      var instanceValues = this.values.get(instance);
      return instanceValues[key];
    }

    if (this.parent)
      return this.parent.getValueFor(instance, key);

    return undefined;
  };

  /**
   * @method setValueFor
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Revision.prototype.setValueFor = function(instance, key, value) {
    if (this.values.has(instance)) {
      var instanceValues = this.values.get(instance);
      instanceValues[key] = value;
    }
    else {
      var instanceValues = {};
      instanceValues[key] = value;
      this.values.set(instance, instanceValues);
    }
  };

  return Revision;
});
