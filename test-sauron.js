var vows = require('vows'),
    assert = require('assert');

var sauron = require('./sauron');

vows.describe('The Eye Who Sees Everything').addBatch({
    'A Simple Request': {
        topic: new(sauron.base),

        'red is red': function (base) {
	    base.say('red', 'red');
            assert.equal (base.ask('red'), 'red');
        },
        'green is blue': function (base) {
	    base.say('green', 'blue');
            assert.equal (base.ask('green'), 'blue');
        },
        'empty key is undefined': function (base) {
            assert.equal (base.ask('lalala'), undefined);
        },
        'one size list key is the same as just key': function (base) {
	    base.say(['one-key'], 'lala');
	    base.say('one-key', 'lele');
            assert.equal (base.ask('one-key'), 'lele');
            assert.equal (base.ask(['one-key']), 'lele');
        }

    },
    'A Simple Promisse': {
        topic: new(sauron.base),

        'if red is red, red is blue': function (base) {
	    base.say('red', 'red');
	    base.say('red', 'function anon_fn(y, x) { if ((y == \'ask\') && (x == \'red\')) { return \'blue\'; } else { return x; } }', true);
            assert.equal (base.ask('red'), 'blue');
        }
    },
    'A Multiple Request': {
        topic: new(sauron.base),

        '"fruit" and "red" is an "apple"': function (base) {
	    base.say(['fruit', 'red'], 'apple');
            assert.equal (base.ask(['fruit', 'red']), 'apple');
        },
        '"fruit", "sweet" and "red" is a "strawberry", and "fruit", "sweet" is an "apple"': function (base) {
	    base.say(['fruit', 'sweet', 'red'], 'strawberry');
	    base.say(['fruit', 'sweet'], 'apple');
            assert.equal (base.ask(['fruit', 'sweet']), 'apple');
            assert.equal (base.ask(['fruit', 'sweet', 'red']), 'strawberry');
        }
    },
    'A Multiple Promisse': {
        topic: new(sauron.base),

        '"fruit" and "red", set "apple", but promisse returning "coconut" if its an apple': function (base) {
	    base.say(['fruit', 'red'], 'apple');
	    base.say(['fruit', 'red'], 'function anon_fn(y, x) { if (x === \'apple\') { return \'coconut\'; } else { return x; } }', true);
            assert.equal (base.ask(['fruit', 'red']), 'coconut');
        }
    },
    'A Simple Comunication Promisse case': {
        topic: new(sauron.base),

        'when asked for "Osvaldo", let "Taylor" know about it': function (base) {
    	    base.say(['osvaldo'], 'function anon_fn(y, x) { sauron.say(["taylor", "about", "osvaldo"], "ok"); }', true);
	    assert.equal (base.ask(['taylor', 'about', 'osvaldo'], undefined));
	    base.ask(['osvaldo']);
	    assert.equal (base.ask(['taylor', 'about', 'osvaldo']), 'ok');
        }
    },
    'A Message Comunication Promisse case': {
        topic: new(sauron.base),

        'when asked for "orange", let "Manuel" know who wants and how many': function (base) {
    	    base.say(['fruits', 'orange'], 
		     'function anon_fn(action, x) { '
		     + 'var value = (function (who_needs) {'
		     + '    if (who_needs) '
		     + '        return who_needs + \',\' + x; '
		     + '    else '
		     + '        return x;})(sauron.ask(["fruits", "Manuel", "orange"]));'
		     + 'sauron.say(["fruits", "Manuel", "orange"], value); '
		     + 'return value;}', 
		     true);
	    assert.equal (base.ask(['fruits', 'Manuel', 'orange']), undefined);
	    base.say(['fruits', 'orange'], '(jack, 5)');
	    assert.equal (base.ask(['fruits', 'Manuel', 'orange']), '(jack, 5)');
	    base.say(['fruits', 'orange'], '(cyntia, 3)');
	    assert.equal (base.ask(['fruits', 'Manuel', 'orange']), '(jack, 5),(cyntia, 3)');
        }
    }

}).export(module);
