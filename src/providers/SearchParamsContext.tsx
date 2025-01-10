import { createContext, type ReactNode, useContext } from 'react'

import { type NumberOfResults, type QueryTypeID } from '@/utils/constants'
import { type LanguageFilterOptions } from '@/utils/search'

// --------------------------------------------------------------------------

interface SearchParams {
  language: string
  languageFilter: LanguageFilterOptions
  queryType: QueryTypeID
  query: string
  resourceIDs: string[]
  numberOfResults: NumberOfResults
}

// --------------------------------------------------------------------------

const SearchParamsContext = createContext<SearchParams | undefined>(undefined)
SearchParamsContext.displayName = 'SearchParamsContext'

// --------------------------------------------------------------------------

function useSearchParams() {
  const params = useContext(SearchParamsContext)

  if (!params) throw new Error('No "params" data set, use SearchParamsProvider to set one')

  return params
}

// --------------------------------------------------------------------------

type SearchParamsProviderProps = SearchParams & {
  children?: ReactNode
}

function SearchParamsProvider({
  language,
  languageFilter,
  queryType,
  query,
  resourceIDs,
  numberOfResults,
  children,
}: SearchParamsProviderProps) {
  const params = { language, languageFilter, queryType, query, resourceIDs, numberOfResults }

  return <SearchParamsContext.Provider value={params}>{children}</SearchParamsContext.Provider>
}

// --------------------------------------------------------------------------

// eslint-disable-next-line react-refresh/only-export-components
export { SearchParamsContext, SearchParamsProvider, useSearchParams }
