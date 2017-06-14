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

function buildPage(template, data) {
  const env = {
    projectName,
    static: 'http://interactive.ftchinese.com/',
    assets: `http://interactive.ftchinese.com/images/${projectName}`,
    isProduction: process.env.NODE_ENV === 'production'
  };
  const context = Object.assign(data, {env});
  const dest = `${tmpDir}/${htmlFile}`;
  return render(template, data)
    .then(html => {
      if (env.isProduction) {
        console.log(`Inline assets`);
        return inline(html, {
          compress: false,
          rootpath: path.resolve(process.cwd(), '.tmp')
        });
      }    
      return html;      
    })
    .then(html => {
      return fs.writeAsync(dest, html);
    })
    .catch(err => {
      throw err;
    });
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

gulp.task('serve',
  gulp.parallel(
    'html', 'styles', 'scripts', 

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

// gulp.task('custom', () => {
//   const customFile = argv.a ? '*' : argv.i
//   const SRC = `custom/**/${customFile}.{js,css}`;
//   const DEST = '.tmp';
//   console.log('Copy custom js and css files to:', DEST);

//   return gulp.src(SRC)
//     .pipe(gulp.dest(DEST));
// });

// function addPrefix ($, file) {
//   $('picture source').each(function() {
//     var source = $(this);
//     var srcset = source.attr('srcset')
//     if (srcset) {
//       srcset = srcset.split(',').map(function(href) {
//         return url.resolve(config.urlPrefix, href.trim());
//       }).join(', ');
//       source.attr('srcset', srcset);
//     }    
//   });
  
//   $('[data-o-component="o-scrollmation"]').each(function() {
//     var el = $(this);
//     var tmp = {};
//     var value = el.attr('data-o-scrollmation-assets');
//     value = JSON.parse(value.replace(/\'/g, '"'));
//     for (let k in value) {
//       const key = url.resolve(config.urlPrefix, k);
//       tmp[key] = value[k]
//     }
//     tmp = JSON.stringify(tmp).replace(/\"/g, "'");
//     el.attr('data-o-scrollmation-assets', tmp);
//   });
// }
// // gulp-prefix cannot prefix `source` of `<picture>`.
// gulp.task('prefix', () => {
//   return gulp.src('.tmp/*.html')
//     .pipe($.cheerio({
//       run: addPrefix,
//       parserOptions: {
//         decodeEntities: false
//       }
//     }))
//     .pipe($.htmlmin({
//       removeComments: true,
//       collapseWhitespace: true,
//       removeAttributeQuotes: true,
//       minifyJS: true,
//       minifyCSS: true
//     }))
//     .pipe($.size({
//       gzip: true,
//       showFiles: true
//     }))    
//     .pipe(gulp.dest('.tmp'));
// })

// gulp.task('clean', function() {
//   return del(['.tmp', 'dist']).then(()=>{
//     console.log('.tmp and dist deleted');
//   });
// });

// gulp.task('build', gulp.series('prod', 'clean', gulp.parallel('html', 'styles', 'webpack', 'extras'), 'smoosh'));

/**********deploy***********/
// gulp.task('images', function () {
//   const imgDir = argv.a ? '**' : argv.i;
//   const destDir = argv.a ? '' : argv.i;
//   const SRC = `./public/images/${imgDir}/*.{svg,png,jpg,jpeg,gif}`;
//   const DEST = path.resolve(__dirname, `${config.assets}/images/${destDir}`);

//   console.log(`Copying images ${SRC} to: ${DEST}`);

//   return gulp.src(SRC)
//     .pipe($.imagemin({
//       progressive: true,
//       interlaced: true,
//       svgoPlugins: [{cleanupIDs: false}],
//       verbose: true
//     }))
//     .pipe(gulp.dest(DEST));
// });

// gulp.task('deploy:html', function() {
//   const DEST = path.resolve(__dirname, config.html)

//   console.log(`Deploying built html file to: ${DEST}`);

//   return gulp.src('dist/*.html')
//     .pipe(gulp.dest(DEST));
// });

// gulp.task('deploy', 
//   gulp.series('build', 
//     gulp.parallel(
//       'images',
//       'deploy:html'
//     )
//   )
// );
/**************/

// gulp.task('demo:copy', () => {
//   const dest = path.resolve(__dirname, config.assets, path.basename(__dirname));
//   console.log(`Copying assets to ${dest}`);

//   return gulp.src(['tmp/**/*', 'custom/**/*.{js,css}'])
//     .pipe(gulp.dest(dest));
// });

// gulp.task(gulp.series('clean', gulp.parallel('html', 'styles', 'webpack', 'images', 'extras')));