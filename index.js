define(['iterator'], function(Iterator) {
  var IndexIterator = function(bucket) {
    Iterator.call(this);

    this.bucket = bucket;
  };

  IndexIterator.prototype = Object.create(Iterator.prototype);
  IndexIterator.prototype.constructor = IndexIterator;

  IndexIterator.prototype.hasNext = function() {
    return this.bucket !== undefined;
  };

  IndexIterator.prototype.next = function() {
    if (!this.hasNext())
      throw StopIteration;

    var value = this.bucket.value;
    this.bucket = this.bucket.next;
    return value;
  };

  var Index = function(hasher) {
    this.hasher = hasher;
    this.buckets = {};
  };

  Index.prototype.find = function(hash) {
    return new IndexIterator(this.buckets[hash]);
  };

  Index.prototype.insert = function(value) {
    var hash = this.hasher.call(value);
    this.buckets[hash] = {
      value: value,
      next: this.buckets[hash]
    };
  };

  Index.prototype.remove = function(value) {
    var hash = this.hasher.call(value);
    var previous = undefined;
    var current = this.buckets[hash];

    while (current) {
      if (current.value === value) {
        if (previous === undefined)
          this.buckets[hash] = current.next;
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
