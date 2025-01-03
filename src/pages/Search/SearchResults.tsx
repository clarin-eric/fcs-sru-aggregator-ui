import { useQuery } from '@tanstack/react-query'
import { type AxiosInstance } from 'axios'
import ProgressBar from 'react-bootstrap/ProgressBar'

import { getSearchResultsMetaOnly, postSearch, type SearchResultsMetaOnly } from '@/utils/api'
import ResourceSearchResult from './ResourceSearchResult'
import { type SearchData } from './SearchInput'

import './styles.css'

// --------------------------------------------------------------------------
// types

export interface SearchResultsProps {
  axios: AxiosInstance
  params: SearchData
}

// --------------------------------------------------------------------------
// component

// TODO: make it cancelable! (useEffect?)
function SearchResults({
  axios,
  params: { query, queryType, language, numberOfResults, resourceIDs },
}: SearchResultsProps) {
  // the actual search
  const {
    data: searchId,
    error,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['search', { query, queryType, language, numberOfResults, resourceIDs }],
    queryFn: postSearch.bind(null, axios, {
      query,
      queryType,
      language,
      numberOfResults: numberOfResults.toString(),
      resourceIds: resourceIDs,
    }),
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  })
  console.debug('searchId', { searchId, error, isLoading, isError })

  // polling of meta results, dependant on searchId
  const {
    data,
    isLoading: isLoading2,
    isError: isError2,
  } = useQuery<SearchResultsMetaOnly>({
    queryKey: ['search-results', searchId],
    queryFn: getSearchResultsMetaOnly.bind(null, axios, searchId ?? ''),
    enabled: !!searchId,
    refetchInterval(query) {
      console.log('[refetchInterval]', query, query.state.data)
      if (query.state.data && query.state.data.inProgress > 0) return 1500
      return false
    },
  })
  console.log('search-results', data, isLoading2, isError2)

  const numRequested = resourceIDs.length
  const numInProgress = data?.inProgress ?? numRequested
  const numWithResults = data?.results.filter((result) => result.numberOfRecords > 0).length ?? 0
  const numNoResultsWithIssues =
    data?.results.filter(
      (result) =>
        result.numberOfRecords <= 0 && (result.diagnostics.length > 0 || result.exception !== null)
    ).length ?? 0
  const numNoResults =
    data?.results.filter(
      (result) =>
        result.numberOfRecords <= 0 && result.diagnostics.length === 0 && result.exception === null
    ).length ?? 0

  return (
    <div id="search-results" className="mt-2 mb-4">
      {/* TODO: add visually-hidden title for semantic site structure */}
      <ProgressBar className="mb-4">
        <ProgressBar
          variant="success"
          now={numWithResults}
          max={numRequested}
          label={`${numWithResults} resources with results`}
        />
        <ProgressBar
          variant="secondary"
          now={numNoResults}
          max={numRequested}
          label={`${numNoResults} resources without results`}
        />
        <ProgressBar
          variant="warning"
          now={numNoResultsWithIssues}
          max={numRequested}
          label={`${numNoResultsWithIssues} resources with errors`}
        />
        <ProgressBar
          striped
          animated
          now={numInProgress}
          max={numRequested}
          label={`Search through ${numInProgress} Resources`}
        />
      </ProgressBar>

      {/* TODO: add fuzzy filter for quick search through results? */}

      {searchId &&
        data &&
        data.results.map((result) => (
          <ResourceSearchResult
            axios={axios}
            searchId={searchId}
            resourceId={result.id}
            resultInfo={result}
            key={`${searchId}-${result.id}`}
          />
        ))}
    </div>
  )
}

export default SearchResults
