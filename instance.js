define(function() {
  var Instance = function(model, proto) {
    this.model = model;

    // Shallow copy prototype properties
    for (var property in proto || []) {
      var descriptor = Object.getOwnPropertyDescriptor(proto, property);
      if (!descriptor) {
        this[property] = proto[property];
        continue;
      }

      // Copy the descriptor instead of only the value
      Object.defineProperty(this, property, descriptor);
    }
  };

  Instance.prototype.destroy = function() {
    console.log('destroy');
  };

  return Instance;
});
