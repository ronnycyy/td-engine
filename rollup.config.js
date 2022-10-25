import { terser } from 'rollup-plugin-terser';
import ts from "rollup-plugin-ts";
import json from '@rollup/plugin-json';

// https://rollupjs.org/guide/en/#configuration-files
export default {
  input: ['./src/index.ts'],
  output: [
    {
      file: './dist/tdEngine.js',
      name: 'tdEngine',
      format: 'iife',
      exports: 'default'
    },
    {
      file: './dist/tdEngine.min.js',
      name: 'tdEngine',
      format: 'iife',
      plugins: [terser()],
      exports: 'default'
    }
  ],
  plugins: [
    json(),
    ts({
      /* Plugin options */
    })
  ]
};
