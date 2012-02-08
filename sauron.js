/*
 * Copyright Fausto Luiz Santin, 2012
 */


/// Meet Sauron

var chaosHash = require('./chaosHash').chaosHash;
var JSON = require('JSON');
var fs = require('fs');

var functionCell = function(context) {
    this.context = context; // shall be {'sauron': this}
    this.cell = [null, ['function (x, action, oldValue) { return x; }']];

    this.getCodes = function() { return this.cell[1]; };
    this.generateFn = function(code) {
	with (context) { 
	    var fn = eval('(' + code + ')'); 
	}
	return fn;
    };
    this.getFn = function() { 
	if (this.cell[0] == null) {
	    var codes = this.getCodes();
	    for (var _i in codes) if (codes.hasOwnProperty(_i)) {
		var code = codes[_i];
		this.setFn(this.generateFn(code));
	    }
	}
	return this.cell[0];
    };
    this.setCell = function (code) {
	this.setFn(this.generateFn(code));
	this.addCode(code);
	return this;
    };
    this.setFn = function (fn) {
	if (this.cell[0] == null)
	    this.cell[0] = fn;
	else {
	    var fn2 = this.getFn();
	    this.cell[0] = function (x, y) { return fn(fn2(x, y), y); };
	}
    };
    this.addCode = function(code) {
	this.cell[1].push(code);
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
		if (Object.prototype.toString.call(data._value) === '[object Object]') { // On saving
		    res._value = data._value.getCodes();
		} else if (Object.prototype.toString.call(data._value) === '[object Array]') { // On loading
		    codes = data._value;
		    res._value = new functionCell({'sauron': this_sauron});
		    for (var _k in codes) if (codes.hasOwnProperty(_k)) {
			if (codes[_k] != 'function (x, action, oldValue) { return x; }')
			    res._value.addCode(codes[_k]);
		    }
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
     * similar to the CLOS concept with before, after and
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
	if (event == true) {
	    this.data_fn.set(what, this.data_fn.get(what).setCell(answer));
	} else {
	    this.data.set(what, this.data_fn.get(what).getFn()(answer, 'say', this.data.get(what)));
	}
    };

    this.dataToJSON() = function () {
	// TODO
    };

    this.dataFnToJSON() = function () {
	// TODO
    };

    this.ask = function(what) {
	if (!this.data_fn.get(what))
	    this.data_fn.set(what, new functionCell({'sauron': this}));
	return this.data_fn.get(what).getFn()(this.data.get(what), 'ask');
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
