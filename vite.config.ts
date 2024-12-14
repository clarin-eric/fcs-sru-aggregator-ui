import { defineConfig } from 'vite'
// import { loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import version from 'vite-plugin-package-version'
import { visualizer } from 'rollup-plugin-visualizer'

// TODO: 'node:' prefix?
import { fileURLToPath, URL } from 'node:url'
// import path from 'node:path'

import pkg from './package.json'

// name for our custom JS/CSS output
const name = `${pkg.name}-${pkg.version}`

// output paths
const outputsLibPath = 'lib/'
const outputsLibVenderPath = `${outputsLibPath}vender/`
const outputsLibAssetsPath = `${outputsLibPath}assets/`

function resolve(url: string | URL) {
  return fileURLToPath(new URL(url, import.meta.url))
}

// https://vite.dev/config/
export default defineConfig({
  // https://vite.dev/guide/build.html#relative-base
  base: './',
  build: {
    rollupOptions: {
      // https://rollupjs.org/configuration-options/#input
      input: [
        // main entry point
        resolve('./index.html'),
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
          [`${outputsLibVenderPath}react-ext`]: ['react-router', '@tanstack/react-query', 'axios'],
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
    // https://github.com/pd4d10/vite-plugin-svgr
    // DEBUG
    visualizer({ open: true, filename: 'bundle-visualization.html' }),
  ],
  define: {
    // TODO: required?
    'process.env': {},
    'import.meta.env.CONTACT_ADDRESS': '"mailto:fcs@clarin.eu"',
    'import.meta.env.API_URL': '"https://contentsearch.clarin.eu/rest/"',
    'import.meta.env.VALIDATOR_URL': '"https://www.clarin.eu/fcsvalidator/"',
  },
  resolve: {
    alias: {
      '@': resolve('./src'),
      '@assets': resolve('./src/assets'),
      '@images': resolve('./src/assets/images'),
      '@fonts': resolve('./src/assets/fonts'),
      // '@': path.resolve(__dirname, './src'),
    },
    // extensions: ['.js', '.json', '.jsx', '.mjs', '.ts', '.tsx', '.yaml'],
  },
})
