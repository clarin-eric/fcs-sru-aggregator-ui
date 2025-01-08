import { useQuery, useQueryClient } from '@tanstack/react-query'
import { type AxiosInstance } from 'axios'
import { useRef, useState } from 'react'
import Alert from 'react-bootstrap/Alert'
import Badge from 'react-bootstrap/Badge'
import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Spinner from 'react-bootstrap/Spinner'
import Table from 'react-bootstrap/Table'
import Tooltip from 'react-bootstrap/Tooltip'

import {
  getSearchResultDetails,
  getSearchResultsMetaOnly,
  postSearchMoreResults,
  type ResourceSearchResult,
  type ResourceSearchResultMetaOnly,
  type SearchResultsMetaOnly,
} from '@/utils/api'
import { NO_MORE_RECORDS_DIAGNOSTIC_URI } from '@/utils/constants'
import { type ResultsViewMode } from '@/utils/results'
import { type LanguageCode2NameMap, languageCodeToName } from '@/utils/search'

import './styles.css'

import bankIcon from 'bootstrap-icons/icons/bank.svg?raw'
import eyeIcon from 'bootstrap-icons/icons/eye.svg?raw'
import infoCircleIcon from 'bootstrap-icons/icons/info-circle.svg?raw'
import link45degIcon from 'bootstrap-icons/icons/link-45deg.svg?raw'
import threeDotsIcon from 'bootstrap-icons/icons/three-dots.svg?raw'
import translateIcon from 'bootstrap-icons/icons/translate.svg?raw'

// --------------------------------------------------------------------------
// types

export interface ResourceSearchResultProps {
  axios: AxiosInstance
  searchId: string
  resourceId: string
  resultInfo: ResourceSearchResultMetaOnly
  viewMode: ResultsViewMode
  showResourceDetails: boolean
  showDiagnostics: boolean
  languages?: LanguageCode2NameMap
  numberOfResults: number
}

export interface ViewPlainProps {
  data: ResourceSearchResult
}

export interface ViewKwicProps {
  data: ResourceSearchResult
}

export interface LoadMoreResultsProps {
  axios: AxiosInstance
  searchId: string
  resourceId: string
  numberOfResults: number
}

// --------------------------------------------------------------------------
// component

