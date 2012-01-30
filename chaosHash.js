/*
 * Copyright Fausto Luiz Santin, 2012
 */

var fs = require('fs');


function chaosHash() {
    this.data = {};

    this.set = function (keys, value) {
	switch (Object.prototype.toString.call(keys)) {
	case '[object Array]':
	    var obj = this.data;
	    var count = 1;
	    for (var _i in keys) if (keys.hasOwnProperty(_i)) {
		var key = keys[_i];
		if (!obj[key])
		    obj[key] = {};
		if (count === keys.length) {
		    obj[key].value = value;
		} else {
		    obj = obj[key];
		    count += 1;
		}
	    }
	    break;
	default:
	    if (!this.data[keys])
		this.data[keys] = {};
	    this.data[keys].value = value;
	    break;
	}
    };

    this.get = function(keys) {
	switch (Object.prototype.toString.call(keys)) {
	case '[object Array]':
	    var obj = this.data;
	    var count = 1;
	    for (var _i in keys) if (keys.hasOwnProperty(_i)) {
		var key = keys[_i];
		if (!obj[key])
		    return undefined;
		if (count === keys.length) {
		    return obj[key].value;
		} else {
		    obj = obj[key];
		    count += 1;
		}
	    }
	    break;
	default:
	    if (!this.data[keys])
		this.data[keys] = {};
	    return this.data[keys].value;
	    break;
	}
    };

    this.copy = function(data) {
	this.data = data;
    };
}

exports.chaosHash = chaosHash;