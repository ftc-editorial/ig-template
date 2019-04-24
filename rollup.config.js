import babel from "rollup-plugin-babel";
import minify from "rollup-plugin-babel-minify";
import bowerResolve from "rollup-plugin-bower-resolve";

export default {
  input: 'client/main.js',
  plugins: [
    bowerResolve({
      module: true
    }),
    babel({
      exclude: 'node_modules/**'
    }),
    minify()
  ],
  output: {
    file: 'build/production/main.min.js',
    format: 'iife',
  },
};
