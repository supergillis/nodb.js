define(['iterators/IteratorImplementation'], function(Iterator) {
  /**
   * The RangeIterator class.
   *
   * @class RangeIterator
   * @extends Iterator
   * @constructor
   * @private
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  var RangeIterator = function(start, step, end) {
    Iterator.call(this);

    this.current = start || 0;
    this.step = step || 1;
    this.end = end;
  };

  RangeIterator.prototype = Object.create(Iterator.prototype);
  RangeIterator.prototype.constructor = RangeIterator;

  RangeIterator.prototype.hasNext = function() {
    if (!this.end)
      return true;

    return this.current < this.end;
  };

  RangeIterator.prototype.next = function() {
    if (!this.hasNext())
      throw StopIteration;

    return this.current += this.step;
  };

  return RangeIterator;
});
