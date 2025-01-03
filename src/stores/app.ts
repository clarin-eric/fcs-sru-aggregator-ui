import { createStore } from 'zustand/vanilla'

// see: https://zustand.docs.pmnd.rs/apis/create-store#updating-state-based-on-previous-state

// --------------------------------------------------------------------------

type AppStoreState = {
  deployPath: string
  apiURL: string
  validatorURL: string | null
  showSearchResultLink: boolean
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
}
type AppStore = AppStoreState & AppStoreActions

// --------------------------------------------------------------------------

const appStore = createStore<AppStore>((set) => ({
  // state
  deployPath: import.meta.env.DEPLOY_PATH,
  apiURL: import.meta.env.API_URL,
  validatorURL: import.meta.env.VALIDATOR_URL,
  showSearchResultLink: false,

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
}))

export default appStore
