require('../src/console.stacktrace');
require('../src/console.limit');

exports.testTimes = function (test) {

  var oldlog = console.log;
  var oldwarn = console.warn;

  var logs = {}, warnings = {};
  console.log = function () {
    logs[arguments[0]] = (logs[arguments[0]] || 0) + 1;
  };
  console.warn = function () {
    warnings[arguments[0]] = (warnings[arguments[0]] || 0) + 1;
  };

  for (var i = 0; i < 10; ++i) {
    console.times(5).log("Hello x5");
    console.times(3)
      .log("World x3");
    console
      .times(2)
      .warn("WTF x2");
  }
  test.equal(logs['Hello x5'], 5, "5 Hello logs");
  test.equal(logs['World x3'], 3, "3 World logs");
  test.equal(warnings['WTF x2'], 2, "2 WTF warnings");

  console.log = oldlog;
  console.warn = oldwarn;

  test.done();
};

exports.testThrottle = function (test) {

  var oldinfo = console.info;

  var infos = {};
  console.info = function () {
    infos[arguments[0]] = (infos[arguments[0]] || 0) + 1;
  };

  // Throttle 20ms events to 100ms during 1s+delta.
  var rate = 20, throttle = 100, duration = 550;
  // Implied +1 in ceil because first event is not throttled.
  var expect1 = Math.ceil(duration / throttle);
  var expect2 = Math.ceil(duration / throttle / 2);

  var interval = setInterval(function () {
    console.throttle(throttle).info('Normal');
    console
      .throttle(throttle * 2)
      .info('Half');
  }, rate);

  setTimeout(function () {
    clearInterval(interval);
    test.equal(infos['Normal'], expect1, "Throttling rate x1 correct");
    test.equal(infos['Half'], expect2, "Throttling rate x2 correct");

    console.info = oldinfo;

    test.done();
  }, duration);

};


exports.testCombo = function (test) {

  var olderror = console.error;

  var errors = {};
  console.error = function () {
    errors[arguments[0]] = (errors[arguments[0]] || 0) + 1;
  };

  // Throttle 20ms events to 100ms during 1s+delta.
  var rate = 20, throttle = 100, duration = 1000, times = 5;

  var interval = setInterval(function () {
    console
      .times(times).throttle(throttle)
      .error('Error 1');
    console
      .throttle(throttle)
      .times(times)
      .error('Error 2');
  }, rate);

  setTimeout(function () {
    test.equal(errors['Error 1'], times - 1, "Times - 1 reached");
    test.equal(errors['Error 2'], times - 1, "Times - 1 reached");
  }, (times - 1.5) * throttle + rate);

  setTimeout(function () {
    test.equal(errors['Error 1'], times, "Times reached");
    test.equal(errors['Error 2'], times, "Times reached");
  }, (times - 0.5) * throttle + rate);

  setTimeout(function () {
    clearInterval(interval);
    test.equal(errors['Error 1'], times, "Times limit worked");
    test.equal(errors['Error 2'], times, "Times limit worked");

    console.error = olderror;

    test.done();
  }, duration + rate);

};

