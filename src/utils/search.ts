import type { LanguageCode2NameMap } from 'fcs-sru-aggregator-api-adapter-typescript'

export type { LanguageCode2NameMap }

// --------------------------------------------------------------------------

export type LanguageFilterOptions = 'byMeta' | 'byGuess' | 'byMetaAndGuess'
export type ResourceSelectionModalViewOptionVisibility = 'all' | 'selected'
export type ResourceSelectionModalViewOptionGrouping = 'resource' | 'institution' | 'language'
export type ResourceSelectionModalViewOptionSorting =
  | 'title-up'
  | 'title-down'
  | 'institution-up'
  | 'institution-down'

// --------------------------------------------------------------------------

export const DEFAULT_SEARCH_LANGUAGE_FILTER: LanguageFilterOptions = 'byMeta'
export const DEFAULT_RESOURCE_VIEW_VISIBILITY: ResourceSelectionModalViewOptionVisibility = 'all'
export const DEFAULT_RESOURCE_VIEW_GROUPING: ResourceSelectionModalViewOptionGrouping = 'resource'
export const DEFAULT_RESOURCE_VIEW_SORTING: ResourceSelectionModalViewOptionSorting = 'title-up'

export const MULTIPLE_LANGUAGE_CODE = 'mul' // see ISO-693-3

// --------------------------------------------------------------------------

export function languageCodeToName(
  code: string,
  codeToLanguageMapping: LanguageCode2NameMap = undefined as unknown as LanguageCode2NameMap,
  options: { defaultAnyLanguage?: string; defaultUnknownLanguage?: string } = {}
) {
  if (code === MULTIPLE_LANGUAGE_CODE) return options?.defaultAnyLanguage ?? 'Any Language'
  return codeToLanguageMapping?.[code] || (options?.defaultUnknownLanguage ?? 'Unknown Language')
}
