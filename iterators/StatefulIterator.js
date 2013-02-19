define(['iterators/IteratorImplementation'], function(Iterator) {
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
    return this.state !== StatefulIterator.Finished;
  };

  StatefulIterator.prototype.next = function() {
    if (!this.hasNext())
      throw StopIteration;

    this.state = StatefulIterator.StateReady;
    return this.current;
  };

  return StatefulIterator;
});
