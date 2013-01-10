_ = require 'underscore'

# receives a function and calls the callback with its returned values,
# regardless if the function is blocking or async
exports.forceCallback = forceCallback = (f,args...,callback) ->
    returned = false
    try
        ret = f.apply this, args.concat((err,data) ->
            if returned then throw "got return value but also callback was called"
            callback(err,data))
    catch error
        callback(error,undefined)

    if ret then returned = true; callback(undefined,ret)

# converts an blocking or async function to an async function
exports.forceCallbackWrap = forceCallbackWrap = (f,args...) ->
    (callback) -> forceCallback.apply(this, [].concat(f,args,callback))


# like async.parallel but functions to be executed are pushed dinamically (look at tests)
exports.parallelBucket = parallelBucket = ->
    @n = 0; @_done = true; @subs = []
    @

parallelBucket::cb = ->
    @n++; @_done = false
    => --@n or @_done = true and _.map @subs, (sub) -> sub()

parallelBucket::done = (callback) -> if @_done then callback() else @subs.push callback