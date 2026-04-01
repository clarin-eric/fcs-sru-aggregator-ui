import type { UseBoundStore } from 'zustand/react'
import { useStore } from 'zustand/react'
import type { StateCreator, StoreApi } from 'zustand/vanilla'
import { createStore } from 'zustand/vanilla'

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

  reset: () => void
}
export type LocaleStore = LocaleStoreState & LocaleStoreActions

// --------------------------------------------------------------------------

export const DEFAULT_STATE: LocaleStoreState = {
  locale: import.meta.env.LOCALE ?? 'en',
  locales: import.meta.env.LOCALES ?? (import.meta.env.LOCALE ? [import.meta.env.LOCALE] : ['en']),
}

export const createLocaleSlice: StateCreator<LocaleStore> = (set) => ({
  // state
  ...DEFAULT_STATE,

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

  reset: () => {
    set(() => ({ ...DEFAULT_STATE }) satisfies LocaleStoreState)
  },
})

// --------------------------------------------------------------------------

const localeStore = createStore<LocaleStore>(createLocaleSlice)

export default localeStore

// --------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useLocaleStore = ((selector?: (state: LocaleStore) => any) => {
  const useBoundStore = useStore(localeStore, selector!)
  return useBoundStore
}) as UseBoundStore<StoreApi<LocaleStore>>
Object.assign(useLocaleStore, localeStore)

// --------------------------------------------------------------------------
