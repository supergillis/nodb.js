define(['iterators/IteratorImplementation'], function(Iterator) {
  /**
   * The RepeatIterator class.
   *
   * @class RepeatIterator
   * @extends Iterator
   * @constructor
   * @private
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  var RepeatIterator = function(value) {
    Iterator.call(this);

    this.value = value;
  };

  RepeatIterator.prototype = Object.create(Iterator.prototype);
  RepeatIterator.prototype.constructor = RepeatIterator;

  RepeatIterator.prototype.hasNext = function() {
    return true;
  };

  RepeatIterator.prototype.next = function() {
    return this.value;
  };

  return RepeatIterator;
});
