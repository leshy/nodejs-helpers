// Generated by CoffeeScript 1.4.0
(function() {
  var depthFirst, extend, forceCallback, forceCallbackWrap, helpers, parallelBucket, _,
    __slice = [].slice;

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
    this.subs = {};
    this.doneSubs = [];
    this.data = {};
    this.callbacks = {};
    this.error = void 0;
    return this;
  };

  parallelBucket.prototype.cb = function(name) {
    var _this = this;
    this.n++;
    this._done = false;
    if (!name) {
      name = this.n;
    }
    this.callbacks[name] = true;
    return function(err, data) {
      if (err) {
        if (!_this.error) {
          _this.error = {};
        }
        _this.error[name] = err;
      }
      _this.data[name] = data;
      exports.dictArrayMap(_this.subs, name, function(err, sub) {
        return sub(err, data);
      });
      --_this.n || (_this._done = true && _.map(_this.doneSubs, function(sub) {
        return sub(_this.error, _this.data);
      }));
      return void 0;
    };
  };

  parallelBucket.prototype.on = function(name, callback) {
    exports.dictpush(this.subs, name, callback);
    if (this.data[name]) {
      return callback(null, this.data[name]);
    }
  };

  parallelBucket.prototype.done = function(callback) {
    if (this._done) {
      return callback(this.error, this.data);
    } else {
      return this.doneSubs.push(callback);
    }
  };

  depthFirst = function(target, clone, callback) {
    var key, response;
    if (target.constructor === Object || target.constructor === Array) {
      for (key in target) {
        this.depthfirst(target[key], function(data) {
          if (!data(delete target[key])) {

          } else {
            return target[key] = data;
          }
        });
      }
      return target;
    } else {
      return response = callback(target);
    }
  };

  exports.random = function(stuff) {
    return stuff[Math.floor(Math.random() * stuff.length)];
  };

  exports.randompop = function(stuff) {
    return stuff.splice(Math.floor(Math.random() * stuff.length), 1)[0];
  };

  exports.remove = function(stuff, element) {
    var i;
    i = stuff.indexOf(element);
    if (i !== -1) {
      stuff.splice(i, 1);
    }
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

  exports.commenterr = function(err, comment) {
    if (err) {
      return comment + ": " + err;
    } else {
      return void 0;
    }
  };

  exports.extend = extend = function() {
    var destination, targets;
    destination = arguments[0], targets = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    _.map(targets, function(target) {
      return _.map(target, function(value, key) {
        var _ref;
        if (((_ref = destination[key]) != null ? _ref.constructor : void 0) === Object) {
          return destination[key] = extend(destination[key], value);
        } else {
          return destination[key] = value;
        }
      });
    });
    return destination;
  };

  exports.dictpush = function(dict, key, value) {
    var arr;
    if (!(arr = dict[key])) {
      arr = dict[key] = [];
    }
    return arr.push(value);
  };

  exports.dictpop = function(dict, key, value) {
    var arr, ret;
    if (!(arr = dict[key])) {
      return;
    }
    if (value) {
      exports.remove(arr, ret = value);
    } else {
      ret = arr.pop();
    }
    if (arr.length === 0) {
      delete dict[key];
    }
    return ret;
  };

  exports.dictArrayMap = function(dict, key, callback) {
    if (!dict[key]) {
      return;
    }
    if (dict[key].constructor !== Array) {
      return callback(null, dict[key]);
    } else {
      return _.map(dict[key], function(val) {
        return callback(null, val);
      });
    }
  };

  exports.dictmap = function(dict, callback) {
    var res;
    res = {};
    _.map(dict, function(value, key) {
      var newvalue;
      newvalue = callback(value, key);
      if (newvalue === void 0) {
        return;
      }
      return res[key] = newvalue;
    });
    return res;
  };

  exports.setTimeout = exports.wait = exports.sleep = exports.delay = function(ms, callback) {
    var done, id, wrappedCallback;
    done = false;
    wrappedCallback = function() {
      done = true;
      return callback();
    };
    id = setTimeout(wrappedCallback, ms);
    return function() {
      if (!done) {
        clearTimeout(id);
        return !done;
      }
    };
  };

  exports.shortTime = function(time) {
    var appendzero;
    if (time == null) {
      time = new Date();
    }
    appendzero = function(n) {
      n = String(n);
      if (n.length === 1) {
        n = "0" + n;
      }
      return n;
    };
    if (time.constructor !== Date) {
      time = new Date(time);
    }
    return appendzero(time.getHours()) + ":" + appendzero(time.getMinutes()) + ":" + appendzero(time.getSeconds());
  };

  exports.normalizeList = function(list) {
    var total;
    total = _.reduce(list, function(total, n) {
      if (total == null) {
        total = 0;
      }
      return total + n;
    });
    return _.map(list, function(n) {
      return n / total;
    });
  };

  exports.normalizeDict = function(dict) {
    var total;
    total = _.reduce(dict, function(total, n) {
      if (total == null) {
        total = 0;
      }
      return total + n;
    });
    return exports.dictmap(dict, function(n) {
      return n / total;
    });
  };

  exports.scaleDict = function(dict, max) {
    var scale;
    if (max == null) {
      max = 1;
    }
    max = _.max(dict, function(value) {
      return value;
    });
    scale = 1 / max;
    return exports.dictmap(dict, function(n) {
      return n * scale;
    });
  };

  exports.normalize = function(data) {
    if (data.constructor === Array) {
      return exports.normalizeList(data);
    }
    if (data.constructor === Object) {
      return exports.normalizeDict(data);
    }
    throw "unknown data type, can't normalize";
  };

  exports.round = function(float, n) {
    if (n == null) {
      n = 3;
    }
    n = Math.pow(10, n);
    return Math.round(float * n) / n;
  };

  exports.countExtend = function(dict1, dict2) {
    _.map(dict2, function(value, key) {
      if (dict1[key] === void 0) {
        return dict1[key] = 1;
      } else {
        return ++dict1[key];
      }
    });
    return dict1;
  };

  exports.arrayToDict = function(iterable, callbackVal, callbackKey) {
    var res;
    res = {};
    _.map(iterable, function(element) {
      var key;
      if (callbackKey) {
        key = callbackKey(element);
      } else {
        key = element;
      }
      if (callbackVal) {
        return res[key] = callbackVal(element);
      } else {
        return res[key] = true;
      }
    });
    return res;
  };

  exports.trim = exports.strip = function(str, chars) {
    return exports.ltrim(exports.rtrim(str, chars), chars);
  };

  exports.ltrim = function(str, chars) {
    if (chars == null) {
      chars = "\\s";
    }
    return str.replace(new RegExp("^[" + chars + "]+", "g"), "");
  };

  exports.rtrim = function(str, chars) {
    if (chars == null) {
      chars = "\\s";
    }
    return str.replace(new RegExp("[" + chars + "]+$", "g"), "");
  };

  exports.makePath = function() {
    var elements;
    elements = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return "/" + _.map(_.flatten(elements), function(element) {
      return exports.trim(element, '\/');
    }).join('/');
  };

  exports.identity = function(x) {
    return x;
  };

  exports.joinF = function() {
    var functs;
    functs = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return _.map(functs, function(f) {
      return f();
    });
  };

  exports.filename = function(path) {
    return path.replace(/^.*[\\\/]/, '');
  };

  exports.pad = function(text, length, char) {
    if (char == null) {
      char = "0";
    }
    if (text.constructor !== String) {
      text = String(text);
    }
    if (text.length >= length) {
      return text;
    }
    _.times(length - text.length, function() {
      return text = char + text;
    });
    return text;
  };

}).call(this);
