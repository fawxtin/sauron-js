var vows = require('vows'),
    assert = require('assert');

var chaosHash = require('./chaosHash').chaosHash;

var setCHash = function (ch, key, value, continuation) { ch.set(key, value); return continuation(); };

vows.describe('Chaordic JS MultiHashTable').addBatch({
    'Insert Simple Values': {
        topic: new(chaosHash),

        'set "a" as 10': function (ch) {
            assert.equal (setCHash(ch, "a", 10, function() { return ch.get("a"); }), 10);
        },
        'set "a" as 10, and "a" as 20': function (ch) {
            assert.equal (setCHash(ch, "a", 10, 
				   function() { 
				       return setCHash(ch, "a", 20, 
						       function () { return ch.get("a"); }); }), 20);
        },
        'set "a" as 10, and "b" as 20': function (ch) {
            assert.equal (setCHash(ch, "a", 10, 
				   function() { 
				       return setCHash(ch, "b", 20, 
						       function () { return ch.get("b"); }); }), 20);
	    assert.equal (ch.get("a"), 10);
        }
    },
    'Insert Multiple Values': {
        topic: new(chaosHash),

        'set ["a", "b"] as 10': function (ch) {
	    var keys = ["a", "b"];
            assert.equal (setCHash(ch, keys, 10, function() { return ch.get(keys); }), 10);
        }
    },
    'Insert Single and Multiple Values': {
        topic: new(chaosHash),

        'set ["a", "b"] as 10, and "a" as 20': function (ch) {
	    var keys = ["a", "b"];
            assert.equal (setCHash(ch, keys, 10, function() { 
				       return setCHash(ch, "a", 20, function() {
							   return ch.get(keys); }); }), 10);
	    assert.equal (ch.get("a"), 20);
        }
    }

}).export(module);
