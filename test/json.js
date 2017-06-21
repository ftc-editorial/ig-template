const loadJson = require('../util/load-json.js');
const path = require('path')
loadJson(path.resolve(__dirname, '../data/growing-pains-2.json'))
  .then(data => {
    console.log(data);
  });