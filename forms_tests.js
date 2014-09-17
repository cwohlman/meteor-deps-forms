Tinytest.add('Forms - acts like a rule', function (test) {
	var form = new Form({
		name: 'person'
		, schema: {
			name: _.isString
		}
	}, {
		name: 'sam'
	});

	test.isTrue(form.valid());

	form.value.name = 0;

	test.isFalse(form.valid());
	test.throws(function () {
		form.check();
	}, 'person name is invalid');
	test.equal(form.errors()[0].message, 'person name is invalid');
});

Tinytest.add('Forms - basic api', function (test) {
	var form = new Form({
		name: 'person'
		, schema: {
			name: _.isString
		}
	}, {
		name: 'sam'
		, children: [
			{
				name: 'joe'
			}
		]
	});

	test.equal(form.field('name').value, 'sam');
	test.equal(form.field('children').value.length, 1);
	test.equal(form.field('children').children()[0].value.name, 'joe');
	test.equal(form.field('children').children()[0].field('name').value, 'joe');
});

Tinytest.add('Forms - reactive api', function (test) {
	var form = new Form({
		name: 'person'
		, schema: {
			name: _.isString
		}
	}, {
		name: 'sam'
		, children: [
			{
				name: 'joe'
			}
		]
	});

	var autoRunCount = 0;

	var nextValue = 'sam';

	var comp = Deps.autorun(function () {
		test.equal(form.field('name').value, nextValue);
		autoRunCount++;
	});

	Deps.flush();

	nextValue = 'joseph';
	form.field('name').set(nextValue);

	Deps.flush(); comp.stop();

	nextValue = 1;

	comp = Deps.autorun(function () {
		test.equal(form.field('children').value.length, nextValue);
		autoRunCount++;
	});

	Deps.flush();

	form.value.children.push({
		name: 'joey'
	});

	nextValue = 2;

	form.field('children').set([].concat(form.value.children));

	Deps.flush(); comp.stop();

	nextValue = 'joey';

	comp = Deps.autorun(function () {
		test.equal(form.field('children').children()[1].field('name').value, nextValue);
		autoRunCount++;
	});

	Deps.flush();

	nextValue = 'sammy';

	form.field('children').children()[1].field('name').set('sammy');

	Deps.flush(); comp.stop();

	test.equal(autoRunCount, 6);
});

Tinytest.add('Forms - schema properties are available', function (test) {
	var form = new Form({
		name: 'person'
		, notes: 'notes'
		, schema: {
			name: _.isString
			, children: {
				schema: {
					name: _.isString
				}
				, asdf: 'gibberish'
			}
		}
	}, {
		name: 'sam'
		, children: [
			{
				name: 'joe'
			}
		]
	});

	test.equal(form.notes, 'notes');
	test.equal(form.field('children').asdf, 'gibberish');
});

Tinytest.add('Forms - schema works with dictionaries', function (test) {
	var form = new Form({
		name: 'person'
		, schema: {
			name: _.isString
		}
	}, {
		name: 'sam'
		, children: {
			joe: {
				name: 'joe'
			}
		}
	});

	test.equal(form.field('name').value, 'sam');
	test.equal(form.field('children').children().length, 1);
	test.equal(form.field('children').children()[0].value.name, 'joe');
	test.equal(form.field('children').children()[0].index, 'joe');
	test.equal(form.field('children').children()[0].field('name').value, 'joe');
});