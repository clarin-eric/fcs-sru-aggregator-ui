import { useQuery } from '@tanstack/react-query'
import { useId, useState } from 'react'
import Alert from 'react-bootstrap/Alert'
import Badge from 'react-bootstrap/Badge'
import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card'
import Collapse from 'react-bootstrap/Collapse'

import { useAggregatorData } from '@/providers/AggregatorDataContext'
import { useAxios } from '@/providers/AxiosContext'
import {
  getSearchResultDetails,
  type ResourceSearchResult,
  type ResourceSearchResultMetaOnly,
} from '@/utils/api'
import { NO_MORE_RECORDS_DIAGNOSTIC_URI } from '@/utils/constants'
import { type ResultsViewMode } from '@/utils/results'
import { languageCodeToName } from '@/utils/search'
import ResourceResultsModal from './ResourceResultsModal'
import ViewKwic from './ViewKwic'
import ViewPlain from './ViewPlain'

import './styles.css'

import bankIcon from 'bootstrap-icons/icons/bank.svg?raw'
import eyeIcon from 'bootstrap-icons/icons/eye.svg?raw'
import infoCircleIcon from 'bootstrap-icons/icons/info-circle.svg?raw'
import translateIcon from 'bootstrap-icons/icons/translate.svg?raw'

// --------------------------------------------------------------------------
// types

export interface ResourceSearchResultProps {
  searchId: string
  resourceId: string
  resultInfo: ResourceSearchResultMetaOnly
  viewMode: ResultsViewMode
  showResourceDetails: boolean
  showDiagnostics: boolean
}

// --------------------------------------------------------------------------
// component

function ResourceSearchResult({
  searchId,
  resourceId,
  resultInfo,
  viewMode,
  showResourceDetails,
  showDiagnostics,
}: ResourceSearchResultProps) {
  const axios = useAxios()
  const { languages } = useAggregatorData()

  const htmlId = useId()
  const [expanded, setExpanded] = useState(true)
  const [showModal, setShowModal] = useState(false)

  const inProgress = resultInfo.inProgress
  const hasResults = resultInfo.numberOfRecordsLoaded > 0 // number of required default KWIC rows loaded
  const hasDiagnostics =
    resultInfo.exception ||
    resultInfo.diagnostics?.filter(
      (diagnostic) => diagnostic.uri !== NO_MORE_RECORDS_DIAGNOSTIC_URI
    ).length > 0

  const { data, isLoading, isError } = useQuery({
    queryKey: ['search-result-details', searchId, resourceId],
    queryFn: getSearchResultDetails.bind(null, axios, searchId, resourceId),
    enabled: !inProgress, // && hasResults,
  })
  console.debug(
    'resource results',
    { searchId, resourceId, inProgress, hasResults, hasDiagnostics },
    { data, isLoading, isError }
  )

  // TODO: filter for language "byGuess" mode

  // do not show when
  // (a) still in progress
  if (inProgress) return null
  // (b) if no results, check if diags and diags should be shown
  if (!hasResults) {
    // if show diags but do not have diags => hide
    if (showDiagnostics && !hasDiagnostics) return null
    // if no results && do not want to show diags => hide
    if (!showDiagnostics) return null
  }
  // (c) does not yet have data
  if (!data) return null

  // --------------------------------------------------------------
  // event handlers

  function handleViewClick() {
    setShowModal(true)
  }

  function handleModalClose() {
    setShowModal(false)
  }

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
    <>
      <Card
        className="my-1 resource-search-result"
        role="group"
        aria-label={`Results and details for resource ${data.resource.title}`}
      >
        <Card.Header className="d-flex accordion">
          <button
            type="button"
            onClick={() => setExpanded((expanded) => !expanded)}
            aria-controls={htmlId}
            aria-expanded={expanded}
            className={`me-3 w-auto flex-grow-1 d-block text-start collapse-toggle-btn ${
              expanded ? '' : 'collapsed'
            }`}
          >
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
          </button>
          <div className="d-inline-block ms-auto">
            <Button size="sm" onClick={handleViewClick}>
              <i dangerouslySetInnerHTML={{ __html: eyeIcon }} /> View
            </Button>
          </div>
        </Card.Header>
        {/* data-bs-toggle="collapse" data-bs-target="#collapseExample" aria-expanded="false" aria-controls="collapseExample" */}
        <Collapse in={expanded}>
          <div id={htmlId}>
            {/* result details */}
            {showResourceDetails && (
              <Card.Body className="border-bottom resource-info">
                <dl className="mb-0" aria-label="Resource information">
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
            {showDiagnostics && hasDiagnostics && (
              <Card.Body className={hasResults ? 'border-top' : ''}>
                {/* TODO: aria invisible heading, adjust levels */}
                {data.exception && (
                  <Alert variant="danger" aria-label="Error information">
                    <Alert.Heading style={{ fontSize: '1rem' }}>
                      <span className="text-uppercase">Exception:</span>{' '}
                      <span aria-label="Error message">{data.exception.message}</span>
                    </Alert.Heading>
                    {data.exception.cause && (
                      <p className="mb-0 small">Cause: {data.exception.cause}</p>
                    )}
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
                      <Alert.Heading style={{ fontSize: '1rem' }}>
                        {diagnostic.message}
                      </Alert.Heading>
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
          </div>
        </Collapse>
      </Card>
      <ResourceResultsModal
        show={showModal}
        searchId={searchId}
        resourceId={resourceId}
        result={data}
        viewMode={viewMode}
        showDiagnostics={showDiagnostics}
        onModalClose={handleModalClose}
      />
    </>
  )
}

export default ResourceSearchResult
