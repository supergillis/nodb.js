define(['./Iterator'], function(Iterator) {
  /**
   * @class Collection
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  var Collection = function() {
  };

  /**
   * @method add
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Collection.prototype.add = function(object) {
    throw 'The function \'add\' is not implemented in the subclass!';
  };

  /**
   * @method remove
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Collection.prototype.remove = function(object) {
    throw 'The function \'remove\' is not implemented in the subclass!';
  };

  /**
   * @method iterator
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Collection.prototype.iterator = function() {
    throw 'The function \'iterator\' is not implemented in the subclass!';
  };

  /**
   * @method all
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Collection.prototype.all = function() {
    return this.iterator();
  };

    /**
   * @method each
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Collection.prototype.each = function(callback) {
    return this.iterator().each(callback);
  };

  /**
   * @method fold
   * @return {Any}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Collection.prototype.fold = function(seed, folder) {
    return this.iterator().fold(seed, folder);
  };

  /**
   * @method reduce
   * @return {Any}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Collection.prototype.reduce = function(reducer) {
    return this.iterator().reduce(reducer);
  };

  /**
   * @method sum
   * @return {Any}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Collection.prototype.sum = function() {
    return this.iterator().sum();
  };

  /**
   * @method min
   * @return {Any}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Collection.prototype.min = function(comparator) {
    return this.iterator().min(comparator);
  };

  /**
   * @method max
   * @return {Any}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Collection.prototype.max = function(comparator) {
    return this.iterator().max(comparator);
  };

  /**
   * @method collect
   * @return {Array}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Collection.prototype.collect = function() {
    return this.iterator().collect();
  };

  /**
   * @method sort
   * @return {Iterator}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Collection.prototype.sort = function(sorter) {
    return this.iterator().sort(sorter);
  };

  /**
   * @method filter
   * @return {Iterator}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Collection.prototype.filter = function(filter) {
    return this.iterator().filter(filter);
  };

  /**
   * @method map
   * @return {Iterator}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Collection.prototype.map = function(mapper) {
    return this.iterator().map(mapper);
  };

  /**
   * @method __iterator__
   * @return {Iterator}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Collection.prototype.__iterator__ = function() {
    return this.iterator();
  };

  /**
   * The ArrayCollection class.
   *
   * @class ArrayCollection
   * @extends Collection
   *
   * @constructor
   * @private
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  var ArrayCollection = function(array) {
    this.array = array || [];
  };

  ArrayCollection.prototype = Object.create(Collection.prototype);
  ArrayCollection.prototype.constructor = ArrayCollection;

  ArrayCollection.prototype.add = function(object) {
    this.array.push(object);
    return this;
  };

  ArrayCollection.prototype.remove = function(object) {
    var index = this.array.indexOf(object);
    if (index !== -1)
      this.array.splice(index, 1);
    return this;
  };

  ArrayCollection.prototype.iterator = function() {
    return new Iterator.Array(this.array);
  };

  /**
   * The LinkedListIterator class.
   *
   * @class LinkedListIterator
   * @extends Iterator
   *
   * @constructor
   * @private
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  var LinkedListIterator = function(current) {
    Iterator.call(this);

    this.current = current;
  };

  LinkedListIterator.prototype = Object.create(Iterator.prototype);
  LinkedListIterator.prototype.constructor = LinkedListIterator;

  LinkedListIterator.prototype.hasNext = function() {
    return !!this.current;
  };

  LinkedListIterator.prototype.next = function() {
    if (!this.hasNext())
      throw StopIteration;

    var value = this.current.value;
    this.current = this.current.next;
    return value;
  };

  /**
   * The LinkedListCollection class.
   *
   * @class LinkedListCollection
   * @extends Collection
   *
   * @constructor
   * @private
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  var LinkedListCollection = function(array) {
    this.current = null;
  };

  LinkedListCollection.prototype = Object.create(Collection.prototype);
  LinkedListCollection.prototype.constructor = LinkedListCollection;

  LinkedListCollection.prototype.add = function(object) {
    this.current = {
      value: object,
      next: this.current
    };
    return this;
  };

  LinkedListCollection.prototype.remove = function(object) {
    var previous = undefined;
    var current = this.current;

    while (current) {
      if (current.value === object) {
        if (previous === undefined)
          this.current = current.next;
        else
          previous.next = current.next;
        break;
      }
      previous = current;
      current = current.next;
    }
    return this;
  };

  LinkedListCollection.prototype.removeAll = function(object) {
    var previous = undefined;
    var current = this.current;

    while (current) {
      if (current.value === object) {
        if (previous === undefined)
          this.current = current.next;
        else
          previous.next = current.next;
      }
      previous = current;
      current = current.next;
    }
    return this;
  };

  LinkedListCollection.prototype.iterator = function() {
    return new LinkedListIterator(this.current);
  };

  Collection.Array = ArrayCollection;
  Collection.LinkedList = LinkedListCollection;

  return Collection;
});
