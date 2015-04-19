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
exports.parallelBucket = parallelBucket = (options) ->
    @n = 0;
    @_done = true
    @data = {} #callback name - data
    @error = null # callback name - error message

    @subs = {} # function name - subscription
    @doneSubs = [] # subscriptions to be called when all function are done with execution
    @callbacks = {} # callback name - number of times called
    
    @

parallelBucket::cb = (name) ->
    @n++; @_done = false
    if not name then name = @n

    @callbacks[name] = 1
    
    (err,data) =>
        if @callbacks[name] > 1 then console.warn "parallelbucket callback '#{ name } called more then once'"
        @callbacks[name] += 1
        if err
            if not @err then @err = {}
            @err[name] = err
        if data then @data[name] = data

        @trigger name, err, data

        --@n or @_done = true and _.map @doneSubs, (sub) => sub(@err,@data)

        return undefined

parallelBucket::trigger = (name,args...) ->
    exports.dictArrayMap @subs, name, (err,sub) => sub.apply @, args
    
parallelBucket::on = (name,callback) ->
    exports.dictpush @subs, name, callback
    if @callbacks[name] > 1 then callback null, @data[name]

parallelBucket::done = (callback) -> if @_done then callback(@err,@data) else @doneSubs.push callback

exports.queue = queue = (options) ->
    _.extend @, { namecounter: 0, n: 0, size: 5, queue: [], doneSubs: [] }, options

queue::push = (name,f,callback) ->
    if name.constructor is Function then f = name and name = @namecounter++ # name is optional
    @queue.push [name, f, callback]
    @start()
        
queue::start = () ->
    popqueue = =>
        if not @queue.length and not @n then return @triggerDone()
        if not @queue.length or @n >= @size then return
            
        @n++
        
        [ name, f ] = @queue.pop()

        f (err,data) =>
            @n--
            if err
                if not @err then @err = {}
                @err[name] = err
                
            if data
                if not @data then @data = {}
                @data[name] = data
                
            popqueue()
            
        popqueue()            

    popqueue()

exports.cbc = cbc = (args...) ->
    if not args.length then return
    if callback = args.shift() then callback.apply @, args

queue::triggerDone = ->
    @_done = true
    _.map @doneSubs, (sub) =>
        cbc sub, @err, @data
    
queue::done = (callback) ->
    @doneSubs.push callback
    if @_done then callback @err, @data
    

# depthfirst search and modify through JSON
depthFirst = (target, clone, callback) ->
    if target.constructor is Object or target.constructor is Array
        for key of target
            @depthfirst target[key], (data) -> if not data then delete target[key] else target[key] = data
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
# --------------------------------------------------

exports.dictpush = (dict,key,value) ->
    if not arr = dict[key] then arr = dict[key] = []
    arr.push value

exports.dictpop = (dict,key,value) ->
    if not arr = dict[key] then return
    if value then exports.remove arr, ret = value else ret = arr.pop()
    if arr.length is 0 then delete dict[key]
    ret

exports.dictArrayMap = (dict,key,callback) ->
    if not dict[key] then return
    if dict[key].constructor isnt Array then callback null, dict[key]
    else _.map dict[key], (val) -> callback null, val

# --------------------------------------------------

exports.delete = (dict,key) ->
    val = dict[key]
    delete dict[key]
    val
    
# previously stupidly named hashfromlist
exports.makeDict = (array,callback) ->
    ret = {}
    _.map array, (elem) ->
        if callback then elem = callback(elem)
        ret[elem] = true
    ret

exports.dictFromArray = (array,cb) ->
    ret = {}
    _.map array, (elem,index) ->
        [key, value] = cb(elem,index)
        if key then ret[key] = value
    ret

exports.dictMap = exports.dictmap = (dict,callback) ->
    if dict.constructor is Array then dict = exports.makeDict dict
    res = {}
    _.map dict, (value,key) ->
        newvalue = callback(value,key)
        if newvalue is undefined then return
        res[key] = newvalue
    res


exports.uniMap = exports.unimap = (something,callback) ->    
    if something.constructor is Array then return _.map something, callback
    if something.constructor is Object then return exports.dictMap something,callback
    return callback(something)


# just reversing setTimeout arguments.. this is more practical for coffeescript
# returns function that canceles setTimeout. that function returns true of false to indicate if cacelation request was executed too late
exports.setTimeout = exports.wait = exports.sleep = exports.delay = (ms,callback) ->
    done = false
    wrappedCallback = -> done = true; callback()
    id = setTimeout wrappedCallback, ms
    (-> if not done then clearTimeout id; return not done)

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
            
exports.round = (x, n=3) ->
    n = Math.pow(10, n)
    Math.round(x * n) / n

exports.countExtend = (dict1, dict2) ->
    _.map dict2, (value,key) -> if dict1[key] is undefined then dict1[key] = 1 else ++dict1[key]
    dict1

