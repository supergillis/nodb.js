define(['iterators/IteratorImplementation'], function(Iterator) {
  /**
   * The MapIterator class.
   *
   * @class MapIterator
   * @extends Iterator
   * @constructor
   * @private
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  var MapIterator = function(wrapped, mapper) {
    Iterator.call(this);

    this.wrapped = wrapped;
    this.mapper = mapper;
  };

  MapIterator.prototype = Object.create(Iterator.prototype);
  MapIterator.prototype.constructor = MapIterator;

  MapIterator.prototype.hasNext = function() {
    return this.wrapped.hasNext();
  };

  MapIterator.prototype.next = function() {
    return this.mapper(this.wrapped.next());
  };

  return MapIterator;
});
