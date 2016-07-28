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
  default: {input: 'myanmar'},
  alias: {i: 'input'}
};

const argv = minimist(process.argv.slice(2), knownOptions);

const contentFileName = path.resolve(__dirname, 'data', argv.i + '.json');
const footerFileName = path.resolve(__dirname, 'data', 'footer.json');
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

  const fileNames = [contentFileName, footerFileName];
  const promisedData = fileNames.map(readFilePromisified);

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

gulp.task('record', () => {
  return Promise.all([contentFileName, 'demos/index.json'].map(readFilePromisified))
    .then(function(contentArr) {
      const parsedData = contentArr.map(JSON.parse);
      const contentData = parsedData[0];
      const indexData = parsedData[1];
      const key = argv.i;
      const value = contentData.articleCover ? contentData.articleCover.headline : contentData.sections[0].articleHead.headline;
      indexData.items[key] = value;
      return indexData;
    })
    .then(function(value) {
      const data = JSON.stringify(value, 4);
      fs.writeFile('demos/index.json', data, (err) => {

      });
    });
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
        baseDir: ['.tmp', 'custom', 'images'],
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
    .pipe(gulp.dest('.tmp')); 
});

gulp.task('smoosher', gulp.series('useref', function smoosh () {
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
  const SRC = path.resolve('images', projectName, '*.{svg,png,jpg,jpeg,gif}') ;
  const DEST = path.resolve(config.assets, 'images', projectName);

  return gulp.src(SRC)
    .pipe($.imagemin({
      progressive: true,
      interlaced: true,
      svgoPlugins: [{cleanupIDs: false}]
    }))
    .pipe(gulp.dest(DEST));
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

gulp.task('build', gulp.series('prod', 'clean', gulp.parallel('mustache', 'styles', 'rollup', 'images', 'extras'), 'smoosher', 'dev'));

gulp.task('serve:dist', function() {
  browserSync.init({
    server: {
      baseDir: ['dist', 'images'],
      routes: {
        '/bower_components': 'bower_components'
      }
    }
  });
});

/**********deploy***********/
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

gulp.task('deploy', gulp.series('build', gulp.parallel('images', 'deploy:html')));