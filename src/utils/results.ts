import type { ResourceSearchResultMetaOnly } from '@clarin-eric/fcs-sru-aggregator-api-adapter-typescript'

import LocaleStore from '@/stores/locale'
import type { Resource } from './api'
import { getBestFromMultilingualValuesTryByLanguage } from './resources'

export type ResultsViewMode = 'plain' | 'kwic' | 'annotation-layers' | 'lexical-entry'
export type ResultsSorting =
  | 'default'
  | 'title-up'
  | 'title-down'
  | 'result-count-total-up'
  | 'result-count-total-down'

// --------------------------------------------------------------------------

export const DEFAULT_VIEW_MODE: ResultsViewMode = 'plain'
export const DEFAULT_VIEW_MODE_WHEN_LEX: ResultsViewMode = 'lexical-entry'
export const DEFAULT_VIEW_MODE_WHEN_FCS: ResultsViewMode = 'plain' // TODO: 'annotation-layers' might be quite UI expensive for unrestricted searches
export const DEFAULT_SORTING: ResultsSorting = 'default'

// --------------------------------------------------------------------------

export const SORT_FNS: {
  [key in ResultsSorting]: (
    lookup: Map<string, Resource>
  ) => (a: ResourceSearchResultMetaOnly, b: ResourceSearchResultMetaOnly) => number
} = {
  default: () => () => 0,
  'title-up': (lookup) => (a, b) => {
    const locale = LocaleStore.getState().locale

    const titleA =
      getBestFromMultilingualValuesTryByLanguage(lookup.get(a.id)?.title ?? null, locale) ?? ''
    const titleB =
      getBestFromMultilingualValuesTryByLanguage(lookup.get(b.id)?.title ?? null, locale) ?? ''

    return titleA.localeCompare(titleB)
  },
  'title-down': (lookup) => (a, b) => {
    const locale = LocaleStore.getState().locale

    const titleA =
      getBestFromMultilingualValuesTryByLanguage(lookup.get(a.id)?.title ?? null, locale) ?? ''
    const titleB =
      getBestFromMultilingualValuesTryByLanguage(lookup.get(b.id)?.title ?? null, locale) ?? ''

    return -titleA.localeCompare(titleB)
  },
  'result-count-total-up': () => (a, b) => {
    const countA = a.numberOfRecords !== -1 ? a.numberOfRecords : a.numberOfRecordsLoaded
    const countB = b.numberOfRecords !== -1 ? b.numberOfRecords : b.numberOfRecordsLoaded
    return countA - countB
  },
  'result-count-total-down': () => (a, b) => {
    const countA = a.numberOfRecords !== -1 ? a.numberOfRecords : a.numberOfRecordsLoaded
    const countB = b.numberOfRecords !== -1 ? b.numberOfRecords : b.numberOfRecordsLoaded
    return countB - countA
  },
}
