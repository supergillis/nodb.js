define(['iterators/StatefulIterator'], function(StatefulIterator) {
  /**
   * The FilterIterator class.
   *
   * @class FilterIterator
   * @extends StatefulIterator
   * @constructor
   * @private
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  var FilterIterator = function(wrapped, filter) {
    StatefulIterator.call(this);

    this.wrapped = wrapped;
    this.filter = filter;
  };

  FilterIterator.prototype = Object.create(StatefulIterator.prototype);
  FilterIterator.prototype.constructor = FilterIterator;

  FilterIterator.prototype.getNext = function() {
    while (this.wrapped.hasNext()) {
       var next = this.wrapped.next();
       if (this.filter(next))
        return next;
    }
    return this.finished();
  };

  return FilterIterator;
});
