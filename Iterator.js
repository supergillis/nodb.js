define(['./Collection'],
  function(Collection) {
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
   * @property defaultComparator
   * @private
   * @static
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Iterator.defaultComparator = function(a, b) {
    return a - b;
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
   * @method stop
   * @protected
   * @return {Any}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Iterator.prototype.stop = function() {
    if (typeof StopIteration !== 'undefined')
      throw StopIteration;

    throw 'There is no next!';
  };

  /**
   * @method collect
   * @return {Any[]}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Iterator.prototype.collect = function() {
    var result = [];
    while (this.hasNext())
      result.push(this.next());

    return result;
  };

  /**
   * @method concat
   * @return {Iterator}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Iterator.prototype.concat = function(other) {
    var wrapped = this;

    return Object.create(Iterator.prototype, {
      hasNext: {
        value: function() {
          return wrapped.hasNext() || other.hasNext();
        }
      },
      next: {
        value: function() {
          if (!this.hasNext())
            return this.stop();

          if (wrapped.hasNext())
            return wrapped.next();

          return other.next();
        }
      }
    });
  };

  /**
   * @method each
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Iterator.prototype.each = function(callback) {
    while (this.hasNext())
      callback(this.next());
  };

  /**
   * @method filter
   * @return {Iterator}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Iterator.prototype.filter = function(filter) {
    var wrapped = this;
    var current = null;
    var loaded = false;

    return Object.create(Iterator.prototype, {
      hasNext: {
        value: function() {
          if (loaded)
            return true;

          while (wrapped.hasNext()) {
            var value = wrapped.next();
            if (filter(value)) {
              current = value;
              loaded = true;
              return true;
            }
          }

          return false;
        }
      },
      next: {
        value: function() {
          if (!this.hasNext())
            return this.stop();

          loaded = false;
          return current;
        }
      }
    });
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
   * @method map
   * @return {Iterator}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Iterator.prototype.map = function(mapper) {
    var wrapped = this;

    return Object.create(Iterator.prototype, {
      hasNext: {
        value: function() {
          return wrapped.hasNext();
        }
      },
      next: {
        value: function() {
          if (!this.hasNext())
            return this.stop();

          return mapper(wrapped.next());
        }
      }
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
   * @method sort
   * @return {Iterator}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Iterator.prototype.sort = function(sorter) {
    var self = this;
    var wrapped = null;

    return Object.create(Iterator.prototype, {
      hasNext: {
        value: function() {
          if (!wrapped) {
            // Lazy load the sorted array
            var sorted = self.collect().sort(sorter);
            wrapped = Iterator.array(sorted);
          }

          return wrapped.hasNext();
        }
      },
      next: {
        value: function() {
          if (!this.hasNext())
            this.stop();

          return wrapped.next();
        }
      }
    });
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
   * @method array
   * @static
   * @return {Iterator}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Iterator.array = function(array) {
    var index = 0;

    // Make shallow copy
    array = array.slice(0);

    return Object.create(Iterator.prototype, {
      hasNext: {
        value: function() {
          return index < array.length;
        }
      },
      next: {
        value: function() {
          if (!this.hasNext())
            return this.stop();

          return array[index++];
        }
      }
    });
  };

  /**
   * @method empty
   * @static
   * @return {Iterator}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Iterator.empty = function() {
    return Object.create(Iterator.prototype, {
      hasNext: {
        value: function() {
          return false;
        }
      },
      next: {
        value: function() {
          return this.stop();
        }
      }
    });
  };

  /**
   * @method range
   * @static
   * @return {Iterator}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Iterator.range = function(start, step, end) {
    start = start || 0;
    step = step || 1;

    return Object.create(Iterator.prototype, {
      hasNext: {
        value: function() {
          return !end || current < end;
        }
      },
      next: {
        value: function() {
          if (!this.hasNext())
            return this.stop();

          return current += step;
        }
      }
    });
  };

  /**
   * @method repeat
   * @static
   * @return {Iterator}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Iterator.repeat = function(value) {
    return Object.create(Iterator.prototype, {
      hasNext: {
        value: function() {
          return true;
        }
      },
      next: {
        value: function() {
          return value;
        }
      }
    });
  };

  return Iterator;
});
