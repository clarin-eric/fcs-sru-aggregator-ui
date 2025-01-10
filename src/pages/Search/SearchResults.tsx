import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import Card from 'react-bootstrap/Card'
import Col from 'react-bootstrap/Col'
import FloatingLabel from 'react-bootstrap/FloatingLabel'
import Form from 'react-bootstrap/Form'
import ProgressBar from 'react-bootstrap/ProgressBar'
import Row from 'react-bootstrap/Row'

import DebouncedFuzzySearchInput from '@/components/DebouncedFuzzySearchInput'
import { useAggregatorData } from '@/providers/AggregatorDataContext'
import { useAxios } from '@/providers/AxiosContext'
import { getSearchResultsMetaOnly, type SearchResultsMetaOnly } from '@/utils/api'
import {
  DEFAULT_SORTING,
  DEFAULT_VIEW_MODE,
  SORT_FNS,
  type ResultsSorting,
  type ResultsViewMode,
} from '@/utils/results'
import ResourceSearchResult from './ResourceSearchResult'
import { type SearchData } from './SearchInput'

import './styles.css'

// --------------------------------------------------------------------------
// types

export interface SearchResultsProps {
  searchId: string
  searchParams: SearchData
  pollDelay?: number
}

// --------------------------------------------------------------------------
// component

