import type { UseBoundStore } from 'zustand/react'
import { useStore } from 'zustand/react'
import type { StateCreator, StoreApi } from 'zustand/vanilla'
import { createStore } from 'zustand/vanilla'

import type { ResultsSorting, ResultsViewMode } from '@/utils/results'
import { DEFAULT_SORTING, DEFAULT_VIEW_MODE } from '@/utils/results'

// --------------------------------------------------------------------------

type SearchResultsStoreState = {
  viewMode: ResultsViewMode
  sorting: ResultsSorting
  filter: string
  showResourceDetails: boolean
  showDiagnostics: boolean
}

type SearchResultsStoreActions = {
  setViewMode: (
    viewMode:
      | SearchResultsStoreState['viewMode']
      | ((
          currentViewMode: SearchResultsStoreState['viewMode']
        ) => SearchResultsStoreState['viewMode'])
  ) => void
  setSorting: (
    sorting:
      | SearchResultsStoreState['sorting']
      | ((currentSorting: SearchResultsStoreState['sorting']) => SearchResultsStoreState['sorting'])
  ) => void
  setFilter: (
    filter:
      | SearchResultsStoreState['filter']
      | ((currentFilter: SearchResultsStoreState['filter']) => SearchResultsStoreState['filter'])
  ) => void

  setShowResourceDetails: (
    showResourceDetails:
      | SearchResultsStoreState['showResourceDetails']
      | ((
          currentShowResourceDetails: SearchResultsStoreState['showResourceDetails']
        ) => SearchResultsStoreState['showResourceDetails'])
  ) => void
  setShowDiagnostics: (
    showDiagnostics:
      | SearchResultsStoreState['showDiagnostics']
      | ((
          currentShowDiagnostics: SearchResultsStoreState['showDiagnostics']
        ) => SearchResultsStoreState['showDiagnostics'])
  ) => void

  reset: () => void
}

export type SearchResultsStore = SearchResultsStoreState & SearchResultsStoreActions

// --------------------------------------------------------------------------

export const DEFAULT_STATE: SearchResultsStoreState = {
  viewMode: DEFAULT_VIEW_MODE,
  sorting: DEFAULT_SORTING,
  filter: '',
  showResourceDetails: false,
  showDiagnostics: false,
}

export const createSearchResultsSlice: StateCreator<SearchResultsStore> = (set) => ({
  // state
  ...DEFAULT_STATE,

  // actions
  setViewMode: (nextViewMode) =>
    set((state) => ({
      viewMode: typeof nextViewMode === 'function' ? nextViewMode(state.viewMode) : nextViewMode,
    })),
  setSorting: (nextSorting) =>
    set((state) => ({
      sorting: typeof nextSorting === 'function' ? nextSorting(state.sorting) : nextSorting,
    })),
  setFilter: (nextFilter) =>
    set((state) => ({
      filter: typeof nextFilter === 'function' ? nextFilter(state.filter) : nextFilter,
    })),

  setShowResourceDetails: (nextShowResourceDetails) =>
    set((state) => ({
      showResourceDetails:
        typeof nextShowResourceDetails === 'function'
          ? nextShowResourceDetails(state.showResourceDetails)
          : nextShowResourceDetails,
    })),
  setShowDiagnostics: (nextShowDiagnostics) =>
    set((state) => ({
      showDiagnostics:
        typeof nextShowDiagnostics === 'function'
          ? nextShowDiagnostics(state.showDiagnostics)
          : nextShowDiagnostics,
    })),

  reset: () => {
    set(() => ({ ...DEFAULT_STATE }) satisfies SearchResultsStoreState)
  },
})

// --------------------------------------------------------------------------

const searchresultsStore = createStore<SearchResultsStore>(createSearchResultsSlice)

export default searchresultsStore

// --------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useSearchResultsStore = ((selector?: (state: SearchResultsStore) => any) => {
  const useBoundStore = useStore(searchresultsStore, selector!)
  return useBoundStore
}) as UseBoundStore<StoreApi<SearchResultsStore>>
Object.assign(useSearchResultsStore, searchresultsStore)

// --------------------------------------------------------------------------