# convert an array to dict of a form { entry: true, entry2: true }
exports.arrayToDict = (iterable,callbackVal,callbackKey) ->
    res = {}
    _.map iterable, (element) ->
        if callbackKey then key = callbackKey(element) else key = element
        if callbackVal then res[key] = callbackVal(element) else res[key] = true
    res

exports.trim = exports.strip = (str, chars) -> exports.ltrim(exports.rtrim(str, chars), chars)

exports.ltrim = (str, chars="\\s") ->
    if not str then return ""
    str.replace(new RegExp("^[" + chars + "]+", "g"), "")
 
exports.rtrim = (str, chars="\\s") ->
    if not str then return ""
    str.replace(new RegExp("[" + chars + "]+$", "g"), "")

exports.makePath = exports.path = (elements...) ->
    "/" + _.map(_.flatten(elements), (element) -> exports.trim element, '\/').join('/')

exports.identity = (x) -> x

exports.joinF = (functs...) -> (args...) -> _.map functs, (f) => f.apply @, args

exports.filename = (path) -> path.replace /^.*[\\\/]/, ''

exports.pad = (text,length,chr="0") ->
    if text.constructor isnt String then text = String text
    if text.length >= length then return text
    _.times length - text.length, -> text = chr + text
    text

# http://en.wikipedia.org/wiki/Jaccard_index
exports.jaccardIndex = (set1, set2) ->
    if set1.constructor is Object then set1 = _.keys(set1)
    if set2.constructor is Object then set2 = _.keys(set2)
    _.intersection(set1, set2).length / _.union(set1, set2).length


exports.prettyNumber = (number) ->
    Math.round(number).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")

exports.prettyDateFull = (d) ->
    if d.constructor isnt Date then d = new Date d
    d.getFullYear() + "/" + exports.pad(d.getMonth() + 1,2) + "/" + exports.pad(d.getDate(),2) + " " + helpers.getShortDay(d) + " at " + exports.pad(d.getHours(),2) + ":" + exports.pad(d.getMinutes(),2) + " (" + helpers.prettyDate(d) + ")"


exports.basicTime = (d) ->
    if d.constructor isnt Date then d = new Date(d)
    return exports.pad(d.getHours(),2) + ":" + exports.pad(d.getMinutes(),2) + ":" + exports.pad(d.getSeconds(),2)

exports.Kilo = 1000
exports.Mega = exports.Kilo * 1000
exports.Giga = exports.Mega * 1000


# pythons zip function
exports.zip = (arrays...) ->
    maxLen = _.reduce arrays, ((maxLen, array) -> if array.length > maxLen then array.length else maxLen), 0
    _(maxLen).times (index) -> _.map arrays, (array) -> array[index]

# like map through multiple arrays
exports.squish = (arrays...,callback) ->
    maxLen = _.reduce arrays, ((maxLen, array) -> if array.length > maxLen then array.length else maxLen), 0
    _(maxLen).times (index) -> callback.apply @, _.map arrays, (array) -> array[index]

exports.mapFind = (array,callback) ->
    ret = undefined
    _.find array, (element) -> ret = callback(element)
    ret
    
exports.mapFilter = (array,callback) ->
    ret = []
    _.each array, (x) ->
        res = callback(x)
        if res then ret.push res
    ret

exports.id = id = (x) -> x

exports.difference = (array1, array2, compare1, compare2) ->
    if not compare1 then compare1 = id
    if not compare2 then compare2 = compare1
    a1diff = []
    a2diff = []
    
    a1compare = _.map array1, (x) -> { c: compare1(x), x: x }    
    a2compare = _.map array2, (x) -> { c: compare2(x), x: x }

    #console.log 'a1compare', a1compare
    #console.log 'a2compare', a2compare
    a1intersection = []
    
    _.each a1compare, (x1) ->
        found = _.find a2compare, (x2) -> if x1.c is x2.c then return x2.matched = true
        if not found then return a1diff.push x1.x
        a1intersection.push x1.x
    
    a2diff = exports.mapFilter(a2compare, (x) -> if not x.matched then x.x else false)

    return [ a1intersection, a1diff, a2diff ]
    

exports.objorclass = objorclass = (x,attr) ->
    if typeof(x) is 'object' then x[attr] else x::[attr]


exports.array = (something) ->
    if not something then return []
    if something.constructor isnt Array then [ something ] else something

exports.unshift = (array, elements...) ->
    array.unshift.apply array, elements
    array
    
exports.push = (array, elements...) ->
    array.push.apply array, elements
    array


#
# sometimes when claling defer.resolve,
# I want to resolve to an unresolved promise, not chain.
# this is my dumb hack, why the hell this isn't possible by default?
# 
exports.sneakyPromise = class sneakyPromise
    constructor: (@promise) ->
    gimme: -> @promise

exports.sneaky = (promise) ->
    new exports.sneakyPromise promise

exports.swap = (dict) ->
    res = {}
    _.map dict, (value,key) -> res[value] = key
    res