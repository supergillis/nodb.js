define([
    'iterators/IteratorImplementation',
    'iterators/ArrayIterator',
    'iterators/EmptyIterator',
    'iterators/FilterIterator',
    'iterators/MapIterator',
    'iterators/RangeIterator',
    'iterators/RepeatIterator',
    'iterators/ZipIterator'],
  function(
    Iterator,
    ArrayIterator,
    EmptyIterator,
    FilterIterator,
    MapIterator,
    RangeIterator,
    RepeatIterator,
    ZipIterator) {
  /**
   * @class Iterator
   */

  /**
   * @method empty
   * @static
   * @return {EmptyIterator}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Iterator.empty = function() {
    return new EmptyIterator();
  };

  /**
   * @method repeat
   * @static
   * @return {RepeatIterator}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Iterator.repeat = function(value) {
    return new RepeatIterator(value);
  };

  /**
   * @method range
   * @static
   * @return {RangeIterator}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Iterator.range = function(start, step, end) {
    return new RangeIterator(start, step, end);
  };

  /**
   * @method array
   * @static
   * @return {ArrayIterator}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Iterator.array = function(array, index) {
    return new ArrayIterator(array, index);
  };

  /**
   * @method filter
   * @return {FilterIterator}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Iterator.prototype.filter = function(filter) {
    return new FilterIterator(this, filter);
  };

  /**
   * @method map
   * @return {MapIterator}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Iterator.prototype.map = function(mapper) {
    return new MapIterator(this, mapper);
  };

  /**
   * @method zip
   * @return {ZipIterator}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Iterator.prototype.zip = function() {
    var iterators = Array.prototype.slice.call(arguments);
    iterators.unshift(this);
    return new ZipIterator(iterators);
  };

  return Iterator;
});
