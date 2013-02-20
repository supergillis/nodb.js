define(['./AbstractIterator'], function(AbstractIterator) {
  /**
   * The ZipIterator class.
   *
   * @class ZipIterator
   * @extends AbstractIterator
   * @constructor
   * @private
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  var ZipIterator = function(iterators) {
    AbstractIterator.call(this);

    this.iterators = iterators;
  };

  ZipIterator.prototype = Object.create(AbstractIterator.prototype);
  ZipIterator.prototype.constructor = ZipIterator;

  ZipIterator.prototype.hasNext = function() {
    for (var index in this.iterators)
      if (this.iterators[index].hasNext())
        return true;
    return false;
  };

  ZipIterator.prototype.next = function() {
    if (!this.hasNext())
      throw StopIteration;

    var nexts = [];
    for (var index in this.iterators) {
      var iterator = this.iterators[index];
      nexts.push(iterator.hasNext() ? iterator.next() : undefined);
    }
    return nexts;
  };

  return ZipIterator;
});
