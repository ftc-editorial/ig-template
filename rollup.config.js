import buble from 'rollup-plugin-buble';
import bowerResolve from 'rollup-plugin-bower-resolve';

export default {
	entry: 'client/js/main.js',
	dest: '.tmp/scripts/bundle.js',
	treeshake: false,
	plugins: [
		bowerResolve(),
		buble()
	],
	format: 'iife',
	sourceMap: true
};