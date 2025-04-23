import type { Resource, ResourceSearchResultMetaOnly } from '@/utils/api'

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
export const DEFAULT_SORTING: ResultsSorting = 'default'

// --------------------------------------------------------------------------

export const SORT_FNS: {
  [key in ResultsSorting]: (
    lookup: Map<string, Resource>
  ) => (a: ResourceSearchResultMetaOnly, b: ResourceSearchResultMetaOnly) => number
} = {
  default: () => () => 0,
  'title-up': (lookup) => (a, b) => {
    const titleA = lookup.get(a.id)?.title || ''
    const titleB = lookup.get(b.id)?.title || ''
    return titleA.localeCompare(titleB)
  },
  'title-down': (lookup) => (a, b) => {
    const titleA = lookup.get(a.id)?.title || ''
    const titleB = lookup.get(b.id)?.title || ''
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
