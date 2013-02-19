define(['iterators/IteratorImplementation'], function(Iterator) {
  /**
   * The ZipIterator class.
   *
   * @class ZipIterator
   * @extends Iterator
   * @constructor
   * @private
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  var ZipIterator = function(iterators) {
    Iterator.call(this);

    this.iterators = iterators;
  };

  ZipIterator.prototype = Object.create(Iterator.prototype);
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