function ViewPlain({ data }: ViewPlainProps) {
  const ref = useRef(null)

  return (
    <>
      <Table hover responsive className="mb-0 results-plain">
        <thead className="visually-hidden">
          <tr>
            <th scope="col">#</th>
            <th scope="col">References</th>
            <th scope="col">Result with Hit</th>
          </tr>
        </thead>
        <tbody>
          {data.kwics.map((kwic, index) => (
            <tr key={`${kwic.pid ?? kwic.reference ?? data.resource.id}-${index}`}>
              <td scope="row" className="text-end text-muted d-none d-sm-table-cell">
                {index + 1}
              </td>
              <td scope="row" className="result-refs">
                {kwic.reference && (
                  <a href={kwic.reference} target="_blank">
                    <i dangerouslySetInnerHTML={{ __html: link45degIcon }} />
                  </a>
                )}{' '}
                {kwic.pid && (
                  <OverlayTrigger
                    placement="auto-start"
                    container={ref}
                    delay={{ show: 250, hide: 400 }}
                    overlay={<Tooltip id={`ttip-${kwic.pid}-${index}`}>{kwic.pid}</Tooltip>}
                  >
                    {/* TODO: maybe with on mouse-over stay? see: https://github.com/react-bootstrap/react-bootstrap/issues/1622*/}
                    <Badge bg="secondary" className="pid-badge">
                      PID
                    </Badge>
                  </OverlayTrigger>
                )}
              </td>
              <td>
                {kwic.fragments.map((fragment, index) =>
                  fragment.hit ? (
                    <mark key={index}>
                      <strong>{fragment.text}</strong>
                    </mark>
                  ) : (
                    <span key={index}>{fragment.text}</span>
                  )
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      {/* overlay mounting point to avoid flickering due to redrawing */}
      <div ref={ref} className="tooltip-mounting-point"></div>
    </>
  )
}

function ViewKwic({ data }: ViewKwicProps) {
  const ref = useRef(null)

  return (
    <>
      <Table hover responsive className="mb-0 results-kwic">
        <thead className="visually-hidden">
          <tr>
            <th scope="col">#</th>
            <th scope="col">References</th>
            <th scope="col">Left Context</th>
            <th scope="col">Hit</th>
            <th scope="col">Right Context</th>
          </tr>
        </thead>
        <tbody>
          {data.kwics.map((kwic, index) => (
            <tr key={`${kwic.pid ?? kwic.reference ?? data.resource.id}-${index}`}>
              <td scope="row" className="text-end text-muted d-none d-sm-table-cell">
                {index + 1}
              </td>
              <td scope="row" className="result-refs">
                {kwic.reference && (
                  <a href={kwic.reference} target="_blank">
                    <i dangerouslySetInnerHTML={{ __html: link45degIcon }} />
                  </a>
                )}{' '}
                {kwic.pid && (
                  <OverlayTrigger
                    placement="auto-start"
                    container={ref}
                    delay={{ show: 250, hide: 400 }}
                    overlay={<Tooltip id={`ttip-${kwic.pid}-${index}`}>{kwic.pid}</Tooltip>}
                  >
                    {/* TODO: maybe with on mouse-over stay? see: https://github.com/react-bootstrap/react-bootstrap/issues/1622*/}
                    <Badge bg="secondary" className="pid-badge">
                      PID
                    </Badge>
                  </OverlayTrigger>
                )}
              </td>
              <td>{kwic.left}</td>
              <td>
                <mark>
                  <strong>{kwic.keyword}</strong>
                </mark>
              </td>
              <td>{kwic.right}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      {/* overlay mounting point to avoid flickering due to redrawing */}
      <div ref={ref} className="tooltip-mounting-point"></div>
    </>
  )
}

function LoadMoreResults({ axios, searchId, resourceId, numberOfResults }: LoadMoreResultsProps) {
  const queryClient = useQueryClient()

  const [enableRequests, setEnableRequests] = useState(false)

  // request more
  const {
    data: searchIdNewButSame,
    isLoading: isLoadingRequesting,
    // isError: isErrorRequesting,
  } = useQuery({
    queryKey: ['search-result-load-more', searchId, resourceId],
    queryFn: postSearchMoreResults.bind(null, axios, searchId, { resourceId, numberOfResults }),
    enabled: enableRequests,
    // NOTE: we never want this to automatically fetch more unless user requests it
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })
  // console.debug('request more results', { enableRequests, searchId, resourceId, searchIdNewButSame, isLoadingRequesting, isErrorRequesting })
  if (searchIdNewButSame !== undefined && searchId !== searchIdNewButSame) {
    console.warn('SearchIDs should be the same?!', { searchId, searchIdNewButSame, resourceId })
  }
  const hasRequestedMore = searchIdNewButSame !== undefined

  // poll for more
  const {
    data: dataPolling,
    isLoading: isLoadingPolling,
    // isError: isErrorPolling,
  } = useQuery<SearchResultsMetaOnly>({
    queryKey: ['search-results', searchId, resourceId],
    queryFn: getSearchResultsMetaOnly.bind(null, axios, searchId),
    enabled: enableRequests && hasRequestedMore,
    refetchInterval(query) {
      // console.debug('[LoadMoreResults#refetchInterval]', { searchId, resourceId, hasRequestedMore, query })
      if (query.state.data && query.state.data.inProgress > 0) return 1500
      return false
    },
  })
  // console.debug('polling for more results finished?', { dataPolling, isLoadingPolling, isErrorPolling, searchId, resourceId })

  const isLoading = isLoadingRequesting || isLoadingPolling
  const isFinished =
    !!dataPolling &&
    // either everything is finished
    (dataPolling.inProgress === 0 ||
      // or the resource we requested more results for is finished
      dataPolling.results.filter(
        (metaResult) => metaResult.id === resourceId && metaResult.inProgress === false
      ).length === 1)

  // console.debug('before render', { enableRequests, isLoading, isFinished, hasRequestedMore, searchId, resourceId })
  if (enableRequests && hasRequestedMore && isFinished) {
    if (enableRequests) {
      // console.debug('disable requests for next')
      setEnableRequests(false)
    }

    // console.debug('Invalidate data for refresh ...', { searchId, resourceId, queryKey: ['search-result-details', searchId, resourceId] })
    // details
    queryClient.invalidateQueries({ queryKey: ['search-result-details', searchId, resourceId] })
  }

  async function handleLoadMoreClick() {
    // console.log('[handleLoadMoreClick]', { searchId, resourceId })

    // TODO: unsure about removeQueries / resetQueries, required to completely clear state
    // more results
    await queryClient.resetQueries({ queryKey: ['search-result-load-more', searchId, resourceId] })
    // polling (we do here ourselves)
    await queryClient.resetQueries({ queryKey: ['search-results', searchId, resourceId] })

    setEnableRequests(true)
  }

  return (
    <Button
      className="more-results-button"
      disabled={isLoading || enableRequests}
      onClick={handleLoadMoreClick}
    >
      {isLoading ? (
        <>
          <Spinner animation="border" />
        </>
      ) : (
        <>
          <i dangerouslySetInnerHTML={{ __html: threeDotsIcon }} /> Load more results
        </>
      )}
    </Button>
  )
}

function ResourceSearchResult({
  axios,
  searchId,
  resourceId,
  resultInfo,
  viewMode,
  showResourceDetails,
  showDiagnostics,
  languages,
  numberOfResults,
}: ResourceSearchResultProps) {
  const inProgress = resultInfo.inProgress
  const hasResults = resultInfo.numberOfRecordsLoaded > 0 // number of required default KWIC rows loaded

  const { data, isLoading, isError } = useQuery({
    queryKey: ['search-result-details', searchId, resourceId],
    queryFn: getSearchResultDetails.bind(null, axios, searchId, resourceId),
    enabled: !inProgress, // && hasResults,
  })
  console.debug(
    'resource results',
    { searchId, resourceId, inProgress },
    { data, isLoading, isError }
  )

  // TODO: filter for language "byGuess" mode

  if (inProgress) return null
  if (!showDiagnostics && !hasResults) return null
  if (!data) return null

  // --------------------------------------------------------------
  // helper

  function hasMoreResults() {
    if (!data) return false
    if (data.nextRecordPosition === -1) return false
    if (data.numberOfRecords === -1) return false
    if (data.numberOfRecords === data.kwics.length) return true // TODO: maybe?
    return true
  }

  // --------------------------------------------------------------
  // event handlers

  // ------------------------------------------------------------------------
  // UI

  function renderResultsCounter() {
    if (!data) return null // TODO

    if (data.numberOfRecords === -1) {
      // probably at end, since endpoints respond with -1 when trying to request more than available
      return data.kwics.length
    } else if (data.numberOfRecords === data.kwics.length && data.nextRecordPosition === -1) {
      // either everything or possibly more
      return `${data.kwics.length} / ${data.numberOfRecords}?`
    } else {
      return `${data.kwics.length} / ${data.numberOfRecords}`
    }
  }

  function renderResults() {
    if (!data) return null // TODO: loading spinner? but should not reach here

    if (viewMode === 'kwic') {
      return <ViewKwic data={data} />
    }
    // 'plain' (fallback)
    return <ViewPlain data={data} />
  }

  return (
    <Card className="my-1 resource-search-result" role="group" aria-label={`Results and details for resource ${data.resource.title}`}>
      <Card.Header className="d-flex">
        <div>
          <Badge
            bg=""
            className="text-bg-light border me-2"
            aria-label="Number of results (total amount, or currently loaded amount with total available)"
          >
            {renderResultsCounter()}
          </Badge>
          <span aria-label="Resource title">{data.resource.title}</span>
          <small className="text-muted" aria-label="Institution name">
            {data.resource.institution}
          </small>
        </div>
        <div className="d-inline-block ms-auto">
          <Button size="sm">
            <i dangerouslySetInnerHTML={{ __html: eyeIcon }} /> View
          </Button>
        </div>
      </Card.Header>
      {/* result details */}
      {showResourceDetails && (
        <Card.Body className="border-bottom resource-info">
          <dl className="mb-0" aria-label='Resource information'>
            <dt>
              <i dangerouslySetInnerHTML={{ __html: bankIcon }} />
              <span> Institution</span>
            </dt>
            <dd className="mb-0">{data.resource.institution}</dd>
            <dt>
              <i dangerouslySetInnerHTML={{ __html: infoCircleIcon }} />
              <span> Description</span>
            </dt>
            {data.resource.description && (
              <>
                <dd className="mb-0">{data.resource.description}</dd>
                <dt>
                  <i dangerouslySetInnerHTML={{ __html: translateIcon }} />
                  <span> Languages</span>
                </dt>
              </>
            )}
            <dd className="mb-0">
              {data.resource.languages
                .map(languages ? (code) => languageCodeToName(code, languages) : (x) => x)
                .toSorted()
                .join(', ')}
            </dd>
          </dl>
        </Card.Body>
      )}
      {/* results */}
      {hasResults && <Card.Body>{renderResults()}</Card.Body>}
      {/* diagnostics */}
      {showDiagnostics && (data.exception || data.diagnostics?.length > 0) && (
        <Card.Body className={hasResults ? 'border-top' : ''}>
          {/* TODO: aria invisible heading, adjust levels */}
          {data.exception && (
            <Alert variant="danger" aria-label='Error information'>
              <Alert.Heading style={{ fontSize: '1rem' }}>
                <span className="text-uppercase">Exception:</span> <span aria-label='Error message'>{data.exception.message}</span>
              </Alert.Heading>
              {data.exception.cause && <p className="mb-0 small">Cause: {data.exception.cause}</p>}
              {data.exception.klass && (
                <p className="mb-0 small">
                  Caused by: <code>{data.exception.klass}</code>
                </p>
              )}
            </Alert>
          )}
          {data.diagnostics
            .filter((diagnostic) => diagnostic.uri !== NO_MORE_RECORDS_DIAGNOSTIC_URI)
            .map((diagnostic) => (
              <Alert
                variant="warning"
                key={`${diagnostic.uri}-${diagnostic.message}-${diagnostic.diagnostic}`}
              >
                <Alert.Heading style={{ fontSize: '1rem' }}>{diagnostic.message}</Alert.Heading>
                {diagnostic.diagnostic && (
                  <p className="mb-0 small">Details: {diagnostic.diagnostic}</p>
                )}
                <p className="mb-0 small">
                  Diagnostic type: <code>{diagnostic.uri}</code>
                  {/* add link to list? */}
                </p>
              </Alert>
            ))}
        </Card.Body>
      )}
      {/* load more button */}
      {hasMoreResults() && (
        <Card.Body className="text-center border-top">
          <LoadMoreResults
            axios={axios}
            searchId={searchId}
            resourceId={resourceId}
            numberOfResults={numberOfResults}
          />
        </Card.Body>
      )}
      {/* <Card.Footer className='text-center'>More Results?</Card.Footer> */}
    </Card>
  )
}

export default ResourceSearchResult
