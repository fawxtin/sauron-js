/*
 * Copyright Fausto Luiz Santin, 2012
 */


/// Meet Sauron

var chaosHash = require('./chaosHash').chaosHash;
var JSON = require('JSON');
var fs = require('fs');
var hashish = require('hashish');

var functionCell = function(context) {
    this.context = context; // shall be {'sauron': this}
    this.cell = {fn: {before: null, after: null, primary: null},
		 code: {before: 'function (x, action, value) { return x; }', 
			after: 'function (x, action, value) { return x; }',
			primary: 'function (x, action, value) { return x; }'}};

    this.getCode = function(type) { return this.cell.code[type]; };
    this.generateFn = function(code) {
	with (context) { 
	    var fn = eval('(' + code + ')'); 
	}
	return fn;
    };
    this.getFn = function(type) { 
	if (this.cell.fn[type] == null) {
	    var code = this.getCode(type);
	    this.setFn(type, this.generateFn(code));
	}
	return this.cell.fn[type];
    };
    this.setFn = function (type, fn) {
	this.cell.fn[type] = fn;
    };
    this.setCode = function(type, code) {
	this.cell.code[type] = code;
    };
    this.getCodes = function() {
	return this.cell.code;
    };
    this.setCodes = function(codes) {
	this.cell.code = codes;
    };
    this.setCell = function (type, code) {
	this.setFn(type, this.generateFn(code));
	this.setCode(type, code);
	return this;
    };

    return this;
};

var parse_data_fn = function(this_sauron, data) {
    // TODO: remove cyclic and unneded stuff to be written to disk
    switch (Object.prototype.toString.call(data)) {
    case '[object Object]':
	var res = {};
	for (var _j in data) if (data.hasOwnProperty(_j)) {
	    if (_j === '_value') { // Critic part
		// TODO: redo
		if (data._value.cell != undefined) { // On saving
		    res._value = data._value.getCodes();
		} else { // On loading
		    codes = data._value;
		    res._value = new functionCell({'sauron': this_sauron});
		    res._value.setCodes(codes);
		}
	    } else 
		res[_j] = parse_data_fn(this_sauron, data[_j]);
	}
	return res;
	break;
    case '[object Function]':
	return null;
    default:
	return data_fn;
    }
};

var base = function() {
    /*
     * TODO: apply the concept of one function per cell,
     * similar to the Lisp CLOS concept with before, after and
     * around closures, beyond the primary event which
     * will not be composed. Example:
     * 
     * keys: A, B, C
     * sequence: before-A, before-B, before-C, primary-C, after-A, after-B, after-C
     * 
     * Around uses call-next-method to keep the sequence going, 
     * dont know yet how to implement it properly.
     */
    this.data = new(chaosHash);
    this.data_fn = new(chaosHash);
    this.say = function(what, answer, event) {
	if (!this.data_fn.get(what))
	    this.data_fn.set(what, new functionCell({'sauron': this}));
	if (event) {
	    this.data_fn.set(what, this.data_fn.get(what).setCell(event, answer));
	} else {
	    this.data.set(what, this.data_fn.get(what).getFn('primary')(answer, 'say', this.data.get(what)));
	}
    };

    this.dataToJSON = function () {
	// TODO
    };

    this.dataFnToJSON = function () {
	// TODO
    };

    this.ask = function(what, msg) {
	if (!this.data_fn.get(what))
	    this.data_fn.set(what, new functionCell({'sauron': this}));
	return this.data_fn.get(what).getFn('primary')(this.data.get(what), 'ask', msg);
    };

    // TODO: load
    this.loadData = function(filename, callback) {
	var that = this;
	fs.readFile(filename, function (err, fdata) {
			if (err) throw err;
			that.data.copy(JSON.parse(fdata));
			console.log('[ info ] loading \'data\' content from: ' + filename);
			callback(that);
		    });
    };

    this.loadDataFn = function(filename, callback) {
	var that = this;
	fs.readFile(filename, function (err, fdata) {
			if (err) throw err;
			that.data_fn.copy(parse_data_fn(that, JSON.parse(fdata)));
			console.log('[ info ] loading \'data_fn\' content from: ' + filename);
			callback(that);
		    });
    };

    this.saveData = function(filename, callback) {
	var that = this;
	fs.writeFile(filename, JSON.stringify(that.data.data, null, 4), function (err) {
			 if (err) throw err;
			 console.log('[ info ] saved \'data\' content at: ' + filename);
			 callback(that);
		     });
    };

    this.saveDataFn = function(filename, callback) {
	var that = this;
	fs.writeFile(filename, JSON.stringify(parse_data_fn(that, that.data_fn.data), null, 4), function (err) {
			 if (err) throw err;
			 console.log('[ info ] saved \'data_fn\' content at: ' + filename);
			 callback(that);
		     });
    };
};

exports.base = base;
exports.functionCell = functionCell;
exports.parse_data_fn = parse_data_fn;
