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
  Iterator.prototype.sort = function(sorter) {
    return new ArrayIterator(this.collect().sort(sorter));
  };

  /**
   * @method concat
   * @return {ConcatenateIterator}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Iterator.prototype.concat = function(other) {
    return new ConcatenateIterator(this, other);
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

  /**
   * The StatefulIterator class.
   *
   * @class StatefulIterator
   * @extends Iterator
   * @constructor
   * @private
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  var StatefulIterator = function() {
    Iterator.call(this);

    this.state = StatefulIterator.StateReady;
    this.current = undefined;
  };

  StatefulIterator.prototype = Object.create(Iterator.prototype);
  StatefulIterator.prototype.constructor = StatefulIterator;

  StatefulIterator.StateReady = 0;
  StatefulIterator.StateLoaded = 1;
  StatefulIterator.StateFinished = 2;

  /**
   * @method finished
   * @return {Any}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  StatefulIterator.prototype.finished = function() {
    this.state = StatefulIterator.StateFinished;
    return undefined;
  };

  /**
   * @method getNext
   * @return {Any}
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  StatefulIterator.prototype.getNext = function() {
    throw 'The function \'getNext\' is not implemented in the subclass!';
  };

  StatefulIterator.prototype.hasNext = function() {
    if (this.state === StatefulIterator.StateReady) {
      this.current = this.getNext();
      if (this.state === StatefulIterator.StateFinished)
        return false;

      this.state = StatefulIterator.StateLoaded;
    }
    return this.state !== StatefulIterator.StateFinished;
  };

  StatefulIterator.prototype.next = function() {
    if (!this.hasNext())
      throw StopIteration;

    this.state = StatefulIterator.StateReady;
    return this.current;
  };

  /**
   * The ArrayIterator class.
   *
   * @class ArrayIterator
   * @extends Iterator
   * @constructor
   * @private
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  var ArrayIterator = function(array, index) {
    Iterator.call(this);

    this.array = array.slice(0);
    this.index = index || 0;
  };

  ArrayIterator.prototype = Object.create(Iterator.prototype);
  ArrayIterator.prototype.constructor = ArrayIterator;

  ArrayIterator.prototype.hasNext = function() {
    return this.index < this.array.length;
  };

  ArrayIterator.prototype.next = function() {
    if (!this.hasNext())
      throw StopIteration;

    return this.array[this.index++];
  };

  /**
   * The ConcatenateIterator class.
   *
   * @class ConcatenateIterator
   * @extends Iterator
   * @constructor
   * @private
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  var ConcatenateIterator = function() {
    Iterator.call(this);

    this.iterators = Array.prototype.slice.call(arguments, 0);
    this.index = 0;
  };

  ConcatenateIterator.prototype = Object.create(Iterator.prototype);
  ConcatenateIterator.prototype.constructor = ConcatenateIterator;

  ConcatenateIterator.prototype.hasNext = function() {
    var iterator;
    while (iterator = this.iterators[this.index]) {
      if (iterator.hasNext())
        return true;
      this.index++;
    }
    return false;
  };

  ConcatenateIterator.prototype.next = function() {
    if (!this.hasNext())
      throw StopIteration;

    return this.iterators[this.index].next();
  };

  /**
   * The EmptyIterator class.
   *
   * @class EmptyIterator
   * @extends Iterator
   * @constructor
   * @private
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  var EmptyIterator = function() {
    Iterator.call(this);
  };

  EmptyIterator.prototype = Object.create(Iterator.prototype);
  EmptyIterator.prototype.constructor = EmptyIterator;

  EmptyIterator.prototype.hasNext = function() {
    return false;
  };

  EmptyIterator.prototype.next = function() {
    throw StopIteration;
  };

  /**
   * The FilterIterator class.
   *
   * @class FilterIterator
   * @extends StatefulIterator
   * @constructor
   * @private
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  var FilterIterator = function(wrapped, callback) {
    StatefulIterator.call(this);

    this.wrapped = wrapped;
    this.callback = callback;
  };

  FilterIterator.prototype = Object.create(StatefulIterator.prototype);
  FilterIterator.prototype.constructor = FilterIterator;

  FilterIterator.prototype.getNext = function() {
    while (this.wrapped.hasNext()) {
       var next = this.wrapped.next();
       if (this.callback(next))
        return next;
    }
    return this.finished();
  };

  /**
   * The MapIterator class.
   *
   * @class MapIterator
   * @extends Iterator
   * @constructor
   * @private
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  var MapIterator = function(wrapped, mapper) {
    Iterator.call(this);

    this.wrapped = wrapped;
    this.mapper = mapper;
  };

  MapIterator.prototype = Object.create(Iterator.prototype);
  MapIterator.prototype.constructor = MapIterator;

  MapIterator.prototype.hasNext = function() {
    return this.wrapped.hasNext();
  };

  MapIterator.prototype.next = function() {
    return this.mapper(this.wrapped.next());
  };

  /**
   * The ObjectIterator class.
   *
   * @class ObjectIterator
   * @extends Iterator
   * @constructor
   * @private
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  var ObjectIterator = function(object) {
    Iterator.call(this);

    this.object = object;
    this.keys = object.keys();
    this.index = 0;
  };

  ObjectIterator.prototype = Object.create(Iterator.prototype);
  ObjectIterator.prototype.constructor = ObjectIterator;

  ObjectIterator.prototype.hasNext = function() {
    return this.index < this.keys.length;
  };

  ObjectIterator.prototype.next = function() {
    if (!this.hasNext())
      throw StopIteration;

    return this.object[this.keys[this.index++]];
  };

  /**
   * The RangeIterator class.
   *
   * @class RangeIterator
   * @extends Iterator
   * @constructor
   * @private
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  var RangeIterator = function(start, step, end) {
    Iterator.call(this);

    this.current = start || 0;
    this.step = step || 1;
    this.end = end;
  };

  RangeIterator.prototype = Object.create(Iterator.prototype);
  RangeIterator.prototype.constructor = RangeIterator;

  RangeIterator.prototype.hasNext = function() {
    if (!this.end)
      return true;

    return this.current < this.end;
  };

  RangeIterator.prototype.next = function() {
    if (!this.hasNext())
      throw StopIteration;

    return this.current += this.step;
  };

  /**
   * The RepeatIterator class.
   *
   * @class RepeatIterator
   * @extends Iterator
   * @constructor
   * @private
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  var RepeatIterator = function(value) {
    Iterator.call(this);

    this.value = value;
  };

  RepeatIterator.prototype = Object.create(Iterator.prototype);
  RepeatIterator.prototype.constructor = RepeatIterator;

  RepeatIterator.prototype.hasNext = function() {
    return true;
  };

  RepeatIterator.prototype.next = function() {
    return this.value;
  };

  /**
   * The ZipIterator class.
   *
   * @class ZipIterator
   * @extends Iterator
   * @constructor
   * @private
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  var ZipIterator = function(iterators) {
    Iterator.call(this);

    this.iterators = iterators;
  };

  ZipIterator.prototype = Object.create(Iterator.prototype);
  ZipIterator.prototype.constructor = ZipIterator;

  ZipIterator.prototype.hasNext = function() {
    for (var index in this.iterators)
      if (!this.iterators[index].hasNext())
        return false;
    return true;
  };

  ZipIterator.prototype.next = function() {
    if (!this.hasNext())
      throw StopIteration;

    var nexts = [];
    for (var index in this.iterators)
      nexts.push(this.iterators[index].next());
    return nexts;
  };

  /**
   * @property Array
   * @static
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Iterator.Array = ArrayIterator;

  /**
   * @property Concatenate
   * @static
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Iterator.Concatenate = ConcatenateIterator;

  /**
   * @property Empty
   * @static
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Iterator.Empty = EmptyIterator;

  /**
   * @property Object
   * @static
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Iterator.Object = ObjectIterator;

  /**
   * @property Range
   * @static
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Iterator.Range = RangeIterator;

  /**
   * @property Repeat
   * @static
   *
   * @author Gillis Van Ginderachter
   * @since 1.0.0
   */
  Iterator.Repeat = RepeatIterator;

  return Iterator;
});
