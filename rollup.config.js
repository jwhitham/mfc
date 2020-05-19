import sourcemaps from 'rollup-plugin-sourcemaps';

export default {
  input: 'dist/main.js',
  output: {
    file: 'dist/main-bundle.js',
    format: 'iife',
    sourcemap: true,
    globals: {
      jquery: 'jQuery'
    },
    name: 'mfc'
  },
  external: [
    'jquery'
  ],
  plugins: [
    sourcemaps()
  ]
};

