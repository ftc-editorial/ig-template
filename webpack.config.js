const path = require('path');
const BowerWebpackPlugin = require('bower-webpack-plugin');

module.exports = {
	// entry: './client/js/main.js',
	output: {
		path: path.join(__dirname, '.tmp/scripts'),
		filename: 'bundle.js',
		sourceMapFilename: '[file].map'
	},
	watch: true,
	devtool: 'source-map',
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