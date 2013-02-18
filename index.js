define(['iterator'], function(Iterator) {
  /**
   * The BucketIterator class.
   *
   * @class BucketIterator
   * @extends Iterator
   * @constructor
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  var BucketIterator = function(bucket) {
    Iterator.call(this);

    this.bucket = bucket;
  };

  BucketIterator.prototype = Object.create(Iterator.prototype);
  BucketIterator.prototype.constructor = BucketIterator;

  BucketIterator.prototype.hasNext = function() {
    return this.bucket !== undefined;
  };

  BucketIterator.prototype.next = function() {
    if (!this.hasNext())
      throw StopIteration;

    var value = this.bucket.value;
    this.bucket = this.bucket.next;
    return value;
  };

  /**
   * The Index class.
   *
   * @class Index
   * @extends Iterator
   * @constructor
   * @protected
   * @param generator {Function}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  var Index = function(generator) {
    this.generator = generator;
    this.buckets = {};
  };

  /**
   * @method all
   * @param key {Any}
   * @return {Iterator} An iterator for all the instances of the
   *   corresponding model for which the key of the index equals `key`.
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Index.prototype.all = function(key) {
    return new BucketIterator(this.buckets[key]);
  };

  /**
   * @method insert
   * @protected
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Index.prototype.insert = function(value) {
    var key = this.generator.call(value);
    this.buckets[key] = {
      value: value,
      next: this.buckets[key]
    };
  };

  /**
   * @method remove
   * @protected
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Index.prototype.remove = function(value) {
    var key = this.generator.call(value);
    var previous = undefined;
    var current = this.buckets[key];

    while (current) {
      if (current.value === value) {
        if (previous === undefined)
          this.buckets[key] = current.next;
        else
          previous.next = current.next;
        return true;
      }
      previous = current;
      current = current.next;
    }
    return false;
  };

  return Index;
});
