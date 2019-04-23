const path = require('path');
const fs = require('fs');
const stripBom = require('strip-bom');
const stripJsonComments = require('strip-json-comments');
const parseJson = require('parse-json');
const {
  promisify
} = require('util');

const parse = (data, filePath) => parseJson(stripBom(stripJsonComments(data)), path.relative('.', filePath));

module.exports = fp => promisify(fs.readFile)(fp, 'utf8').then(data => parse(data, fp));
