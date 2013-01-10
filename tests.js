
var helpers = require('./index.js')
var async = require('async')

//console.log(helpers.weightedRandom([1,2,3], function(n) { return n }))

exports.returnorcallback = function(test){

    var test1 = function (callback) { setTimeout(function () {callback(undefined,2)}, 100) }
    var test2 = function () { return 3 }    
    
    async.parallel({
        f1: helpers.forceCallbackWrap(test1),
        f2: helpers.forceCallbackWrap(test2)
    }, function (err,data) {
        test.done()
    })
}


exports.parallelbucket = function (test) {
    
    function makewaiter (n) {
        return function (callback) { setTimeout(callback,n) }
    }
    
    var bucket = new helpers.parallelbucket()

    makewaiter(50)(bucket.cb())
    makewaiter(60)(bucket.cb())
    makewaiter(70)(bucket.cb())
    makewaiter(80)(bucket.cb())
    makewaiter(90)(bucket.cb())

    test.equals(bucket.n, 5)

    bucket.ondone( function() { test.done() } )

}
