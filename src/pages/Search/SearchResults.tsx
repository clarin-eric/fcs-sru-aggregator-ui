import { useQuery } from '@tanstack/react-query'
import { type AxiosInstance } from 'axios'
import { useState } from 'react'
import Card from 'react-bootstrap/Card'
import Col from 'react-bootstrap/Col'
import FloatingLabel from 'react-bootstrap/FloatingLabel'
import Form from 'react-bootstrap/Form'
import ProgressBar from 'react-bootstrap/ProgressBar'
import Row from 'react-bootstrap/Row'

import { getSearchResultsMetaOnly, postSearch, type SearchResultsMetaOnly } from '@/utils/api'
import { DEFAULT_VIEW_MODE, type ResultsViewMode } from '@/utils/results'
import { type LanguageCode2NameMap } from '@/utils/search'
import ResourceSearchResult from './ResourceSearchResult'
import { type SearchData } from './SearchInput'

import './styles.css'

// --------------------------------------------------------------------------
// types

export interface SearchResultsProps {
  axios: AxiosInstance
  params: SearchData
  languages?: LanguageCode2NameMap
}

// --------------------------------------------------------------------------
// component

// TODO: make it cancelable! (useEffect?)
function SearchResults({
  axios,
  params: { query, queryType, language, numberOfResults, resourceIDs },
  languages,
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

  const [viewMode, setViewMode] = useState<ResultsViewMode>(DEFAULT_VIEW_MODE)

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

  // --------------------------------------------------------------
  // event handlers

  function handleViewModeChange(event: React.ChangeEvent<HTMLSelectElement>) {
    // console.debug('viewmode#onchange', viewMode, '=>', event.target.value)
    setViewMode(event.target.value as ResultsViewMode)
  }

  // --------------------------------------------------------------
  // rendering

  return (
    <div id="search-results" className="mt-2 mb-4">
      {/* TODO: add visually-hidden title for semantic site structure */}
      <ProgressBar className="mb-3">
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
      <Card className="mb-2">
        <Card.Body>
          <Row>
            <Col md={3} sm={6}>
              <FloatingLabel label="View mode" controlId="results-view-mode">
                <Form.Select value={viewMode} onChange={handleViewModeChange}>
                  <option value="plain">Plain</option>
                  <option value="kwic">Keyword in Context</option>
                  {queryType === 'fcs' && (
                    <option value="annotation-layers">Annotation Layers</option>
                  )}
                </Form.Select>
              </FloatingLabel>
            </Col>
            <Col md={3} sm={6}>
              {/* show warnings/errors */}
            </Col>
            <Col md={3} sm={6}>
              {/* TODO: fuzzy filter */}
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {searchId &&
        data &&
        data.results.map((result) => (
          <ResourceSearchResult
            axios={axios}
            searchId={searchId}
            resourceId={result.id}
            resultInfo={result}
            viewMode={viewMode}
            showResourceDetails={true} // TODO
            languages={languages}
            numberOfResults={numberOfResults}
            key={`${searchId}-${result.id}`}
          />
        ))}
    </div>
  )
}

export default SearchResults
