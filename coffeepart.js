(function() {
  var depthFirst, forceCallback, forceCallbackWrap, helpers, parallelBucket, _;
  var __slice = Array.prototype.slice, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  _ = require('underscore');
  helpers = require('./index');
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
    if (ret !== void 0) {
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
    this.data = {};
    this.error = void 0;
    return this;
  };
  parallelBucket.prototype.cb = function(name) {
    this.n++;
    this._done = false;
    if (!name) {
      name = this.n;
    }
    return __bind(function(err, data) {
      if (err) {
        if (!this.error) {
          this.error = {};
        }
        this.error[name] = err;
      }
      this.data[name] = data;
      --this.n || (this._done = true && _.map(this.subs, __bind(function(sub) {
        return sub(this.error, this.data);
      }, this)));
    }, this);
  };
  parallelBucket.prototype.done = function(callback) {
    if (this._done) {
      return callback(this.error, this.data);
    } else {
      return this.subs.push(callback);
    }
  };
  depthFirst = function(target, changecallback, clone, callback) {
    var bucket, key, response;
    if (target.constructor === Object || target.constructor === Array) {
      if (clone) {
        target = _.clone(target);
      }
      bucket = new parallelBucket();
      for (key in target) {
        this.depthfirst(target[key], changecallback, clone, function(data) {
          return target[key] = data;
        });
      }
      return target;
    } else if (response = callback(target)) {
      return response;
    } else {
      return target;
    }
  };
  exports.random = function(stuff) {
    return stuff[Math.floor(Math.random() * stuff.length)];
  };
  exports.randompop = function(stuff) {
    return stuff.splice(Math.floor(Math.random() * stuff.length), 1)[0];
  };
  exports.remove = function(stuff, element) {
    stuff.splice(stuff.indexOf(element), 1);
    return stuff;
  };
  exports.shuffle = function(stuff) {
    var _results;
    stuff = _.clone(stuff);
    _results = [];
    while (stuff.length) {
      _results.push(exports.randompop(stuff));
    }
    return _results;
  };
}).call(this);
