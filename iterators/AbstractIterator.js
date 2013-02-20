define(function() {
  /**
   * The AbstractIterator class.
   *
   * @class AbstractIterator
   * @constructor
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  var AbstractIterator = function() {
  };

  /**
   * @method hasNext
   * @return {Boolean}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  AbstractIterator.prototype.hasNext = function() {
    throw 'The function \'hasNext\' is not implemented in the subclass!';
  };

  /**
   * @method next
   * @return {Any}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  AbstractIterator.prototype.next = function() {
    throw 'The function \'next\' is not implemented in the subclass!';
  };

  return AbstractIterator;
});
