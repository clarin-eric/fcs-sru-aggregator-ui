import type { UseBoundStore } from 'zustand/react'
import { useStore } from 'zustand/react'
import type { StateCreator, StoreApi } from 'zustand/vanilla'
import { createStore } from 'zustand/vanilla'

import type { ResourceSelectionModalViewOptionGrouping } from '@/utils/search'
import { DEFAULT_RESOURCE_VIEW_GROUPING } from '@/utils/search'

// --------------------------------------------------------------------------

type ModalsStoreState = {
  showResourceSelection: boolean
  showLanguageSelection: boolean
  showQuerySuggestions: boolean
  showQueryBuilder: boolean

  resourceSelectionGrouping: ResourceSelectionModalViewOptionGrouping
}

type ModalsStoreActions = {
  setShowResourceSelection: (
    showResourceSelection:
      | ModalsStoreState['showResourceSelection']
      | ((
          currentShowResourceSelection: ModalsStoreState['showResourceSelection']
        ) => ModalsStoreState['showResourceSelection'])
  ) => void
  setShowLanguageSelection: (
    showLanguageSelection:
      | ModalsStoreState['showLanguageSelection']
      | ((
          currentShowLanguageSelection: ModalsStoreState['showLanguageSelection']
        ) => ModalsStoreState['showLanguageSelection'])
  ) => void
  setShowQuerySuggestions: (
    showQuerySuggestions:
      | ModalsStoreState['showQuerySuggestions']
      | ((
          currentShowQuerySuggestions: ModalsStoreState['showQuerySuggestions']
        ) => ModalsStoreState['showQuerySuggestions'])
  ) => void
  setShowQueryBuilder: (
    showQueryBuilder:
      | ModalsStoreState['showQueryBuilder']
      | ((
          currentShowQueryBuilder: ModalsStoreState['showQueryBuilder']
        ) => ModalsStoreState['showQueryBuilder'])
  ) => void
  setResourceSelectionGrouping: (
    resourceSelectionGrouping:
      | ModalsStoreState['resourceSelectionGrouping']
      | ((
          currentResourceSelectionGrouping: ModalsStoreState['resourceSelectionGrouping']
        ) => ModalsStoreState['resourceSelectionGrouping'])
  ) => void

  updateFromURLSearchParams: (searchParams: URLSearchParams) => URLSearchParams
}

export type ModalsStore = ModalsStoreState & ModalsStoreActions

// --------------------------------------------------------------------------

const createModalsSlice: StateCreator<ModalsStore> = (set) => ({
  // state
  showResourceSelection: false,
  showLanguageSelection: false,
  showQuerySuggestions: false,
  showQueryBuilder: false,
  resourceSelectionGrouping: DEFAULT_RESOURCE_VIEW_GROUPING,

  // actions
  setShowResourceSelection: (nextShowResourceSelection) =>
    set((state) => ({
      showResourceSelection:
        typeof nextShowResourceSelection === 'function'
          ? nextShowResourceSelection(state.showResourceSelection)
          : nextShowResourceSelection,
    })),
  setShowLanguageSelection: (nextShowLanguageSelection) =>
    set((state) => ({
      showLanguageSelection:
        typeof nextShowLanguageSelection === 'function'
          ? nextShowLanguageSelection(state.showLanguageSelection)
          : nextShowLanguageSelection,
    })),
  setShowQuerySuggestions: (nextShowQuerySuggestions) =>
    set((state) => ({
      showQuerySuggestions:
        typeof nextShowQuerySuggestions === 'function'
          ? nextShowQuerySuggestions(state.showQuerySuggestions)
          : nextShowQuerySuggestions,
    })),
  setShowQueryBuilder: (nextShowQueryBuilder) =>
    set((state) => ({
      showQueryBuilder:
        typeof nextShowQueryBuilder === 'function'
          ? nextShowQueryBuilder(state.showQueryBuilder)
          : nextShowQueryBuilder,
    })),
  setResourceSelectionGrouping: (nextResourceSelectionGrouping) =>
    set((state) => ({
      resourceSelectionGrouping:
        typeof nextResourceSelectionGrouping === 'function'
          ? nextResourceSelectionGrouping(state.resourceSelectionGrouping)
          : nextResourceSelectionGrouping,
    })),

  updateFromURLSearchParams: (searchParams) => {
    const newState: Partial<ModalsStoreState> = {}

    if (import.meta.env.FEATURE_QUERY_BUILDER) {
      const hasOpenQueryBuilder = searchParams.has('openQueryBuilder')
      if (hasOpenQueryBuilder) {
        newState['showQueryBuilder'] = true
      }
    }

    // update store
    set(() => newState)

    // return updated search query
    const newSearchParams = new URLSearchParams(searchParams)
    newSearchParams.delete('openQueryBuilder')
    return newSearchParams
  },
})

// --------------------------------------------------------------------------

const searchinputStore = createStore<ModalsStore>(createModalsSlice)

export default searchinputStore

// --------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useModalsStore = ((selector?: (state: ModalsStore) => any) => {
  const useBoundStore = useStore(searchinputStore, selector!)
  return useBoundStore
}) as UseBoundStore<StoreApi<ModalsStore>>
Object.assign(useModalsStore, searchinputStore)

// --------------------------------------------------------------------------
