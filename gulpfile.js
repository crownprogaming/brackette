//run gulp whenever you modify anything in public dir.
var gulp = require('gulp');
var vulcanize = require('gulp-vulcanize');
var minify = require('gulp-minifier');

//For polymer elements.
gulp.task('vulcanize', function() {
  return gulp.src('public/elements/brackette-elements.html')
  .pipe(vulcanize({
	  	stripComments: true,
	    inlineScripts: true,
	    inlineCss: true
  	}))
  .pipe(gulp.dest('dist/elements'));
});

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

//run gulp whenever you modify anything in public dir.
gulp.task('default', ['vulcanize', 'minifyCss', 'minifyJs']);