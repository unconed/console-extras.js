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

