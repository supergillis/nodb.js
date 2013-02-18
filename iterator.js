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
  }

  FilterIterator = function(wrapped, filter) {
    this.wrapped = wrapped;
    this.filter = filter;
  };

  FilterIterator.prototype = Object.create(Iterator.prototype);
  FilterIterator.prototype.constructor = FilterIterator;

  return Iterator;
});
