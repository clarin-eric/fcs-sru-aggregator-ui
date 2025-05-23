import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import Card from 'react-bootstrap/Card'
import Col from 'react-bootstrap/Col'
import FloatingLabel from 'react-bootstrap/FloatingLabel'
import Form from 'react-bootstrap/Form'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Popover from 'react-bootstrap/Popover'
import ProgressBar from 'react-bootstrap/ProgressBar'
import Row from 'react-bootstrap/Row'

import DebouncedFuzzySearchInput from '@/components/DebouncedFuzzySearchInput'
import ResourceSearchResult from '@/components/ResourceSearchResult'
import { useAggregatorData } from '@/providers/AggregatorDataContext'
import { useAxios } from '@/providers/AxiosContext'
import { useSearchParams } from '@/providers/SearchParamsContext'
import { getSearchResultsMetaOnly, type SearchResultsMetaOnly } from '@/utils/api'
import { NO_MORE_RECORDS_DIAGNOSTIC_URI } from '@/utils/constants'
import { trackSiteSearch } from '@/utils/matomo'
import {
  DEFAULT_SORTING,
  DEFAULT_VIEW_MODE,
  DEFAULT_VIEW_MODE_WHEN_LEX,
  SORT_FNS,
  type ResultsSorting,
  type ResultsViewMode,
} from '@/utils/results'

import './styles.css'

// --------------------------------------------------------------------------
// types

export const DEFAULT_POLL_DELAY = 1500

export interface SearchResultsProps {
  searchId: string
  pollDelay?: number
}

// --------------------------------------------------------------------------
// component

