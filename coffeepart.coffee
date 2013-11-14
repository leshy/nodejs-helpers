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

# converts a blocking or an async function to an async function (when you want to accept both)
exports.forceCallbackWrap = forceCallbackWrap = (f,args...) ->
    (callback) -> forceCallback.apply(this, [].concat(f,args,callback))


# like async.parallel but functions to be executed are pushed dinamically (look at tests)
# 
# this should block when dispatching cb()
# it should support running particular number of parallel processes,
# OR it should support queueing
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

# depthfirst search and modify through JSON
depthFirst = (target, clone, callback) ->
    if target.constructor is Object or target.constructor is Array
        for key of target
            @depthfirst target[key], (data) -> if not data delete target[key] else target[key] = data
        target
    else response = callback(target)

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

# operations for dealing with a dictionary of arrays
exports.dictpush = (dict,key,value) ->
    if not arr = dict[key] then arr = dict[key] = []
    arr.push value

exports.dictpop = (dict,key,value) ->
    if not arr = dict[key] then return
    if value then exports.remove arr, ret = value else ret = arr.pop()
    if arr.length is 0 then delete dict[key]
    ret

exports.dictmap = (dict,callback) ->
    res = {}
    _.map dict, (value,key) ->
        newvalue = callback(value,key)
        if newvalue is undefined then return
        res[key] = newvalue
    res

# just reversing setTimeout arguments.. this is more practical for coffeescript
exports.wait = exports.sleep = exports.delay = (ms,callback) -> setTimeout callback, ms

exports.shortTime = ( time = new Date()) ->
    appendzero = (n) ->
        n = String(n)
        if n.length is 1 then n = "0" + n
        n
        
    if time.constructor isnt Date then time = new Date(time)
    appendzero(time.getHours()) + ":" + appendzero(time.getMinutes()) + ":" + appendzero(time.getSeconds())

exports.normalizeList = (list) ->
    total = _.reduce list, (total=0,n) -> total + n
    _.map list, (n) -> n / total

exports.normalizeDict = (dict) ->
    total = _.reduce dict, (total=0,n) -> total + n
    exports.dictmap dict, (n) -> n / total

exports.scaleDict = (dict,max=1) ->
    max = _.max dict, (value) -> value
    scale = 1 / max
    exports.dictmap dict, (n) -> n * scale

exports.normalize = (data) ->
    if data.constructor is Array then return exports.normalizeList data
    if data.constructor is Object then return exports.normalizeDict data
    throw "unknown data type, can't normalize"
            
exports.round = (float, n=3) ->
    n = Math.pow(10, n)
    Math.round(float * n) / n

exports.countExtend = (dict1, dict2) ->
    _.map dict2, (value,key) -> if dict1[key] is undefined then dict1[key] = 1 else ++dict1[key]
    dict1

exports.mapToDict = (iterable,callback) ->
    res = {}
    _.map iterable, (element) -> res[callback(element)] = true
    res
    
# convert an array to dict of a form { entry: true, entry2: true }
exports.arrayToDict = (iterable) ->
    res = {}
    _.map iterable, (element) -> res[element] = true
    res

exports.trim = exports.strip = (str, chars) -> exports.ltrim(exports.rtrim(str, chars), chars)

exports.ltrim = (str, chars="\\s") -> 
    str.replace(new RegExp("^[" + chars + "]+", "g"), "")
 
exports.rtrim = (str, chars="\\s") -> 
    str.replace(new RegExp("[" + chars + "]+$", "g"), "")

exports.makePath = (elements...) ->
    "/" + _.map(_.flatten(elements), (element) -> exports.trim element, '\/').join('/')


