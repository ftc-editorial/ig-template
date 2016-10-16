const promisify = require('promisify-node')
const fs = promisify('fs');
const path = require('path');
const url = require('url');
const isThere = require('is-there');
const co = require('co');
const mkdirp = require('mkdirp');
const helper = require('./helper');
const merge = require('deepmerge');

const browserSync = require('browser-sync').create();
const del = require('del');
const cssnext = require('postcss-cssnext');

const gulp = require('gulp');
const $ = require('gulp-load-plugins')();

const minimist = require('minimist');
const options = {
  string: ['input'],
  boolean: 'all',
  alias: {
    i: 'input',
    a: 'all'
  },
  default: {
    input: 'myanmar'
  }
};
const argv = minimist(process.argv.slice(2), options);

const webpack = require('webpack');
const webpackConfig = require('./webpack.config.js');

const footer = require('./bower_components/ftc-footer');

const config = require('./config.json');

const demoList = require('./demos/src/demo-list.json');
// If argv.a exists, you are building all in `demoList`. Otherwise a single project.
const names = argv.a ? demoList : [argv.i];
// Browser-syn use `index.html` for argv.a or single individual projects' name
const index = argv.a ? 'index.html' : `${argv.i}.html`;

const prodSetting = {
  "analytics": true,
  "production": true
};

const tmpDir = '.tmp';

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

    if (!isThere(tmpDir)) {
      mkdirp.sync(tmpDir);
    }

    const data = yield Promise.all(names.map(name => {
      const file = path.resolve(process.cwd(), `data/${name}.json`);
      return helper.readJson(file);
    }));

    const renderResults = yield Promise.all(data.map(datum => {
      const template = 'index.html';
      console.log(`Using data file ${datum.name}.json`);

      const context = merge({
        footer: footer
      }, datum.content);
      
      if (process.env.NODE_ENV === 'prod') {
        Object.assign(context, prodSetting);
      } 

      return helper.render(template, context, datum.name);
    }));

    yield Promise.all(renderResults.map(result => {
      return fs.writeFile(`${tmpDir}/${result.name}.html`, result.content, 'utf8');
    }));

  // If argv.a passed, you are building all projects. Let's generate an index page listing them all.
    if (argv.a) {
    // Data is nested under `content` field. Unwrap it.
      const demoData = data.map(d => {
        return d.content
      });

      const demoResult = yield helper.render('demo.html', {demos: demoData});

      yield fs.writeFile(`${tmpDir}/index.html`, demoResult, 'utf8');
    }       
  })
  .then(function(){
    browserSync.reload('*.html');
  }, function(err) {
    console.error(err.stack);
  });
});

gulp.task('styles', function styles() {
  const DEST = `${tmpDir}/styles`;

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
  if (process.env.NODE_ENV === 'prod') {
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

gulp.task('wpwatch', () => {
  return Promise.resolve(webpackConfig.watch = true);
});

gulp.task('serve',
  gulp.series('wpwatch', 
    gulp.parallel(
      'html', 'styles', 'webpack', 

      function serve() {
      browserSync.init({
        server: {
          baseDir: [tmpDir, 'custom', 'public'],
          index: index,
          routes: {
            '/bower_components': 'bower_components'
          }
        },
        files: 'custom/**/*.{css,js,csv}'
      });

      gulp.watch(['views/**/**/*.html', 'data/*.json'], gulp.parallel('html'));
      gulp.watch('client/scss/**/**/*.scss', gulp.parallel('styles'));
    })
  )
);

gulp.task('custom', () => {
  const customFile = argv.a ? '*' : argv.i
  const SRC = `custom/**/${customFile}.{js,css}`;
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
            return url.resolve(config.urlPrefix, href.trim());
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
    .pipe(gulp.dest('dist'));
})

gulp.task('smoosh', gulp.series('custom', function smoosh () {
  return gulp.src('.tmp/*.html')
    .pipe($.smoosher({
      ignoreFilesNotFound: true
    }))
    .pipe(gulp.dest('dist')); 
}));

gulp.task('extras', function () {
  return gulp.src('data/csv/*.csv', {
    dot: true
  })
  .pipe(gulp.dest('dist'));
});

gulp.task('clean', function() {
  return del(['.tmp', 'dist']).then(()=>{
    console.log('.tmp and dist deleted');
  });
});

gulp.task('build', gulp.series('prod', 'clean', gulp.parallel('html', 'styles', 'webpack', 'extras'), 'smoosh'));

/**********deploy***********/
gulp.task('images', function () {
  const imgDir = argv.a ? '**' : argv.i;
  const destDir = argv.a ? '' : argv.i;
  const SRC = `./public/images/${imgDir}/*.{svg,png,jpg,jpeg,gif}`;
  const DEST = path.resolve(__dirname, `${config.assets}/images/${destDir}`);

  console.log(`Copying images ${SRC} to: ${DEST}`);

  return gulp.src(SRC)
    .pipe($.imagemin({
      progressive: true,
      interlaced: true,
      svgoPlugins: [{cleanupIDs: false}],
      verbose: true
    }))
    .pipe(gulp.dest(DEST));
});

gulp.task('deploy:html', function() {
  const DEST = path.resolve(__dirname, config.html)

  console.log(`Deploying built html file to: ${DEST}`);

  return gulp.src('dist/*.html')
    .pipe(gulp.dest(DEST));
});

gulp.task('deploy', 
  gulp.series('build', 
    gulp.parallel(
      'images',
      'deploy:html'
    )
  )
);
/**************/

gulp.task('demo:copy', () => {
  const dest = path.resolve(__dirname, config.assets, path.basename(__dirname));
  console.log(`Copying assets to ${dest}`);

  return gulp.src(['tmp/**/*', 'custom/**/*.{js,css}'])
    .pipe(gulp.dest(dest));
});

gulp.task(gulp.series('clean', gulp.parallel('html', 'styles', 'webpack', 'images', 'extras')));