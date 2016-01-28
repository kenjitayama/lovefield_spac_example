'use strict';

var gulp = require('gulp');
var execSync = require('child_process').execSync;

gulp.task('lovefield:spac', function(callback) {

  execSync('node devlib/lovefield/spac/lovefield-spac ' +
    '--schema resources/lovefield-spac/appSchema.yaml ' +
    '--namespace appdb ' +
    '--outputdir resources/lovefield-spac/output'
  );
  callback();
});

gulp.task('lovefield:closure', function(callback) {

  execSync('java ' +
    '-jar node_modules/google-closure-compiler/compiler.jar ' +
    '--language_in=ECMASCRIPT5 ' +
    '--only_closure_dependencies ' +
    '--closure_entry_point="appdb" ' +
    '--js="devlib/closure-library/closure/goog" ' +
    '--js="!devlib/closure-library/closure/goog/**_test.js" ' +
    '--js="devlib/lovefield/lib" ' +
    '--js="resources/lovefield-spac/output/appdb_gen.js" ' +
    '--js_output_file="appdb.js"'
  );
  callback();
});

gulp.task('default', ['lovefield:spac', 'lovefield:closure']);
