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
      options.callbacks.push cb
      switch options.state
        | 0 => options.state = 1; options.ret = console.log f.apply @, args.concat(gotData)
        | 2 => _.defer ~> h.cbca cb, options.data
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


