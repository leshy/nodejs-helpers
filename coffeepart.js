// Generated by CoffeeScript 1.9.1
(function() {
  var _, cbc, depthFirst, extend, forceCallback, forceCallbackWrap, helpers, id, objorclass, parallelBucket, queue, sneakyPromise,
    slice = [].slice;

  _ = require('underscore');

  helpers = require('./index');

  exports.forceCallback = forceCallback = function() {
    var args, callback, error, f, j, ret, returned;
    f = arguments[0], args = 3 <= arguments.length ? slice.call(arguments, 1, j = arguments.length - 1) : (j = 1, []), callback = arguments[j++];
    returned = false;
    try {
      ret = f.apply(this, args.concat(function(err, data) {
        if (returned) {
          throw "got return value but also callback was called";
        }
        return callback(err, data);
      }));
    } catch (_error) {
      error = _error;
      callback(error, void 0);
    }
    if (ret !== void 0) {
      returned = true;
      return callback(void 0, ret);
    }
  };

  exports.forceCallbackWrap = forceCallbackWrap = function() {
    var args, f;
    f = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    return function(callback) {
      return forceCallback.apply(this, [].concat(f, args, callback));
    };
  };

  exports.parallelBucket = parallelBucket = function(options) {
    this.n = 0;
    this._done = true;
    this.data = {};
    this.error = null;
    this.subs = {};
    this.doneSubs = [];
    this.callbacks = {};
    return this;
  };

  parallelBucket.prototype.cb = function(name) {
    this.n++;
    this._done = false;
    if (!name) {
      name = this.n;
    }
    this.callbacks[name] = 1;
    return (function(_this) {
      return function(err, data) {
        if (_this.callbacks[name] > 1) {
          console.warn("parallelbucket callback '" + name + " called more then once'");
        }
        _this.callbacks[name] += 1;
        if (err) {
          if (!_this.err) {
            _this.err = {};
          }
          _this.err[name] = err;
        }
        if (data) {
          _this.data[name] = data;
        }
        _this.trigger(name, err, data);
        --_this.n || (_this._done = true && _.map(_this.doneSubs, function(sub) {
          return sub(_this.err, _this.data);
        }));
        return void 0;
      };
    })(this);
  };

  parallelBucket.prototype.trigger = function() {
    var args, name;
    name = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    return exports.dictArrayMap(this.subs, name, (function(_this) {
      return function(err, sub) {
        return sub.apply(_this, args);
      };
    })(this));
  };

  parallelBucket.prototype.on = function(name, callback) {
    exports.dictpush(this.subs, name, callback);
    if (this.callbacks[name] > 1) {
      return callback(null, this.data[name]);
    }
  };

  parallelBucket.prototype.done = function(callback) {
    if (this._done) {
      return callback(this.err, this.data);
    } else {
      return this.doneSubs.push(callback);
    }
  };

  exports.queue = queue = function(options) {
    return _.extend(this, {
      namecounter: 0,
      n: 0,
      size: 5,
      queue: [],
      doneSubs: []
    }, options);
  };

  queue.prototype.push = function(name, f, callback) {
    if (name.constructor === Function) {
      f = name && (name = this.namecounter++);
    }
    this.queue.push([name, f, callback]);
    return this.start();
  };

  queue.prototype.start = function() {
    var popqueue;
    popqueue = (function(_this) {
      return function() {
        var f, name, ref;
        if (!_this.queue.length && !_this.n) {
          return _this.triggerDone();
        }
        if (!_this.queue.length || _this.n >= _this.size) {
          return;
        }
        _this.n++;
        ref = _this.queue.pop(), name = ref[0], f = ref[1];
        f(function(err, data) {
          _this.n--;
          if (err) {
            if (!_this.err) {
              _this.err = {};
            }
            _this.err[name] = err;
          }
          if (data) {
            if (!_this.data) {
              _this.data = {};
            }
            _this.data[name] = data;
          }
          return popqueue();
        });
        return popqueue();
      };
    })(this);
    return popqueue();
  };

  exports.cbc = cbc = function() {
    var args, callback;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    if (!args.length) {
      return;
    }
    if (callback = args.shift()) {
      return callback.apply(this, args);
    }
  };

  queue.prototype.triggerDone = function() {
    this._done = true;
    return _.map(this.doneSubs, (function(_this) {
      return function(sub) {
        return cbc(sub, _this.err, _this.data);
      };
    })(this));
  };

  queue.prototype.done = function(callback) {
    this.doneSubs.push(callback);
    if (this._done) {
      return callback(this.err, this.data);
    }
  };

  depthFirst = function(target, clone, callback) {
    var key, response;
    if (target.constructor === Object || target.constructor === Array) {
      for (key in target) {
        this.depthfirst(target[key], function(data) {
          if (!data) {
            return delete target[key];
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
    var results;
    stuff = _.clone(stuff);
    results = [];
    while (stuff.length) {
      results.push(exports.randompop(stuff));
    }
    return results;
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
    destination = arguments[0], targets = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    _.map(targets, function(target) {
      return _.map(target, function(value, key) {
        var ref;
        if (((ref = destination[key]) != null ? ref.constructor : void 0) === Object) {
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

  exports["delete"] = function(dict, key) {
    var val;
    val = dict[key];
    delete dict[key];
    return val;
  };

  exports.makeDict = function(array, callback) {
    var ret;
    ret = {};
    _.map(array, function(elem) {
      if (callback) {
        elem = callback(elem);
      }
      return ret[elem] = true;
    });
    return ret;
  };

  exports.dictFromArray = function(array, cb) {
    var ret;
    ret = {};
    _.map(array, function(elem, index) {
      var key, ref, value;
      ref = cb(elem, index), key = ref[0], value = ref[1];
      if (key) {
        return ret[key] = value;
      }
    });
    return ret;
  };

  exports.dictMap = exports.dictmap = function(dict, callback) {
    var res;
    if (dict.constructor === Array) {
      dict = exports.makeDict(dict);
    }
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

  exports.uniMap = exports.unimap = function(something, callback) {
    if (something.constructor === Array) {
      return _.map(something, callback);
    }
    if (something.constructor === Object) {
      return exports.dictMap(something, callback);
    }
    return callback(something);
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

  exports.round = function(x, n) {
    if (n == null) {
      n = 3;
    }
    n = Math.pow(10, n);
    return Math.round(x * n) / n;
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
    if (!str) {
      return "";
    }
    return str.replace(new RegExp("^[" + chars + "]+", "g"), "");
  };

  exports.rtrim = function(str, chars) {
    if (chars == null) {
      chars = "\\s";
    }
    if (!str) {
      return "";
    }
    return str.replace(new RegExp("[" + chars + "]+$", "g"), "");
  };

  exports.makePath = exports.path = function() {
    var elements;
    elements = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return "/" + _.map(_.flatten(elements), function(element) {
      return exports.trim(element, '\/');
    }).join('/');
  };

  exports.identity = function(x) {
    return x;
  };

  exports.joinF = function() {
    var functs;
    functs = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return function() {
      var args;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return _.map(functs, (function(_this) {
        return function(f) {
          return f.apply(_this, args);
        };
      })(this));
    };
  };

  exports.filename = function(path) {
    return path.replace(/^.*[\\\/]/, '');
  };

  exports.pad = function(text, length, chr) {
    if (chr == null) {
      chr = "0";
    }
    if (text.constructor !== String) {
      text = String(text);
    }
    if (text.length >= length) {
      return text;
    }
    _.times(length - text.length, function() {
      return text = chr + text;
    });
    return text;
  };

  exports.jaccardIndex = function(set1, set2) {
    if (set1.constructor === Object) {
      set1 = _.keys(set1);
    }
    if (set2.constructor === Object) {
      set2 = _.keys(set2);
    }
    return _.intersection(set1, set2).length / _.union(set1, set2).length;
  };

  exports.prettyNumber = function(number) {
    return Math.round(number).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  exports.prettyDateFull = function(d) {
    if (d.constructor !== Date) {
      d = new Date(d);
    }
    return d.getFullYear() + "/" + exports.pad(d.getMonth() + 1, 2) + "/" + exports.pad(d.getDate(), 2) + " " + helpers.getShortDay(d) + " at " + exports.pad(d.getHours(), 2) + ":" + exports.pad(d.getMinutes(), 2) + " (" + helpers.prettyDate(d) + ")";
  };

  exports.basicTime = function(d) {
    if (d.constructor !== Date) {
      d = new Date(d);
    }
    return exports.pad(d.getHours(), 2) + ":" + exports.pad(d.getMinutes(), 2) + ":" + exports.pad(d.getSeconds(), 2);
  };

  exports.Kilo = 1000;

  exports.Mega = exports.Kilo * 1000;

  exports.Giga = exports.Mega * 1000;

  exports.zip = function() {
    var arrays, maxLen;
    arrays = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    maxLen = _.reduce(arrays, (function(maxLen, array) {
      if (array.length > maxLen) {
        return array.length;
      } else {
        return maxLen;
      }
    }), 0);
    return _(maxLen).times(function(index) {
      return _.map(arrays, function(array) {
        return array[index];
      });
    });
  };

  exports.squish = function() {
    var arrays, callback, j, maxLen;
    arrays = 2 <= arguments.length ? slice.call(arguments, 0, j = arguments.length - 1) : (j = 0, []), callback = arguments[j++];
    maxLen = _.reduce(arrays, (function(maxLen, array) {
      if (array.length > maxLen) {
        return array.length;
      } else {
        return maxLen;
      }
    }), 0);
    return _(maxLen).times(function(index) {
      return callback.apply(this, _.map(arrays, function(array) {
        return array[index];
      }));
    });
  };

  exports.mapFind = function(array, callback) {
    var ret;
    ret = void 0;
    _.find(array, function(element) {
      return ret = callback(element);
    });
    return ret;
  };

  exports.mapFilter = function(array, callback) {
    var ret;
    ret = [];
    _.each(array, function(x) {
      var res;
      res = callback(x);
      if (res) {
        return ret.push(res);
      }
    });
    return ret;
  };

  exports.id = id = function(x) {
    return x;
  };

  exports.difference = function(array1, array2, compare1, compare2) {
    var a1compare, a1diff, a1intersection, a2compare, a2diff;
    if (!compare1) {
      compare1 = id;
    }
    if (!compare2) {
      compare2 = compare1;
    }
    a1diff = [];
    a2diff = [];
    a1compare = _.map(array1, function(x) {
      return {
        c: compare1(x),
        x: x
      };
    });
    a2compare = _.map(array2, function(x) {
      return {
        c: compare2(x),
        x: x
      };
    });
    a1intersection = [];
    _.each(a1compare, function(x1) {
      var found;
      found = _.find(a2compare, function(x2) {
        if (x1.c === x2.c) {
          return x2.matched = true;
        }
      });
      if (!found) {
        return a1diff.push(x1.x);
      }
      return a1intersection.push(x1.x);
    });
    a2diff = exports.mapFilter(a2compare, function(x) {
      if (!x.matched) {
        return x.x;
      } else {
        return false;
      }
    });
    return [a1intersection, a1diff, a2diff];
  };

  exports.objorclass = objorclass = function(x, attr) {
    if (typeof x === 'object') {
      return x[attr];
    } else {
      return x.prototype[attr];
    }
  };

  exports.array = function(something) {
    if (!something) {
      return [];
    }
    if (something.constructor !== Array) {
      return [something];
    } else {
      return something;
    }
  };

  exports.unshift = function() {
    var array, elements;
    array = arguments[0], elements = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    array.unshift.apply(array, elements);
    return array;
  };

  exports.push = function() {
    var array, elements;
    array = arguments[0], elements = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    array.push.apply(array, elements);
    return array;
  };

  exports.sneakyPromise = sneakyPromise = (function() {
    function sneakyPromise(promise1) {
      this.promise = promise1;
    }

    sneakyPromise.prototype.gimme = function() {
      return this.promise;
    };

    return sneakyPromise;

  })();

  exports.sneaky = function(promise) {
    return new exports.sneakyPromise(promise);
  };

  exports.swap = function(dict) {
    var res;
    res = {};
    _.map(dict, function(value, key) {
      return res[value] = key;
    });
    return res;
  };

}).call(this);
