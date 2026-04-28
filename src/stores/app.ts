import type { UseBoundStore } from 'zustand/react'
import { useStore } from 'zustand/react'
import type { StateCreator, StoreApi } from 'zustand/vanilla'
import { createStore } from 'zustand/vanilla'

import { SetupAndInstallScriptParams as MatomoSetupParams } from '@/utils/matomo'

// see: https://zustand.docs.pmnd.rs/apis/create-store#updating-state-based-on-previous-state

// --------------------------------------------------------------------------

type AppStoreState = {
  deployPath: string
  apiURL: string
  validatorURL: string | null

  appVersion: string
  appGitCommitRef: string | null
  appGitCommitSha: string | null
  appGitCommitDate: string | null
  appGitCommitTag: string | null

  uiVersion: string
  uiGitCommitSha: string
  uiGitCommitRef: string | null
  uiGitCommitDate: string

  showSearchResultLink: boolean
  weblichtEnabled: boolean

  appTitle: string
  appTitleHead: string

  matomoTrackingEnabled: boolean
  matomoTrackingParams: string | MatomoSetupParams | null

  authEnabled: boolean
  authUsername: string | null
  isAuthenticated: boolean
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

  setAppVersion: (
    appVersion:
      | AppStoreState['appVersion']
      | ((currentAppVersion: AppStoreState['appVersion']) => AppStoreState['appVersion'])
  ) => void
  setAppGitCommitRef: (
    ref:
      | AppStoreState['appGitCommitRef']
      | ((currentRef: AppStoreState['appGitCommitRef']) => AppStoreState['appGitCommitRef'])
  ) => void
  setAppGitCommitSha: (
    sha:
      | AppStoreState['appGitCommitSha']
      | ((currentSha: AppStoreState['appGitCommitSha']) => AppStoreState['appGitCommitSha'])
  ) => void
  setAppGitCommitDate: (
    date:
      | AppStoreState['appGitCommitDate']
      | ((currentDate: AppStoreState['appGitCommitDate']) => AppStoreState['appGitCommitDate'])
  ) => void
  setAppGitCommitTag: (
    tag:
      | AppStoreState['appGitCommitTag']
      | ((currentTag: AppStoreState['appGitCommitTag']) => AppStoreState['appGitCommitTag'])
  ) => void

  setShowSearchResultLink: (
    show:
      | AppStoreState['showSearchResultLink']
      | ((oldShow: AppStoreState['showSearchResultLink']) => AppStoreState['showSearchResultLink'])
  ) => void
  setWeblichtEnabled: (
    enabled:
      | AppStoreState['weblichtEnabled']
      | ((oldEnabled: AppStoreState['weblichtEnabled']) => AppStoreState['weblichtEnabled'])
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

  setAuthEnabled: (
    enabled:
      | AppStoreState['authEnabled']
      | ((isEnabled: AppStoreState['authEnabled']) => AppStoreState['authEnabled'])
  ) => void
  setAuthUsername: (
    user:
      | AppStoreState['authUsername']
      | ((oldUser: AppStoreState['authUsername']) => AppStoreState['authUsername'])
  ) => void

  reset: () => void
}
type AppStore = AppStoreState & AppStoreActions

// --------------------------------------------------------------------------

export const DEFAULT_STATE: AppStoreState = {
  deployPath: import.meta.env.DEPLOY_PATH,
  apiURL: import.meta.env.API_URL,
  validatorURL: import.meta.env.VALIDATOR_URL,

  appVersion: import.meta.env.APPLICATION_VERSION,
  appGitCommitRef: import.meta.env.GIT_APP_INFO_REF,
  appGitCommitSha: import.meta.env.GIT_APP_INFO_SHA,
  appGitCommitDate: import.meta.env.GIT_APP_INFO_DATE,
  appGitCommitTag: import.meta.env.GIT_APP_INFO_TAG,

  uiVersion: import.meta.env.UI_VERSION,
  uiGitCommitSha: import.meta.env.GIT_UI_INFO_SHA,
  uiGitCommitRef: import.meta.env.GIT_UI_INFO_REF,
  uiGitCommitDate: import.meta.env.GIT_UI_INFO_DATE,

  showSearchResultLink: import.meta.env.SHOW_SEARCH_RESULT_LINK,
  weblichtEnabled: import.meta.env.WEBLICHT_ENABLED,
  appTitle: import.meta.env.APP_TITLE,
  appTitleHead: import.meta.env.APP_TITLE_HEAD,

  matomoTrackingEnabled: import.meta.env.FEATURE_TRACKING_MATOMO, // read-only
  matomoTrackingParams: import.meta.env.FEATURE_TRACKING_MATOMO
    ? import.meta.env.FEATURE_TRACKING_MATOMO_PARAMS
    : null,

  authEnabled:
    import.meta.env.FEATURE_AUTHENTICATION && import.meta.env.FEATURE_AUTHENTICATION_ENABLED,
  authUsername: null,
  isAuthenticated: false,
}

export const createAppSlice: StateCreator<AppStore> = (set) => ({
  // state
  ...DEFAULT_STATE,

  // actions
  setDeployPath: (path) =>
    set((state) => ({ deployPath: typeof path === 'function' ? path(state.deployPath) : path })),
  setApiURL: (url) =>
    set((state) => ({ apiURL: typeof url === 'function' ? url(state.apiURL) : url })),
  setValidatorURL: (url) =>
    set((state) => ({ validatorURL: typeof url === 'function' ? url(state.validatorURL) : url })),

  setAppVersion: (url) =>
    set((state) => ({ appVersion: typeof url === 'function' ? url(state.appVersion) : url })),
  setAppGitCommitRef: (url) =>
    set((state) => ({
      appGitCommitRef: typeof url === 'function' ? url(state.appGitCommitRef) : url,
    })),
  setAppGitCommitSha: (url) =>
    set((state) => ({
      appGitCommitSha: typeof url === 'function' ? url(state.appGitCommitSha) : url,
    })),
  setAppGitCommitDate: (url) =>
    set((state) => ({
      appGitCommitDate: typeof url === 'function' ? url(state.appGitCommitDate) : url,
    })),
  setAppGitCommitTag: (url) =>
    set((state) => ({
      appGitCommitTag: typeof url === 'function' ? url(state.appGitCommitTag) : url,
    })),

  setShowSearchResultLink: (show) =>
    set((state) => ({
      showSearchResultLink: typeof show === 'function' ? show(state.showSearchResultLink) : show,
    })),
  setWeblichtEnabled: (enabled) =>
    set((state) => ({
      weblichtEnabled: typeof enabled === 'function' ? enabled(state.weblichtEnabled) : enabled,
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
  setAuthEnabled: (enabled) =>
    import.meta.env.FEATURE_AUTHENTICATION
      ? set((state) => ({
          authEnabled: typeof enabled === 'function' ? enabled(state.authEnabled) : enabled,
        }))
      : null,
  setAuthUsername: (user) =>
    set((state) => {
      const newUsername = typeof user === 'function' ? user(state.authUsername) : user
      return {
        authUsername: newUsername,
        isAuthenticated: newUsername !== null && newUsername !== 'anonymous', // anonymous
      }
    }),

  reset: () => {
    set(() => ({ ...DEFAULT_STATE }) satisfies AppStoreState)
  },
})

// --------------------------------------------------------------------------

const appStore = createStore<AppStore>(createAppSlice)

export default appStore

// --------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useAppStore = ((selector?: (state: AppStore) => any) => {
  const useBoundStore = useStore(appStore, selector!)
  return useBoundStore
}) as UseBoundStore<StoreApi<AppStore>>
Object.assign(useAppStore, appStore)

// --------------------------------------------------------------------------

// both variants can be used to use reactive state

// const validatorUrl = useAppStore((state) => state.validatorURL)
//
// const [validatorUrl, setValidatorUrl] = useState(AppStore.getState().validatorURL)
// AppStore.subscribe((state) => setValidatorUrl(state.validatorURL))

// --------------------------------------------------------------------------
