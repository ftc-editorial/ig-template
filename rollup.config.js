const babili = require('rollup-plugin-babili');
const babel = require('rollup-plugin-babel');
const bowerResolve = require('rollup-plugin-bower-resolve');

export default {
  entry: 'client/main.js',
  plugins: [
    bowerResolve({
      module: true
    }),
    babel({
      exclude: 'node_modules/**'
    }),
    babili()
  ],
  targets: [
    {
      dest: '.tmp/scripts/main.js',
      format: 'iife',
    }
  ]
};