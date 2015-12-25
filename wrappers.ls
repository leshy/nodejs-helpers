_ = require 'underscore'
h = require './index'

exports.wrap =

  # will execute an asyc (or sync) function once, and cache the result for the next time
  once: (f) ->
    
    options = do
      state: 0
      data: void
      callbacks: []

    gotData = (...data) ->
      options.data = data
      options.state = 2
      _.each options.callbacks, ~> h.cbca it, options.data

    ret = (...args, cb) ->
      switch options.state
        # not running
        | 0 => options.state = 1; options.callbacks.push(cb); options.ret = f.apply @, args.concat(gotData)
        # running
        | 1 => options.callbacks.push cb
        # finished
        | 2 => _.defer ~> h.cbca cb, options.data

      return options.ret

    ret

  
  throttle: (options, f) ->
    doptions = do
      time: 50
      state: 0
      argAggregator: h.id
      args: []
      callbacks: []
      
    options = _.extend doptions, options
    
    
    argAggregate = (newArgs) -> options.args = doptions.argAggregator newArgs, options.args
    
    startWait = ->
      options.state = 1
      h.wait options.time, startRun

    startRun = -> 
      f.apply options.self, options.args.concat gotData(options.callbacks)
      options.state = 0
      options.args = []
      options.callbacks = []

    gotData = (callbacks) -> (...data) ->
      _.each callbacks, (cb) -> cb.apply @, data
      
    ret = (...args, cb) ->
      switch options.state
      
        # not running
        | 0 =>
          options.self = @
          if cb then options.callbacks.push(cb)
          argAggregate(args)
          
          startWait()
          
        # running
        | 1 =>
          options.callbacks.push(cb)
          argAggregate(args)
          
      return void      
    

  multi: (f) -> (...args) -> _.map args, (arg) ->
    if arg@@ isnt Array then arg = [ arg ]
    f.call @, arg

  # dict curry
  dCurry: (f, cOptions) ->
    (options, ...args) ->
      args.unshift _.extend cOptions, options
      f.apply @, args


