define(['./Collection', 'iterators'], function(Collection, Iterator) {
  /**
   * The ArrayCollection class.
   *
   * @class ArrayCollection
   * @extends Collection
   *
   * @constructor
   * @private
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  var ArrayCollection = function(array) {
    this.array = array || [];
  };

  ArrayCollection.prototype = Object.create(Collection.prototype);
  ArrayCollection.prototype.constructor = ArrayCollection;

  ArrayCollection.prototype.add = function(value) {
    this.array.push(value);
    return this;
  };

  ArrayCollection.prototype.iterator = function() {
    return Iterator.array(this.array);
  };

  return ArrayCollection;
});
