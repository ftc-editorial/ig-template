const path = require('path');
const BowerWebpackPlugin = require('bower-webpack-plugin');

module.exports = {
	// entry: './client/js/main.js',
	output: {
		path: path.join(__dirname, '.tmp/scripts'),
		filename: 'main.js',
		sourceMapFilename: '[file].map'
	},
	watch: true,
	devtool: 'source-map',
	module: {
		loaders: [
			{
				test: /\.js$/,
				include: [
					path.resolve(__dirname, 'client/js'),
					path.resolve(__dirname, 'bower_components')
				],
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