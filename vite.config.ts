import react from '@vitejs/plugin-react'
import {
  type ExternalOption,
  type InputOption,
  type LogHandlerWithDefault,
  type OutputOptions,
  type PreRenderedAsset,
  type PreRenderedChunk,
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

import { existsSync, globSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import { basename } from 'node:path'
// import path from 'node:path'

// build customization
import transformDynamicToStaticImportsPlugin from './build/transform-dynamic-to-static-imports'
import transformEmbedLocalesResourcesPlugin from './build/transform-embed-locales-resources'
import deleteGeneratedFilesPlugin from './build/delete-generated-files'

import pkg from './package.json'

// name for our custom JS/CSS output
const name = `${pkg.name}-${pkg.version}`

// output paths
const outputsLibPath = 'lib/'
const outputsLibVenderPath = `${outputsLibPath}vendor/`
const outputsLibAssetsPath = `${outputsLibPath}assets/`
const outputsLibLocalesPath = `${outputsLibPath}locales/`
// NOTE: that single chunk (bundle mode) build will not use the "lib/" prefix

// entry point name (dynamic components)
const entryQueryBuilder = 'src/components/QueryBuilder/index.ts'

// locale stuff
const inputSrcLocales = 'src/locales'
const I18n_LANGUAGES = ['en', 'de'] // languages we support
const I18N_PREFIXES = ['clarin', 'textplus'] // locale variants/overrides, active prefix will contain base namespaces, too
const I18N_BASE_NS = ['app', 'querysuggestions', 'common'] // bundle together
const I18N_LAZY_LOAD_NS = ['querybuilder'] // each its own chunk

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
          assetFileNames(chunkInfo: PreRenderedAsset) {
            if (chunkInfo.names.includes('index.css')) {
              // lazy import modules
              if (chunkInfo.originalFileNames.includes(entryQueryBuilder)) {
                return `${pkg.name}-query-builder-${pkg.version}.[ext]`
              }
              // main
              return `${name}.[ext]`
            }
            return `assets/[name].[ext]`
          },
          entryFileNames: `${name}.js`,
          chunkFileNames(chunkInfo: PreRenderedChunk) {
            if (chunkInfo.isDynamicEntry) {
              if (chunkInfo.facadeModuleId?.endsWith(entryQueryBuilder)) {
                return `${pkg.name}-query-builder-${pkg.version}.js`
              }
            }
            return `[name].js`
          },
        },
        treeshake: {
          moduleSideEffects(id: string, external: boolean) {
            // keep to defaults (-> true)
            if (external) return true
            // but mark QueryBuilder as side effect free
            if (id.endsWith(entryQueryBuilder)) return false
            // back to defaults for everything else
            return true
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

      // show direct link to search results
      'import.meta.env.SHOW_SEARCH_RESULT_LINK': process.env.VITE_SHOW_SEARCH_RESULT_LINK
        ? `${process.env.VITE_SHOW_SEARCH_RESULT_LINK}`
        : JSON.stringify(false),
      // features
      'import.meta.env.FEATURE_TRACKING_MATOMO': process.env.VITE_FEATURE_TRACKING_MATOMO
        ? `"${process.env.VITE_FEATURE_TRACKING_MATOMO}"`
        : JSON.stringify(true),
      // params = { srcUrl: '', trackerUrl: '', siteId: -1, userId: '', domains: [] }
      'import.meta.env.FEATURE_TRACKING_MATOMO_PARAMS': process.env
        .VITE_FEATURE_TRACKING_MATOMO_PARAMS
        ? `${process.env.VITE_FEATURE_TRACKING_MATOMO_PARAMS}`
        : JSON.stringify(null),

      // enable visual query builder
      'import.meta.env.FEATURE_QUERY_BUILDER': process.env.VITE_FEATURE_QUERY_BUILDER
        ? `${process.env.VITE_FEATURE_QUERY_BUILDER}`
        : JSON.stringify(true),

      'import.meta.env.LOCALE': process.env.VITE_LOCALE
        ? `"${process.env.VITE_LOCALE}"`
        : JSON.stringify(I18n_LANGUAGES[0]),
      'import.meta.env.LOCALES': process.env.VITE_LOCALES
        ? `${process.env.VITE_LOCALES}`
        : JSON.stringify(I18n_LANGUAGES),

      // i18n context prefix, e.g., CLARIN
      'import.meta.env.I18N_NS_CONTEXT_PREFIX': process.env.VITE_I18N_NS_CONTEXT_PREFIX
        ? `"${process.env.VITE_I18N_NS_CONTEXT_PREFIX}"`
        : JSON.stringify(I18N_PREFIXES[0]),
    },
    resolve: {
      alias: {
        '@': resolve('./src'),
        '@assets': resolve('./src/assets'),
        '@images': resolve('./src/assets/images'),
        '@fonts': resolve('./src/assets/fonts'),
        '@vendor': resolve('./src/vendor'),
        '@locales': resolve('./src/locales'),
      },
      // extensions: ['.js', '.json', '.jsx', '.mjs', '.ts', '.tsx', '.yaml'],
    },
  } satisfies UserConfig

  const paramLocalePrefix = JSON.parse(baseConfig.define['import.meta.env.I18N_NS_CONTEXT_PREFIX'])
  const paramLocale = JSON.parse(baseConfig.define['import.meta.env.LOCALE'])
  const paramFeatureQueryBuilderEnabled = JSON.parse(
    baseConfig.define['import.meta.env.FEATURE_QUERY_BUILDER']
  )

  // filter out stuff that is not enabled/available/used
  const i18nLazyLoadNs = I18N_LAZY_LOAD_NS.filter((ns) =>
    !paramFeatureQueryBuilderEnabled ? ns !== 'querybuilder' : true
  )

  if (isSingleChunk) {
    // keep a single chunk
    // Object.assign(baseConfig.define, {} satisfies Record<string, unknown>)

    // rewrite dynamic imports into static import
    baseConfig.plugins.push(transformDynamicToStaticImportsPlugin())
    // include locale dynamic import into default chunk
    baseConfig.plugins.push(
      transformEmbedLocalesResourcesPlugin({
        removeResourcesToBackend: true,
        localesImportPrefix: '@locales/',
        localesWithNamespaces: Object.assign(
          {},
          ...I18n_LANGUAGES.map((locale) => ({
            [locale]: [
              ...I18N_BASE_NS.map((ns) => `${paramLocalePrefix}.${ns}`),
              ...I18N_BASE_NS,
              ...i18nLazyLoadNs.map((ns) => `${paramLocalePrefix}.${ns}`),
              ...i18nLazyLoadNs,
            ].filter((ns) => existsSync(resolve(`${inputSrcLocales}/${locale}/${ns}.json`))),
          }))
        ),
      })
    )
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
        assetFileNames(chunkInfo: PreRenderedAsset) {
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
              if (chunkInfo.originalFileNames.includes(entryQueryBuilder)) {
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
        entryFileNames(chunkInfo: PreRenderedChunk) {
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
        chunkFileNames(chunkInfo: PreRenderedChunk) {
          // DEBUG
          // console.debug('chunkFileNames', {
          //   name: chunkInfo.name,
          //   facadeModuleId: chunkInfo.facadeModuleId,
          //   isDynamicEntry: chunkInfo.isDynamicEntry,
          //   // moduleIds: chunkInfo.moduleIds,
          // })
          if (chunkInfo.isDynamicEntry) {
            if (chunkInfo.facadeModuleId?.endsWith(entryQueryBuilder)) {
              return `${outputsLibPath}${pkg.name}-query-builder-${pkg.version}.js`
            }

            const locales_pat = `/${inputSrcLocales}/`
            if (
              !chunkInfo.name.startsWith(outputsLibLocalesPath) &&
              chunkInfo.facadeModuleId?.includes(locales_pat)
            ) {
              const filename = chunkInfo.facadeModuleId
              const language = filename
                .substring(filename.indexOf(locales_pat) + locales_pat.length)
                .split('/', 1)[0]
              return `${outputsLibLocalesPath}${language}/${chunkInfo.name}.js`
            }
          }
          return `[name].js`
        },
        // https://rollupjs.org/configuration-options/#output-manualchunks
        manualChunks: {
          // vendor
          [`${outputsLibVenderPath}react`]: ['react', 'react-dom', 'react/jsx-runtime'],
          [`${outputsLibVenderPath}react-ext`]: [
            '@nozbe/microfuzz/react',
            '@tanstack/react-query',
            'axios',
            'i18next-resources-to-backend',
            'i18next',
            'react-helmet-async',
            'react-i18next',
            'react-router',
            'react-slugify',
            'zustand',
          ],
          // ui
          [`${outputsLibVenderPath}bootstrap`]: ['react-bootstrap'],
        },
      } satisfies OutputOptions,
      // filter out locales from dynamic import detection
      // see: https://vite.dev/config/build-options.html#build-dynamicimportvarsoptions
      external: [
        ...globSync(`${inputSrcLocales}/*/*.*.json`).filter(
          (fn) => !basename(fn, '.json').startsWith(paramLocalePrefix)
        ),
      ] satisfies ExternalOption,
    })

    const manualChunks = (baseConfig.build.rollupOptions.output as OutputOptions).manualChunks!

    if (paramFeatureQueryBuilderEnabled) {
      Object.assign(manualChunks, {
        // lazy loaded chunk (query-builder)
        [`${outputsLibVenderPath}antlr4`]: ['antlr4ng'],
      })
    }

    // embed locale dynamic import into default chunk
    baseConfig.plugins.push(
      transformEmbedLocalesResourcesPlugin({
        removeResourcesToBackend: false,
        localesImportPrefix: '@locales/',
        localesWithNamespaces: Object.assign(
          {},
          ...I18n_LANGUAGES.filter((locale) => locale === paramLocale).map((locale) => ({
            [locale]: [
              ...I18N_BASE_NS.map((ns) => `${paramLocalePrefix}.${ns}`),
              ...I18N_BASE_NS,
            ].filter((ns) => existsSync(resolve(`${inputSrcLocales}/${locale}/${ns}.json`))),
          }))
        ),
      })
    )
    // delete generated output files we don't want
    baseConfig.plugins.push(
      deleteGeneratedFilesPlugin({
        pattern: [
          // other prefixed variants
          ...I18N_PREFIXES.filter((prefix) => prefix !== paramLocalePrefix).map(
            (prefix) => `${outputsLibLocalesPath}*/${prefix}*`
          ),
          // disabled dynamic components
          ...(!paramFeatureQueryBuilderEnabled
            ? [
                `${outputsLibLocalesPath}*/querybuilder.*`,
                `${outputsLibLocalesPath}*/*.querybuilder.*`,
              ]
            : []),
        ],
        debug: debug,
      })
    )

    // create bundled i18n locale chunks
    for (const language of I18n_LANGUAGES) {
      const modules: string[] = []
      const pushIfExists = (modules: string[], fn: string) => {
        if (!existsSync(resolve(fn))) return
        modules.push(fn)
      }

      // standard locale chunks for active prefix and shared base stuff
      for (const namespace of I18N_BASE_NS) {
        pushIfExists(
          modules,
          `${inputSrcLocales}/${language}/${paramLocalePrefix}.${namespace}.json`
        )
        pushIfExists(modules, `${inputSrcLocales}/${language}/${namespace}.json`)
      }
      if (modules.length > 0) {
        Object.assign(manualChunks, {
          [`${outputsLibLocalesPath}${language}/default`]: modules,
        })
      }

      // lazy load / async import modules
      for (const namespace of i18nLazyLoadNs) {
        const modules: string[] = []
        pushIfExists(
          modules,
          `${inputSrcLocales}/${language}/${paramLocalePrefix}.${namespace}.json`
        )
        pushIfExists(modules, `${inputSrcLocales}/${language}/${namespace}.json`)
        if (modules.length > 0) {
          Object.assign(manualChunks, {
            [`${outputsLibLocalesPath}${language}/${namespace}`]: modules,
          })
        }
      }
    }
    // NOTE: create a shared chunk for impossible locales? (i.e., other locale prefixes) -- external option
    // see also https://rollupjs.org/configuration-options/#output-manualchunks for ideas?
    // const toBeIgnoredModules: string[] = []
    // for (const language of I18n_LANGUAGES) {
    //   for (const prefix of I18N_PREFIXES) {
    //     if (prefix === paramLocalePrefix) continue
    //     const pushIfExists = (fn: string) => {
    //       if (!existsSync(resolve(fn))) return
    //       toBeIgnoredModules.push(fn)
    //     }
    //     for (const namespace of I18N_BASE_NS) {
    //       pushIfExists(`${inputSrcLocales}/${language}/${prefix}.${namespace}.json`)
    //     }
    //     for (const namespace of i18nLazyLoadNs) {
    //       pushIfExists(`${inputSrcLocales}/${language}/${prefix}.${namespace}.json`)
    //     }
    //   }
    //   if (toBeIgnoredModules.length > 0) {
    //     Object.assign(manualChunks, {
    //       [`${outputsLibLocalesPath}_ignoreme`]: toBeIgnoredModules,
    //     })
    //   }
    // }
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
