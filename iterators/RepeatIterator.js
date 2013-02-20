define(['./AbstractIterator'], function(AbstractIterator) {
  /**
   * The RepeatIterator class.
   *
   * @class RepeatIterator
   * @extends AbstractIterator
   * @constructor
   * @private
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  var RepeatIterator = function(value) {
    AbstractIterator.call(this);

    this.value = value;
  };

  RepeatIterator.prototype = Object.create(AbstractIterator.prototype);
  RepeatIterator.prototype.constructor = RepeatIterator;

  RepeatIterator.prototype.hasNext = function() {
    return true;
  };

  RepeatIterator.prototype.next = function() {
    return this.value;
  };

  return RepeatIterator;
});
