import react from '@vitejs/plugin-react'
import {
  type InputOption,
  type LogHandlerWithDefault,
  type OutputOptions,
  type RollupOptions,
} from 'rollup'
import { visualizer } from 'rollup-plugin-visualizer'
import {
  type BuildOptions,
  defineConfig,
  type ESBuildOptions,
  loadEnv,
  type UserConfig,
} from 'vite'
import version from 'vite-plugin-package-version'

import { fileURLToPath, URL } from 'node:url'
// import path from 'node:path'

import pkg from './package.json'

// name for our custom JS/CSS output
const name = `${pkg.name}-${pkg.version}`

// output paths
const outputsLibPath = 'lib/'
const outputsLibVenderPath = `${outputsLibPath}vendor/`
const outputsLibAssetsPath = `${outputsLibPath}assets/`
// NOTE: that single chunk (bundle mode) build will not use the "lib/" prefix

// flags
const debug = false

function resolve(url: string | URL) {
  // path.resolve(__dirname, url)
  return fileURLToPath(new URL(url, import.meta.url))
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // merge local .env* files
  process.env = Object.assign(process.env, loadEnv(mode, process.cwd(), ''))

  const isSingleChunk = mode === 'bundle'

  // base configuration
  const baseConfig = {
    // https://vite.dev/guide/build.html#relative-base
    base: './',
    build: {
      rollupOptions: {
        // https://rollupjs.org/configuration-options/#input
        input: [
          // main entry point
          resolve('./index.html'),
        ],
        output: {
          assetFileNames(chunkInfo) {
            if (chunkInfo.names.includes('index.css')) {
              // lazy import modules
              if (chunkInfo.originalFileNames.includes('src/components/QueryBuilder/index.ts')) {
                return `${pkg.name}-query-builder-${pkg.version}.[ext]`
              }
              // main
              return `${name}.[ext]`
            }
            return `assets/[name].[ext]`
          },
          entryFileNames: `${name}.js`,
          chunkFileNames(chunkInfo) {
            if (chunkInfo.isDynamicEntry) {
              if (chunkInfo.facadeModuleId?.endsWith('src/components/QueryBuilder/index.ts')) {
                return `${pkg.name}-query-builder-${pkg.version}.js`
              }
            }
            return `[name].js`
          },
        },
      },
      // manifest: true,
      sourcemap: true,
      // DEBUG
      // minify: false,
    },
    css: {
      // NOTE: only used in dev-mode
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

      // deployment on subpath, default is "/" for root
      // see also the "base" configuration on top
      'import.meta.env.DEPLOY_PATH': process.env.VITE_DEPLOY_PATH
        ? `"${process.env.VITE_DEPLOY_PATH}"`
        : JSON.stringify('/'),
      // canonical URL for FCS SRU Aggregator
      'import.meta.env.CANONCIAL_URL': process.env.VITE_CANONCIAL_URL
        ? `"${process.env.VITE_CANONCIAL_URL}"`
        : JSON.stringify('https://contentsearch.clarin.eu'),
      // API base URL for FCS SRU Aggregator
      'import.meta.env.API_URL': process.env.VITE_API_URL
        ? `"${process.env.VITE_API_URL}"`
        : JSON.stringify('https://contentsearch.clarin.eu/rest/'),
      // base URL for FCS Endpoint Validator to build redirect links
      'import.meta.env.VALIDATOR_URL': process.env.VITE_VALIDATOR_URL
        ? `"${process.env.VITE_VALIDATOR_URL}"`
        : JSON.stringify('https://www.clarin.eu/fcsvalidator/'),

      // application title
      'import.meta.env.APP_TITLE': process.env.VITE_APP_TITLE
        ? `"${process.env.VITE_APP_TITLE}"`
        : JSON.stringify('Content Search'),
      // HTML head page title
      'import.meta.env.APP_TITLE_HEAD': process.env.VITE_APP_TITLE_HEAD
        ? `"${process.env.VITE_APP_TITLE_HEAD}"`
        : JSON.stringify('FCS Aggregator – Content Search'),
      // footer: imprint, disclaimer, ...
      'import.meta.env.TERMS_AND_DISCLAIMER_ADDRESS': process.env.VITE_TERMS_AND_DISCLAIMER_ADDRESS
        ? `"${process.env.VITE_TERMS_AND_DISCLAIMER_ADDRESS}"`
        : JSON.stringify('https://www.clarin.eu/content/terms-use-and-disclaimer'),
      // footer/help: contact address (footer/help page)
      'import.meta.env.CONTACT_ADDRESS': process.env.VITE_CONTACT_ADDRESS
        ? `"${process.env.VITE_CONTACT_ADDRESS}"`
        : JSON.stringify('mailto:fcs@clarin.eu'),

      // show direct link to search results
      'import.meta.env.SHOW_SEARCH_RESULT_LINK': process.env.VITE_SHOW_SEARCH_RESULT_LINK
        ? `"${process.env.VITE_SHOW_SEARCH_RESULT_LINK}"`
        : JSON.stringify(false),
      // features
      'import.meta.env.FEATURE_TRACKING_MATOMO': process.env.VITE_FEATURE_TRACKING_MATOMO
        ? `"${process.env.VITE_FEATURE_TRACKING_MATOMO}"`
        : JSON.stringify(true),
      // params = { srcUrl: '', trackerUrl: '', siteId: -1, userId: '', domains: [] }
      'import.meta.env.FEATURE_TRACKING_MATOMO_PARAMS': process.env
        .VITE_FEATURE_TRACKING_MATOMO_PARAMS
        ? `"${process.env.VITE_FEATURE_TRACKING_MATOMO_PARAMS}"`
        : JSON.stringify(null),

      // enable visual query builder
      'import.meta.env.FEATURE_QUERY_BUILDER': process.env.VITE_FEATURE_QUERY_BUILDER
        ? `"${process.env.VITE_FEATURE_QUERY_BUILDER}"`
        : JSON.stringify(true),
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
  } satisfies UserConfig

  if (isSingleChunk) {
    // keep a single chunk
    // Object.assign(baseConfig.define, {} satisfies Record<string, unknown>)
  } else {
    // split into multiple chunks if not disabled
    Object.assign(baseConfig.build.rollupOptions, {
      input: [
        ...baseConfig.build.rollupOptions.input,
        // separate output chunks (primarily for CSS)
        'bootstrap/dist/css/bootstrap.min.css',
        // separate out prismjs chunk
        resolve('./src/vendor/prismjs'),
      ] satisfies InputOption,
      output: {
        assetFileNames(chunkInfo) {
          if (chunkInfo.names.length === 1) {
            // DEBUG
            // console.debug('assetFileNames', {
            //   name: chunkInfo.names,
            //   originalFileNames: chunkInfo.originalFileNames,
            //   sourceLen: chunkInfo.source.length,
            // })
            // main output chunks
            if (chunkInfo.names.includes('index.css')) {
              // lazy import modules
              if (chunkInfo.originalFileNames.includes('src/components/QueryBuilder/index.ts')) {
                return `${outputsLibPath}${pkg.name}-query-builder-${pkg.version}.[ext]`
              }
              // main
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
        entryFileNames(chunkInfo) {
          // DEBUG
          // console.debug('entryFileNames', chunkInfo)
          if (
            chunkInfo.name === 'index' &&
            chunkInfo.facadeModuleId?.endsWith('vendor/prismjs/index.ts')
          ) {
            return `${outputsLibVenderPath}prism.js`
          }
          // if (
          //   chunkInfo.name === 'index' &&
          //   chunkInfo.facadeModuleId?.endsWith('vendor/antlr4ng/index.ts')
          // ) {
          //   return `${outputsLibVenderPath}antlr.js`
          // }
          return `${outputsLibPath}${name}.js`
        },
        chunkFileNames(chunkInfo) {
          // DEBUG
          // console.debug('chunkFileNames', {
          //   name: chunkInfo.name,
          //   facadeModuleId: chunkInfo.facadeModuleId,
          //   isDynamicEntry: chunkInfo.isDynamicEntry,
          // })
          if (chunkInfo.isDynamicEntry) {
            if (chunkInfo.facadeModuleId?.endsWith('src/components/QueryBuilder/index.ts')) {
              return `${outputsLibPath}${pkg.name}-query-builder-${pkg.version}.js`
            }
          }
          return `[name].js`
        },
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
            'react-slugify',
          ],
          // lazy loaded chunk (query-builder)
          [`${outputsLibVenderPath}antlr4`]: ['antlr4ng'],
          // ui
          [`${outputsLibVenderPath}bootstrap`]: ['react-bootstrap'],
        },
      } satisfies OutputOptions,
    })
  }

  // debug options to print more logging messages (development stuff)
  if (debug) {
    Object.assign(baseConfig.esbuild, {
      logLevel: 'verbose',
    } satisfies ESBuildOptions)
    Object.assign(baseConfig.build.rollupOptions, {
      logLevel: 'debug',
      onLog: ((level, log, defaultHandler) => {
        console.log(`[${level}]: ${log}`)
        defaultHandler?.(level, log)
      }) satisfies LogHandlerWithDefault,
    } satisfies RollupOptions)
    Object.assign(baseConfig.build, {
      manifest: true,
      minify: false,
    } satisfies BuildOptions)
  }

  return baseConfig
})
