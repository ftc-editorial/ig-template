const fs = require('fs');
const isThere = require('is-there');
const co = require('co');
const mkdirp = require('mkdirp');
const nunjucks = require('nunjucks');
const helper = require('./helper');

nunjucks.configure('views', {
  autoescape: false,
  noCache: true
});

co(function *() {
  const destDir = '.tmp';

  if (!isThere(destDir)) {
    mkdirp(destDir, (err) => {
      if (err) console.log(err);
    });
  }

  const [context, footer] = yield Promise.all(['data/myanmar.json', 'data/footer.json'].map(helper.readJson));
  context.footer = footer;
  
  const res = nunjucks.render('base.html', context);
  const indexPage = fs.createWriteStream('.tmp/index.html');
  indexPage.write(res);
  indexPage.on('error', (error) => {
    console.log(error);
  });
}).then(function(){
  
}, function(err) {
  console.error(err.stack);
});