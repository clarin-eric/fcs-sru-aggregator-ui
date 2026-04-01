import type { UseBoundStore } from 'zustand/react'
import { useStore } from 'zustand/react'
import type { StateCreator, StoreApi } from 'zustand/vanilla'
import { createStore } from 'zustand/vanilla'

import type { NumberOfResults, QueryTypeID } from '@/utils/constants'
import { DEFAULT_QUERY_TYPE, NUMBER_OF_RESULTS, QUERY_TYPES } from '@/utils/constants'
import type { LanguageFilterOptions } from '@/utils/search'
import { DEFAULT_SEARCH_LANGUAGE_FILTER, MULTIPLE_LANGUAGE_CODE } from '@/utils/search'

// --------------------------------------------------------------------------

export interface SearchData {
  language: string
  languageFilter: LanguageFilterOptions
  queryType: QueryTypeID
  query: string
  resourceIDs: string[]
  numberOfResults: NumberOfResults
}

// --------------------------------------------------------------------------

type SearchInputStoreState = {
  language: string
  languageFilter: LanguageFilterOptions
  queryType: QueryTypeID
  query: string
  resourceIDs: string[]
  numberOfResults: NumberOfResults

  initialEndpointsResources: null
  initialMode: 'search' | null
}

type SearchInputStoreActions = {
  setLanguage: (
    language:
      | SearchInputStoreState['language']
      | ((currentLanguage: SearchInputStoreState['language']) => SearchInputStoreState['language'])
  ) => void
  setLanguageFilter: (
    languageFilter:
      | SearchInputStoreState['languageFilter']
      | ((
          currentLanguageFilter: SearchInputStoreState['languageFilter']
        ) => SearchInputStoreState['languageFilter'])
  ) => void
  setQueryType: (
    queryType:
      | SearchInputStoreState['queryType']
      | ((
          currentQueryType: SearchInputStoreState['queryType']
        ) => SearchInputStoreState['queryType'])
  ) => void
  setQuery: (
    query:
      | SearchInputStoreState['query']
      | ((currentQuery: SearchInputStoreState['query']) => SearchInputStoreState['query'])
  ) => void
  setResourceIDs: (
    resourceIDs:
      | SearchInputStoreState['resourceIDs']
      | ((
          currentResourceIDs: SearchInputStoreState['resourceIDs']
        ) => SearchInputStoreState['resourceIDs'])
  ) => void
  setNumberOfResults: (
    numberOfResults:
      | SearchInputStoreState['numberOfResults']
      | ((
          currentNumberOfResults: SearchInputStoreState['numberOfResults']
        ) => SearchInputStoreState['numberOfResults'])
  ) => void

  updateFromURLSearchParams: (searchParams: URLSearchParams) => URLSearchParams

  makeSearchRequestParams: () => SearchData

  reset: () => void
}

export type SearchInputStore = SearchInputStoreState & SearchInputStoreActions

// --------------------------------------------------------------------------

export const DEFAULT_STATE: SearchInputStoreState = {
  language: MULTIPLE_LANGUAGE_CODE,
  languageFilter: DEFAULT_SEARCH_LANGUAGE_FILTER,
  queryType: DEFAULT_QUERY_TYPE,
  query: '',
  resourceIDs: [],
  numberOfResults: NUMBER_OF_RESULTS[0],

  initialEndpointsResources: null,
  initialMode: null,
}

export const createSearchInputSlice: StateCreator<SearchInputStore> = (set, get) => ({
  // state
  ...DEFAULT_STATE,

  // actions
  setLanguage: (nextLanguage) =>
    set((state) => ({
      language: typeof nextLanguage === 'function' ? nextLanguage(state.language) : nextLanguage,
    })),
  setLanguageFilter: (nextLanguageFilter) =>
    set((state) => ({
      languageFilter:
        typeof nextLanguageFilter === 'function'
          ? nextLanguageFilter(state.languageFilter)
          : nextLanguageFilter,
    })),
  setQueryType: (nextQueryType) =>
    set((state) => ({
      queryType:
        typeof nextQueryType === 'function' ? nextQueryType(state.queryType) : nextQueryType,
    })),
  setQuery: (nextQuery) =>
    set((state) => ({
      query: typeof nextQuery === 'function' ? nextQuery(state.query) : nextQuery,
    })),
  setResourceIDs: (nextResourceIDs) =>
    set((state) => ({
      resourceIDs:
        typeof nextResourceIDs === 'function'
          ? nextResourceIDs(state.resourceIDs)
          : nextResourceIDs,
    })),
  setNumberOfResults: (nextNumberOfResults) =>
    set((state) => ({
      numberOfResults:
        typeof nextNumberOfResults === 'function'
          ? nextNumberOfResults(state.numberOfResults)
          : nextNumberOfResults,
    })),

  updateFromURLSearchParams: (searchParams) => {
    const newState: Partial<SearchInputStoreState> = {}

    const newQuery = searchParams.get('query')
    if (newQuery) {
      newState['query'] = newQuery
    }

    const newQueryType = searchParams.get('queryType')
    if (newQueryType) {
      if (QUERY_TYPES.find((qt) => qt.id === newQueryType) !== undefined) {
        newState['queryType'] = newQueryType as QueryTypeID
      } else {
        console.warn('Found unsupported queryType in search params:', newQueryType)
      }
    }

    const xAggregationContext = searchParams.get('x-aggregation-context')
    if (xAggregationContext) {
      try {
        const endpoints2handles = JSON.parse(xAggregationContext)

        newState['initialEndpointsResources'] = endpoints2handles
      } catch (error) {
        console.error(
          'Error trying to parse "x-aggregation-context" search parameter!',
          { xAggregationContext },
          error
        )
      }
    }

    const mode = searchParams.get('mode')
    if (mode && mode === 'search') {
      newState['initialMode'] = 'search'
    }

    // update store
    set(() => newState)

    // return updated search query
    const newSearchParams = new URLSearchParams(searchParams)
    newSearchParams.delete('x-aggregation-context')
    newSearchParams.delete('mode')
    return newSearchParams
  },

  makeSearchRequestParams: () => {
    // TODO: is this correct or is there a better/easier way? (especially with slicing)
    const storeState: SearchInputStoreState = get()
    return {
      language: storeState.language,
      languageFilter: storeState.languageFilter,
      queryType: storeState.queryType,
      query: storeState.query,
      resourceIDs: storeState.resourceIDs ?? [],
      numberOfResults: storeState.numberOfResults,
    }
  },

  reset: () => {
    set(() => ({ ...DEFAULT_STATE }) satisfies SearchInputStoreState)
  },
})

// --------------------------------------------------------------------------

const searchinputStore = createStore<SearchInputStore>(createSearchInputSlice)

export default searchinputStore

// --------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useSearchInputStore = ((selector?: (state: SearchInputStore) => any) => {
  const useBoundStore = useStore(searchinputStore, selector!)
  return useBoundStore
}) as UseBoundStore<StoreApi<SearchInputStore>>
Object.assign(useSearchInputStore, searchinputStore)

// --------------------------------------------------------------------------
