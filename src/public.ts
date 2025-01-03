import AppStore from '@/stores/app'

// --------------------------------------------------------------------------

type MyAggregatorConfiguration = {
  DEPLOY_PATH: string
  API_URL: string
  VALIDATOR_URL: string
  SHOW_SEARCH_RESULT_LINK: boolean
}

declare const window: Window &
  typeof globalThis & {
    MyAggregator: MyAggregatorConfiguration & { [key: string]: unknown }
    _paq: []
  }

// --------------------------------------------------------------------------

// set global defaults
window.MyAggregator = window.MyAggregator || {}
window._paq = window._paq || []

// --------------------------------------------------------------------------

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

  // observe and notify about invalid configuration changes
  window.MyAggregator = new Proxy(window.MyAggregator, {
    get(target, prop: string) {
      return target[prop]
    },
    set(target, prop: string, val: unknown) {
      if (prop === 'DEPLOY_PATH') {
        console.error('Configuration DEPLOY_PATH can only be set on initialization!')
        return false
      }
      if (prop === 'API_URL') {
        console.error('Configuration API_URL can only be set on initialization!')
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
      target[prop] = val
      return true
    },
  })

  // TODO: for debugging
  Object.assign(window.MyAggregator, {
    getAppStore: () => AppStore,
  })
}
