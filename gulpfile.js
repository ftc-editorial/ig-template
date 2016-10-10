const promisify = require('promisify-node')
const fs = promisify('fs');
const path = require('path');
const url = require('url');
const isThere = require('is-there');
const co = require('co');
const mkdirp = require('mkdirp');
const helper = require('./helper');

const browserSync = require('browser-sync').create();
const del = require('del');
const cssnext = require('postcss-cssnext');

const gulp = require('gulp');
const $ = require('gulp-load-plugins')();

const minimist = require('minimist');
const options = {
  string: ['input'],
  alias: {
    i: 'input'
  },
  default: {
    input: 'myanmar'
  }
};
const argv = minimist(process.argv.slice(2), options);

const rollup = require('rollup').rollup;
const buble = require('rollup-plugin-buble');
const bowerResolve = require('rollup-plugin-bower-resolve');
const uglify = require('rollup-plugin-uglify');
var cache;

const webpack = require('webpack');
const webpackConfig = require('./webpack.config.js');

const footer = require('./bower_components/ftc-footer');

const config = require('./config.json');

const dataFile = path.resolve(__dirname, `data/${argv.i}.json`);

const projectName = argv.i;

process.env.NODE_ENV = 'dev';
// change NODE_ENV between tasks.
gulp.task('prod', function(done) {
  process.env.NODE_ENV = 'prod';
  done();
});

gulp.task('dev', function(done) {
  process.env.NODE_ENV = 'dev';
  done();
});

gulp.task('html', () => {
  return co(function *() {
    const destDir = '.tmp';

    if (!isThere(destDir)) {
      mkdirp(destDir, (err) => {
        if (err) console.log(err);
      });
    }

   if (process.env.NODE_ENV === 'prod') {
      context.analytics = true;
      context.iconsPath = config.icons;
      context.production = true;
    }

    const context = yield fs.readFile(dataFile);
    context.footer = footer;
    context.projectName = projectName;

    const renderResult = yield helper.render('index.html', context);

    yield fs.writeFile('.tmp/index.html', renderResult, 'utf8');
  })
  .then(function(){
    browserSync.reload('index.html');
  }, function(err) {
    console.error(err.stack);
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
    .pipe($.if(process.env.NODE_ENV === 'prod', $.cssnano()))
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
// change webpack config if env is production.
  if (process.env.NODE_ENV === 'prod') {
    delete webpackConfig.watch;
    webpackConfig.plugins.push(new webpack.optimize.UglifyJsPlugin())
  }
  webpack(webpackConfig, function(err, stats) {
    if (err) throw new $.util.PluginError('webpack', err);
    $.util.log('[webpack]', stats.toString({
      colors: $.util.colors.supportsColor,
      chunks: false,
      hash: false,
      version: false
    }))
    browserSync.reload('main.js');
    done();
  });
});

gulp.task('serve', 
  gulp.parallel(
    'mustache', 'styles', 'webpack', 

    function serve() {
    browserSync.init({
      server: {
        baseDir: ['.tmp', 'custom', 'public'],
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
    plugins: [
      bowerResolve(),
      buble(),
      uglify()
    ],
    cache: cache,
  }).then(function(bundle) {
    cache = bundle;

    return bundle.write({
      format: 'iife',
      dest: '.tmp/scripts/main.js',
      sourceMap: true,
    });
  });
});

gulp.task('custom', () => {
  const SRC = 'custom/**/' + projectName + '.{js,css}';
  const DEST = '.tmp';
  console.log('Copy custom js and css files to:', DEST);

  return gulp.src(SRC)
    .pipe(gulp.dest(DEST));
});

// gulp-prefix cannot prefix `source` of `<picture>`.
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
  const SRC = './public/images/' + projectName + '/*.{svg,png,jpg,jpeg,gif}' ;
  const DEST = path.resolve(__dirname, config.assets, 'images', projectName);
  console.log('Copying images to:', DEST);

  return gulp.src(SRC)
    .pipe($.imagemin({
      progressive: true,
      interlaced: true,
      svgoPlugins: [{cleanupIDs: false}],
      verbose: true
    }))
    .pipe(gulp.dest(DEST));
});

gulp.task('clean', function() {
  return del(['.tmp', 'dist']).then(()=>{
    console.log('.tmp and dist deleted');
  });
});

gulp.task('build', gulp.series('prod', 'clean', gulp.parallel('index', 'styles', 'rollup', 'images', 'extras'), 'smoosh'));

gulp.task('serve:dist', function() {
  const indexFile = projectName + '.html';

  browserSync.init({
    server: {
      baseDir: ['dist', 'public'],
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
// Read the content of selected project's json, get its `pageTitle` entry.
// Read the content of `demos/index.json`. Use the `arig.i` as key to check if this key exists.
// If this key does not exist, add it with `pageTitle` as value.
gulp.task('index:demo', () => {
  return co(function *() {
    const dataFiles = [contentDataFile, 'demos/index.json'];
    const destDir = 'dist';

    if (!isThere(destDir)) {
      mkdirp(destDir, (err) => {
        if (err) console.log(err);
      });
    }

    const [projectData, indexData] = yield Promise.all(dataFiles.map(helper.readJSON));
    const key = argv.i;
    const value = projectData.pageTitle;

    if (!indexData.projectList) {
      indexData.porjectList = {};
    }
    indexData.porjectList = indexData.porjectList || {};

    if(!indexData.projectList.hasOwnProperty(key) || indexData.projectList[key] !== value) {
      indexData.porjectList[key] = value;
      const ws = fs.createWriteStream('demos/index.json');
      ws.write(JSON.stringify(indexData));
      ws.on('error', (error) => {
        console.log(error);
      });
    }

    const res = nunjucks.render('index.njk', indexData);
    const indexPage = fs.createWriteStream('dist/index.html');
    indexPage.write(res);
    indexPage.on('error', (error) => {
      console.log(error);
    });
  });
});

gulp.task('copy:demo', () => {
  const DEST = path.resolve(__dirname, config.assets, 'ig-template');
  console.log('Copy demo of', projectName, 'to', DEST);
  return gulp.src('dist/**/*.{html,js,css,map}')
    .pipe(gulp.dest(DEST));
});

gulp.task('demo', gulp.series('clean', gulp.parallel('index', 'styles', 'rollup', 'images', 'custom', 'index:demo'), 'html:demo', 'copy:demo'));
