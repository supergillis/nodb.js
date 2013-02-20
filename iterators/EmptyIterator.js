define(['./AbstractIterator'], function(AbstractIterator) {
  /**
   * The EmptyIterator class.
   *
   * @class EmptyIterator
   * @extends AbstractIterator
   * @constructor
   * @private
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  var EmptyIterator = function() {
    AbstractIterator.call(this);
  };

  EmptyIterator.prototype = Object.create(AbstractIterator.prototype);
  EmptyIterator.prototype.constructor = EmptyIterator;

  EmptyIterator.prototype.hasNext = function() {
    return false;
  };

  EmptyIterator.prototype.next = function() {
    throw StopIteration;
  };

  return EmptyIterator;
});
