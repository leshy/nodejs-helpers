var _ = require('underscore')

// calls function if it exists
exports.cb = function() { 
    var args = exports.toArray(arguments)
    if (!args.length) { return }
    var callback = args.shift()
    if (callback) { callback.apply(this,args) }
}

exports.cbc = function(callback) { 
    if (callback) { return callback } else { return function () {} }
}

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


// receives a function and calls the callback with its returned values, regardless if the function is blocking or async
exports.forceCallback = function (f,callback) { 
    var returned = false
    
    try {
        var ret = f(function (err,data) { 
            if (returned) { throw "got return value but also callback was called"; return }
            callback(err,data)
        })
    } catch (err) {
        callback(err,undefined)
        return
    }
    
    if (ret != undefined) { returned = true; callback(undefined,ret) }
}


// converts an blocking or async function to an async function
exports.forceCallbackWrap = function (f) {  
    return function (callback) { exports.forceCallback(f,callback) }
}

// reverses err and data for a callback...
// used for async.js calls usually when I don't want to exit on error but on data..
exports.reverseCallbackWrap = function (f) {
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
    } else {
        throw "dunno"
    }
}

exports.trim = function (str, chars) {
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

exports.maybeiterate = function (something,callback) {
    if (!something) { callback(); return }

    if ((something.constructor == Array) || (something.constructor == Object)) {
        _.map(something,callback)
        return
    }

    if ((typeof(something) == 'object') && something.each && (something.each.constructor == Function)) {
        something.each(callback)
        return
    }

    callback(something)
}

exports.unimap = function (something,callback) {
    if (something.constructor == Array) { return _.map(something,callback) }
    if (something.constructor == Object) { return exports.hashmap(something,callback) }
    return callback(something)
}

exports.hashmap = function (hash,callback) {
    var ret = {}
    for (property in hash) { ret[property] = callback(hash[property], property) }
    return ret
}

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

// I want my push to return the resulting array..
exports.push = function () {
    var args = exports.toArray(arguments)
    var array = args.shift()
    array.push.apply(array,args)
}