// TODO: make it (search?) cancelable! (useEffect?)
function SearchResults({
  searchId,
  searchParams: { queryType, numberOfResults, resourceIDs },
  pollDelay = 1500,
}: SearchResultsProps) {
  const axios = useAxios()
  const { resources } = useAggregatorData()

  const [viewMode, setViewMode] = useState<ResultsViewMode>(DEFAULT_VIEW_MODE)
  const [sorting, setSorting] = useState<ResultsSorting>(DEFAULT_SORTING)
  const [filter, setFilter] = useState('')
  const [showResourceDetails, setShowResourceDetails] = useState(false)
  const [showDiagnostics, setShowDiagnostics] = useState(false)

  const sortFn = useMemo(() => {
    const lookup = new Map()
    resources?.forEach((resource) => {
      lookup.set(resource.id, resource)
    })
    return SORT_FNS[sorting](lookup)
  }, [sorting, resources])

  // polling of meta results, dependant on searchId
  pollDelay ??= 1500
  const {
    data,
    isLoading: isLoadingSearchResults,
    isError: isErrorSearchResults,
  } = useQuery<SearchResultsMetaOnly>({
    queryKey: ['search-results', searchId],
    queryFn: getSearchResultsMetaOnly.bind(null, axios, searchId ?? ''),
    enabled: !!searchId,
    refetchInterval(query) {
      console.log('[refetchInterval]', query, query.state.data)
      if (query.state.data && query.state.data.inProgress > 0) return pollDelay
      return false
    },
  })
  console.log('search-results', data, isLoadingSearchResults, isErrorSearchResults)

  const sortedResults = useMemo(() => data?.results.toSorted(sortFn) || [], [data, sortFn])

  const numRequested = resourceIDs.length
  const numInProgress = data?.inProgress ?? numRequested
  const numWithResults = useMemo(
    () => data?.results.filter((result) => result.numberOfRecords > 0).length ?? 0,
    [data]
  )
  const numNoResultsWithIssues = useMemo(
    () =>
      data?.results.filter(
        (result) =>
          result.numberOfRecords <= 0 &&
          (result.diagnostics.length > 0 || result.exception !== null)
      ).length ?? 0,
    [data]
  )
  const numNoResults = useMemo(
    () =>
      data?.results.filter(
        (result) =>
          result.numberOfRecords <= 0 &&
          result.diagnostics.length === 0 &&
          result.exception === null
      ).length ?? 0,
    [data]
  )

  // --------------------------------------------------------------
  // event handlers

  function handleViewModeChange(event: React.ChangeEvent<HTMLSelectElement>) {
    // console.debug('viewmode#onchange', viewMode, '=>', event.target.value)
    setViewMode(event.target.value as ResultsViewMode)
  }

  function handleSortingChange(event: React.ChangeEvent<HTMLSelectElement>) {
    // console.debug('sorting#onchange', sorting, '=>', event.target.value)
    setSorting(event.target.value as ResultsSorting)
  }

  // --------------------------------------------------------------
  // rendering

  return (
    <div id="search-results" className="mt-2 mb-4">
      {/* TODO: add visually-hidden title for semantic site structure */}
      {/* TODO: add tooltip with easier to read information */}
      {/* TODO: mobile design: hide labels and maybe add below? */}
      <ProgressBar className="mb-3">
        <ProgressBar
          variant="success"
          now={numWithResults}
          max={numRequested}
          label={`${numWithResults} resources with results`}
          aria-label="Resources with results"
        />
        <ProgressBar
          variant="secondary"
          now={numNoResults}
          max={numRequested}
          label={`${numNoResults} resources without results`}
          aria-label="Resources without results but no issues"
        />
        <ProgressBar
          variant="warning"
          now={numNoResultsWithIssues}
          max={numRequested}
          label={`${numNoResultsWithIssues} resources with errors`}
          aria-label="Resources with issues (warnings/diagnostics or errors)"
        />
        <ProgressBar
          striped
          animated
          now={numInProgress}
          max={numRequested}
          label={`Search through ${numInProgress} Resources`}
          aria-label="Resources with pending results"
        />
      </ProgressBar>

      <Card className="mb-2" role="group" aria-label="Result display and filter options">
        <Card.Body>
          <Row className="row-gap-2">
            <Col lg={'auto'} md={6} sm={6}>
              <FloatingLabel label="View mode" controlId="results-view-mode">
                <Form.Select value={viewMode} onChange={handleViewModeChange}>
                  <option value="plain">Plain</option>
                  <option value="kwic">Keyword in Context</option>
                  {queryType === 'fcs' && (
                    <option value="annotation-layers">Annotation Layers</option>
                  )}
                  {queryType === 'lex' && <option value="lex-props">Dictionary</option>}
                </Form.Select>
              </FloatingLabel>
            </Col>
            <Col lg={'auto'} md={6} sm={6}>
              <FloatingLabel label="Sorting" controlId="results-sorting">
                <Form.Select value={sorting} onChange={handleSortingChange}>
                  <option value="default">(default)</option>
                  <option value="title-up">Title (up)</option>
                  <option value="title-down">Title (down)</option>
                  <option value="result-count-total-up">Total result count (up)</option>
                  <option value="result-count-total-down">Total result count (down)</option>
                </Form.Select>
              </FloatingLabel>
            </Col>
            <Col lg={'auto'} md={12} sm={6} className="flex-fill order-xl-4">
              <FloatingLabel label="Result filter query" controlId="result-filter">
                <DebouncedFuzzySearchInput
                  disabled={sorting !== 'default' || true} // TODO: implement
                  value={filter}
                  onChange={(value) => setFilter(value)}
                />
              </FloatingLabel>
            </Col>
            <Col lg={'auto'} md={12} sm={12} className="align-content-center order-xl-3">
              <Form.Check
                checked={showResourceDetails}
                onChange={() => setShowResourceDetails((show) => !show)}
                id="results-view-resource-details"
                label="Show result details"
              />
              <Form.Check
                checked={showDiagnostics}
                onChange={() => setShowDiagnostics((show) => !show)}
                id="results-view-warnings-errors"
                label="Show warning and error messages"
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {searchId &&
        data &&
        sortedResults.map((result) => (
          <ResourceSearchResult
            searchId={searchId}
            resourceId={result.id}
            resultInfo={result}
            viewMode={viewMode}
            showResourceDetails={showResourceDetails}
            showDiagnostics={showDiagnostics}
            numberOfResults={numberOfResults}
            key={`${searchId}-${result.id}`}
          />
        ))}
    </div>
  )
}

export default SearchResults
