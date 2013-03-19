define([
    './Utilities',
    './Collection',
    './Iterator'],
  function(µ, Collection, Iterator) {
  /**
   * The Index class.
   *
   * @class Index
   *
   * @constructor
   * @protected
   * @param generator {Function}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  var Index = function(model, generator) {
    Object.defineProperties(this, {
      generator: {
        value: generator
      },
      collections: {
        value: {}
      }
    });

    if (!this.generator)
      return;

    // Create index for existing instances
    var instances = model.all();
    while (instances.hasNext())
      this.insert(instances.next());

    // Create index for new instances
    model.on({
      event: 'create',
      callback: µ.bind(this, function(instance) {
        this.insert(instance);
      })
    });

    model.on({
      event: 'set',
      callback: µ.bind(this, function(instance) {
        this.remove(instance);
      })
    });

    model.after({
      event: 'set',
      callback: µ.bind(this, function(instance) {
        this.insert(instance);
      })
    });
  };

  /**
   * @method find
   * @param key {Any}
   * @return {Iterator} An iterator for all the instances of the
   *   corresponding model for which the key of the index equals `key`.
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Index.prototype.find = function(key) {
    var collection = this.collections[key];
    if (!collection)
      return new Iterator.Empty();

    return collection.iterator();
  };

  /**
   * @method insert
   * @protected
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Index.prototype.insert = function(object) {
    var key = this.generator(object);
    var collection = this.collections[key];
    if (!collection)
      this.collections[key] = collection = new Collection.LinkedList();

    // Add value to the collection with corresponding key
    collection.add(object);
  };

  /**
   * @method remove
   * @protected
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Index.prototype.remove = function(object) {
    var key = this.generator(object);
    var collection = this.collections[key];
    if (!collection)
      return;

    // Remove value from the collection with corresponding key
    collection.remove(object);
  };

  return Index;
});
