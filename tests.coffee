helpers = require './index.js'
async = require 'async'

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
    makewaiter = (n) -> (callback) -> setTimeout callback, n

    bucket = new helpers.parallelBucket()

    makewaiter(50)(bucket.cb())
    makewaiter(60)(bucket.cb())
    makewaiter(70)(bucket.cb())
    makewaiter(80)(bucket.cb())
    makewaiter(90)(bucket.cb())

    test.equals bucket.n, 5

    bucket.done -> test.equals bucket.n, 0; test.done()
