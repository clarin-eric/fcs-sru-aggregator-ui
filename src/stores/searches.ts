import type { UseBoundStore } from 'zustand/react'
import { useStore } from 'zustand/react'
import type { StateCreator, StoreApi } from 'zustand/vanilla'
import { createStore } from 'zustand/vanilla'

// --------------------------------------------------------------------------

type SearchesStoreState = {
  // current (active) search id
  searchId: string | undefined
}

type SearchesStoreActions = {
  setSearchId: (
    searchId:
      | SearchesStoreState['searchId']
      | ((currentSearchId: SearchesStoreState['searchId']) => SearchesStoreState['searchId'])
  ) => void

  reset: () => void
}

export type SearchesStore = SearchesStoreState & SearchesStoreActions

// --------------------------------------------------------------------------

export const DEFAULT_STATE: SearchesStoreState = {
  searchId: undefined,
}

export const createSearchesSlice: StateCreator<SearchesStore> = (set) => ({
  // state
  ...DEFAULT_STATE,

  // actions
  setSearchId: (nextSearchId) =>
    set((state) => ({
      searchId: typeof nextSearchId === 'function' ? nextSearchId(state.searchId) : nextSearchId,
    })),

  reset: () => {
    set(() => ({ ...DEFAULT_STATE }) satisfies SearchesStoreState)
  },
})

// --------------------------------------------------------------------------

const searchesStore = createStore<SearchesStore>(createSearchesSlice)

export default searchesStore

// --------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useSearchesStore = ((selector?: (state: SearchesStore) => any) => {
  const useBoundStore = useStore(searchesStore, selector!)
  return useBoundStore
}) as UseBoundStore<StoreApi<SearchesStore>>
Object.assign(useSearchesStore, searchesStore)

// --------------------------------------------------------------------------
