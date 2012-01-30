/*
 * Copyright Fausto Luiz Santin, 2012
 */

var fs = require('fs');

// TODO: implement an data._history, to track data history changes


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
		    obj[key]._value = value;
		} else {
		    obj = obj[key];
		    count += 1;
		}
	    }
	    break;
	default:
	    if (!this.data[keys])
		this.data[keys] = {};
	    this.data[keys]._value = value;
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
		    return obj[key]._value;
		} else {
		    obj = obj[key];
		    count += 1;
		}
	    }
	    break;
	default:
	    if (!this.data[keys])
		this.data[keys] = {};
	    return this.data[keys]._value;
	    break;
	}
    };

    this.copy = function(data) {
	this.data = data;
    };
}

exports.chaosHash = chaosHash;