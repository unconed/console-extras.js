require('../src/console.times');

exports.testTimesLimit = function (test) {

  var reallog = console.log;

  var logs = {}, warnings = {};
  console.log = function () {
    logs[arguments[0]] = (logs[arguments[0]] || 0) + 1;
  };
  console.warn = function () {
    warnings[arguments[0]] = (warnings[arguments[0]] || 0) + 1;
  };

  for (var i = 0; i < 10; ++i) {
    console.times(5).log("Hello x5");
    console.times(3).log("World x3");
    console.times(2).warn("WTF x2");
  }
  test.ok(logs['Hello x5']   === 5, "5 Hello logs");
  test.ok(logs['World x3']   === 3, "3 World logs");
  test.ok(warnings['WTF x2'] === 2, "2 WTF warnings");

  test.done();
};

