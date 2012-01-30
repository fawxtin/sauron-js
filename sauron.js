/*
 * Copyright Fausto Luiz Santin, 2012
 */


/// Meet Sauron

var chaosHash = require('./chaosHash').chaosHash;
var JSON = require('JSON');
var fs = require('fs');

var functionCell = function(context) {
    this.context = context; // shall be {'sauron': this}
    this.cell = [null, ['function (action, x) { return x; }']];

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
	    this.cell[0] = function (y, x) { return fn(y, fn2(y, x)); };
	}
    };
    this.addCode = function(code) {
	this.cell[1].push(code);
    };

    return this;
};

var base = function() {
    this.data = new(chaosHash);
    this.data_fn = new(chaosHash);
    this.say = function(what, answer, promisse) {
	if (!this.data_fn.get(what))
	    this.data_fn.set(what, new functionCell({'sauron': this}));
	if (promisse == true) {
	    this.data_fn.set(what, this.data_fn.get(what).setCell(answer));
	} else {
	    this.data.set(what, this.data_fn.get(what).getFn()('say', answer));
	}
    };

    this.ask = function(what) {
	if (!this.data_fn.get(what))
	    this.data_fn.set(what, new functionCell({'sauron': this}));
	return this.data_fn.get(what).getFn()('ask', this.data.get(what));
    };

    // TODO: load
    this.loadData = function(base, filename) {
	fs.readFile(filename, function (err, fdata) {
			if (err) throw err;
			base.data.copy(JSON.parse(fdata));
		    });
    };

    this.loadDataFn = function(base, filename) {
	fs.readFile(filename, function (err, fdata) {
			if (err) throw err;
			base.data_fn.copy(JSON.parse(fdata));
		    });
    };

    this.saveData = function(base, filename) {
	fs.writeFile(filename, JSON.stringify(base.data.data, null, 4), function (err) {
			 if (err) throw err;
			 console.log('[ info ] saved \'data\' content at: ' + filename);
		     });
    };

    this.saveDataFn = function(base, filename) {
	fs.writeFile(filename, JSON.stringify(base.data_fn.data, null, 4), function (err) {
			 if (err) throw err;
			 console.log('[ info ] saved \'data_fn\' content at: ' + filename);
		     });
    };
};

exports.base = base;
exports.functionCell = functionCell;