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
  // path.resolve(__dirname, url)
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
        // separate out prismjs chunk
        resolve('./src/vendor/prismjs'),
      ],
      output: {
        assetFileNames(chunkInfo) {
          if (chunkInfo.names.length === 1) {
            // DEBUG
            // console.debug("assetFileNames", {
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
        // entryFileNames: `${outputsLibPath}${name}.js`,
        entryFileNames(chunkInfo) {
          // DEBUG
          // console.debug('entryFileNames', chunkInfo)
          if (
            chunkInfo.name === 'index' &&
            chunkInfo.facadeModuleId?.endsWith('vendor/prismjs/index.ts')
          ) {
            return `${outputsLibVenderPath}prism.js`
          }
          return `${outputsLibPath}${name}.js`
        },
        chunkFileNames: `[name].js`,
        // DEBUG
        // chunkFileNames(chunkInfo) {
        //   console.debug("chunkInfo", chunkInfo)
        //   return `[name].js`
        // },
        // https://rollupjs.org/configuration-options/#output-manualchunks
        manualChunks: {
          // vendor
          [`${outputsLibVenderPath}react`]: ['react', 'react-dom', 'react/jsx-runtime'],
          [`${outputsLibVenderPath}react-ext`]: [
            'react-router',
            '@tanstack/react-query',
            'axios',
            'zustand',
            '@nozbe/microfuzz/react',
            'react-helmet-async',
          ],
          // ui
          [`${outputsLibVenderPath}bootstrap`]: ['react-bootstrap'],
        },
      },
      // treeshake?
    },
    // manifest: true,
    sourcemap: true,
    // DEBUG
    // minify: false,
  },
  css: {
    // NOTE: only for dev-mode
    devSourcemap: true,
  },
  esbuild: {
    // strip from production build, mostly for development only so simply remove it
    // see: https://github.com/vitejs/vite/discussions/7920
    drop: ['debugger'],
    pure: ['console.log', 'console.debug'],
  },
  plugins: [
    react(),
    version(),
    // DEBUG
    visualizer({
      open: true,
      filename: 'bundle-visualization.html',
      emitFile: false, // to place output into "dist/" folder on build
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  define: {
    // TODO: required?
    'process.env': {},

    // head stuffs
    'import.meta.env.HEAD_TITLE': '"FCS Aggregator – Content Search"',
    // footer/help: contact address (footer/help page)
    'import.meta.env.CONTACT_ADDRESS': '"mailto:fcs@clarin.eu"',
    // footer: imprint, disclaimer, ...
    'import.meta.env.TERMS_AND_DISCLAIMER_ADDRESS':
      '"https://www.clarin.eu/content/terms-use-and-disclaimer"',

    // deployment on subpath, default is "/" for root
    'import.meta.env.DEPLOY_PATH': '"/"',
    // API base URL for FCS SRU Aggregator
    'import.meta.env.API_URL': '"https://contentsearch.clarin.eu/rest/"',
    // base URL for FCS Endpoint Validator to build redirect links
    'import.meta.env.VALIDATOR_URL': '"https://www.clarin.eu/fcsvalidator/"',

    // show direct link to search results
    'import.meta.env.SHOW_SEARCH_RESULT_LINK': 'false',
    // features
    'import.meta.env.FEATURE_TRACKING_MATOMO': 'true',
    // 'import.meta.env.FEATURE_TRACKING_MATOMO_PARAMS': JSON.stringify({ srcUrl: '', trackerUrl: '', siteId: -1, userId: '', domains: [] }),
  },
  resolve: {
    alias: {
      '@': resolve('./src'),
      '@assets': resolve('./src/assets'),
      '@images': resolve('./src/assets/images'),
      '@fonts': resolve('./src/assets/fonts'),
      '@vendor': resolve('./src/vendor'),
    },
    // extensions: ['.js', '.json', '.jsx', '.mjs', '.ts', '.tsx', '.yaml'],
  },
})
