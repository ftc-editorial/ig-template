const fs = require('fs');
const path = require('path');
const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const del = require('del');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const browserify = require('browserify');
const watchify = require('watchify');
const debowerify = require('debowerify');
const babelify = require('babelify');
const cssnext = require('postcss-cssnext');
const $ = require('gulp-load-plugins')();
const minimist = require('minimist');

const config = require('./config.json');

const knownOptions = {
  string: 'input',
  default: {input: 'example.json'},
  alias: {i: 'input'}
};

const argv = minimist(process.argv.slice(2), knownOptions);

const taskName = argv._[0];
const dataFile = argv.i;
const projectName = dataFile.slice(0, -5);

gulp.task(function mustache() {
  const DEST = '.tmp';

  try {
    const article = JSON.parse(fs.readFileSync('model/' + dataFile));
  } catch (e) {
    console.log(`Cannot read your data file: models/${dataFile}`);
    console.log(e);
    return;
  }
  
  const theme = article.lightTheme;

  const footer = JSON.parse(fs.readFileSync('model/footer.json'));

  const analytics = false;

  if (taskName === 'build' || taskName === 'deploy') {
    analytics = true;    
  }

  return gulp.src('views/index.mustache')
    .pipe($.changed(DEST))
    .pipe($.mustache({
      theme: theme,
      analytics: analytics,
      article: article,
      footer: footer
    }, {
      extension: '.html'
    }))
    .pipe($.size({
      gzip: true,
      showFiles: true
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
    .pipe($.size({
      gzip: true,
      showFiles: true
    }))
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest(DEST))
    .pipe(browserSync.stream());
});

gulp.task('scripts', function() {
  const b = browserify({
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

  const b = browserify({
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
    gulp.watch('client/**/**/*.scss', gulp.parallel('styles'));
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

/* demos */
gulp.task("mustache:demos", function() {
  const DEST = '.tmp';

  const article = JSON.parse(fs.readFileSync('model/data.json'));

  const footer = JSON.parse(fs.readFileSync('model/footer.json'));

  return gulp.src('demos/*.mustache')
    .pipe($.changed(DEST))
    .pipe($.if('light-theme.mustache',
      $.mustache({
        theme: true,
        article: article,
        footer: footer
      }, {
        extension: '.html'
      }),
      $.mustache({
        theme: false,
        article: article,
        footer: footer
      }, {
        extension: '.html'
      })
    ))
    .pipe(gulp.dest(DEST))
    .pipe(browserSync.stream({once: true}));
});

gulp.task('copy:demos', function() {
  return gulp.src('demos/index.html')
    .pipe(gulp.dest('.tmp'))
    .pipe(browserSync.stream({once: true}));
});

gulp.task('images:demos', function() {
  return gulp.src('client/images/*.{svg,png,jpg,jpeg,gif}')
    .pipe($.imagemin({
      progressive: true,
      interlaced: true,
      svgoPlugins: [{cleanupIDs: false}]
    }))
    .pipe(gulp.dest('.tmp/images'));
});

gulp.task('build:demos', gulp.parallel('copy:demos', 'mustache:demos', 'styles', 'images:demos'));

gulp.task('watch:demos', 
  gulp.parallel('copy:demos', 'mustache:demos', 'styles',
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
    gulp.watch(['views/**/*.mustache', 'model/*.json', 'demos/*.mustache'], gulp.parallel('mustache:demos'));
    //gulp.watch('client/**/*.js', gulp.parallel('lint'));
  })
);

gulp.task('demos', gulp.series('clean', 'build:demos', function(){
  return gulp.src('.tmp/**/**')
    .pipe(gulp.dest(config.deploy.assets + projectName));
}));