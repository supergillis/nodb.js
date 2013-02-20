define([
    './AbstractIterator',
    './ArrayIterator',
    './EmptyIterator',
    './FilterIterator',
    './MapIterator',
    './RangeIterator',
    './RepeatIterator',
    './ZipIterator'],
  function(
    AbstractIterator,
    ArrayIterator,
    EmptyIterator,
    FilterIterator,
    MapIterator,
    RangeIterator,
    RepeatIterator,
    ZipIterator) {
  /**
   * @class AbstractIterator
   */

  /**
   * @method each
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  AbstractIterator.prototype.each = function(callback) {
    while (this.hasNext())
      callback(this.next());
  };

  /**
   * @method fold
   * @return {Any}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  AbstractIterator.prototype.fold = function(seed, folder) {
    while (this.hasNext())
      seed = folder(seed, this.next());
    return seed;
  };

  /**
   * @method reduce
   * @return {Any}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  AbstractIterator.prototype.reduce = function(reducer) {
    return this.fold(this.next(), reducer);
  };

  /**
   * @method sum
   * @return {Any}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  AbstractIterator.prototype.sum = function() {
    return this.fold(0, function(sum, value) {
      return sum + value;
    });
  };

  /**
   * @property defaultComparator
   * @private
   * @static
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  AbstractIterator.defaultComparator = function(a, b) {
    return a - b;
  };

  /**
   * @method min
   * @return {Any}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  AbstractIterator.prototype.min = function(comparator) {
    comparator = comparator || AbstractIterator.defaultComparator;
    return this.fold(undefined, function(min, value) {
      return min && comparator(min, value) < 0 ? min : value;
    });
  };

  /**
   * @method max
   * @return {Any}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  AbstractIterator.prototype.max = function(comparator) {
    comparator = comparator || AbstractIterator.defaultComparator;
    return this.fold(undefined, function(max, value) {
      return max && comparator(max, value) > 0 ? max : value;
    });
  };

  /**
   * @method collect
   * @return {Array}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  AbstractIterator.prototype.collect = function() {
    var array = [];
    this.each(function(value) {
      array.push(value);
    });
    return array;
  };

  /**
   * @method sort
   * @return {ArrayIterator}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  AbstractIterator.prototype.sort = function(sorter) {
    return AbstractIterator.array(this.collect().sort(sorter));
  };

  /**
   * @method empty
   * @static
   * @return {EmptyIterator}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  AbstractIterator.empty = function() {
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
  AbstractIterator.repeat = function(value) {
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
  AbstractIterator.range = function(start, step, end) {
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
  AbstractIterator.array = function(array, index) {
    return new ArrayIterator(array, index);
  };

  /**
   * @method filter
   * @return {FilterIterator}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  AbstractIterator.prototype.filter = function(filter) {
    return new FilterIterator(this, filter);
  };

  /**
   * @method map
   * @return {MapIterator}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  AbstractIterator.prototype.map = function(mapper) {
    return new MapIterator(this, mapper);
  };

  /**
   * @method zip
   * @return {ZipIterator}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  AbstractIterator.prototype.zip = function() {
    var iterators = Array.prototype.slice.call(arguments);
    iterators.unshift(this);
    return new ZipIterator(iterators);
  };

  return AbstractIterator;
});
