/**
 * Console rate limiting, unique per line of originating code.
 *
 * console.times(n) - Only runs n times 
 * console.throttle(time) - Only runs once every time milliseconds.
 *
 * Each returns a console object whose methods are rate limited.
 */
(function (console) {

  var counts = {};
  var timestamps = {};

  // Create replacement console class
  var limited = Object.create(console);

  // Prepare limited versions of all console methods.
  for (i in console) (function (method, key) {
    limited[key] = function () {
      var id = this.__id;

      // Once every x ms
      var timestamp = timestamps[id] || 0;
      var now = +new Date();
      if ((now - timestamp) >= this.__throttle) {
        timestamps[id] = now;

        // Up to n times
        var count = counts[id] || 0;
        if (count < this.__limit) {
          counts[id] = count + 1;

          var that = console[key].consoleExtras ? this : console;
          console[key].apply(that, arguments);
        }
      }

      return this;
    };
  })(console[i], i);

  // Add .times() to console.
  console.times = function (n) {
    var ret = Object.create(limited);
    ret.__id = this.__id || console.__getCallID(1);
    ret.__limit = n;
    ret.__throttle = this.__throttle || 0;
    return ret;
  };
  console.times.consoleExtras = true;

  // Add .throttle() to console.
  console.throttle = function (time) {
    var ret = Object.create(limited);
    ret.__id = this.__id || console.__getCallID(1);
    ret.__limit = this.__limit || Infinity;
    ret.__throttle = time;
    return ret;
  };
  console.throttle.consoleExtras = true;

})(console);
