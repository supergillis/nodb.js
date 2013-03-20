define(['./Utilities', './Iterator'], function(µ, Iterator) {
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
  Collection.prototype.add = function(object) {
    throw 'The function \'add\' is not implemented in the subclass!';
  };

  /**
   * @method remove
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Collection.prototype.remove = function(object) {
    throw 'The function \'remove\' is not implemented in the subclass!';
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
   * @method contains
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Collection.prototype.contains = function(object) {
    var iterator = this.iterator();
    while (iterator.hasNext()) {
      var value = iterator.next();
      if (value === object)
        return true;
    }
    return false;
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
   * @return {Any[]}
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

  /**
   * @method asArray
   * @static
   * @return {Collection}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Collection.asArray = function(object) {
    var array = [];
    if (µ.isArray(object))
      array = object.slice(0);
    else if (Iterator.prototype.isPrototypeOf(object))
      array = object.collect();
    else if (Collection.prototype.isPrototypeOf(object))
      array = object.collect();

    return Object.create(Collection.prototype, {
      add: {
        value: function(object) {
          array.push(object);
          return this;
        }
      },
      remove: {
        value: function(object) {
          var index = array.indexOf(object);
          if (index !== -1)
            array.splice(index, 1);
          return this;
        }
      },
      contains: {
        value: function(object) {
          return array.indexOf(object) !== -1;
        }
      },
      iterator: {
        value: function() {
          return Iterator.forArray(array);
        }
      }
    });
  };

  /**
   * @method asLinkedList
   * @static
   * @return {Collection}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Collection.asLinkedList = function(object) {
    // First value is a dummy value
    var current = {};
    var last = current;

    var collection = Object.create(Collection.prototype, {
      add: {
        value: function(object) {
          last.next = {
            value: object,
            next: undefined
          };
          last = last.next;
          return this;
        }
      },
      remove: {
        value: function(value) {
          // Skip the dummy value
          var previous = current;
          var iterating = current.next;

          while (iterating) {
            if (iterating.value === object) {
              previous.next = iterating.next;
              break;
            }

            previous = iterating;
            iterating = iterating.next;
          }
          return this;
        }
      },
      removeAll: {
        value: function(value) {
          // Skip the dummy value
          var previous = current;
          var iterating = current.next;

          while (iterating) {
            if (iterating.value === object)
              previous.next = iterating.next;

            previous = iterating;
            iterating = iterating.next;
          }
          return this;
        }
      },
      iterator: {
        value: function() {
          var iterating = current.next;

          return Object.create(Iterator.prototype, {
            hasNext: {
              value: function() {
                return !!iterating;
              }
            },
            next: {
              value: function() {
                if (!this.hasNext())
                  throw StopIteration;

                var value = iterating.value;
                iterating = iterating.next;
                return value;
              }
            }
          });
        }
      }
    });

    // Initialize the collection
    if (µ.isArray(object)) {
      µ.each(object, function(_, value) {
        collection.add(value);
      });
    }
    else if (Iterator.prototype.isPrototypeOf(object) ||
        Collection.prototype.isPrototypeOf(object)) {
      object.each(function(value) {
        collection.add(value);
      })
    }

    return collection;
  };

  return Collection;
});
