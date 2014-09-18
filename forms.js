Form = function (schema, value) {
	this.name = schema.name;
	this.value = value;

	if (schema && !(schema instanceof Schema)) {
		schema = new Schema(schema);
	}
	if (schema) {
		this.attachSchema(schema);
	}

	this.dep = new Deps.Dependency();
	this.dep.deps = {};

	this.valueDep = new Deps.Dependency();
	this.valueDep.deps = {};
};

// Form.addHelper = function (helper, childHelper) {

// };

// XXX we need to do more research into the way deps and the new blaze layout
// engine work, we might be able to get away with a single dep which is
// shared by all children.
// one thing we want to avoid is re-running the child/field constructors if
// possible...

// XXX Field and Child constructors should specify
// a property parentInitiallizer which is a constructor
// fn for generating the parent object if it does not 
// exist. (should be Object and Array respectively)

var Field = function (parent, fieldName) {
	console.log('created', fieldName);
	this.name = fieldName;
	this.value = parent.value && parent.value[fieldName];
	this.parent = parent;
	this.parents = [parent].concat(parent.parents || []);

	if (parent.schema) this.attachSchema(parent.schema[fieldName]);

	this.dep = parent.dependency(fieldName);
	this.valueDep = parent.valueDependency(fieldName);

	this.dep.depend();
};

var Child = function (parent, item, index) {
	this.key = item && item._id || index;
	this.index = index;
	this.name = parent.name;
	this.value = parent.value && parent.value[index];
	this.parent = parent;

	this.parents = [parent].concat(parent.parents || []);

	if (parent.schema) this.attachSchema(parent.schema.toItemSchema());

	this.dep = parent.dependency(this.key);
	this.valueDep = parent.valueDependency(this.key);

	this.dep.depend();
};

// Constructors should share prototypes
Field.prototype = Child.prototype = Form.prototype;

// Context helpers
Form.prototype.field = function (fieldName) {
	return new Field(this, fieldName);
};

Form.prototype.values = function () {
	return _.map(this.value, function (child, index) {
		return new Child(this, child, index);
	}, this);
};

// Reactive helpers
Form.prototype.dependency = function (key) {
	if (!this.dep.deps[key]) {
		this.dep.deps[key] = new Deps.Dependency();
		this.dep.deps[key].deps = {};
	}
	return this.dep.deps[key];
};

Form.prototype.valueDependency = function (key) {
	if (!this.valueDep.deps[key]) {
		this.valueDep.deps[key] = new Deps.Dependency();
		this.valueDep.deps[key].deps = {};
	}
	return this.valueDep.deps[key];
};

Form.prototype.set = function (value) {
	this.value = value;

	if (this.parent) {
		this.parent.value[this.index || this.name] = value;
	}

	this.dep.changed();

	// children
	_.each(this.deps, function (a) {
		a.changed();
	});

	// parents

	// calling the parent dependency is probably the right thing to do
	// but has unfortunate implications with regard to re-rendering
	// luckily blaze handles these excessive invalidations smoothely, but
	// it would be nice to avoid having dependencies in the Field and Child
	// constructors.

	// an alternative would be to move the dependency chaining to the get
	// function (send dependencies down the chain instead of sending
	// invalidations up the chain.)

	_.each(this.parents, function (a) {
		a.valueDep.changed();
	});
};

Form.prototype.get = function () {
	this.dep.depend();
	this.valueDep.depend();
	return this.value;
};

Form.prototype.attachSchema = function (schema) {
	this._schemaInstance = schema;
	_.defaults(this, schema);
};

// Validation helpers
Form.prototype.errors = function () {
	this.dep.depend();
	return this._schemaInstance && this._schemaInstance.errors(this.value, this);
};

Form.prototype.valid = function () {
	this.dep.depend();
	return this._schemaInstance && this._schemaInstance.match(this.value, this);
};

Form.prototype.check = function () {
	this.dep.depend();
	return this._schemaInstance && this._schemaInstance.check(this.value, this);
};
