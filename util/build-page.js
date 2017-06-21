const pify = require('pify');
const fs = require('fs-jetpack');
const path = require('path');
const loadJson = require('./load-json.js');
const inline = pify(require('inline-source'));
const minify = require('html-minifier').minify;
const footer = require('@ftchinese/ftc-footer')();
const marked = require('marked');
const nunjucks = require('nunjucks');
nunjucks.configure(
  [
    path.resolve(__dirname, '../views'), 
    path.resolve(__dirname, '../node_modules/@ftchinese/ftc-footer'),
    path.resolve(__dirname, '../custom')
  ], 
  {
    noCache: true,
    watch: false,
    autoescape: false
  }
)
.addFilter('md', function(str) {
  return marked(str);
});
const render = pify(nunjucks.render);

async function buildPage({template='index.html', input='myanmar', output='.tmp'}={}) {
  const jsonFile = path.resolve(__dirname, `../data/${input}.json`);
  const destFile = path.resolve(__dirname, `../${output}/${input}.html`);

  const isProduction = process.env.NODE_ENV === 'production';
  const mediaPrefix = process.env.MEDIA_PREFIX ? process.env.MEDIA_PREFIX : '';
  console.log(`Media prefix: ${mediaPrefix}`);

  const env = {
    projectName: input,
    static: 'http://interactive.ftchinese.com/',
    urlPrefix: isProduction ? `http://interactive.ftchinese.com` : mediaPrefix,
    isProduction
  };

  const data = await loadJson(jsonFile);
  const context = Object.assign({env}, data, {footer});
  console.log(`Building page for ${input}`);

  let html = await render(template, context);
  if (env.isProduction) {
    console.log(`Inline js and css`);
    html = await inline(html, {
      compress: false,
      rootpath: path.resolve(__dirname, `../${output}`)
    });

    console.log(`Minify html`);
    html = minify(html, {
      collapseBooleanAttributes: true,
      collapseInlineTagWhitespace: true,
      collapseWhitespace: true,
      conservativeCollapse: true,
      removeComments: true,
      minifyCSS: true,
      minifyJS: true
    });
  }
  await fs.writeAsync(destFile, html);
}

if (require.main === module) {
  const argv = require('minimist')(process.argv.slice(2), {
    alias: {
      i: 'input',
    },
    default: {
      input: 'myanmar'
    }
  });

  buildPage({input: argv.i})
    .catch(err => {
      console.log(err);
    });
}

module.exports = buildPage;