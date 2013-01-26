var _ = require('underscore')

// calls function if it exists
exports.cbc = function() { 
    var args = exports.toArray(arguments)
    if (!args.length) { return }
    var callback = args.shift()
    if (callback) { callback.apply(this,args) }
}

exports.cb = function(callback) { if (callback) { return callback } else { return function () {} } }

// converts retarded magical arguments object to an Array object
var toArray = exports.toArray = function(arg) { return Array.prototype.slice.call(arg); }

// Takes a date object and returns a string
exports.prettyDate = function(date){

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


exports.normalize = function(list) {
    var total = _.reduce(list,function(total,n) { return total + n } ,0)
    return _.map(list,function(n) { return n / total })
}


exports.randrange = function (x) {
    return Math.floor(Math.random() * x + 1)
}


exports.random = function(stuff) {
    return stuff[Math.floor(Math.random() * stuff.length)]
}


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

exports.trim = exports.strip = function (str, chars) {
	return exports.ltrim(exports.rtrim(str, chars), chars);
}
 
exports.ltrim = function (str, chars) {
	chars = chars || "\\s";
	return str.replace(new RegExp("^[" + chars + "]+", "g"), "");
}
 
exports.rtrim = function (str, chars) {
	chars = chars || "\\s";
	return str.replace(new RegExp("[" + chars + "]+$", "g"), "");
}

exports.capitalize = function (str) { return str.charAt(0).toUpperCase() + str.slice(1); }

// this thing should accept an non iterable object and callback only once.. 
// try to iterate through an object, call a callback with the object itself if you fail
exports.maybeiterate = function (something,callback) {
    if (!something) { callback(); return }

    if ((something.constructor == Array) || (something.constructor == Object)) {
        _.map(something,callback)
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

// universal map
exports.unimap = function (something,callback) {
    if (something.constructor == Array) { return _.map(something,callback) }
    if (something.constructor == Object) { return exports.hashmap(something,callback) }
    return callback(something)
}

exports.hashfromlist = function (list) {
    ret = {}
    _.map(list, function (elem) { ret[elem] = true })
    return ret
}

// this thing should accept an non iterable object and callback only once.. 
exports.hashmap = function (hash,callback) {
    if (hash.constructor == Array) { hash = exports.hashfromlist(hash) }
    var ret = {}
    for (property in hash) { 
        res = callback(hash[property], property) 
        if (res != undefined) { ret[property] = res }
    }
    return ret
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

exports.Minute = 1000 * 60
exports.Hour = exports.Minute * 60
exports.Day = exports.Hour * 24
exports.Month = exports.Day * 30
exports.Now = function () { return new Date().getTime() }

exports.isEmpty = function (ob){
    for(var i in ob){ return false;}
    return true;
}

// convert an array to dict of a form { entry: true, entry2: true }
// used in order to utilize quick searching through the dict data structure vs the array one
exports.arraytodict = function (array) {
    var ret = {}
    _.map(array, function (x) { ret[x] = true })
    return ret
}


exports.dictadd = dictadd = function (dict,key,value) {
    if (!dict[key]) { dict[key] = [] }
    dict[key].push(value)
}


exports.objorclass = objorclass = function (obj,name) {
    if (obj.constructor == Function) {
        return obj.prototype[name]
    } else {
        return obj[name]
    }
}


exports.makedict = makedict = function (elements,key) {
    dict = {}
    
    _.map(objects, function (obj) {
        if (key.constructor == String) {
            keyval = obj[key]
        } else {
            keyval = key(obj)
        }

        dictadd(dict,keyval,obj)

    })
    return dict
}

exports.makelist = function (dict) { return _.flatten(_.values(dict)) }

// slowly rewriting this thing to js..
coffeepart = require('./coffeepart')
_.extend(exports, coffeepart)

