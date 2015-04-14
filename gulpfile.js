require('shelljs/global');


var argv = require('yargs').argv;
var compass = require('gulp-compass');
var assign = require('object-assign');
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var connect = require('connect');
var cssnext = require('gulp-cssnext');
var del = require('del');
var frontMatter = require('front-matter');
var icons = require("gulp-material-icons");
var sprites = require("gulp-svg-sprites");
var gulp = require('gulp');
var tasks = require("./icons.json");
var gulpIf = require('gulp-if');
var gutil = require('gulp-util');
var he = require('he');
var hljs = require('highlight.js');
var htmlmin = require('gulp-htmlmin');
var jshint = require('gulp-jshint');
var nunjucks = require('nunjucks');
var path = require('path');
var plumber = require('gulp-plumber');
var Remarkable = require('remarkable');
var rename = require('gulp-rename');
var serveStatic = require('serve-static');
var source = require('vinyl-source-stream');
var sourcemaps = require('gulp-sourcemaps');
var through = require('through2');
var uglify = require('gulp-uglify');
var svg2png = require('gulp-svg2png');
var deploy = require('gulp-gh-pages');

gulp.task("icons", function() {
    return icons({tasks: tasks})
        .pipe(sprites())
        .pipe(gulp.dest(path.join(DEST, 'svg')));
});

/**
 * The output directory for all the built files.
 */
const DEST = './build';

/**
 * The name of the Github repo.
 */
const REPO = 'interior';


/**
 * Truthy if NODE_ENV isn't 'dev'
 */
const PROD = process.env.NODE_ENV !== 'dev';


nunjucks.configure('templates', { autoescape: false });


function streamError(err) {
  gutil.beep();
  gutil.log(err instanceof gutil.PluginError ? err.toString() : err.stack);
}


function extractFrontMatter(options) {
  var files = [];
  var site = assign({demos: []}, options);
  return through.obj(
    function transform(file, enc, done) {
      var contents = file.contents.toString();
      var yaml = frontMatter(contents);

      if (yaml.attributes) {
        var slug = path.basename(file.path, path.extname(file.path));

        file.contents = new Buffer(yaml.body);
        file.data = {
          site: site,
          page: assign({slug: slug}, yaml.attributes)
        };

        if (file.path.indexOf('demos') > -1) {
          site.demos.push(file.data.page);
        }
      }

      files.push(file);
      done();
    },
    function flush(done) {
      files.forEach(function(file) { this.push(file); }.bind(this));
      done();
    }
  )
}


function renderMarkdown() {
  var markdown = new Remarkable({
    html: true,
    typographer: true,
    highlight: function (code, lang) {
      // Unescape to avoid double escaping.
      code = he.unescape(code);
      return lang ? hljs.highlight(lang, code).value : he.escape(code);
    }
  });
  return through.obj(function (file, enc, cb) {
    try {
      if (path.extname(file.path) == '.md') {
        file.contents = new Buffer(markdown.render(file.contents.toString()));
      }
      this.push(file);
    }
    catch (err) {
      this.emit('error', new gutil.PluginError('renderMarkdown', err, {
        fileName: file.path
      }));
    }
    cb();
  });
}


function renderTemplate() {
  return through.obj(function (file, enc, cb) {
    try {
      // Render the file's content to the page.content template property.
      var content = file.contents.toString();
      file.data.page.content = nunjucks.renderString(content, file.data);

      // Then render the page in its template.
      var template = file.data.page.template;
      file.contents = new Buffer(nunjucks.render(template, file.data));

      this.push(file);
    }
    catch (err) {
      this.emit('error', new gutil.PluginError('renderTemplate', err, {
        fileName: file.path
      }));
    }
    cb();
  });
}
 

gulp.task('pages', function() {

  var baseData = require('./config.json');
  var overrides = PROD ? {baseUrl: '/' + REPO + '/', env: 'dev'} : {};
  var siteData = assign(baseData, overrides);

  return gulp.src(['*.html', './demos/**/*.html'], {base: process.cwd()})
      .pipe(plumber({errorHandler: streamError}))
      .pipe(extractFrontMatter(siteData))
      .pipe(renderMarkdown())
      .pipe(renderTemplate())
      .pipe(rename(function(path) {
        if (path.basename != 'index' && path.basename != '404') {
          path.dirname += '/' + path.basename;
          path.basename = 'index';
          path.extname = '.html';
        }
      }))
      .pipe(htmlmin({
        removeComments: true,
        collapseWhitespace: true,
        collapseBooleanAttributes: true,
        removeAttributeQuotes: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        minifyJS: true,
        minifyCSS: true
      }))
      .pipe(gulp.dest(DEST));
});


gulp.task('images', function() {
  return gulp.src('./assets/images/**/*')
      .pipe(gulp.dest(path.join(DEST, 'images')));
});


gulp.task('css', function() {
  return gulp.src('./assets/css/main.css')
      .pipe(plumber({errorHandler: streamError}))
      .pipe(cssnext({compress: true}))
      .pipe(gulp.dest(DEST));
});
 
gulp.task('compass', function() {
  gulp.src('./assets/sass/*.scss')
    .pipe(compass({
      css: './assets/css',
      sass: './assets/sass'
    }))
    .pipe(gulp.dest('./assets/css'));
});


gulp.task('lint', function() {
  return gulp.src('./assets/javascript/**/*.js')
      .pipe(plumber({errorHandler: streamError}))
      .pipe(jshint())
      .pipe(jshint.reporter('default'))
      .pipe(gulpIf(PROD, jshint.reporter('fail')))
});


gulp.task('javascript', ['lint'], function() {
  return browserify('./assets/javascript/main.js', {debug: true}).bundle()
      .on('error', streamError)
      .pipe(source('main.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({loadMaps: true}))
      .pipe(gulpIf(PROD, uglify()))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest(DEST));
});

gulp.task('cleanAssets', function(done) {
  del('./assets/css/*.css', done);
});

gulp.task('clean', function(done) {
  del(DEST, done);
});


gulp.task('default', ['icons', 'images', 'css', 'compass', 'javascript', 'pages']);


gulp.task('serve', ['default'], function() {
  var port = argv.port || argv.p || 4000;
  connect().use(serveStatic(DEST)).listen(port);

  gulp.watch('./assets/sass/**/*.scss', ['compass']);
  gulp.watch('./assets/css/**/*.css', ['css']);
  gulp.watch('./assets/images/*', ['images']);
  gulp.watch('./assets/javascript/*', ['javascript']);
  gulp.watch(['*.html', './demos/**/*', './templates/*/*'], ['pages']);
});


gulp.task('deploy',['default'], function () {
  return gulp.src("./build/**/*")
    .pipe(deploy())
});
