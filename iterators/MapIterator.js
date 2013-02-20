define(['./AbstractIterator'], function(AbstractIterator) {
  /**
   * The MapIterator class.
   *
   * @class MapIterator
   * @extends AbstractIterator
   * @constructor
   * @private
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  var MapIterator = function(wrapped, mapper) {
    AbstractIterator.call(this);

    this.wrapped = wrapped;
    this.mapper = mapper;
  };

  MapIterator.prototype = Object.create(AbstractIterator.prototype);
  MapIterator.prototype.constructor = MapIterator;

  MapIterator.prototype.hasNext = function() {
    return this.wrapped.hasNext();
  };

  MapIterator.prototype.next = function() {
    return this.mapper(this.wrapped.next());
  };

  return MapIterator;
});
