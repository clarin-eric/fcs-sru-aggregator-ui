import { createStore } from 'zustand/vanilla'
import { useStore } from 'zustand/react'

// --------------------------------------------------------------------------

type LocaleStoreState = {
  locale: string
  locales: string[]
}
type LocaleStoreActions = {
  setLocale: (
    locale:
      | LocaleStoreState['locale']
      | ((currentLocale: LocaleStoreState['locale']) => LocaleStoreState['locale'])
  ) => void
  setLocales: (
    locales:
      | LocaleStoreState['locales']
      | ((currentLocales: LocaleStoreState['locales']) => LocaleStoreState['locales'])
  ) => void
}
export type LocaleStore = LocaleStoreState & LocaleStoreActions

// --------------------------------------------------------------------------

const localeStore = createStore<LocaleStore>((set) => ({
  // state
  locale: import.meta.env.LOCALE ?? 'en',
  locales: import.meta.env.LOCALES ?? import.meta.env.LOCALE ? [import.meta.env.LOCALE] : ['en'],

  // actions
  setLocale: (nextLocale) =>
    // TODO: we could add validation here to not call set() if locale is unknown...
    set((state) => ({
      locale: typeof nextLocale === 'function' ? nextLocale(state.locale) : nextLocale,
    })),
  setLocales: (nextLocales) =>
    set((state) => ({
      locales: typeof nextLocales === 'function' ? nextLocales(state.locales) : nextLocales,
    })),
}))

export default localeStore

// --------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useLocaleStore = (selector?: (state: LocaleStore) => any) => {
  const useBoundStore = useStore(localeStore, selector!)
  Object.assign(useBoundStore, localeStore)
  return useBoundStore
}

// --------------------------------------------------------------------------
