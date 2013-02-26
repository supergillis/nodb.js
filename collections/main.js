define([
    './src/Collection',
    './src/ArrayCollection'],
  function(
    Collection,
    ArrayCollection) {
  /**
   * @class Collection
   */

  /**
   * @method array
   * @static
   * @return {ArrayCollection}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Collection.array = function(array) {
    return new ArrayCollection(array);
  };

  return Collection;
});
