// Generated by LiveScript 1.4.0
(function(){
  var _, h, slice$ = [].slice;
  _ = require('underscore');
  h = require('./index');
  exports.wrap = {
    once: function(f){
      var options, gotData, ret;
      options = {
        state: 0,
        data: void 8,
        callbacks: []
      };
      gotData = function(){
        var data, this$ = this;
        data = slice$.call(arguments);
        options.data = data;
        options.state = 2;
        return _.each(options.callbacks, function(it){
          return h.cbca(it, options.data);
        });
      };
      ret = function(){
        var i$, args, cb, this$ = this;
        args = 0 < (i$ = arguments.length - 1) ? slice$.call(arguments, 0, i$) : (i$ = 0, []), cb = arguments[i$];
        switch (options.state) {
        case 0:
          options.state = 1;
          options.callbacks.push(cb);
          options.ret = f.apply(this, args.concat(gotData));
          break;
        case 1:
          options.callbacks.push(cb);
          break;
        case 2:
          _.defer(function(){
            return h.cbca(cb, options.data);
          });
        }
        return options.ret;
      };
      return ret;
    },
    throttle: function(options, f){
      var doptions, argAggregate, startWait, startRun, gotData, ret;
      doptions = {
        time: 50,
        state: 0,
        argAggregator: h.id,
        args: [],
        callbacks: []
      };
      options = _.extend(doptions, options);
      argAggregate = function(newArgs){
        return options.args = doptions.argAggregator(newArgs, options.args);
      };
      startWait = function(){
        options.state = 1;
        return h.wait(options.time, startRun);
      };
      startRun = function(){
        f.apply(options.self, options.args.concat(gotData(options.callbacks)));
        options.state = 0;
        options.args = [];
        return options.callbacks = [];
      };
      gotData = function(callbacks){
        return function(){
          var data;
          data = slice$.call(arguments);
          return _.each(callbacks, function(cb){
            return cb.apply(this, data);
          });
        };
      };
      return ret = function(){
        var i$, args, cb;
        args = 0 < (i$ = arguments.length - 1) ? slice$.call(arguments, 0, i$) : (i$ = 0, []), cb = arguments[i$];
        switch (options.state) {
        case 0:
          options.self = this;
          if (cb) {
            options.callbacks.push(cb);
          }
          argAggregate(args);
          startWait();
          break;
        case 1:
          options.callbacks.push(cb);
          argAggregate(args);
        }
      };
    },
    multi: function(f){
      return function(){
        var args;
        args = slice$.call(arguments);
        return _.map(args, function(arg){
          if (arg.constructor !== Array) {
            arg = [arg];
          }
          return f.call(this, arg);
        });
      };
    },
    dCurry: function(f, cOptions){
      return function(options){
        var args;
        args = slice$.call(arguments, 1);
        args.unshift(_.extend(cOptions, options));
        return f.apply(this, args);
      };
    }
  };
}).call(this);
