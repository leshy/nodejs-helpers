helpers = h = require './index.js'
async = require 'async'
_ = require 'underscore'
p = require 'bluebird'
ph = require './promise'

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

exports.queue = (test) ->
    queue = new helpers.queue size: 3
    triggered = {}
    
    testf = (name,time,err,data) -> (callback) ->
        console.log "f #{name} starting"
        helpers.wait time, ->
            console.log "f #{name} done"
            triggered[name] = true; callback err, data

    queue.push 'f1', testf('f1', 100, null, 'data1')
    queue.push 'f2', testf('f2', 100, null, 'data2')
    queue.push 'f3', testf('f3', 100, 'error3', 'data3')
    queue.push 'f4', testf('f4', 100, null, 'data4')
    queue.push 'f5', testf('f5', 100, null, 'data5')
    
    queue.done (err,data) ->
        test.done()
            
                
exports.parallelBucket = (test) ->
    makewaiter = (n) -> (callback) -> setTimeout (-> callback(undefined,100 - n)), n

    bucket = new helpers.parallelBucket()

    makewaiter(50)(bucket.cb())
    makewaiter(60)(bucket.cb())
    makewaiter(70)(bucket.cb('bla'))
    makewaiter(80)(bucket.cb())
    makewaiter(90)(bucket.cb())

    specificsub = 0
    
    bucket.on 'bla', (err,data) -> specificsub += 1

    test.equals bucket.n, 5

    bucket.done (err,data) ->
        console.log(err, data);
        test.equals bucket.n, 0;
        test.equals specificsub, 1
        bucket.on 'bla', (err,data) -> test.done()


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

exports.normalizeList = (test) ->
    a = [1,2,3]
    test.deepEqual helpers.normalize(a), [ 0.16666666666666666, 0.3333333333333333, 0.5 ]
    test.done()

exports.dictmap = (test) ->
    test.deepEqual helpers.dictmap({ bla: 1, x: 2, k: 3 }, (n) -> ++n), { bla: 2, x: 3, k: 4 }
    test.done()

exports.normalizeDict = (test) ->
    test.deepEqual helpers.normalize({ bla: 1, x: 2, k: 3 }), { bla: 0.16666666666666666, x: 0.3333333333333333, k: 0.5 }
    test.done()

exports.pad = (test) ->
    test.equals helpers.pad("bla",5,"X"), "XXbla"
    test.done()


exports.zip = (test) ->
    a = [1,2,3,4]
    b = ['a','b','c']
    test.deepEqual helpers.zip(a,b), [ [ 1, 'a' ], [ 2, 'b' ], [ 3, 'c' ], [ 4, undefined ] ]
    test.done()

exports.squish = (test) ->
    a = [1,2,3,4]
    b = [8,5,1,1]
    test.deepEqual helpers.squish( a, b, (a,b) -> a+b), [ 9, 7, 4, 5 ]
    test.done()

exports.mapFind = (test) ->
    a = [1,2,3,4]
    test.equal helpers.mapFind(a, (e) -> if e is 3 then "a" else false), "a"
    test.done()

exports.difference = (test) ->
    a = ["bla", "faf", "bx", "gla"]
    b = ["gog", "laa", "xa", "faq"]

    [adiff, bdiff ] = helpers.difference a, b, ((x) -> x + "a"), ((x) -> "b" + x)
    console.log a
    console.log b
    console.log [adiff, bdiff ]
    test.done()


exports.once = (test) ->
  cnt = 0
  cbcnt = 0

  testf = (callback) ->
    h.wait 100, ->
      cnt += 1
      callback undefined
    return 'x'

  testfd = h.wrap.once testf

  testcb = (err,data) ->
      cbcnt += 1
      if cbcnt is 3
        test.done!

  test.equals testfd(testcb), 'x'
  h.wait 10, -> test.equals testfd(testcb), 'x'
  h.wait 50, -> test.equals testfd(testcb), 'x'
  h.wait 150, -> test.equals testfd(testcb), 'x'


exports.dCurry = (test) ->
  bla = (options, x, y) ->
    return [ options, x, y ]

  bla1 = h.dCurry bla, test1: 8, bla: 'bla', a: 3
  bla2 = h.dCurry bla1, test1: 0, bla: 'xx', b: 5

  ret = bla2({ la: 3, test1: 9 }, 1,2)
  test.deepEqual ret, [ { test1: 9, bla: 'xx', a: 3, b: 5, la: 3 }, 1, 2]
  test.done()


exports.dCurryPlusCurry = (test) ->
  bla = (options, x, y) --> return [ options, x, y ]

  bla1 = h.dCurry bla, test1: 8, bla: 'bla', a: 3
  bla2 = h.dCurry bla1, test1: 0, bla: 'xx', b: 5

  ret = bla2 { la: 3, test1: 9 }, 1 2 # test without curry
  test.deepEqual ret, [ { test1: 9, bla: 'xx', a: 3, b: 5, la: 3 }, 1, 2]

  # test with curry
  bla3 = bla2 { la: 3, test1: 9 }
  bla4 = bla3 1
  ret = bla4 2
  test.deepEqual ret, [ { test1: 9, bla: 'xx', a: 3, b: 5, la: 3 }, 1, 2]


  test.done()


exports.promiseRetry = (test) ->
  counter = 0
  testF = (target) -> -> new p (resolve,reject) ~>
    counter := counter + 1
    if counter is target then resolve "done " + counter
    else reject "error " + counter

  res = {} 
  ph.retry( { delay: 5, times: 5 }, testF(3)).then (data) ->
    test.equals data, "done 3"
    counter := 0
    ph.retry( { delay: 5, times: 2 }, testF(3)).catch (data) ->
      test.equals data, "error 2"
      test.done()
