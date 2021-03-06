var _ = require('underscore')

exports.cb = function(callback) { if (callback) { return callback } else { return function () {} } }

// converts retarded magical arguments object to an Array object
var toArray = exports.toArray = function(arg) { return Array.prototype.slice.call(arg); }

// Takes a date object and returns a string
exports.prettyDate = function(date){
    if (date.constructor != Date) { date = new Date(date) }
    var diff = (((new Date()).getTime() - date.getTime())) / 1000
    var day_diff = Math.floor(Math.abs(diff / 86400))
    if (diff < 0) { day_diff *= -1 }

    if ( isNaN(day_diff) )
        return 'dunno';

    return day_diff == 0 && (
        diff < -7200 && "in " + Math.floor(Math.abs(diff / 3600)) + " hours" ||
            diff < -3600 && "in 1 hour" ||
            diff < -120 && "in " + Math.floor(Math.abs(diff / 60)) + " minutes" ||
            diff < -60 && "in 1 minute" ||
            diff < 60 && "just now" ||
            diff < 120 && "1 minute ago" ||
            diff < 3600 && Math.floor( diff / 60 ) + " minutes ago" ||
            diff < 7200 && "1 hour ago" ||
            diff < 86400 && Math.floor( diff / 3600 ) + " hours ago") ||

        day_diff < -31  && Math.ceil( Math.abs(day_diff / 31) ) + " months ago" ||
        day_diff < -7 && "in " + Math.ceil( day_diff / 7 ) + " weeks" ||
        day_diff < -1 && "in " + day_diff + " days" ||
        day_diff == -1 && "tomorrow at " + date.getHours() + ":" + date.getMinutes() ||
        day_diff == 1 && "yesterday" ||
        day_diff < 7 && day_diff + " days ago" ||
        day_diff < 31 && Math.ceil( day_diff / 7 ) + " weeks ago" ||
        Math.ceil( day_diff / 31 ) + " months ago";

}

// get day by name from a date object
exports.getDay = function (date) {
    var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    return days[date.getDay()]
}
// get day by name from a date object
exports.getShortDay = function (date) {
    return exports.getDay(date).slice(0,3)
}

// takes a size in bytes and returns a string
exports.prettySize = function(bytes) {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return 'n/a';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
};

exports.uuid = exports.generateid = exports.rndid = function (len,chars) {
    if (!len) { len = 20 }
    if (!chars) { chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('') }
    var uuid = []
    charlen = chars.length
    for (var i = 0; i < len; i++) uuid[i] = chars[ 0 | Math.random() * charlen ];
    return uuid.join('')
}


exports.RandomFloat = exports.randomFloat = exports.randrange = function RandomFloat(x) { return Math.random() * x }
exports.RandomInt = exports.randomInt = function RandomInt(x) { return Math.round(exports.RandomFloat(x)) }
exports.RandomBool = exports.randomBool = function RandomBool() { return Boolean(exports.RandomInt(1)) }
exports.RandomSign = exports.randomSign = function RandomSign() { return  (exports.RandomBool()) ? 1 : -1 }
exports.RandomWalk = exports.randomWalk = function RandomWalk(x,step) { return x + (exports.RandomSign() * exports.RandomInt(step))  }
exports.RandomWalkFloat = exports.randomWalkFloat = function RandomWalkFloat(x,step) { return x + (exports.RandomSign() * exports.RandomFloat(step))  }

// select a random object from an array (stuff)
// but it uses getweight function to figure out the probability weights for its selection
// example:
// console.log(helpers.weightedRandom([1,2,3], function(n) { return n }))

exports.weightedRandom = function(stuff,getweight) {

    if (stuff.length == 1) { return _.first(stuff) }

    var weights = exports.normalize(_.map(stuff,getweight))
    var target = Math.random()

    var index = 0
    _.reduce(weights,function (total,n) {
        total += n

        if (total < target) { index = index + 1 }
        return total

    }, 0 )

    return stuff[index]
}


// reverses err and data for a callback...
// used for async.js calls usually when I don't want to exit on error but on data..
exports.reverseCallbackWrap = exports.reverseCb = function (f) {
    return function (err,data) { return f(data,err) }
}

exports.throwToCallback = function (f) {
    return function () {
        args = toArray(arguments)
        callback = args.pop()
        try {
            var ret = f.apply(this,args)
        } catch(err) {
            callback(err); return
        }
        callback(undefined,ret)
    }
}

exports.identity = function (x) { return x }

exports.copy = function (obj) {
    if (obj.constructor == Array) {
        return _.map(obj,exports.identity)
    }

    if (obj.constructor == Object) {
        return _.extend({},obj)
    }

    throw "dunno"
}

exports.capitalize = function (str) { if (str) { return str.charAt(0).toUpperCase() + str.slice(1) } }

// this thing should accept an non iterable object and callback only once..
// try to iterate through an object, call a callback with the object itself if you fail
exports.maybeiterate = exports.maybeIterate = exports.mIter = function (something,callback) {
    if (!something) { callback(); return }

    if ((something.constructor == Array) || (something.constructor == Object)) {
        _.each(something,callback)
        callback();
        return
    }

    if ((typeof(something) == 'object') && something.each && (something.each.constructor == Function)) {
        something.each(callback)
        callback();
        return
    }

    callback(something)
}

exports.hashfilter = function (hash,callback) {
    var ret = {}
    for (property in hash) { var r = callback(hash[property], property); if (r != undefined) { ret[property] = r} }
    return ret
}

// I want find to return value and a key too
exports.find = function (collection,callback) {
    for (i in collection) {
        var ret = callback(collection[i], i)
        if (ret) { return ret }
    }
}

exports.Minute = exports.minute = 1000 * 60
exports.Hour = exports.hour = exports.Minute * 60
exports.Day = exports.day = exports.Hour * 24
exports.Month = exports.month = exports.Day * 30
exports.Year = exports.year = exports.Month * 30
exports.Now = exports.now = function () { return new Date().getTime() }

exports.isEmpty = function (ob){
    for(var i in ob){ return false;}
    return true;
}

exports.makedict = makedict = function (elements,key) {
    dict = {}

    _.map(elements, function (obj) {
        if (key.constructor == String) {
            keyval = obj[key]
        } else {
            keyval = key(obj)
        }

        dict[keyval] = obj
        //dictadd(dict,keyval,obj)

    })
    return dict
}

exports.makelist = function (dict) { return _.flatten(_.values(dict)) }

// Removes a module from the cache
// http://stackoverflow.com/questions/9210542/node-js-require-cache-possible-to-invalidate
require.uncache = function (moduleName) {
    // Run over the cache looking for the files
    // loaded by the specified module name
    searchCache(moduleName, function (mod) { delete require.cache[mod.id] })
}

// Runs over the cache to search for all the cached
searchCache = function (moduleName, callback) {
    // Resolve the module identified by the specified name
    var mod = require.resolve(moduleName);

    // Check if the module has been resolved and found within
    // the cache
    if (mod && ((mod = require.cache[mod]) !== undefined)) {
        // Recursively go over the results
        (function run(mod) {
            // Go over each of the module's children and
            // run over it
            mod.children.forEach(function (child) {
                run(child);
            });

            // Call the specified callback providing the
            // found module
            callback(mod);
        })(mod);
    }
};

// slowly rewriting this thing to coffeescript..
_.extend(exports, require('./coffeepart'))

_.extend(exports, require('./wrappers'))

exports.dCurry = exports.wrap.dCurry
