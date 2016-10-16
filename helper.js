const fs = require('fs');
const path = require('path');
const nunjucks = require('nunjucks');

var env = new nunjucks.Environment(
  new nunjucks.FileSystemLoader(
    [
      path.resolve(process.cwd(), 'demos/src'),
      path.resolve(process.cwd(), 'views'),
      path.resolve(process.cwd(), 'bower_components/ftc-footer'),
      path.resolve(process.cwd(), 'bower_components/ftc-icons')
    ],
    {noCache: true}
  ),
  {autoescape: false}
);

function render(template, context, name) {
  return new Promise(function(resolve, reject) {
    env.render(template, context, function(err, result) {
      if (err) {
        reject(err);
      } else {
        if (name) {
          resolve({
            name: name,
            content: result
          });          
        } else {
          resolve(result);
        }
      }
    });
  });
}

function readJson(filename) {
  return new Promise(
    function(resolve, reject) {
      fs.readFile(filename, 'utf8', function(err, data) {
        if (err) {
          console.log('Cannot find file: ' + filename);
          reject(err);
        } else {
          const content = JSON.parse(data);
          const name = path.basename(filename, '.json');

          Object.assign(content, {projectName: name});
          
          resolve({
            name: name,
            content: content
          });
        }
      });
    }
  );
}

function readFile(filename) {
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

function merge(o, p) {
  for (var prop in p) {
    if (o.hasOwnProperty(prop)) {continue;}
    o[prop] = p[prop];
  }
  return o;
}

module.exports = {
  readJson: readJson,
  readFile: readFile,
  render: render,
  merge: merge
};
