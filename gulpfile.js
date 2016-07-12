const fs = require('fs');
const path = require('path');
const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const del = require('del');
const cssnext = require('postcss-cssnext');
const $ = require('gulp-load-plugins')();
const minimist = require('minimist');
const webpackStream = require('webpack-stream');
const merge = require('merge-stream');
const webpackConfig = require('./webpack.config.js');
process.env.NODE_ENV = 'development';

const config = require('./config.json');

const knownOptions = {
  string: 'input',
  default: {input: 'example.json'},
  alias: {i: 'input'}
};

const argv = minimist(process.argv.slice(2), knownOptions);

const taskName = argv._[0];
const articleDataFile = path.resolve(__dirname, 'data', argv.i);
const footerDataFile = path.resolve(__dirname, 'data', 'footer.json');
const projectName = path.basename(argv.i, '.json');

function readFilePromisified(filename) {
  return new Promise(
    function(resolve, reject) {
      fs.readFile(filename, 'utf8', function(err, data) {
        if (err) {
          console.log('Cannot find file: ' + filename);
          reject(err);
        } else {
          resolve(data);
        }
      });
    }
  );
}

gulp.task('mustache', function () {
  const DEST = '.tmp';

  var analytics = false;

  if (process.env.NODE_ENV === 'production') {
    analytics = true;
  }

  const dataFiles = [articleDataFile, footerDataFile];
  const promisedData = dataFiles.map(readFilePromisified);

  return gulp.src('./views/index.mustache')
    .pipe($.data(function(file) {
      return Promise.all(promisedData)
        .then(function(value) {
           const contents = value.map(JSON.parse);
           return {
            analytics: analytics,
            article: contents[0],
            footer: contents[1]
           };
        });
    }))   
    .pipe($.mustache({}, {
      extension: '.html'
    }))
    .pipe($.size({
      gzip: true,
      showFiles: true
    })) 
    .pipe(gulp.dest(DEST))
    .pipe(browserSync.stream({once:true}));
});

gulp.task('styles', function styles() {
  const DEST = '.tmp/styles';

  return gulp.src('client/scss/main.scss')
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
    .pipe($.size({
      gzip: true,
      showFiles: true
    }))
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest(DEST))
    .pipe(browserSync.stream({once:true}));
});

gulp.task('scripts', function() {
  const DEST = '.tmp/scripts/';

  if (process.env.NODE_ENV === 'production') {
    webpackConfig.watch = false;
  }
  
  return gulp.src('client/js/main.js')
    .pipe(webpackStream(webpackConfig, null, function(err, stats) {
      $.util.log(stats.toString({
          colors: $.util.colors.supportsColor,
          chunks: false,
          hash: false,
          version: false
      }));
      browserSync.reload();
    }))
    .on('error', $.util.log) 
    .pipe(gulp.dest(DEST));
});


