import babel from "rollup-plugin-babel";
import minify from "rollup-plugin-babel-minify";
import bowerResolve from "rollup-plugin-bower-resolve";

export default {
  input: {
    "main": 'client/main.js',
    "main.min": "client/main.js"
  },
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
    dir: "dist",
    entryFileNames: '[name].js',
    format: 'iife',
  },
};
