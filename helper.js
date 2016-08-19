const fs = require('fs');

/*
 * Copy the enumerable properties of `p` to `o`, and return `o`.
 * If `o` and `p` have a property by the same name, `o`'s property is left alone.
 */
function merge(o, p) {
	for (var prop in p) {
		if (o.hasOwnProperty(prop)) {
			continue;
		} 
		o[prop] = p[prop];
	}
	return o;
}

// keep the original object intact;
function merge2(o, p) {
  var temp = {};
  for (var k in o) {
    temp[k] = o[k]
  }
  for (var prop in p) {
    if (temp.hasOwnProperty(prop)) {
      continue;
    } 
    temp[prop] = p[prop];
  }
  return temp;
}

function extend(o, p) {
  for (var prop in p) {
    o[prop] = p[prop];
  }
  return o;
}

// keep the original intact
function extend2(o, p) {
  var temp = {};
  for (var k in o) {
    temp[k] = o[k]
  }
  for (var prop in p) {
    temp[prop] = p[prop];
  }
  return temp
}

function readJSON(filename) {
  return new Promise(
    function(resolve, reject) {
      fs.readFile(filename, 'utf8', function(err, data) {
        if (err) {
          console.log('Cannot find file: ' + filename);
          reject(err);
        } else {
          resolve(JSON.parse(data));
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

module.exports = {
  merge: merge,
  extend: extend,
  readJSON: readJSON,
  readFile: readFile
};