// TODO: make it (search?) cancelable! (useEffect?)
function SearchResults({ searchId, pollDelay = DEFAULT_POLL_DELAY }: SearchResultsProps) {
  const axios = useAxios()
  const { resources } = useAggregatorData()
  const { query, queryType, resourceIDs } = useSearchParams()

  // TODO: useTransition for changes?

  const [viewMode, setViewMode] = useState<ResultsViewMode>(
    queryType === 'lex' ? DEFAULT_VIEW_MODE_WHEN_LEX : DEFAULT_VIEW_MODE
  )
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
  pollDelay ??= DEFAULT_POLL_DELAY
  const {
    data,
    // isLoading: isLoadingSearchResults,
    // isError: isErrorSearchResults,
  } = useQuery<SearchResultsMetaOnly>({
    queryKey: ['search-results', searchId],
    queryFn: getSearchResultsMetaOnly.bind(null, axios, searchId ?? ''),
    enabled: !!searchId,
    refetchInterval(query) {
      // console.debug('[refetchInterval]', query, query.state.data)
      if (query.state.data && query.state.data.inProgress > 0) return pollDelay
      return false
    },
  })
  // console.debug('search-results', data, isLoadingSearchResults, isErrorSearchResults)

  const sortedResults = useMemo(() => data?.results.toSorted(sortFn) || [], [data, sortFn])

  // all successful results use the LexHITS data view, and have Hits with hitKind attributes
  const isAllLexHITS =
    queryType === 'lex' &&
    data?.results.every((result) => result.numberOfRecords <= 0 || result.isLexHits === true)

  const numRequested = resourceIDs.length
  const numInProgress = data?.inProgress ?? numRequested
  const numWithResults = useMemo(
    () =>
      data?.results.filter(
        (result) =>
          (result.numberOfRecords !== -1 ? result.numberOfRecords : result.numberOfRecordsLoaded) >
          0
      ).length ?? 0,
    [data]
  )
  const numWithResultsWithWarnings = useMemo(
    () =>
      data?.results.filter(
        (result) =>
          !result.inProgress &&
          (result.numberOfRecords !== -1 ? result.numberOfRecords : result.numberOfRecordsLoaded) >
            0 &&
          result.diagnostics.filter(
            (diagnostic) => diagnostic.uri !== NO_MORE_RECORDS_DIAGNOSTIC_URI
          ).length > 0
      ).length ?? 0,
    [data]
  )
  const numNoResults = useMemo(
    () =>
      data?.results.filter(
        (result) =>
          !result.inProgress &&
          (result.numberOfRecords !== -1 ? result.numberOfRecords : result.numberOfRecordsLoaded) <=
            0 &&
          result.diagnostics.filter(
            (diagnostic) => diagnostic.uri !== NO_MORE_RECORDS_DIAGNOSTIC_URI
          ).length === 0 &&
          result.exception === null
      ).length ?? 0,
    [data]
  )
  const numNoResultsWithIssues = useMemo(
    () =>
      data?.results.filter(
        (result) =>
          !result.inProgress &&
          (result.numberOfRecords !== -1 ? result.numberOfRecords : result.numberOfRecordsLoaded) <=
            0 &&
          (result.diagnostics.filter(
            (diagnostic) => diagnostic.uri !== NO_MORE_RECORDS_DIAGNOSTIC_URI
          ).length > 0 ||
            result.exception !== null)
      ).length ?? 0,
    [data]
  )
  const numNoResultsWithExceptions = useMemo(
    () =>
      data?.results.filter(
        (result) => !result.inProgress && result.numberOfRecords <= 0 && result.exception !== null
      ).length ?? 0,
    [data]
  )
  const numNoResultsWithWarnings = useMemo(
    () =>
      data?.results.filter(
        (result) =>
          !result.inProgress &&
          (result.numberOfRecords !== -1 ? result.numberOfRecords : result.numberOfRecordsLoaded) <=
            0 &&
          result.diagnostics.filter(
            (diagnostic) => diagnostic.uri !== NO_MORE_RECORDS_DIAGNOSTIC_URI
          ).length > 0 &&
          result.exception === null
      ).length ?? 0,
    [data]
  )

  // TODO: this might not yet be completely correct?
  const numResultsTotalAvailable = useMemo(
    () =>
      data?.results
        .map((result) =>
          result.numberOfRecords !== -1 ? result.numberOfRecords : result.numberOfRecordsLoaded
        )
        .reduce((acc, cur) => acc + cur, 0) ?? 0,
    [data]
  )
  const numResultsTotalLoaded = useMemo(
    () =>
      data?.results
        .map((result) => result.numberOfRecordsLoaded)
        .reduce((acc, cur) => acc + cur, 0) ?? 0,
    [data]
  )

  // TODO: add total result counter?

  // --------------------------------------------------------------

  if (import.meta.env.FEATURE_TRACKING_MATOMO) {
    /* eslint-disable react-hooks/rules-of-hooks */
    const [sent, setSent] = useState(false)
    useEffect(() => {
      if (data && numInProgress === 0) {
        if (!sent) {
          setSent(true)

          // TODO: sum total (not yet requested) or only loaded by user
          trackSiteSearch(query, queryType, numResultsTotalLoaded)
        }
      }
    }, [data, numInProgress, query, queryType, searchId, sent, numResultsTotalLoaded])
  }

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
      <OverlayTrigger
        placement="auto"
        overlay={
          <Popover id="search-progress-information-popover">
            <Popover.Header>Search Progress Information</Popover.Header>
            <Popover.Body style={{ textIndent: '2rem hanging' }}>
              <div>
                <code>{numRequested.toString().padStart(4, '\u00A0')}</code> resources requested
              </div>
              {numInProgress > 0 && (
                <div>
                  <code>{numInProgress.toString().padStart(4, '\u00A0')}</code> ↳ resources pending
                </div>
              )}
              <hr className="mt-2 mb-1" />
              <div>
                <code>
                  {(numNoResults + numNoResultsWithIssues).toString().padStart(4, '\u00A0')}
                </code>{' '}
                resources without results
              </div>
              <div>
                <code>{numNoResults.toString().padStart(4, '\u00A0')}</code> ↳ OK, without issues
              </div>
              {/*
              <div>
                <code>{numNoResultsWithIssues.toString().padStart(4, '\u00A0')}</code>{' '}
                ↳ due to warnings or errors
              </div>
              */}
              {numNoResultsWithWarnings > 0 && (
                <div>
                  <code>{numNoResultsWithWarnings.toString().padStart(4, '\u00A0')}</code> ↳ with
                  warnings
                </div>
              )}
              {numNoResultsWithExceptions > 0 && (
                <div>
                  <code>{numNoResultsWithExceptions.toString().padStart(4, '\u00A0')}</code> ↳ due
                  to fatal errors
                </div>
              )}
              <hr className="mt-2 mb-1" />
              <div>
                <code>{numWithResults.toString().padStart(4, '\u00A0')}</code> resources with
                results
              </div>
              {numWithResultsWithWarnings > 0 && (
                <div>
                  <code>{numWithResultsWithWarnings.toString().padStart(4, '\u00A0')}</code> ↳ with
                  warnings
                </div>
              )}
              <hr className="mt-2 mb-0" />
              <hr className="mt-1 mb-1" />
              <div>
                <code>
                  {'\u00A0'}
                  {numResultsTotalLoaded}
                  {'\u00A0'}/{'\u00A0'}
                  {numResultsTotalAvailable}
                </code>{' '}
                total hits
              </div>
            </Popover.Body>
          </Popover>
        }
      >
        <ProgressBar className="mb-3">
          <ProgressBar
            variant="success"
            now={numWithResults}
            max={numRequested}
            label={<span>{numWithResults} resources with results</span>}
            aria-label="Resources with results"
          />
          <ProgressBar
            variant="secondary"
            now={numNoResults + numNoResultsWithIssues}
            max={numRequested}
            label={<span>{numNoResults + numNoResultsWithIssues} resources without results</span>}
            aria-label="Resources without results (might be due to issues)"
          />
          <ProgressBar
            striped
            animated
            now={numInProgress}
            max={numRequested}
            label={<span>Search through {numInProgress} Resources</span>}
            aria-label="Resources with pending results"
          />
        </ProgressBar>
      </OverlayTrigger>

      <Card className="mb-2" role="group" aria-label="Result display and filter options">
        <Card.Body>
          <Row className="row-gap-2">
            <Col lg={'auto'} md={6} sm={6}>
              <FloatingLabel label="View mode" controlId="results-view-mode">
                <Form.Select value={viewMode} onChange={handleViewModeChange}>
                  <option value="plain">Plain</option>
                  {/* maybe allow kwic for LexCQL if not a LexHITS data view */}
                  {(queryType !== 'lex' || !isAllLexHITS) && (
                    <option value="kwic">Keyword in Context</option>
                  )}
                  {queryType === 'fcs' && (
                    <option value="annotation-layers">Annotation Layers</option>
                  )}
                  {queryType === 'lex' && <option value="lexical-entry">Dictionary</option>}
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
            key={`${searchId}-${result.id}`}
          />
        ))}
    </div>
  )
}

export default SearchResults
