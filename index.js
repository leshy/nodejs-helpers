var _ = require('underscore')

// calls function if it exists
exports.cb = function() { 
    var args = exports.toArray(arguments)
    if (!args.length) { return }
    var callback = args.shift()
    if (callback) { callback.apply(this,args) }
}

// converts retarded magical arguments object to an Array object
exports.toArray = function(arg) { return Array.prototype.slice.call(arg); }

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




var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split(''); 

exports.uuid = function (len) { 
    if (!len) { len = 20 }
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
exports.returnOrCallback = function (f,callback) { 
    var returned = false
    var ret = f(function (err,data) { 
        if (returned) { throw "got return value but also callback was called"; return }
        callback(err,data)
    })
    if (ret != undefined) { returned = true; callback(undefined,ret) }
}


// converts an blocking or async function to an async function
exports.returnOrCallbackPack = function (f) {  
    return function (callback) { exports.returnOrCallback(f,callback) }
}
