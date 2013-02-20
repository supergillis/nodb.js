define(['./AbstractIterator'], function(AbstractIterator) {
  /**
   * The ArrayIterator class.
   *
   * @class ArrayIterator
   * @extends AbstractIterator
   * @constructor
   * @private
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  var ArrayIterator = function(array, index) {
    AbstractIterator.call(this);

    this.array = array;
    this.index = index || 0;
  };

  ArrayIterator.prototype = Object.create(AbstractIterator.prototype);
  ArrayIterator.prototype.constructor = ArrayIterator;

  ArrayIterator.prototype.clone = function() {
    return new ArrayIterator(this.array, this.index);
  };

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

  return ArrayIterator;
});
