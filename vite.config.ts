import { defineConfig } from 'vite'
// import { loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import version from 'vite-plugin-package-version'
// import { visualizer } from 'rollup-plugin-visualizer'

// TODO: 'node:' prefix?
import { fileURLToPath, URL } from 'url'
// import { resolve } from 'path'
// import path from 'path'

import pkg from './package.json'

// name for our custom JS/CSS output
const name = `${pkg.name}-${pkg.version}`

// output paths
const outputsLibPath = 'lib/'
const outputsLibVenderPath = `${outputsLibPath}vender/`
const outputsLibAssetsPath = `${outputsLibPath}assets/`

// https://vite.dev/config/
export default defineConfig({
  // https://vite.dev/guide/build.html#relative-base
  base: './',
  build: {
    rollupOptions: {
      // https://rollupjs.org/configuration-options/#input
      input: [
        // main entry point
        fileURLToPath(new URL('./index.html', import.meta.url)),
        // separate output chunks (primarily for CSS)
        'bootstrap/dist/css/bootstrap.min.css',
      ],
      output: {
        assetFileNames(chunkInfo) {
          if (chunkInfo.names.length === 1) {
            // DEBUG
            // console.debug({
            //   name: chunkInfo.names,
            //   originalFileNames: chunkInfo.originalFileNames,
            //   sourceLen: chunkInfo.source.length,
            // })
            // main output chunk
            if (chunkInfo.names.includes('index.css')) {
              return `${outputsLibPath}${name}.[ext]`
            }
            // known output chunks (vendor)
            if (['bootstrap.css'].some((name) => chunkInfo.names.includes(name))) {
              // TODO: or check if suffix matching to `originalFileNames`
              return `${outputsLibVenderPath}[name].[ext]`
            }
          }
          // default output chunks (assets)
          return `${outputsLibAssetsPath}[name].[ext]`
        },
        entryFileNames: `${outputsLibPath}${name}.js`,
        chunkFileNames: `[name].js`,
        // DEBUG
        // chunkFileNames(chunkInfo) {
        //   console.debug(chunkInfo)
        //   return `[name].js`
        // },
        // https://rollupjs.org/configuration-options/#output-manualchunks
        manualChunks: {
          // vendor
          [`${outputsLibVenderPath}react`]: ['react', 'react-dom', 'react/jsx-runtime'],
          // ui
          [`${outputsLibVenderPath}bootstrap`]: ['react-bootstrap'],
        },
      },
      // treeshake?
    },
    sourcemap: true,
    // DEBUG
    // minify: false,
  },
  css: {
    // NOTE: only for dev-mode
    devSourcemap: true,
  },
  plugins: [
    react(),
    version(),
    // DEBUG
    // visualizer({ open: true, filename: 'bundle-visualization.html' }),
  ],
  define: {
    // TODO: required?
    'process.env': {},
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // '@': path.resolve(__dirname, './src'),
    },
    // extensions: ['.js', '.json', '.jsx', '.mjs', '.ts', '.tsx', '.yaml'],
  },
})
