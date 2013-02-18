define(function() {
  var Iterator = function() {
  };

  Iterator.prototype.hasNext = function() {
    throw 'not implemented';
  };

  Iterator.prototype.next = function() {
    throw 'not implemented';
  };

  Iterator.prototype.filter = function(filter) {
    return new FilterIterator(this, filter);
  };

  Iterator.prototype.map = function(mapper) {
    return new MapIterator(this, mapper);
  };

  Iterator.prototype.reduce = function(reducer, start) {
    var value = start;
    while (this.hasNext())
      value = reducer(value, this.next());
    return value;
  };

  Iterator.prototype.sum = function() {
    return this.reduce(function(sum, value) {
      return sum + value;
    }, 0);
  };

  Iterator.prototype.min = function() {
    return this.reduce(function(min, value) {
      return !!min && min < value ? min : value;
    }, undefined);
  };

  Iterator.prototype.max = function() {
    return this.reduce(function(max, value) {
      return !!max && max > value ? max : value;
    }, undefined);
  };

  Iterator.prototype.collect = function() {
    var collection = [];
    while (this.hasNext())
      collection.push(this.next());
    return collection;
  };

  Iterator.forNothing = function() {
    return new EmptyIterator();
  };

  Iterator.forArray = function(array) {
    return new ArrayIterator(array);
  };

  ThrowingIterator = function() {
    Iterator.call(this);
  };

  ThrowingIterator.prototype = Object.create(Iterator.prototype);
  ThrowingIterator.prototype.constructor = ThrowingIterator;

  ThrowingIterator.prototype.next = function() {
    if (!this.hasNext())
      throw StopIteration;

    return this.uncheckedNext();
  };

  ThrowingIterator.prototype.uncheckedNext = function() {
    throw 'not implemented';
  };

  EmptyIterator = function() {
    ThrowingIterator.call(this);
  };

  EmptyIterator.prototype = Object.create(ThrowingIterator.prototype);
  EmptyIterator.prototype.constructor = EmptyIterator;

  EmptyIterator.prototype.hasNext = function() {
    return false;
  };

  ArrayIterator = function(array) {
    ThrowingIterator.call(this);

    this.array = array;
    this.index = 0;
  };

  ArrayIterator.prototype = Object.create(ThrowingIterator.prototype);
  ArrayIterator.prototype.constructor = ArrayIterator;

  ArrayIterator.prototype.hasNext = function() {
    return this.index < this.array.length;
  };

  ArrayIterator.prototype.uncheckedNext = function() {
    return this.array[this.index++];
  };

  MapIterator = function(wrapped, mapper) {
    Iterator.call(this);

    this.wrapped = wrapped;
    this.mapper = mapper;
  };

  MapIterator.prototype = Object.create(Iterator.prototype);
  MapIterator.prototype.constructor = MapIterator;

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

  FilterIterator.prototype = Object.create(Iterator.prototype);
  FilterIterator.prototype.constructor = FilterIterator;

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
