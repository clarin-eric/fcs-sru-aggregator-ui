import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card'
import Col from 'react-bootstrap/Col'
import FloatingLabel from 'react-bootstrap/FloatingLabel'
import Form from 'react-bootstrap/Form'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Popover from 'react-bootstrap/Popover'
import ProgressBar from 'react-bootstrap/ProgressBar'
import Row from 'react-bootstrap/Row'
import { Trans, useTranslation } from 'react-i18next'

import type { SearchResultsMetaOnly } from '@clarin-eric/fcs-sru-aggregator-api-adapter-typescript'
import {
  getSearchResultsMetaOnly,
  postSearchStop,
} from '@clarin-eric/fcs-sru-aggregator-api-adapter-typescript'

import ResourceSearchResult from '@/components/ResourceSearchResult'
import { useAggregatorData } from '@/providers/AggregatorDataContext'
import { useAxios } from '@/providers/AxiosContext'
import { useSearchParams } from '@/providers/SearchParamsContext'
import { useSearchResultsStore } from '@/stores/searchresults'
import { NO_MORE_RECORDS_DIAGNOSTIC_URI } from '@/utils/constants'
import { trackSiteSearch } from '@/utils/matomo'
import type { ResultsSorting, ResultsViewMode } from '@/utils/results'
import {
  DEFAULT_VIEW_MODE,
  DEFAULT_VIEW_MODE_WHEN_FCS,
  DEFAULT_VIEW_MODE_WHEN_LEX,
  isValidViewModeForQueryType,
  SORT_FNS,
  validViewModesForQueryType,
} from '@/utils/results'

