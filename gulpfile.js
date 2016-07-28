const fs = require('fs');
const path = require('path');
const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const del = require('del');
const cssnext = require('postcss-cssnext');
const $ = require('gulp-load-plugins')();
const minimist = require('minimist');
const merge = require('merge-stream');
const rollupStream = require('rollup-stream');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const rollup = require('rollup').rollup;
const buble = require('rollup-plugin-buble');
const bowerResolve = require('rollup-plugin-bower-resolve');

var cache;

process.env.NODE_ENV = 'development';

const config = require('./config.json');

const knownOptions = {
  string: 'input',
  default: {input: 'example'},
  alias: {i: 'input'}
};

const argv = minimist(process.argv.slice(2), knownOptions);

const taskName = argv._[0];
const articleDataFile = path.resolve(__dirname, 'data', argv.i + '.json');
const footerDataFile = path.resolve(__dirname, 'data', 'footer.json');
const projectName = argv.i;

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

  const dataFiles = [articleDataFile, footerDataFile];
  const promisedData = dataFiles.map(readFilePromisified);

  return gulp.src('./views/index.mustache')
    .pipe($.data(function(file) {
      return Promise.all(promisedData)
        .then(function(value) {
           const jsonData = value.map(JSON.parse);
           const viewData = jsonData[0];
           viewData.footer = jsonData[1];
           viewData.projectName = projectName;
           if (process.env.NODE_ENV === 'production') {
              viewData.analytics = true;
              viewData.iconsPath = config.icons;
            }
           return viewData;
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

gulp.task('eslint', () => {
  return gulp.src('client/js/*.js')
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.eslint.failAfterError());
});

gulp.task('js', () => {
  return rollupStream({
    entry: 'client/js/main.js',
    treeshake: false,
    plugins: [
      bowerResolve(),
      buble()
    ],
    cache: cache,
    format: 'iife'
  })
  .pipe($.plumber())
  .pipe(source('main.js', './scr'))
  .pipe(buffer())
  .pipe($.sourcemaps.init({loadMaps: true}))
  .pipe($.rename('bundle.js'))
  .pipe($.sourcemaps.write('.'))
  .pipe(gulp.dest('.tmp/scripts'))
  .pipe(browserSync.stream({once:true}));
});

gulp.task('rollup', () => {
  return rollup({
    entry: 'client/js/main.js',
    treeshake: false,
    plugins: [
      bowerResolve(),
      buble()
    ],
    cache: cache,
  }).then(function(bundle) {
    cache = bundle;

    return bundle.write({
      format: 'iife',
      // moduleName: 'Share',
      // moduleId: 'ftc-share',
      dest: '.tmp/scripts/bundle.js',
      sourceMap: true,
    }).then(function() {
      browserSync.reload('bundle.js');
    });
  });
});

gulp.task('serve', 
  gulp.parallel(
    'mustache', 'styles', 'rollup', 

    function serve() {
    browserSync.init({
      server: {
        baseDir: ['.tmp', 'custom', 'demos'],
        routes: {
          '/bower_components': 'bower_components'
        }
      }
    });


    browserSync.watch('custom/**/*.{css,js,csv}')
    .on('change', browserSync.reload);

    gulp.watch(['views/**/**/*.mustache', 'data/*.json'], gulp.parallel('mustache'));

    gulp.watch('client/scss/**/**/*.scss', gulp.parallel('styles'));

    gulp.watch('client/**/*.js', gulp.parallel('rollup'));
  })
);

/* build */
gulp.task('useref', () => {
  return gulp.src('.tmp/index.html')
    .pipe($.useref({searchPath: ['.tmp', 'custom']}))
    .pipe(gulp.dest('dist')); 
});

gulp.task('html', gulp.series('useref', function smoosh () {
  return gulp.src('dist/index.html')
    .pipe($.smoosher())
    .pipe(gulp.dest('dist')); 
}));

gulp.task('extras', function () {
  return gulp.src('data/csv/*.csv', {
    dot: true
  })
  .pipe(gulp.dest('dist'));
});

gulp.task('images', function () {
  const SRC = 'images/' + projectName + '/*.{svg,png,jpg,jpeg,gif}';

  return gulp.src(SRC)
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

gulp.task('build', gulp.series('prod', 'clean', gulp.parallel('mustache', 'styles', 'rollup', 'images', 'extras'), 'html', 'dev'));

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

/**********deploy***********/
gulp.task('deploy:assets', function() {
  return gulp.src(['dist/**/*.{csv,png,jpg,svg}'])
    .pipe(gulp.dest(config.assets + projectName))
});

gulp.task('deploy:html', function() {
  console.log(path.resolve(__dirname, config.html));
  return gulp.src('dist/index.html')
    .pipe($.prefix(config.imgPrefix))
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
           const jsonData = value.map(JSON.parse);
           const viewData = jsonData[0];
           viewData.footer = jsonData[1];
           return viewData;
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
           const jsonData = value.map(JSON.parse);
           const viewData = jsonData[0];
           viewData.footer = jsonData[1];
           viewData.darkTheme = false;
           viewData.lightTheme = true;
           return viewData;
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

gulp.task('images:demos', function () {
  return gulp.src('demos/images/*.{png,jpg,gif,svg}')
    .pipe($.imagemin({
      progressive: true,
      interlaced: true,
      svgoPlugins: [{cleanupIDs: false}]
    }))
    .pipe(gulp.dest('.tmp/images'));
});

gulp.task('build:demos', gulp.parallel('copy:demos', 'mustache:demos', 'styles', 'rollup', 'images:demos'));

gulp.task('watch:demos', 
  gulp.parallel('copy:demos', 'mustache:demos', 'styles', 'rollup',
    function serve() {
    browserSync.init({
      server: {
        baseDir: ['demos', '.tmp'],
        routes: {
          '/bower_components': 'bower_components'
        }
      }
    });

    gulp.watch('client/**/*.{csv,svg,png,jpg}', browserSync.reload);
    gulp.watch('client/**/**/*.scss', gulp.parallel('styles'));
    gulp.watch('demos/*.html', gulp.parallel('copy:demos'));
    gulp.watch(['views/**/*.mustache', 'data/*.json', 'demos/*.mustache'], gulp.parallel('mustache:demos'));
    gulp.watch('client/**/*.js', gulp.parallel('rollup'));
  })
);

gulp.task('demos', gulp.series('clean', 'build:demos', function(){
  return gulp.src(['.tmp/**/**'])
    .pipe(gulp.dest(config.assets + 'ig-template'));
}));