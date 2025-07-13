import { createStore } from 'zustand/vanilla'

import { SetupAndInstallScriptParams as MatomoSetupParams } from '@/utils/matomo'

// see: https://zustand.docs.pmnd.rs/apis/create-store#updating-state-based-on-previous-state

// --------------------------------------------------------------------------

type AppStoreState = {
  deployPath: string
  apiURL: string
  validatorURL: string | null

  showSearchResultLink: boolean

  appTitle: string
  appTitleHead: string

  matomoTrackingEnabled: boolean
  matomoTrackingParams: string | MatomoSetupParams | null

  authUsername: string | null
}
type AppStoreActions = {
  setDeployPath: (
    path:
      | AppStoreState['deployPath']
      | ((currentPath: AppStoreState['deployPath']) => AppStoreState['deployPath'])
  ) => void
  setApiURL: (
    url:
      | AppStoreState['apiURL']
      | ((currentURL: AppStoreState['apiURL']) => AppStoreState['apiURL'])
  ) => void
  setValidatorURL: (
    url:
      | AppStoreState['validatorURL']
      | ((currentURL: AppStoreState['validatorURL']) => AppStoreState['validatorURL'])
  ) => void

  setShowSearchResultLink: (
    show:
      | AppStoreState['showSearchResultLink']
      | ((oldShow: AppStoreState['showSearchResultLink']) => AppStoreState['showSearchResultLink'])
  ) => void

  setAppTitle: (
    title:
      | AppStoreState['appTitle']
      | ((currentTitle: AppStoreState['appTitle']) => AppStoreState['appTitle'])
  ) => void
  setAppTitleHead: (
    title:
      | AppStoreState['appTitleHead']
      | ((currentTitle: AppStoreState['appTitleHead']) => AppStoreState['appTitleHead'])
  ) => void

  setMatomoTrackingParams: (
    params:
      | AppStoreState['matomoTrackingParams']
      | ((
          oldParams: AppStoreState['matomoTrackingParams']
        ) => AppStoreState['matomoTrackingParams'])
  ) => void

  setAuthUsername: (
    user:
      | AppStoreState['authUsername']
      | ((oldUser: AppStoreState['authUsername']) => AppStoreState['authUsername'])
  ) => void
}
type AppStore = AppStoreState & AppStoreActions

// --------------------------------------------------------------------------

const appStore = createStore<AppStore>((set) => ({
  // state
  deployPath: import.meta.env.DEPLOY_PATH,
  apiURL: import.meta.env.API_URL,
  validatorURL: import.meta.env.VALIDATOR_URL,
  showSearchResultLink: import.meta.env.SHOW_SEARCH_RESULT_LINK,
  appTitle: import.meta.env.APP_TITLE,
  appTitleHead: import.meta.env.APP_TITLE_HEAD,
  matomoTrackingEnabled: import.meta.env.FEATURE_TRACKING_MATOMO, // read-only
  matomoTrackingParams: import.meta.env.FEATURE_TRACKING_MATOMO
    ? import.meta.env.FEATURE_TRACKING_MATOMO_PARAMS
    : null,
  authUsername: null,

  // actions
  setDeployPath: (path) =>
    set((state) => ({ deployPath: typeof path === 'function' ? path(state.deployPath) : path })),
  setApiURL: (url) =>
    set((state) => ({ apiURL: typeof url === 'function' ? url(state.apiURL) : url })),
  setValidatorURL: (url) =>
    set((state) => ({ validatorURL: typeof url === 'function' ? url(state.validatorURL) : url })),
  setShowSearchResultLink: (show) =>
    set((state) => ({
      showSearchResultLink: typeof show === 'function' ? show(state.showSearchResultLink) : show,
    })),
  setAppTitle: (title) =>
    set((state) => ({ appTitle: typeof title === 'function' ? title(state.appTitle) : title })),
  setAppTitleHead: (title) =>
    set((state) => ({
      appTitleHead: typeof title === 'function' ? title(state.appTitleHead) : title,
    })),
  setMatomoTrackingParams: (params) =>
    set((state) => ({
      matomoTrackingParams:
        typeof params === 'function' ? params(state.matomoTrackingParams) : params,
    })),
  setAuthUsername: (user) =>
    set((state) => ({
      authUsername: typeof user === 'function' ? user(state.authUsername) : user,
    })),
}))

export default appStore
