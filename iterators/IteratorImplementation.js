define(function() {
  /**
   * The Iterator class.
   *
   * @class Iterator
   * @constructor
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  var Iterator = function() {
  };

  /**
   * @method clone
   * @return {Iterator}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Iterator.prototype.clone = function() {
    throw 'The function \'clone\' is not implemented in the subclass!';
  };

  /**
   * @method reset
   * @return {Iterator}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Iterator.prototype.reset = function() {
    throw 'The function \'reset\' is not implemented in the subclass!';
  };

  /**
   * @method hasNext
   * @return {Boolean}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Iterator.prototype.hasNext = function() {
    throw 'The function \'hasNext\' is not implemented in the subclass!';
  };

  /**
   * @method next
   * @return {Any}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Iterator.prototype.next = function() {
    throw 'The function \'next\' is not implemented in the subclass!';
  };

  /**
   * @method fold
   * @return {Any}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Iterator.prototype.fold = function(seed, folder) {
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
  Iterator.prototype.reduce = function(reducer) {
    return this.fold(this.next(), reducer);
  };

  /**
   * @method sum
   * @return {Any}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Iterator.prototype.sum = function() {
    return this.fold(0, function(sum, value) {
      return sum + value;
    });
  };

  /**
   * @property defaultComparator
   * @static
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Iterator.defaultComparator = function(a, b) {
    return a - b;
  };

  /**
   * @method min
   * @return {Any}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Iterator.prototype.min = function(comparator) {
    comparator = comparator || Iterator.defaultComparator;
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
  Iterator.prototype.max = function(comparator) {
    comparator = comparator || Iterator.defaultComparator;
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
  Iterator.prototype.collect = function() {
    return this.fold([], function(array, value) {
      array.push(value);
      return array;
    });
  };

  /**
   * @method sort
   * @return {ArrayIterator}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Iterator.prototype.sort = function(sorter) {
    return Iterator.array(this.collect().sort(sorter));
  };

  return Iterator;
});