gulp.task('serve', 
  gulp.parallel(
    'mustache', 'styles', 'scripts', 

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
    gulp.watch('client/scss/**/**/*.scss', gulp.parallel('styles'));
    gulp.watch(['views/**/**/*.mustache', 'data/*.json'], gulp.parallel('mustache'));
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
    // .pipe($.useref({searchPath: ['.', '.tmp']}))
    // .pipe($.if('*.js', $.uglify()))
    // .pipe($.if('*.css', $.cssnano()))
    // .pipe($.if('*.html', $.htmlReplace(config.static)))
    .pipe($.htmlReplace(config.static))
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

// Set NODE_ENV according to dirrent task run.
// Any easy way to set it?
gulp.task('dev', function() {
  return Promise.resolve(process.env.NODE_ENV = 'development')
    .then(function(value) {
      console.log('NODE_ENV: ' + process.env.NODE_ENV);
    });
});

gulp.task('prod', function() {
  return Promise.resolve(process.env.NODE_ENV = 'production')
    .then(function(value) {
      console.log('NODE_ENV: ' + process.env.NODE_ENV);
    });
});

gulp.task('build', gulp.series('prod', 'clean', gulp.parallel('mustache', 'styles', 'scripts', 'images', 'extras'), 'html', 'dev'));


/**********deploy***********/
gulp.task('deploy:assets', function() {
  return gulp.src(['dist/**/*.{csv,png,jpg,svg}'])
    .pipe(gulp.dest(config.assets + projectName))
});

gulp.task('deploy:html', function() {
  return gulp.src('dist/index.html')
    .pipe($.prefix(config.prefixUrl + projectName))
    .pipe($.rename({
      basename: projectName, 
      extname: '.html'
    }))
    .pipe($.htmlmin({
      removeComments: true,
      collapseWhitespace: true,
      removeAttributeQuotes: true,
      minifyJS: true,
      minifyCSS: true
    }))
    .pipe($.size({
      gzip: true,
      showFiles: true
    }))
    .pipe(gulp.dest(config.html));
});

gulp.task('deploy', gulp.series('build', gulp.parallel('deploy:assets', 'deploy:html')));


/* demos */
gulp.task("mustache:demos", function() {
  const DEST = '.tmp';
  const dataFiles = [articleDataFile, footerDataFile];

  const promisedData = dataFiles.map(readFilePromisified);

  const dark = gulp.src('./views/index.mustache')
    .pipe($.data(function(file) {
      return Promise.all(promisedData)
        .then(function(value) {
           const contents = value.map(JSON.parse);
           return {
            article: contents[0],
            footer: contents[1]
           };
        });
    }))   
    .pipe($.mustache({}, {
      extension: '.html'
    }))
    .pipe($.rename({
      basename: 'dark-theme'
    }))
    .pipe(gulp.dest(DEST));

  const light = gulp.src('./views/index.mustache')
    .pipe($.data(function(file) {
      return Promise.all(promisedData)
        .then(function(value) {
           const contents = value.map(JSON.parse);
           contents[0].lightTheme = true;
           return {
            article: contents[0],
            footer: contents[1]
           };
        });
    }))   
    .pipe($.mustache({}, {
      extension: '.html'
    }))
    .pipe($.rename({
      basename: 'light-theme'
    }))
    .pipe(gulp.dest(DEST));

  return merge(dark, light);
});

gulp.task('copy:demos', function() {
  return gulp.src('demos/index.html')
    .pipe(gulp.dest('.tmp'))
    .pipe(browserSync.stream({once: true}));
});

gulp.task('build:demos', gulp.parallel('copy:demos', 'mustache:demos', 'styles', 'scripts', 'images', 'extras'));

gulp.task('watch:demos', 
  gulp.parallel('copy:demos', 'mustache:demos', 'styles', 'scripts',
    function serve() {
    browserSync.init({
      server: {
        baseDir: ['demos', '.tmp', 'client'],
        routes: {
          '/bower_components': 'bower_components'
        }
      }
    });

    gulp.watch('client/**/*.{csv,svg,png,jpg}', browserSync.reload);
    gulp.watch('client/**/**/*.scss', gulp.parallel('styles'));
    gulp.watch('demos/*.html', gulp.parallel('copy:demos'));
    gulp.watch(['views/**/*.mustache', 'data/*.json', 'demos/*.mustache'], gulp.parallel('mustache:demos'));
    //gulp.watch('client/**/*.js', gulp.parallel('lint'));
  })
);

gulp.task('demos', gulp.series('clean', 'build:demos', function(){
  return gulp.src(['.tmp/**/**', 'dist/**/**'])
    .pipe(gulp.dest(config.assets + 'ig-template'));
}));

// Deprecate browserify
// const source = require('vinyl-source-stream');
// const buffer = require('vinyl-buffer');
// const browserify = require('browserify');
// const watchify = require('watchify');
// const debowerify = require('debowerify');
// const babelify = require('babelify');
// Browerify task deprecated.
/*gulp.task('scripts', function() {
  const b = browserify({
    entries: 'client/js/main.js',
    debug: true,
    cache: {},
    packageCache: {},
    transform: [babelify, debowerify],
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
});*/