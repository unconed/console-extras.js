/*! console-extras - v0.1 - 2013-01-26
* Copyright (c) 2013 Steven Wittens; Licensed  */

(function (console) {

// Get unique ID per call based on stack trace
console.__getCallID = function (skip) {
  var stack = new Error().stack;
  if (stack) {
    var lines = stack.split(/\n/g);
    var found = false, offset = 0;

    skip++; // skip self

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

})(console);


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

/**
 * Data collation/analysis.
 *
 * console.collate(...) - Pass arbitrary data in to summarize, e.g. numbers, arrays, objects.
 * console.summary(...) - Output a summary for a previous .collate() call (asynchronous).
 */
(function (console) {

  // Keep track of stats
  var sets = { };
  function Stat() {
    this.x = 0;
    this.x2 = 0;
    this.strings = [];
    this.children = [];
    this.classes = {};
    this.count = 0;
  }

  // Create replacement console class
  var collated = Object.create(console);

  // Collate data points
  console.collate = function () {

    // Prepare arguments
    var args = Array.prototype.slice.apply(arguments);

    // Fetch data/stats so far
    var id = this.__id || console.__getCallID(0);
    var stats = sets[id] = sets[id] || [];

    // Munch data point
    function munch(stat, value) {
      stat = stat || new Stat();

      var type = typeof value;
      if (value instanceof Array) type = 'array';

      switch (type) {
        case 'number':
          stat.x += value;
          stat.x2 += value * value;
          stat.count++;
          break;

        case 'array':
          value.forEach(function (value, i) {
            stat.children[i] = munch(stat.children[i], value);
          });
          break;

        case 'string':
          stat.strings[value] = (stat.strings[value] || 0) + 1;
          break;

        case 'object':
          var name = value.constructor && value.constructor.name || 'Object';
          type = stat.classes[name] || { count: 0, properties: {} };
          type.count++;

          for (i in value) (function (value, i) {
            type.properties[i] = munch(type.properties[i], value);
          })(value[i], i);

          stat.classes[name] = type;
          break;

        default:
          return;
      }

      return stat;
    }

    // Munch all arguments
    args.forEach(function (arg, i) {
      stats[i] = munch(stats[i], arg);
    });

    // Remember original call ID and reset limits.
    var ret = Object.create(collated);
    ret.__id = id;
    ret.__limit = Infinity;
    ret.__throttle = 0;
    return ret;
  };
  console.collate.consoleExtras = true;

  // Summarize collated data
  console.summary = function () {
    setTimeout(function () {

      // Fetch data/stats so far
      var id = this.__id || console.__getCallID(0);
      var stats = sets[id] = sets[id] || [];
      var out = [];

      for (i in stats) {
        out.push(stats[i].toOutput('', i +': '));
      }

      delete sets[id];

      console.log(out.join("\n"));
    }.bind(this), 0);
  };
  console.summary.consoleExtras = true;

  // Pretty printer for stats
  Stat.prototype.toOutput = function (prefix, name) {
    var out = [];
    var named = false;

    // Numbers: show mean / stddev
    if (this.count) {
      var inv = 1 / Math.max(1, this.count);
      var mean = this.x * inv;
      var stddev = Math.sqrt((this.x2 - this.x * mean) * inv);

      function print(x) {
        return Math.round(x * 100) / 100;
      }

      out.push(prefix + name + print(mean) + ' ± ' + print(stddev) + ' (×' + this.count + ')');
    }
    else {
      out.push(prefix + name);
    }

    // Strings: show uniques
    for (var string in this.strings) {
      var total = this.strings[string];
      if (string.length > 32) string = string.substring(0, 32) + '...';
      out.push(prefix +'  "'+ string +'" (×' + this.strings[string] + ')');
    }

    // Children: indent and recurse
    if (this.children.length) {
      out.push(prefix + '  Array');
      for (var i in this.children) {
        out.push(this.children[i].toOutput(prefix + '    ', i +': '));
      }
    }

    // Classes: indent and recurse
    for (klass in this.classes) {
      var item = this.classes[klass];
      out.push(prefix + '  ' + klass + ' (×' + item.count + ')');
      for (var i in item.properties) {
        out.push(item.properties[i].toOutput(prefix + '    ', i +': '));
      }
    }

    return out.join("\n");
  }

})(console);