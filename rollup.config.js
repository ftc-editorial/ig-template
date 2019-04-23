import babel from "rollup-plugin-babel";
import minify from "rollup-plugin-babel-minify";
import bowerResolve from "rollup-plugin-bower-resolve";

export default {
  input: 'client/main.js',
  output: {
    dest: '.tmp/scripts/main.js',
      format: 'iife',
  },
  plugins: [
    bowerResolve({
      module: true
    }),
    babel({
      exclude: 'node_modules/**'
    }),
    minify()
  ] //,
  // targets: [
  //   {
  //     dest: '.tmp/scripts/main.js',
  //     format: 'iife',
  //   }
  // ]
};
