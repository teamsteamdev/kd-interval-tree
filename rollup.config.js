import resolve from 'rollup-plugin-node-resolve'
import builtins from 'rollup-plugin-node-builtins'
import commonjs from 'rollup-plugin-commonjs'
import babel from 'rollup-plugin-babel'

import pkg from './package.json'

export default [
  // browser-friendly UMD build
  {
    input: 'src/main.js',
    output: {
      file: pkg.browser,
      format: 'umd'
    },
    name: 'kdIntervalTree',
    plugins: [
      resolve({
        preferBuiltins: true
      }), // so Rollup can find dependencies
      builtins(), // so Rollup can include node global depencencies
      commonjs(), // so Rollup can convert dependencies to an ES module
      babel({
        exclude: 'node_modules/**' // only transpile our source code
      })
    ]
  },

  // CommonJS (for Node) and ES module (for bundlers) build.
  {
    input: 'src/main.js',
    external: ['lodash/fp', 'node-interval-tree', 'lodash/isError'],
    output: [
      { file: pkg.main, format: 'cjs' },
      { file: pkg.module, format: 'es' }
    ],
    plugins: [
      babel({
        exclude: 'node_modules/**' // only transpile our source code
      })
    ]
  }
]
