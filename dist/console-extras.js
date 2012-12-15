/*! console-extras - v0.1 - 2012-12-14
* Copyright (c) 2012 Steven Wittens; Licensed  */

/**
 * console.times(n)
 *
 * Returns a console object whose methods will only fire n times
 * for a particular line in the source.
 */
(function (console) {

  var counts = {};

  // Prepare limited versions of all console methods.
  var limited = {};
  for (i in console) (function (method, key) {
    limited[key] = function () {
      var id = getCallID();

      var count = counts[id] || 0;
      if (count < this.limit) {
        counts[id] = count + 1;

        // Note: look up method live to allow overrides in testing.
        console[key].apply(console, arguments);
      }
    }
  })(console[i], i);

  // Get unique ID per call based on stack trace
  function getCallID() {
    var stack = new Error().stack;
    if (stack) {
      var lines = stack.split(/\n/g), skip = 2;
      var found = false, offset = 0;
      for (i in lines) {
        if (offset == skip) {
          return lines[i];
        }
        if (!found && lines[i].match(/getCallID/)) {
          found = true;
        }
        if (found) {
          offset++;
        }
      }
    }

    return 'exception';
  }

  // Add method to console.
  console.times = function (n) {
    var console = Object.create(limited);
    console.limit = n;
    return console;
  };

})(console);
