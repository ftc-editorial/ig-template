const fs = require('fs');
var path = require('path');
var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var del = require('del');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var watchify = require('watchify');
var debowerify = require('debowerify');
var babelify = require('babelify');
var cssnext = require('postcss-cssnext');
var $ = require('gulp-load-plugins')();

var config = require('./config.json');
var projectName = path.basename(__dirname);

gulp.task(function mustache() {
  const DEST = '.tmp';

  const options = JSON.parse(fs.readFileSync('model/data.json'));

  options.analytics = false;

  if (process.argv[2] === 'build' || process.argv[2] === 'deploy') {
    options.analytics = true;    
  }

  return gulp.src('views/index.mustache')
    .pipe($.changed(DEST))
    .pipe($.mustache(options, {
      extension: '.html'
    }))
    .pipe(gulp.dest(DEST))
    .pipe(browserSync.stream({once: true}));
});

gulp.task('styles', function styles() {
  const DEST = '.tmp/styles';

  return gulp.src('client/main.scss')
    .pipe($.changed(DEST))
    .pipe($.plumber())
    .pipe($.sourcemaps.init({loadMaps:true}))
    .pipe($.sass({
      outputStyle: 'expanded',
      precision: 10,
      includePaths: ['bower_components']
    }).on('error', $.sass.logError))
    .pipe($.postcss([
      cssnext({
        features: {
          colorRgba: false
        }
      })
    ]))
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest(DEST))
    .pipe(browserSync.stream());
});

gulp.task('scripts', function() {
  var b = browserify({
    entries: 'client/main.js',
    debug: true,
    cache: {},
    packageCache: {},
    transform: [debowerify, babelify],
    plugin: [watchify]
  });

  b.on('update', bundle);
  b.on('log', $.util.log);

  bundle();

  function bundle(ids) {
    $.util.log('Compiling JS...');
    if (ids) {
      console.log('Chnaged Files:\n' + ids);
    }   
    return b.bundle()
      .on('error', function(err) {
        $.util.log(err.message);
        browserSync.notify('Browerify Error!')
        this.emit('end')
      })
      .pipe(source('bundle.js'))
      .pipe(buffer())
      .pipe($.sourcemaps.init({loadMaps: true}))
      .pipe($.sourcemaps.write('./'))
      .pipe(gulp.dest('.tmp/scripts'))
      .pipe(browserSync.stream({once:true}));
  }
});

gulp.task('js', function() {
  const DEST = '.tmp/scripts/';

  var b = browserify({
    entries: 'client/main.js',
    debug: true,
    cache: {},
    packageCache: {},
    transform: [babelify, debowerify]
  });

  return b.bundle()
    .on('error', function(err) {
      $.util.log(err.message);
      this.emit('end')
    })
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe($.sourcemaps.init({loadMaps: true}))
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest(DEST));
});

gulp.task('lint', function() {
  return gulp.src('client/**/*.js')
    .pipe($.eslint({
        extends: 'eslint:recommended',
        globals: {
          'd3': true,
          'ga': true,
          'fa': true
        },
        rules: {
          semi: [2, "always"]
        },
        envs: [
          'browser'
        ]
    }))
    .pipe($.eslint.format())
    .pipe($.eslint.failAfterError());  
});

gulp.task('copyjs', function() {
  return gulp.src('client/scripts/**.js')
    .pipe(gulp.dest('.tmp/scripts'));
});

gulp.task('serve', 
  gulp.parallel(
    'mustache', 'styles', 'scripts', 'copyjs',

    function serve() {
    browserSync.init({
      server: {
        baseDir: ['.tmp', 'client'],
        routes: {
          '/bower_components': 'bower_components'
        }
      }
    });

    gulp.watch('client/**/*.{csv,svg,png,jpg}', browserSync.reload);
    gulp.watch('client/**/*.scss', gulp.parallel('styles'));
    gulp.watch(['views/**/*.mustache', 'model/*.json'], gulp.parallel('mustache'));
    //gulp.watch('client/**/*.js', gulp.parallel('lint'));
  })
);

gulp.task('serve:dist', function() {
  browserSync.init({
    server: {
      baseDir: ['dist'],
      routes: {
        '/bower_components': 'bower_components'
      }
    }
  });
});

/* build */
gulp.task('html', function() {
  return gulp.src('.tmp/index.html')
/*    .pipe($.useref({searchPath: ['.', '.tmp']}))
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', $.cssnano()))*/
    .pipe($.if('*.html', $.htmlReplace(config.static)))
    .pipe($.smoosher())
    .pipe(gulp.dest('dist'));
});

gulp.task('extras', function () {
  return gulp.src('client/**/*.csv', {
    dot: true
  })
  .pipe(gulp.dest('dist'));
});

gulp.task('images', function () {
  return gulp.src('client/images/*.{svg,png,jpg,jpeg,gif}')
    .pipe($.imagemin({
      progressive: true,
      interlaced: true,
      svgoPlugins: [{cleanupIDs: false}]
    }))
    .pipe(gulp.dest('dist/images'));
});


gulp.task('clean', function() {
  return del(['.tmp', 'dist']).then(()=>{
    console.log('.tmp and dist deleted');
  });
});

gulp.task('build', gulp.series('clean', gulp.parallel('mustache', 'styles', 'js', 'images', 'extras'), 'html'));


/**********deploy***********/
gulp.task('deploy:assets', function() {
  return gulp.src(['dist/**/*.{csv,png,jpg,svg}'])
    .pipe(gulp.dest(config.deploy.assets + projectName))
});

gulp.task('deploy:html', function() {
  return gulp.src('dist/index.html')
    .pipe($.prefix(config.prefixUrl + projectName))
    .pipe($.rename({basename: projectName, extname: '.html'}))
    .pipe($.htmlmin({
      removeComments: true,
      collapseWhitespace: true,
      removeAttributeQuotes: true,
      minifyJS: true,
      minifyCSS: true
    }))
    .pipe($.sizereport({
      gzip: true
    }))
    .pipe(gulp.dest(config.deploy.index));
});


gulp.task('deploy', gulp.series('build', gulp.parallel('deploy:assets', 'deploy:html')));
