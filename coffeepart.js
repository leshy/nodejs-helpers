(function() {
  var forceCallback, forceCallbackWrap, parallelBucket, _;
  var __slice = Array.prototype.slice, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  _ = require('underscore');
  exports.forceCallback = forceCallback = function() {
    var args, callback, f, ret, returned, _i;
    f = arguments[0], args = 3 <= arguments.length ? __slice.call(arguments, 1, _i = arguments.length - 1) : (_i = 1, []), callback = arguments[_i++];
    returned = false;
    try {
      ret = f.apply(this, args.concat(function(err, data) {
        if (returned) {
          throw "got return value but also callback was called";
        }
        return callback(err, data);
      }));
    } catch (error) {
      callback(error, void 0);
    }
    if (ret) {
      returned = true;
      return callback(void 0, ret);
    }
  };
  exports.forceCallbackWrap = forceCallbackWrap = function() {
    var args, f;
    f = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    return function(callback) {
      return forceCallback.apply(this, [].concat(f, args, callback));
    };
  };
  exports.parallelBucket = parallelBucket = function() {
    this.n = 0;
    this._done = true;
    this.subs = [];
    return this;
  };
  parallelBucket.prototype.cb = function() {
    this.n++;
    this._done = false;
    return __bind(function() {
      return --this.n || (this._done = true && _.map(this.subs, function(sub) {
        return sub();
      }));
    }, this);
  };
  parallelBucket.prototype.done = function(callback) {
    if (this._done) {
      return callback();
    } else {
      return this.subs.push(callback);
    }
  };
}).call(this);
