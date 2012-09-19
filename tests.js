
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
