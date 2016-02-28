// var co = require('co');
var path = require('path');
var test = require('tape').test;
var utils = require('../lib/utils');
var join = path.join;

var fixtures = join(process.cwd(), 'test', 'fixtures', 'utils');

function asyncFunc(value, handler) {
	setTimeout(function () {
		return (handler(undefined, value));
	}, 100);
}

function asyncFuncWithOptions(value, options, handler) {
	setTimeout(function () {
		return (handler(undefined, value));
	}, options.time);
}

test('fly utilities ✈', function (t) {
	t.ok(utils !== undefined, 'it\'s real');

	['bind', 'defer', 'find', 'log', 'error', 'alert', 'stamp', 'trace']
		.forEach(function (prop) {
			t.ok(utils[prop] !== undefined, prop + ' is defined');
		});
	t.end();
});

test('utils.defer (asyncFunc) ✈', function (t) {
	t.plan(1);
	utils.defer(asyncFunc)(42).then(function (value) {
		t.equal(value, 42, 'promisifies an async func');
	});
});

test('utils.defer (asyncFunc /w options) ✈', function (t) {
	t.plan(1);
	utils.defer(asyncFuncWithOptions)(1985, {time: 100}).then(function (value) {
		t.equal(value, 1985, 'promisifies an async func w/ options');
	});
});

test('utils.find (flyfile) ✈', function (t) {
	t.plan(4);

	var name = 'flyfile.js';
	var full = join(fixtures, name);

	utils.find(name, fixtures).then(function (fp) {
		t.ok(fp !== undefined, 'finds a flyfile, given a directory');
		t.equal(fp, full, 'finds the right one!');
	});

	utils.find(full).then(function (fp) {
		var f = fp.substr(1); // find-up PR -- remove preceding `/` from `//Users/...`
		t.equal(f, full, 'finds a flyfile, given a filepath');
	});

	var dir = join(fixtures, 'one'); // test dir
	utils.find(name, dir).then(function (fp) {
		t.equal(fp, full, 'finds a flyfile, traversing upwards');
	});
});

test('utils.read', function (t) {
	var fp = join(fixtures, 'a.js');
	utils.read(fp).then(function (data) {
		t.equal(data, 'const pi = 3.14\n', 'reads a file\'s contents');
		t.end();
	});
});

test('utils.write', function (t) {
	var fp = join(fixtures, 'test.js');
	var data = 'hello';

	utils.write(fp, data).then(function () {
		return utils.find(fp).then(function (f) {
			t.true(f !== undefined, 'file was created');

			return utils.read(fp).then(function (d) {
				t.deepEqual(d, data, 'file had data');
				t.end();
			});
		});
	});
});

// test('utils.bind (module) ✈', function (t) {
// 	const coffee = require(
// 		utils.bind(join(process.cwd(), './utils/sample.coffee'))
// 	)
// 	t.equal(coffee.getSecret(), 42, 'binds to coffee-script')

// 	// const babel = require(
// 	//   utils.bind(join(process.cwd(), "./utils/sample.babel.js"))
// 	// )
// 	// t.equal(babel.getSecret(), 42, "binds to babel")

// 	t.end()
// })
