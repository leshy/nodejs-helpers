require! {
  underscore: _
  './index': h
  bluebird: p
}

exports.retry = (o,f) -> new p (resolve,reject) ~>
    dO = do
      times: 10
      delay: 100
      delayf: void # (x) -> (x * 2)

    if o@@ is Function then f := o; o := {}
    o := _.extend dO, o

    tryAgain = -> 
      f()
        .then -> resolve it
        .catch ->
          o.times -= 1
          if o.times
            h.wait o.delay, tryAgain
            if o.delayf? then o.delay = o.delayf(o.delay)
              
          else reject it

    tryAgain!
  
exports.queue = (o) ->
  dO = do
    size: 1

  o = _.extend dO, o
  queue = []
  activeJobs = 0
  
  work = ->
    if activeJobs is o.size then return
    if not queue.length then return

    job = _.first @queue
    
    job()
      .finally ~>
        queue.shift!   # remove from queue (what about error handling?)
        activeJobs := activeJobs - 1
        work!
      
  return push = (job) ->
    queue.push job
    work!
    
