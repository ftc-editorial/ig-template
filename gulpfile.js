const path = require('path');
const del = require('del');
const browserSync = require('browser-sync').create();
const buildPage = require('./lib/build-page.js');
const gulp = require('gulp');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const cssnext = require('postcss-cssnext');
const sourcemaps = require('gulp-sourcemaps');
const imagemin = require('gulp-imagemin');

const rollup = require('rollup').rollup;
const babili = require('rollup-plugin-babili');
const babel = require('rollup-plugin-babel');
const bowerResolve = require('rollup-plugin-bower-resolve');

const argv = require('minimist')(process.argv.slice(2), {
  alias: {
    i: 'input'
  },
  default: {
    input: 'myanmar'
  }
});

const projectName = argv.i;
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

gulp.task('html', () => {
  return buildPage({input: argv.i})
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
    .pipe(postcss([
      cssnext({
        features: {
          colorRgba: false
        }
      })
    ]))
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
    .pipe(imagemin({
      progressive: true,
      interlaced: true,
      svgoPlugins: [{cleanupIDs: false}],
      verbose: true,
    }))
    .pipe(gulp.dest(dest));
});

gulp.task('deploy:html', function() {
  const dest = path.resolve(__dirname, deployDest.html)

  console.log(`Deploying built html file to: ${dest}`);

  return gulp.src(`${tmpDir}/${projectName}.html`)
    .pipe(gulp.dest(dest));
});

gulp.task('deploy', gulp.series('build', 'deploy:html'));