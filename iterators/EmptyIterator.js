define(['iterators/IteratorImplementation'], function(Iterator) {
  /**
   * The EmptyIterator class.
   *
   * @class EmptyIterator
   * @extends Iterator
   * @constructor
   * @private
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  var EmptyIterator = function() {
    Iterator.call(this);
  };

  EmptyIterator.prototype = Object.create(Iterator.prototype);
  EmptyIterator.prototype.constructor = EmptyIterator;

  EmptyIterator.prototype.hasNext = function() {
    return false;
  };

  EmptyIterator.prototype.next = function() {
    throw StopIteration;
  };

  return EmptyIterator;
});
