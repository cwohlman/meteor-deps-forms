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
};

var Field = function (parent, fieldName) {
	this.name = fieldName;
	this.value = parent.value && parent.value[fieldName];
	this.parent = parent;

	if (parent.schema) this.attachSchema(parent.schema[fieldName]);

	this.dep = parent.dependency(fieldName);

	this.dep.depend();
};

var Child = function (parent, item, index) {
	this.key = item && item._id || index;
	this.index = index;
	this.name = parent.name;
	this.value = parent.value && parent.value[index];
	this.parent = parent;
	
	if (parent.schema) this.attachSchema(parent.schema.toItemSchema());

	this.dep = parent.dependency(this.key);

	this.dep.depend();
};

// Constructors should share prototypes
Field.prototype = Child.prototype = Form.prototype;

// Context helpers
Form.prototype.field = function (fieldName) {
	return new Field(this, fieldName);
};

Form.prototype.children = function () {
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

Form.prototype.set = function (value) {
	this.value = value;

	if (this.parent) {
		this.parent.value[this.index || this.name] = value;
	}

	this.dep.changed();
	_.each(this.deps, function (a) {
		a.changed();
	});
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
