var gulp = require('gulp');
var vulcanize = require('gulp-vulcanize');
var minify = require('gulp-minifier');

//For our polymer elements.
gulp.task('vulcanize', function() {
  return gulp.src('public/elements/brackette-elements.html')
  .pipe(vulcanize({
	  	stripComments: true,
	    inlineScripts: true,
	    inlineCss: true
  	}))
  .pipe(gulp.dest('dist/elements'));
});

/*
gulp.task('minifyJs', function(){
	return gulp.src([ 
		'bower_components/jquery/dist/jquery.min.js',
		'bower_components/bootstrap/dist/js/bootstrap.min.js',
		'bower_components/bootstrap-validator/dist/validator.min.js',
		'bower_components/webcomponentsjs/webcomponents-lite.js',
		'public/js/brackette.js'])
	.pipe(concat('brackette.js'))
	.pipe(gulp.dest('dist/js'))
});
*/

//minify custom css files
gulp.task('minifyCss', function(){
	return gulp.src(['public/css/style.css'])
	.pipe(minify({
		minify: true,
		    collapseWhitespace: true,
      		conservativeCollapse: false,
      		minifyCSS: true,
      		minifyJS: false
		}))
	.pipe(gulp.dest('dist/css'))
});

gulp.task('minifyJs', function(){
	return gulp.src(['public/js/brackette.js'])
	.pipe(minify({
		minify: true,
		    collapseWhitespace: true,
      		conservativeCollapse: false,
      		minifyCSS: false,
      		minifyJS: true
		}))
	.pipe(gulp.dest('dist/js'))
});

gulp.task('default', ['vulcanize', 'minifyCss', 'minifyJs']);