const path = require('path');
const minimist = require('minimist');

const knownOptions = {
  string: 'input',
  default: {input: 'example.json'},
  alias: {i: 'input'}
};

const argv = minimist(process.argv.slice(2), knownOptions);

const taskName = argv._[0];
const dataFilename = path.resolve(__dirname, 'model', argv.i);
const projectName = path.basename(argv.i, '.json');

console.log(dataFilename);
console.log(projectName);

process.env.NODE_ENV = 'development';
console.log('before: ' + process.env.NODE_ENV);

Promise.resolve(process.env.NODE_ENV = 'production')
	.then(value => console.log(process.env.NODE_ENV));

console.log('after: ' + process.env.NODE_ENV);