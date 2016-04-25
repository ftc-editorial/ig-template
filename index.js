const minimist = require('minimist');

const knownOptions = {
	string: 'input',
	default: {input: 'data.json'},
	alias: {i: 'input'}
};

const argv = minimist(process.argv.slice(2), knownOptions);

console.log(argv);