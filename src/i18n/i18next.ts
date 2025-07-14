import type { TOptions } from 'i18next'
import i18n from 'i18next'
import resourcesToBackend from 'i18next-resources-to-backend'
import { initReactI18next } from 'react-i18next'

import localeStore from '@/stores/locale'

import resourcesEnApp from '@/locales/en/app.json'
import resourcesEnCommon from '@/locales/en/common.json'

// pre-loaded resources
const resources = {
  en: {
    app: resourcesEnApp,
    common: resourcesEnCommon,
  },
}

// i18n namespace prefix to allow for overriding global defaults
export const I18N_NS_CONTEXT_PREFIX = import.meta.env.I18N_NS_CONTEXT_PREFIX as string | undefined
// default language
export const LANGUAGE = localeStore.getInitialState().locale
export const LANGUAGES = localeStore.getInitialState().locales

// --------------------------------------------------------------------------

export function resolveNs(ns?: string[] | string, defaultNSs?: string[]) {
  if (!ns) return defaultNSs
  const nsParam = typeof ns === 'string' ? [ns] : ns
  const nsAndPrefiex = I18N_NS_CONTEXT_PREFIX
    ? [...nsParam.map((ns) => `${I18N_NS_CONTEXT_PREFIX}.${ns}`), ...nsParam]
    : nsParam
  return defaultNSs ? [...nsAndPrefiex, ...defaultNSs] : nsAndPrefiex
}

// --------------------------------------------------------------------------

// list of all (pre-loaded namespaces)
const I18N_NS_ALL_BASE = ['app', 'common']
// build list with prefixed variants with higher lookup priority
const I18N_NS_ALL = resolveNs(I18N_NS_ALL_BASE)

// --------------------------------------------------------------------------

function toArray(val: readonly string[] | string) {
  return typeof val === 'string' || !Array.isArray(val) ? [String(val)] : val
}

function postProcessTryPrefixedNamespacesFirst(
  value: string,
  key: string | string[],
  options: TOptions,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  translator: any
): string {
  // if no prefix defined, nothing to do here
  if (I18N_NS_CONTEXT_PREFIX === undefined) return value

  // console.debug('[postProcessor:try-prefixed-namespaces-first]', { value, key, options, translator })

  // if we are recursing, then exit
  if (options?.['postProcessTryPrefixedNamespacesFirst'] !== undefined) return value

  // see: i18next/src/Translator.js

  const keys = toArray(key)
  const namespaces = toArray(options.ns || translator.options.defaultNS || [])
  // NOTE: we do NOT do any namespaces check in keys

  // check which namespaces to search for key
  const resolved = translator.resolve(keys, options)

  // we found a translation, only check namespace where key was found (and if options.ns argument)
  // if no translation, check all namespaces
  const namespacesToCheck =
    resolved?.res !== undefined ? [...toArray(options.ns || []), resolved.usedNS] : namespaces

  // prefix namespaces
  const namespacesPrefixed = namespacesToCheck.map((ns: string) =>
    ns.startsWith(I18N_NS_CONTEXT_PREFIX) ? ns : `${I18N_NS_CONTEXT_PREFIX}.${ns}`
  )

  // use translator.translate() instead of translator.resolve() for all the fancy processing
  const result = translator.translate(keys, {
    ...options,
    ns: namespacesPrefixed,
    postProcessTryPrefixedNamespacesFirst: true, // marker to stop recursion
  })

  // const resolvedPrefixed = translator.resolve(keys, { ...options, ns: namespacesPrefixed })
  // console.debug('[postProcessor:try-prefixed-namespaces-first]', { resolved, resolvedPrefixed, keys, namespaces, namespacesToCheck, namespacesPrefixed, result,})

  // return "new" result if not a key (not found) otherwise return default value
  return !keys.includes(result) ? result : value
}

// NOTE: that translator.exists() will NOT work as it ignores namespaces

// --------------------------------------------------------------------------

// configure i18next
i18n
  // react integration
  .use(initReactI18next)
  // translation lookup with prefix
  .use({
    type: 'postProcessor',
    name: 'try-prefixed-namespaces-first',
    process: postProcessTryPrefixedNamespacesFirst,
  })
  // dynamic resource loading
  .use(
    resourcesToBackend((language: string, namespace: string) => {
      // console.debug('[resourcesToBackend] Trying to load resources', { language, namespace })
      const resources = import(`@/locales/${language}/${namespace}.json`)
      // console.debug('[resourcesToBackend] Got resources', resources)
      return resources
    })
  )
  // initialization
  .init({
    lng: LANGUAGE,
    fallbackLng: LANGUAGE,
    supportedLngs: LANGUAGES,

    // i18n all namespaces to load
    ns: I18N_NS_ALL,
    // i18n namespaces check for keys
    defaultNS: I18N_NS_ALL_BASE,
    fallbackNS: I18N_NS_ALL_BASE,

    debug: import.meta.env.DEV,
    // saveMissing: true,
    // returnDetails: true,

    interpolation: {
      escapeValue: false,
    },
    // returnNull: true,

    postProcess: ['try-prefixed-namespaces-first'],

    resources,
    partialBundledLanguages: true,

    react: {
      // useTranslation() is able to to multiple namespaces!
      nsMode: 'fallback',
    },
  })

// DEBUG
Object.assign(window, { i18n })

export default i18n
