require('../src/console.stacktrace');

exports.testStackTrace = function (test) {
  test.ok(console.__getCallID(0).match(/testStackTrace/), "Can identify self on stack");
  test.done();
};