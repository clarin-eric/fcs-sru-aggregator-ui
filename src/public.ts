import AppStore from '@/stores/app'
import LocaleStore from '@/stores/locale'
import { SetupAndInstallScriptParams as MatomoSetupParams } from './utils/matomo'

// --------------------------------------------------------------------------

type MyAggregatorConfiguration = {
  DEPLOY_PATH: string
  API_URL: string
  VALIDATOR_URL: string | null
  SHOW_SEARCH_RESULT_LINK: boolean
  APP_TITLE: string
  APP_TITLE_HEAD: string
  TERMS_AND_DISCLAIMER_ADDRESS: string
  CONTACT_ADDRESS: string | null
  MATOMO_TRACKING_PARAMS: string | MatomoSetupParams | null
  AUTH_USERNAME: string | null
}

declare const window: Window &
  typeof globalThis & {
    MyAggregator: Partial<MyAggregatorConfiguration> & { [key: string]: unknown }
    _paq: unknown[] | { push: (params: unknown[]) => void }
  }

// --------------------------------------------------------------------------

// set global defaults
window.MyAggregator = window['MyAggregator'] || {}
window._paq = window['_paq'] || []

// --------------------------------------------------------------------------

export const CONFIG_NAMES_ONLY_ON_INITIALIZATION = [
  'DEPLOY_PATH',
  'API_URL',
  'APP_TITLE',
  'APP_TITLE_HEAD',
  'TERMS_AND_DISCLAIMER_ADDRESS',
  'CONTACT_ADDRESS',
  'MATOMO_TRACKING_PARAMS',
]

/**
 * Configure AppStore with `MyAggregatorConfiguration`.
 * Must be called only once and should be run before the React App rendering happens.
 */
export function configure() {
  if (window.MyAggregator.DEPLOY_PATH !== undefined) {
    AppStore.getState().setDeployPath(window.MyAggregator.DEPLOY_PATH)
  }
  if (window.MyAggregator.API_URL !== undefined) {
    AppStore.getState().setApiURL(window.MyAggregator.API_URL)
  }
  if (window.MyAggregator.VALIDATOR_URL !== undefined) {
    AppStore.getState().setValidatorURL(window.MyAggregator.VALIDATOR_URL)
  }
  if (window.MyAggregator.SHOW_SEARCH_RESULT_LINK !== undefined) {
    AppStore.getState().setShowSearchResultLink(window.MyAggregator.SHOW_SEARCH_RESULT_LINK)
  }
  if (window.MyAggregator.APP_TITLE !== undefined) {
    AppStore.getState().setAppTitle(window.MyAggregator.APP_TITLE)
  }
  if (window.MyAggregator.APP_TITLE_HEAD !== undefined) {
    AppStore.getState().setAppTitleHead(window.MyAggregator.APP_TITLE_HEAD)
  }
  if (window.MyAggregator.TERMS_AND_DISCLAIMER_ADDRESS !== undefined) {
    AppStore.getState().setTermsAndDisclaimerUrl(window.MyAggregator.TERMS_AND_DISCLAIMER_ADDRESS)
  }
  if (window.MyAggregator.CONTACT_ADDRESS !== undefined) {
    AppStore.getState().setContactAddress(window.MyAggregator.CONTACT_ADDRESS)
  }
  if (import.meta.env.FEATURE_TRACKING_MATOMO) {
    if (window.MyAggregator.MATOMO_TRACKING_PARAMS !== undefined) {
      AppStore.getState().setMatomoTrackingParams(window.MyAggregator.MATOMO_TRACKING_PARAMS)
    }
  }
  if (window.MyAggregator.AUTH_USERNAME !== undefined) {
    AppStore.getState().setAuthUsername(window.MyAggregator.AUTH_USERNAME)
  }

  // observe and notify about invalid configuration changes
  window.MyAggregator = new Proxy(window.MyAggregator, {
    get(target, prop: string) {
      return target[prop]
    },
    set(target, prop: string, val: unknown) {
      if (CONFIG_NAMES_ONLY_ON_INITIALIZATION.includes(prop)) {
        console.error(`Configuration ${prop} can only be set on initialization!`)
        return false
      }

      if (prop === 'VALIDATOR_URL') {
        if (val === null || typeof val === 'string') {
          console.log('Updating VALIDATOR_URL ...')
          AppStore.getState().setValidatorURL(val)
          return true
        }
        return false
      }
      if (prop === 'SHOW_SEARCH_RESULT_LINK') {
        if (typeof val === 'boolean') {
          console.log('Updating SHOW_SEARCH_RESULT_LINK ...')
          AppStore.getState().setShowSearchResultLink(val)
          return true
        }
        return false
      }

      if (prop === 'AUTH_USERNAME') {
        if (val === null || typeof val === 'string') {
          console.log('Updating AUTH_USERNAME ...')
          AppStore.getState().setAuthUsername(val)
          return true
        }
        return false
      }

      target[prop] = val
      return true
    },
  })

  // TODO: for debugging
  Object.assign(window.MyAggregator, {
    getAppStore: () => AppStore,
  })
}

export function updateLocale() {
  // update locale stuff
  // - get browser languages
  // - check against available languages
  // - use match or fall back to default
  const localeStore = LocaleStore.getState()
  const userLanguages: string[] = [
    navigator.language || navigator.userLanguage,
    ...navigator.languages,
  ]
  let foundLocale = false
  for (const userLanguage of userLanguages) {
    // match, ok
    if (userLanguage === localeStore.locale) {
      // TODO: notify if not first match?
      console.debug('User locale matches default locale:', userLanguage)
      foundLocale = true
      break
    }
    // check if found in alternatives
    if (localeStore.locales.includes(userLanguage)) {
      console.log('Switching locale to:', userLanguage)
      localeStore.setLocale(userLanguage)
      foundLocale = true
      break
    }
  }
  if (!foundLocale) {
    console.warn(
      'User locale',
      userLanguages,
      'was not found in available languages',
      localeStore.locales
    )
  }

  // TODO: for debugging
  Object.assign(window.MyAggregator, {
    getLocaleStore: () => LocaleStore,
  })
}
