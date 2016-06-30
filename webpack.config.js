const path = require('path');
const BowerWebpackPlugin = require('bower-webpack-plugin');

module.exports = {
	// entry: './client/js/main.js',
	output: {
		// path: path.join(__dirname, '.tmp/scripts'),
		filename: 'bundle.js'
	},
	watch: true,
	module: {
		loaders: [
			{
				test: /\.js$/,
				exclude: /(node_modules)/,
				loader: 'babel',
				query: {
					presets: ['es2015']
				}
			}
		]
	},
	plugins: [
		new BowerWebpackPlugin({
			includes: /\.js$/
		})
	]
};