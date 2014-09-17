Package.describe({
  summary: "A simple library for making forms reactive."
});

Package.on_use(function (api, where) {
  api.use('schema');
  api.use('underscore');

  api.add_files('forms.js', ['client', 'server']);

  api.export('Form');
});

Package.on_test(function (api) {
  api.use('forms');

  api.use(['schema', 'rules', 'tinytest', 'test-helpers']);

  api.add_files('forms_tests.js', ['client', 'server']);
});
