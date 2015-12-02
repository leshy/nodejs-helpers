_ = require 'underscore'
h = require './index'

exports.wrap =

  # will execute an asyc (or sync) function once, and cache the result for the next time
  once: (f) ->
    
    options =
      state: 0
      data: void
      callbacks: []

    gotData = (...data) ->
      options.data = data
      options.state = 2
      _.each options.callbacks, ~> h.cbca it, options.data

    ret = (...args, cb) ->
      
      # finished
      if options.state is 2 then _.defer ~> h.cbca cb, options.data

      # running
      if options.state is 1 then options.callbacks.push cb

      # not running
      if options.state is 0 then options.state = 1; options.callbacks.push(cb); options.ret = f.apply @, args.concat(gotData)
      return options.ret

    ret

  multi: (f) -> (...args) -> _.map args, (arg) ->
    if arg@@ isnt Array then arg = [ arg ]
    f.call @, arg

  # dict curry
  dCurry: (f, cOptions) ->
    (options, ...args) ->
      args.unshift _.extend cOptions, options
      f.apply @, args


