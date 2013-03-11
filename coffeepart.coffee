_ = require 'underscore'
helpers = require './index'

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

    if ret isnt undefined then returned = true; callback(undefined,ret)

# converts an blocking or async function to an async function
exports.forceCallbackWrap = forceCallbackWrap = (f,args...) ->
    (callback) -> forceCallback.apply(this, [].concat(f,args,callback))


# like async.parallel but functions to be executed are pushed dinamically (look at tests)
exports.parallelBucket = parallelBucket = ->
    @n = 0; @_done = true; @subs = []; @data = {}; @error = undefined;
    @

parallelBucket::cb = (name) ->
    @n++; @_done = false
    if not name then name = @n
        
    (err,data) =>
        
        if err
            if not @error then @error = {}
            @error[name] = err
        @data[name] = data
        
        --@n or @_done = true and _.map @subs, (sub) => sub(@error,@data)

        return undefined

parallelBucket::done = (callback) -> if @_done then callback(@error,@data) else @subs.push callback

depthFirst = (target, changecallback, clone, callback) ->
    if target.constructor is Object or target.constructor is Array
        
        if clone then target = _.clone target

        bucket = new parallelBucket()
        
        for key of target
            @depthfirst target[key], changecallback, clone, (data) -> target[key] = data
                
        target
    else if response = callback(target) then response else target


exports.random = (stuff) -> stuff[Math.floor(Math.random() * stuff.length)]

exports.randompop = (stuff) -> stuff.splice(Math.floor(Math.random() * stuff.length),1)[0]

exports.remove = (stuff,element) ->
    i = stuff.indexOf(element)
    if i != -1 then stuff.splice(i, 1)
    stuff


exports.shuffle = (stuff) -> 
    stuff = _.clone(stuff)
    exports.randompop(stuff) while stuff.length


exports.commenterr = (err,comment) -> if err then comment + ": " + err else undefined

# recursive extend
exports.extend = extend = (destination, targets...) ->
    _.map targets, (target) ->
        _.map target, (value,key) ->
            if destination[key]?.constructor is Object then destination[key] = extend destination[key], value
            else destination[key] = value
    destination


