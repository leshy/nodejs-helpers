(function() {
  var async, helpers;
  helpers = require('./index.js');
  async = require('async');
  exports.returnorcallback = function(test) {
    var f1, f2;
    f1 = function(n) {
      return n + 3;
    };
    f2 = function(n, callback) {
      setTimeout((function() {
        return callback(void 0, n + 4);
      }), 100);
    };
    return async.parallel({
      f1: helpers.forceCallbackWrap(f1, 1),
      f2: helpers.forceCallbackWrap(f2, 1)
    }, function(err, data) {
      test.equals(err, void 0);
      test.deepEqual(data, {
        f1: 4,
        f2: 5
      });
      return test.done();
    });
  };
  exports.parallelBucket = function(test) {
    var bucket, makewaiter;
    makewaiter = function(n) {
      return function(callback) {
        return setTimeout((function() {
          return callback(void 0, 100 - n);
        }), n);
      };
    };
    bucket = new helpers.parallelBucket();
    makewaiter(50)(bucket.cb());
    makewaiter(60)(bucket.cb());
    makewaiter(70)(bucket.cb('bla'));
    makewaiter(80)(bucket.cb());
    makewaiter(90)(bucket.cb());
    test.equals(bucket.n, 5);
    return bucket.done(function(err, data) {
      console.log(err, data);
      test.equals(bucket.n, 0);
      return test.done();
    });
  };
  exports.remove = function(test) {
    var a;
    a = ['bla', 'blu', 'blo'];
    helpers.remove(a, 'blu');
    test.deepEqual(a, ['bla', 'blo']);
    return test.done();
  };
}).call(this);
