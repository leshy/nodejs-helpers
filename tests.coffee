helpers = require './index.js'
async = require 'async'
_ = require 'underscore'

exports.returnorcallback = (test) -> 
    f1 = (n) -> n + 3
    f2 = (n,callback) -> setTimeout( (-> callback(undefined,n + 4)), 100); return undefined
    
    async.parallel {
        f1: helpers.forceCallbackWrap(f1, 1)
        f2: helpers.forceCallbackWrap(f2, 1)
        }, (err,data) ->
            test.equals err, undefined
            test.deepEqual data, { f1: 4, f2: 5 }
            test.done()
    
                
exports.parallelBucket = (test) ->
    makewaiter = (n) -> (callback) -> setTimeout (-> callback(undefined,100 - n)), n

    bucket = new helpers.parallelBucket()

    makewaiter(50)(bucket.cb())
    makewaiter(60)(bucket.cb())
    makewaiter(70)(bucket.cb('bla'))
    makewaiter(80)(bucket.cb())
    makewaiter(90)(bucket.cb())

    test.equals bucket.n, 5

    bucket.done (err,data) -> console.log(err, data); test.equals bucket.n, 0; test.done()


exports.remove = (test) ->
    a = [ 'bla','blu', 'blo' ]
    helpers.remove a, 'blu'
    test.deepEqual a,  [ 'bla', 'blo' ]

    b = [ 'bla','blu', 'blo' ]
    helpers.remove b, 'hahaha'
    test.deepEqual b,  [ 'bla','blu', 'blo' ]
    test.done()


exports.extend = (test) ->
    test.deepEqual helpers.extend({ bla: { a: 2} }, { bla: { b: 3 }, c: 4}), { bla: { a: 2, b: 3 }, c: 4 }
    test.done()


exports.dictpush = (test) ->
    dict = {}
    helpers.dictpush dict, 'testkey1', 'val1'
    helpers.dictpush dict, 'testkey1', 'val2'
    helpers.dictpush dict, 'testkey1', 'val3'
    helpers.dictpush dict, 'testkey2', 'val4'

    test.deepEqual {"testkey1":["val1","val2","val3"],"testkey2":["val4"]}, dict

    test.equals helpers.dictpop(dict, 'testkey1'), 'val3'
    test.equals helpers.dictpop(dict, 'testkey1', 'val1'), 'val1'
    test.equals helpers.dictpop(dict, 'testkey1'), 'val2'
    test.equals helpers.dictpop(dict, 'testkey2'), 'val4'
    test.equals helpers.dictpop(dict, 'testkey1'), undefined

    test.deepEqual {}, dict
    
    test.done()


exports.round = (test) ->
    test.equals helpers.round(1.12494326), 1.125
    test.done()
    

exports.normalize = (test) ->
    a = [1,2,3]
    test.deepEqual helpers.normalize(a), [ 0.16666666666666666, 0.3333333333333333, 0.5 ]
    test.done()

    