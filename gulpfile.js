const fs = require('fs');
const path = require('path');
const url = require('url');
const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const del = require('del');
const cssnext = require('postcss-cssnext');
const $ = require('gulp-load-plugins')();
const minimist = require('minimist');
const merge = require('merge-stream');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const rollup = require('rollup').rollup;
const buble = require('rollup-plugin-buble');
const bowerResolve = require('rollup-plugin-bower-resolve');
const nunjucks = require('nunjucks');
const webpackStream = require('webpack-stream');
const webpackConfig = require('./webpack.config.js');

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

gulp.task('webpack', function(done) {
  const DEST = '.tmp/scripts/';
  return gulp.src('client/js/main.js')
    .pipe(webpackStream(webpackConfig, null, function(err, stats) {
      $.util.log(stats.toString({
          colors: $.util.colors.supportsColor,
          chunks: false,
          hash: false,
          version: false
      }));
      browserSync.reload({once: true});
    }))
    .pipe(gulp.dest(DEST));
});



gulp.task('serve', 
  gulp.parallel(
    'mustache', 'styles', 'webpack', 

    function serve() {
    browserSync.init({
      server: {
        baseDir: ['.tmp', 'custom', 'images'],
        routes: {
          '/bower_components': 'bower_components'
        }
      },
      files: 'custom/**/*.{css,js,csv}'
    });

    gulp.watch(['views/**/**/*.mustache', 'data/*.json'], gulp.parallel('mustache'));

    gulp.watch('client/scss/**/**/*.scss', gulp.parallel('styles'));
  })
);

/* build */
// use rollup and buble to build js
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
      dest: '.tmp/scripts/main.js',
      sourceMap: true,
    });
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

gulp.task('custom', () => {
  const SRC = 'custom/**/' + projectName + '.{js,css}';
  const DEST = '.tmp';
  console.log('Copy custom js and css files to:', DEST);

  return gulp.src(SRC)
    .pipe(gulp.dest(DEST));
});

gulp.task('prefix', () => {
  return gulp.src('.tmp/index.html')
    .pipe($.cheerio(function($, file) {
      $('picture source').each(function() {
        var source = $(this);
        var srcset = source.attr('srcset')
        if (srcset) {
          srcset = srcset.split(',').map(function(href) {
            return url.resolve(config.imgPrefix, href).replace('%20', ' ');
          }).join(', ');
          source.attr('srcset', srcset);
        }    
      });
    }))
    .pipe(gulp.dest('dist'));
})

gulp.task('smoosh', gulp.series('custom', function smoosh () {
  return gulp.src('.tmp/index.html')
    .pipe($.smoosher({
      ignoreFilesNotFound: true
    }))
    .pipe($.useref())
    .pipe($.rename({
      basename: projectName, 
      extname: '.html'
    }))
    .pipe(gulp.dest('dist')); 
}));

gulp.task('extras', function () {
  return gulp.src('data/csv/*.csv', {
    dot: true
  })
  .pipe(gulp.dest('dist'));
});

gulp.task('images', function () {
  const SRC = './images/' + projectName + '/*.{svg,png,jpg,jpeg,gif}' ;
  const DEST = path.resolve(__dirname, config.assets, 'images', projectName);
  console.log('Copying images to:', DEST);

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

gulp.task('build', gulp.series('prod', 'clean', gulp.parallel('mustache', 'styles', 'rollup', 'images', 'extras'), 'smoosh', 'dev'));

gulp.task('serve:dist', function() {
  const indexFile = projectName + '.html';

  browserSync.init({
    server: {
      baseDir: ['dist', 'images'],
      index:  indexFile,
      routes: {
        '/bower_components': 'bower_components'
      }
    }
  });
});

/**********deploy***********/
gulp.task('deploy:html', function() {
  const DEST = path.resolve(__dirname, config.html)
  console.log('Deploying built html file to:', DEST);
  return gulp.src('dist/index.html')
    .pipe($.prefix(config.imgPrefix))
// Gulp-prefix cannot prefix <srouce srcset="url, url2">. Do it manually.
    .pipe($.cheerio(function($, file) {
      $('picture source').each(function() {
        var source = $(this);
        var srcset = source.attr('srcset')
        if (srcset) {
          srcset = srcset.split(',').map(function(href) {
            return url.resolve(config.imgPrefix, href).replace('%20', ' ');
          }).join(', ');
          source.attr('srcset', srcset);
        }    
      });
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
    .pipe(gulp.dest(DEST));
});

gulp.task('deploy', gulp.series('build', 'deploy:html'));

// demos
gulp.task('html:demo', () => {
  console.log('Rename html to:', projectName, 'Copy all to: dist');
  return gulp.src('.tmp/**/*.{html,css,js,map}')
    .pipe($.if('index.html', $.rename({basename: projectName})))
    .pipe(gulp.dest('dist'));
});

// Build an index page listing all projects sent to test serve.
gulp.task('index', () => {
  return Promise.all([contentFileName, 'demos/index.json'].map(readFilePromisified))
    .then((contentArr) => {
      const parsedData = contentArr.map(JSON.parse);
      const contentData = parsedData[0];
      const indexData = parsedData[1];
      const key = argv.i;
      const value = contentData.pageTitle;
      if (!indexData.items) {
        indexData.items = {};
      }

      if (!(key in indexData.items) || indexData.items[key] !== value) {
        indexData.items[key] = value;
      }
    
      return indexData;
    })
    .then((value) => {
      const res = nunjucks.render('demos/index.njk', value);
      fs.writeFile('dist/index.html', res, (err) => {
        console.log('dist/index.html created.');
      });
      return value;
    })
    .then((value) => {
      const data = JSON.stringify(value, 4);
      fs.writeFile('demos/index.json', data, (err) => {
        console.log('demos/index.json updated.');
      });
    });
});

gulp.task('copy:demo', () => {
  const DEST = path.resolve(__dirname, config.assets, 'ig-template');
  console.log('Copy demo of', projectName, 'to', DEST);
  return gulp.src('dist/**/*.{html,js,css,map}')
    .pipe(gulp.dest(DEST));
});

gulp.task('demo', gulp.series(gulp.parallel('mustache', 'styles', 'rollup', 'images', 'custom', 'index'), 'html:demo', 'copy:demo'));
