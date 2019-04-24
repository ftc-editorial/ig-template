const path = require('path');
const del = require('del');
// const buildPage = require('./util/build-page.js');
// const svnUpdate = require('./util/svn-update.js');
const gulp = require('gulp');
const sass = require('gulp-sass');
// const postcss = require('gulp-postcss');
// const cssnext = require('postcss-cssnext');
const sourcemaps = require('gulp-sourcemaps');
const imagemin = require('gulp-imagemin');

const rollup = require('rollup');
let cache;

const bowerResolve = require('rollup-plugin-bower-resolve');

// const argv = require('minimist')(process.argv.slice(2), {
//   alias: {
//     i: 'input'
//   },
//   default: {
//     input: 'myanmar'
//   }
// });

// const projectName = argv.i;
// const htmlFile = `${projectName}.html`;

// change NODE_ENV between tasks.
// gulp.task('prod', () => {
//   return Promise.resolve(process.env.NODE_ENV = 'production');
// });

// gulp.task('dev', () => {
//   return Promise.resolve(process.env.NODE_ENV = 'development');
// });

// gulp.task('html', () => {
//   return buildPage({input: argv.i})
//     .then(() => {
//       browserSync.reload('*.html');
//       return Promise.resolve();
//     })
//     .catch(err => {
//       console.log(err);
//     });
// });
const jsInputFile = 'client/main.js';
const cssOutDir = "build/styles";
const jsOutFile = "build/scripts/main.js";

function buildCss() {
  return gulp.src('client/*.scss')
    .pipe(sourcemaps.init({loadMaps:true}))
    .pipe(sass({
      outputStyle: 'expanded',
      includePaths: ['bower_components']
    }).on('error', (err) => {
      console.log(err);
    }))
    // .pipe(postcss([
    //   cssnext({
    //     features: {
    //       colorRgba: false
    //     }
    //   })
    // ]))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(cssOutDir))
}

exports.style = buildCss;

async function buildJs() {
  const bundle = await rollup.rollup({
    input: jsInputFile,
    cache,
    plugins: [
      bowerResolve({
        module: true
      }),
    ],
  });

  console.log(bundle.watchFiles);

  await bundle.write({
    file: jsOutFile,
    format: 'iife',
    sourcemap: true,
  });
}

exports.script = buildJs;

exports.watch = gulp.parallel(buildCss, buildJs, function() {
  // gulp.watch(['views/**/**/*.html', 'data/*.json'], gulp.parallel('html'));
  gulp.watch('client/**/*.js', buildJs);
  gulp.watch('client/**/*.scss', buildCss);
});

// gulp.task('clean', () => {
//   return del(['.tmp']).then(()=>{
//     console.log('.tmp and dist deleted');
//   });
// });

// gulp.task('build', gulp.series('prod', 'clean', gulp.parallel('styles', 'scripts'), 'html', 'dev'));

// const deployDest = {
// 	"html": "../special",
// 	"assets": "../ft-interact"
// }

// gulp.task('svn:update', () => {
//   return svnUpdate()
//     .catch(err => {
//       console.log(err)
//     });
// });

// gulp.task('imagemin', () => {
//   const src = `./public/images/${projectName}/*.{svg,png,jpg,jpeg,gif}`;
//   const dest = path.resolve(__dirname, `${deployDest.assets}/images/${projectName}`);

//   console.log(`Image output: ${dest}`);

//   return gulp.src(src)
//     .pipe(imagemin([
//       imagemin.gifsicle({interlaced: true}),
//       imagemin.jpegtran({progressive: true}),
//       imagemin.optipng({optimizationLevel: 5}),
//       imagemin.svgo({plugins: [{cleanupIDs: false}]})
//     ], {
//       verbose: true
//     }))
//     .pipe(gulp.dest(dest));
// });

// gulp.task('images', gulp.series('svn:update', 'imagemin'));

// gulp.task('deploy:html', () => {
//   const dest = path.resolve(__dirname, deployDest.html)

//   console.log(`Deploying built html file to: ${dest}`);

//   return gulp.src(`${tmpDir}/${projectName}.html`)
//     .pipe(gulp.dest(dest));
// });

// gulp.task('deploy', gulp.series('build', 'deploy:html'));
