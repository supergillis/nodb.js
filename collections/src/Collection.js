define(function() {
  /**
   * @class Collection
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  var Collection = function() {
  };

  /**
   * @method add
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Collection.prototype.add = function() {
    throw 'The function \'add\' is not implemented in the subclass!';
  };

  /**
   * @method iterator
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Collection.prototype.iterator = function() {
    throw 'The function \'iterator\' is not implemented in the subclass!';
  };

  /**
   * @method all
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Collection.prototype.all = function() {
    return this.iterator();
  };

    /**
   * @method each
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Collection.prototype.each = function(callback) {
    return this.iterator().each(callback);
  };

  /**
   * @method fold
   * @return {Any}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Collection.prototype.fold = function(seed, folder) {
    return this.iterator().fold(seed, folder);
  };

  /**
   * @method reduce
   * @return {Any}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Collection.prototype.reduce = function(reducer) {
    return this.iterator().reduce(reducer);
  };

  /**
   * @method sum
   * @return {Any}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Collection.prototype.sum = function() {
    return this.iterator().sum();
  };

  /**
   * @method min
   * @return {Any}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Collection.prototype.min = function(comparator) {
    return this.iterator().min(comparator);
  };

  /**
   * @method max
   * @return {Any}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Collection.prototype.max = function(comparator) {
    return this.iterator().max(comparator);
  };

  /**
   * @method collect
   * @return {Array}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Collection.prototype.collect = function() {
    return this.iterator().collect();
  };

  /**
   * @method sort
   * @return {Iterator}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Collection.prototype.sort = function(sorter) {
    return this.iterator().sort(sorter);
  };

  /**
   * @method filter
   * @return {Iterator}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Collection.prototype.filter = function(filter) {
    return this.iterator().filter(filter);
  };

  /**
   * @method map
   * @return {Iterator}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Collection.prototype.map = function(mapper) {
    return this.iterator().map(mapper);
  };

  /**
   * @method __iterator__
   * @return {Iterator}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Collection.prototype.__iterator__ = function() {
    return this.iterator();
  };

  return Collection;
});
