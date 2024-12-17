export interface LanguageCode2NameMap {
  [code: string]: string
}

export type LanguageFilterOptions = 'byMeta' | 'byGuess' | 'byMetaAndGuess'

export const DEFAULT_SEARCH_LANGUAGE_FILTER: LanguageFilterOptions = 'byMeta'
export const MULTIPLE_LANGUAGE_CODE = 'mul' // see ISO-693-3

export function languageCodeToName(
  code: string,
  codeToLanguageMapping: LanguageCode2NameMap = undefined as unknown as LanguageCode2NameMap
) {
  if (code === MULTIPLE_LANGUAGE_CODE) return 'Any Language'
  return codeToLanguageMapping?.[code] || 'Unknown Language'
}