import stopCircleIcon from 'bootstrap-icons/icons/stop-circle.svg?raw'

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
  const { t } = useTranslation()
  const axios = useAxios()
  const { resources } = useAggregatorData()
  const { query, queryType, resourceIDs } = useSearchParams()

  // TODO: useTransition for changes?

  const viewMode = useSearchResultsStore((state) => state.viewMode)
  const setViewMode = useSearchResultsStore((state) => state.setViewMode)
  const sorting = useSearchResultsStore((state) => state.sorting)
  const setSorting = useSearchResultsStore((state) => state.setSorting)
  const showResourceDetails = useSearchResultsStore((state) => state.showResourceDetails)
  const setShowResourceDetails = useSearchResultsStore((state) => state.setShowResourceDetails)
  const showDiagnostics = useSearchResultsStore((state) => state.showDiagnostics)
  const setShowDiagnostics = useSearchResultsStore((state) => state.setShowDiagnostics)

  const defaultViewMode =
    queryType === 'lex'
      ? DEFAULT_VIEW_MODE_WHEN_LEX
      : queryType === 'fcs'
        ? DEFAULT_VIEW_MODE_WHEN_FCS
        : DEFAULT_VIEW_MODE

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

  if (!isValidViewModeForQueryType(viewMode, queryType, { isAllLexHITS })) {
    // TODO: keep last used view mode / check if current view mode is valid for (new) query type
    setViewMode(defaultViewMode)
  }

  const numRequested = resourceIDs.length
  const numInProgress = data?.inProgress ?? numRequested
  const numCancelled = data?.cancelled ?? 0

  const isFinished = numInProgress === 0 || numCancelled > 0

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
  // const numNoResultsDueCancellation = useMemo(() => data?.results.filter((result) => result.cancelled) ?? 0, [data])

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

  async function handleStopSearchClick() {
    console.debug('Stop search', { searchId })
    await postSearchStop(axios, searchId)
  }

  // --------------------------------------------------------------
  // rendering

  function renderViewModeOptions() {
    const validViewModes = validViewModesForQueryType(queryType, { isAllLexHITS })

    return (
      <>
        <option value="plain">{t('search.results.displayOptions.viewModeOptions.plain')}</option>
        {/* maybe allow kwic for LexCQL if not a LexHITS data view */}
        {validViewModes.includes('kwic') && (
          <option value="kwic">{t('search.results.displayOptions.viewModeOptions.kwic')}</option>
        )}
        {validViewModes.includes('annotation-layers') && (
          <option value="annotation-layers">
            {t('search.results.displayOptions.viewModeOptions.annotation-layers')}
          </option>
        )}
        {validViewModes.includes('lexical-entry') && (
          <option value="lexical-entry">
            {t('search.results.displayOptions.viewModeOptions.lexical-entry')}
          </option>
        )}
      </>
    )
  }

  // TODO: add filter for exact vs. fuzzy/normalised search results

  return (
    <div id="search-results" className="mt-2 mb-4">
      {/* TODO: add visually-hidden title for semantic site structure */}
      {/* TODO: add tooltip with easier to read information */}
      {/* TODO: mobile design: hide labels and maybe add below? */}
      <Row className="row-gap-2 mb-3 justify-content-center align-items-center">
        <Col>
          <OverlayTrigger
            placement="auto"
            overlay={
              <Popover id="search-progress-information-popover">
                <Popover.Header>{t('search.results.progressPopover.title')}</Popover.Header>
                <Popover.Body style={{ textIndent: '2rem hanging' }}>
                  {/* XXX.toString().padStart(4, '\u00A0'), */}
                  <div>
                    <Trans
                      i18nKey="search.results.progressPopover.numResourcesRequested"
                      count={numRequested}
                    />
                  </div>
                  {numInProgress > 0 && (
                    <div>
                      <Trans
                        i18nKey="search.results.progressPopover.numResourcesRequestedPending"
                        count={numInProgress}
                      />
                    </div>
                  )}
                  <hr className="mt-2 mb-1" />
                  <div>
                    <Trans
                      i18nKey="search.results.progressPopover.numResourcesWithoutResults"
                      count={numNoResults + numNoResultsWithIssues}
                    />
                  </div>
                  <div>
                    <Trans
                      i18nKey="search.results.progressPopover.numResourcesWithoutResultsOK"
                      count={numNoResults}
                    />
                  </div>
                  {numCancelled > 0 && (
                    <div>
                      <Trans
                        i18nKey="search.results.progressPopover.numResourcesWithoutResultsDueCancellations"
                        count={numCancelled}
                      />
                    </div>
                  )}
                  {/*
              <div>
                <Trans
                  i18nKey="search.results.progressPopover.numResourcesWithoutResultsErrorsWarnings"
                  count={numNoResultsWithIssues}
                />
              </div>
              */}
                  {numNoResultsWithWarnings > 0 && (
                    <div>
                      <Trans
                        i18nKey="search.results.progressPopover.numResourcesWithoutResultsWarnings"
                        count={numNoResultsWithWarnings}
                      />
                    </div>
                  )}
                  {numNoResultsWithExceptions > 0 && (
                    <div>
                      <Trans
                        i18nKey="search.results.progressPopover.numResourcesWithoutResultsErrors"
                        count={numNoResultsWithExceptions}
                      />
                    </div>
                  )}
                  <hr className="mt-2 mb-1" />
                  <div>
                    <Trans
                      i18nKey="search.results.progressPopover.numResourcesWithResults"
                      count={numWithResults}
                    />
                  </div>
                  {numWithResultsWithWarnings > 0 && (
                    <div>
                      <Trans
                        i18nKey="search.results.progressPopover.numResourcesWithResultsWarnings"
                        count={numWithResultsWithWarnings}
                      />
                    </div>
                  )}
                  <hr className="mt-2 mb-0" />
                  <hr className="mt-1 mb-1" />
                  <div>
                    <Trans
                      i18nKey="search.results.progressPopover.numResourcesWithResultsTotal"
                      count={numResultsTotalLoaded}
                      values={{ available: numResultsTotalAvailable }}
                    />
                  </div>
                </Popover.Body>
              </Popover>
            }
          >
            <ProgressBar>
              <ProgressBar
                variant="success"
                now={numWithResults}
                max={numRequested}
                label={
                  <span>
                    {t('search.results.progressBar.numWithResults', { count: numWithResults })}
                  </span>
                }
                aria-label={t('search.results.progressBar.numWithResultsAriaLabel')}
              />
              <ProgressBar
                variant="secondary"
                now={numNoResults + numNoResultsWithIssues}
                max={numRequested}
                label={
                  <span>
                    {t('search.results.progressBar.numWithoutResults', {
                      count: numNoResults + numNoResultsWithIssues,
                    })}
                  </span>
                }
                aria-label={t('search.results.progressBar.numWithoutResultsAriaLabel')}
              />
              <ProgressBar
                striped
                animated
                now={numInProgress}
                max={numRequested}
                label={
                  <span>
                    {t('search.results.progressBar.numResultsPending', { count: numInProgress })}
                  </span>
                }
                aria-label={t('search.results.progressBar.numResultsPendingAriaLabel')}
              />
            </ProgressBar>
          </OverlayTrigger>
        </Col>
        {!isFinished && (
          <Col lg={'auto'} className="d-flex justify-content-center">
            <Button variant="danger" onClick={handleStopSearchClick}>
              <i dangerouslySetInnerHTML={{ __html: stopCircleIcon }} />{' '}
              {t('search.results.buttonStopSearch')}
            </Button>
          </Col>
        )}
      </Row>

      <Card
        className="mb-2"
        role="group"
        aria-label={t('search.results.displayOptions.cardAriaLabel')}
      >
        <Card.Body>
          <Row className="row-gap-2">
            <Col lg={'auto'} md={6} sm={6}>
              <FloatingLabel
                label={t('search.results.displayOptions.viewModeLabel')}
                controlId="results-view-mode"
              >
                <Form.Select value={viewMode} onChange={handleViewModeChange}>
                  {renderViewModeOptions()}
                </Form.Select>
              </FloatingLabel>
            </Col>
            <Col lg={'auto'} md={6} sm={6}>
              <FloatingLabel
                label={t('search.results.displayOptions.sortingLabel')}
                controlId="results-sorting"
              >
                <Form.Select value={sorting} onChange={handleSortingChange}>
                  <option value="default">
                    {t('search.results.displayOptions.sortingOptions.default')}
                  </option>
                  <option value="title-up">
                    {t('search.results.displayOptions.sortingOptions.title-up')}
                  </option>
                  <option value="title-down">
                    {t('search.results.displayOptions.sortingOptions.title-down')}
                  </option>
                  <option value="result-count-total-up">
                    {t('search.results.displayOptions.sortingOptions.result-count-total-up')}
                  </option>
                  <option value="result-count-total-down">
                    {t('search.results.displayOptions.sortingOptions.result-count-total-down')}
                  </option>
                </Form.Select>
              </FloatingLabel>
            </Col>
            {/*
            NOTE: this is not yet implemented (efficiently, so do not render it)
            <Col lg={'auto'} md={12} sm={6} className="flex-fill order-xl-4">
              <FloatingLabel
                label={t('search.results.displayOptions.resultFilterQueryLabel')}
                controlId="result-filter"
              >
                <DebouncedFuzzySearchInput
                  disabled={sorting !== 'default' || true} // TODO: implement
                  value={filter}
                  onChange={(value) => setFilter(value)}
                />
              </FloatingLabel>
            </Col>
            */}
            <Col lg={'auto'} md={12} sm={12} className="align-content-center order-xl-3">
              <Form.Check
                checked={showResourceDetails}
                onChange={() => setShowResourceDetails((show) => !show)}
                id="results-view-resource-details"
                label={t('search.results.displayOptions.optionShowResultDetails')}
              />
              <Form.Check
                checked={showDiagnostics}
                onChange={() => setShowDiagnostics((show) => !show)}
                id="results-view-warnings-errors"
                label={t('search.results.displayOptions.optionShowWarningsErrors')}
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
