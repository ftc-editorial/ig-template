const pify = require('pify');
const fs = require('fs-jetpack');
const path = require('path');
const loadJsonFile = require('load-json-file');
const writeJsonFile = require('write-json-file');
const inline = pify(require('inline-source'));
const nunjucks = require('nunjucks');
nunjucks.configure(['views', 'node_modules/@ftchinese/ftc-footer'], {
  noCache: true,
  watch: false,
  autoescape: false
});
const render = pify(nunjucks.render);

const browserSync = require('browser-sync').create();
const cssnext = require('postcss-cssnext');
const gulp = require('gulp');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss')
const sourcemaps = require('gulp-sourcemaps');
const imagemin = require('gulp-imagemin');

const rollup = require('rollup').rollup;
const babili = require('rollup-plugin-babili');
const babel = require('rollup-plugin-babel');
const bowerResolve = require('rollup-plugin-bower-resolve');

const footer = require('@ftchinese/ftc-footer')();

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

const config = require('./config.json');

const projectName = argv.i;
const dataFile = path.resolve(process.cwd(),`data/${projectName}.json`)
const htmlFile = `${projectName}.html`;
const tmpDir = '.tmp';

process.env.NODE_ENV = 'development';
// change NODE_ENV between tasks.
gulp.task('prod', function() {
  return Promise.resolve(process.env.NODE_ENV = 'production');
});

gulp.task('dev', function() {
  return Promise.resolve(process.env.NODE_ENV = 'development');
});

async function buildPage(template, data) {
  const isProduction = process.env.NODE_ENV === 'production';
  const env = {
    projectName,
    static: 'http://interactive.ftchinese.com/',
    urlPrefix: isProduction ? `http://interactive.ftchinese.com/images/${projectName}` : '',
    isProduction
  };

  const context = Object.assign(data, {env});
  const dest = `${tmpDir}/${htmlFile}`;

  let html = await render(template, data);
  if (env.isProduction) {
    html = await inline(html, {
      compress: false,
      rootpath: path.resolve(process.cwd(), '.tmp')
    })
  }

  await fs.writeAsync(dest, html);
}

gulp.task('html', () => {

  return loadJsonFile(dataFile)
    .then(json => {
      return buildPage('index.html', Object.assign(json, {
        footer: footer
      }));
    })
    .then(() => {
      browserSync.reload('*.html');
      return Promise.resolve();
    })
    .catch(err => {
      console.log(err);
    });
});

gulp.task('styles', function styles() {
  const dest = `${tmpDir}/styles`;

  return gulp.src('client/*.scss')
    .pipe(sourcemaps.init({loadMaps:true}))
    .pipe(sass({
      outputStyle: process.env.NODE_ENV === 'production' ? 'compressed' : 'expanded',
      precision: 10,
      includePaths: ['bower_components']
    }).on('error', (err) => {
      console.log(err);
    }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(dest))
    .pipe(browserSync.stream());
});

let cache;
gulp.task('scripts', () => {
  const config = {
    entry: 'client/main.js',
    plugins: [
      bowerResolve({
        module: true
      }),
      babel({
        exclude: 'node_modules/**'
      })
    ],
    cache: cache
  }

  if (process.env.NODE_ENV === 'production') {
    config.plugins.push(babili());
  }
  
  return rollup(config).then(function(bundle) {
    cache = bundle;
    return bundle.write({
      dest: `${tmpDir}/scripts/main.js`,
      format: 'iife',
      sourceMap: true
    });
  })
  .catch(err => {
    console.log(err);
  });
});

gulp.task('serve', gulp.parallel('html', 'styles', 'scripts', 
  function serve() {
    browserSync.init({
      server: {
        baseDir: [tmpDir, 'custom', 'public'],
        index: htmlFile,
        routes: {
          '/bower_components': 'bower_components'
        }
      },
      files: 'custom/**/*.{css,js,csv}'
    });

    gulp.watch(['views/**/**/*.html', 'data/*.json'], gulp.parallel('html'));
    gulp.watch('client/**/*.js', gulp.parallel('scripts'));
    gulp.watch('client/**/*.scss', gulp.parallel('styles'));
  })
);

gulp.task('clean', function() {
  return del(['.tmp']).then(()=>{
    console.log('.tmp and dist deleted');
  });
});

gulp.task('build', gulp.series('prod', 'clean', gulp.parallel('styles', 'scripts'), 'html', 'dev'));


const deployDest = {
	"html": "../special",
	"assets": "../ft-interact"
}
gulp.task('images', function () {
  const src = `./public/images/${projectName}/*.{svg,png,jpg,jpeg,gif}`;
  const dest = path.resolve(__dirname, `${deployDest.assets}/images/${projectName}`);

  console.log(`Copying images ${src} to: ${dest}`);

  return gulp.src(src)
    .pipe($.imagemin({
      progressive: true,
      interlaced: true,
      svgoPlugins: [{cleanupIDs: false}],
      verbose: true
    }))
    .pipe(gulp.dest(dest));
});

gulp.task('deploy:html', function() {
  const dest = path.resolve(__dirname, deployDest.html)

  console.log(`Deploying built html file to: ${dest}`);

  return gulp.src(`.tmp/${projectName}.html`)
    .pipe(gulp.dest(DEST));
});