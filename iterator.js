define(function() {
  /**
   * The Iterator class.
   *
   * @class Iterator
   * @constructor
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  var Iterator = function() {
  };

  /**
   * @method reset
   * @return {Iterator}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Iterator.prototype.reset = function() {
    throw 'not implemented';
  };

  /**
   * @method hasNext
   * @return {Boolean}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Iterator.prototype.hasNext = function() {
    throw 'not implemented';
  };

  /**
   * @method next
   * @return {Any}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Iterator.prototype.next = function() {
    throw 'not implemented';
  };

  /**
   * @method filter
   * @return {Iterator}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Iterator.prototype.filter = function(filter) {
    return new FilterIterator(this, filter);
  };

  /**
   * @method map
   * @return {Iterator}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Iterator.prototype.map = function(mapper) {
    return new MapIterator(this, mapper);
  };

  /**
   * @method reduce
   * @return {Any}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Iterator.prototype.reduce = function(reducer, initialValue) {
    var value = initialValue;
    while (this.hasNext())
      value = reducer(value, this.next());
    return value;
  };

  /**
   * @method sum
   * @return {Any}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Iterator.prototype.sum = function() {
    return this.reduce(function(sum, value) {
      return sum + value;
    }, 0);
  };

  /**
   * @method min
   * @return {Any}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Iterator.prototype.min = function() {
    return this.reduce(function(min, value) {
      return !!min && min < value ? min : value;
    }, undefined);
  };

  /**
   * @method max
   * @return {Any}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Iterator.prototype.max = function() {
    return this.reduce(function(max, value) {
      return !!max && max > value ? max : value;
    }, undefined);
  };

  /**
   * @method collect
   * @return {Array}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Iterator.prototype.collect = function() {
    var collection = [];
    while (this.hasNext())
      collection.push(this.next());
    return collection;
  };

  /**
   * @static
   * @method forNothing
   * @return {Iterator}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Iterator.forNothing = function() {
    return new EmptyIterator();
  };

  /**
   * @static
   * @method forArray
   * @return {Iterator}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Iterator.forArray = function(array) {
    return new ArrayIterator(array);
  };

  /**
   * The EmptyIterator class.
   *
   * @class EmptyIterator
   * @extends Iterator
   * @constructor
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  EmptyIterator = function() {
    Iterator.call(this);
  };

  EmptyIterator.prototype = Object.create(Iterator.prototype);
  EmptyIterator.prototype.constructor = EmptyIterator;

  EmptyIterator.prototype.reset = function() {
    return this;
  };

  EmptyIterator.prototype.hasNext = function() {
    return false;
  };

  EmptyIterator.prototype.next = function() {
      throw StopIteration;
  };

  /**
   * The ArrayIterator class.
   *
   * @class ArrayIterator
   * @extends Iterator
   * @constructor
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  ArrayIterator = function(array) {
    Iterator.call(this);

    this.array = array;
    this.index = 0;
  };

  ArrayIterator.prototype = Object.create(Iterator.prototype);
  ArrayIterator.prototype.constructor = ArrayIterator;

  ArrayIterator.prototype.reset = function() {
    this.index = 0;
    return this;
  };

  ArrayIterator.prototype.hasNext = function() {
    return this.index < this.array.length;
  };

  ArrayIterator.prototype.next = function() {
    if (!this.hasNext())
      throw StopIteration;
    return this.array[this.index++];
  };

  /**
   * The MapIterator class.
   *
   * @class MapIterator
   * @extends Iterator
   * @constructor
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  MapIterator = function(wrapped, mapper) {
    Iterator.call(this);

    this.wrapped = wrapped;
    this.mapper = mapper;
  };

  MapIterator.prototype = Object.create(Iterator.prototype);
  MapIterator.prototype.constructor = MapIterator;

  MapIterator.prototype.reset = function() {
    this.wrapped.reset();
    return this;
  };

  MapIterator.prototype.hasNext = function() {
    return this.wrapped.hasNext();
  };

  MapIterator.prototype.next = function() {
    return this.mapper(this.wrapped.next());
  };

  FilterIterator = function(wrapped, filter) {
    Iterator.call(this);

    this.wrapped = wrapped;
    this.filter = filter;
    this.findNext();
  };

  /**
   * The FilterIterator class.
   *
   * @class FilterIterator
   * @extends Iterator
   * @constructor
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  FilterIterator.prototype = Object.create(Iterator.prototype);
  FilterIterator.prototype.constructor = FilterIterator;

  FilterIterator.prototype.reset = function() {
    this.wrapped.reset();
    return this;
  };

  FilterIterator.prototype.hasNext = function() {
    return this._hasNext;
  };

  FilterIterator.prototype.next = function() {
    var next = this._next;
    this.findNext();
    return next;
  };

  FilterIterator.prototype.findNext = function() {
    while (this.wrapped.hasNext()) {
       var next = this.wrapped.next();
       if (this.filter(next)) {
         this._hasNext = true;
         this._next = next;
         return;
       }
    }
    this._hasNext = false;
    this._next = undefined;
  };

  return Iterator;
});
