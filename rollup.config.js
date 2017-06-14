const babili = require('rollup-plugin-babili');
const babel = require('rollup-plugin-babel');

export default {
  entry: 'client/main.js',
  plugins: [
    babel({
      exclude: 'node_modules/**'
    }),
    babili()
  ],
  targets: [
    {
      dest: 'public/scripts/main.js',
      format: 'iife',
    }
  ]
};