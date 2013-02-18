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
       if (this.filter.call(next)) {
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
