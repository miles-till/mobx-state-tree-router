import external from 'rollup-plugin-peer-deps-external';
import resolve from '@rollup/plugin-node-resolve';
//import builtins from 'rollup-plugin-node-builtins';
import builtins from 'builtin-modules';
import json from '@rollup/plugin-json';
import babel from 'rollup-plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import { uglify } from 'rollup-plugin-uglify';
import filesize from 'rollup-plugin-filesize';

import pkg from './package.json';

const input = 'src/index.js';
const globals = {
  react: 'React',
  'react-dom': 'ReactDOM',
  mobx: 'mobx',
  'mobx-react': 'mobxReact',
  'mobx-state-tree': 'mobxStateTree'
};

export default [
  {
    input: input,
    output: {
      name: 'mobxStateTreeRouter',
      file: pkg.main,
      format: 'umd',
      globals: globals,
      sourcemap: true
    },
    external: builtins,
    plugins: [
      external(),
      resolve({
        mainFields: ['module', 'main'],
        preferBuiltins: false
      }),
      //builtins(),
      json(),
      babel({
        exclude: 'node_modules/**',
        runtimeHelpers: true
      }),
      commonjs(),
      filesize()
    ]
  }, {
    input: input,
    output: {
      name: 'mobxStateTreeRouter',
      file: `dist/${pkg.name}.min.js`,
      format: 'umd',
      globals: globals,
      sourcemap: true
    },
    external: builtins,
    plugins: [
      external(),
      resolve({
        mainFields: ['module', 'main'],
        preferBuiltins: false
      }),
      //builtins(),
      json(),
      babel({
        exclude: 'node_modules/**',
        runtimeHelpers: true
      }),
      commonjs(),
      uglify(),
      filesize()
    ]
  }, {
    input: input,
    output: {
      file: pkg.module,
      format: 'es',
      globals: globals,
      sourcemap: true
    },
    external: builtins,
    plugins: [
      external({
        includeDependencies: true
      }),
      resolve({
        mainFields: ['module', 'main'],
        preferBuiltins: false
      }),
      babel({
        exclude: 'node_modules/**',
        runtimeHelpers: true
      }),
      commonjs(),
      filesize()
    ]
  }
];