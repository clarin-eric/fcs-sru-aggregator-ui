import { useEffect, useState } from 'react'
import Alert from 'react-bootstrap/Alert'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Dropdown from 'react-bootstrap/Dropdown'
import FloatingLabel from 'react-bootstrap/FloatingLabel'
import Form from 'react-bootstrap/Form'
import Modal from 'react-bootstrap/Modal'
import Row from 'react-bootstrap/Row'

import { useAggregatorData } from '@/providers/AggregatorDataContext'
import { useAxios } from '@/providers/AxiosContext'
import { useSearchParams } from '@/providers/SearchParamsContext'
import { getURLForDownload, getURLForWeblicht, type ResourceSearchResult } from '@/utils/api'
import { DOWNLOAD_FORMATS, NO_MORE_RECORDS_DIAGNOSTIC_URI } from '@/utils/constants'
import { type ResultsViewMode } from '@/utils/results'
import { languageCodeToName, MULTIPLE_LANGUAGE_CODE } from '@/utils/search'
import LoadMoreResultsButton from './LoadMoreResultsButton'
import ViewKwic from './ViewKwic'
import ViewPlain from './ViewPlain'

import './styles.css'

import bankIcon from 'bootstrap-icons/icons/bank.svg?raw'
import downloadIcon from 'bootstrap-icons/icons/download.svg?raw'
import envelopeArrowUpIcon from 'bootstrap-icons/icons/envelope-arrow-up.svg?raw'
import infoCircleIcon from 'bootstrap-icons/icons/info-circle.svg?raw'
import translateIcon from 'bootstrap-icons/icons/translate.svg?raw'

// --------------------------------------------------------------------------
// types

interface ResourceResultsModalProps {
  show: boolean
  searchId: string
  resourceId: string
  result: ResourceSearchResult
  viewMode: ResultsViewMode
  onModalClose: () => void
}

// --------------------------------------------------------------------------
// component

function ResourceResultsModal({
  show,
  searchId,
  resourceId,
  result,
  viewMode: viewModeProps,
  onModalClose,
}: ResourceResultsModalProps) {
  const axios = useAxios()
  const { languages, weblichtLanguages } = useAggregatorData()
  const { numberOfResults, queryType, language, languageFilter } = useSearchParams()

  const [showDiagnostics] = useState(false)
  const [viewMode, setViewMode] = useState(viewModeProps)
  useEffect(() => {
    setViewMode(viewModeProps)
  }, [viewModeProps])

  const hasDiagnostics = result.exception || result.diagnostics?.length > 0

  // --------------------------------------------------------------
  // helper

  function hasMoreResults() {
    if (!result) return false
    if (result.nextRecordPosition === -1) return false
    if (result.numberOfRecords === -1) return false
    if (result.numberOfRecords === result.kwics.length) return true // TODO: maybe?
    return true
  }

  let languageForWeblicht = null
  let disableWeblicht = false
  if (!weblichtLanguages.includes(language)) {
    // the search language is either AnyLanguage or unsupported
    if (language === MULTIPLE_LANGUAGE_CODE) {
      if (result.resource.languages && result.resource.languages.length === 1) {
        languageForWeblicht = result.resource.languages[0]
      } else {
        const languagesFromKwic = [
          ...new Set(
            result.kwics.map((kwic) => kwic.language).filter((language) => language !== null)
          ),
        ]
        if (languagesFromKwic.length === 1) {
          languageForWeblicht = languagesFromKwic[0]
        }
      }
    }
    if (!languageForWeblicht) {
      console.warn('Cannot use WebLicht: unsupported language', { language, languageFilter })
      disableWeblicht = true
    }
  }

  // ------------------------------------------------------------------------
  // event handlers

  function handleViewModeChange(event: React.ChangeEvent<HTMLSelectElement>) {
    setViewMode(event.target.value as ResultsViewMode)
  }

  // ------------------------------------------------------------------------
  // UI

  function renderResults() {
    if (!result) return null // TODO: loading spinner? but should not reach here

    if (viewMode === 'kwic') {
      return <ViewKwic data={result} />
    }
    // 'plain' (fallback)
    return <ViewPlain data={result} />
  }

  return (
    <Modal
      show={show}
      onHide={() => onModalClose()}
      size="xl"
      fullscreen="lg-down"
      centered
      className="resource-search-result-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>{result.resource.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="resource-info">
        <dl className="mb-0" aria-label="Resource information">
          <dt>
            <i dangerouslySetInnerHTML={{ __html: bankIcon }} />
            <span> Institution</span>
          </dt>
          <dd className="mb-0">{result.resource.institution}</dd>
          <dt>
            <i dangerouslySetInnerHTML={{ __html: infoCircleIcon }} />
            <span> Description</span>
          </dt>
          {result.resource.description && (
            <>
              <dd className="mb-0">{result.resource.description}</dd>
              <dt>
                <i dangerouslySetInnerHTML={{ __html: translateIcon }} />
                <span> Languages</span>
              </dt>
            </>
          )}
          <dd className="mb-0">
            {result.resource.languages
              .map(languages ? (code) => languageCodeToName(code, languages) : (x) => x)
              .toSorted()
              .join(', ')}
          </dd>
        </dl>
        <hr />
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
          <Col
            lg={'auto'}
            md={6}
            sm={6}
            className="d-flex flex-grow-1 column-gap-3 align-items-center justify-content-end"
          >
            <Dropdown>
              <Dropdown.Toggle>
                <i dangerouslySetInnerHTML={{ __html: downloadIcon }} /> Download
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {DOWNLOAD_FORMATS.map(({ id: format, label }) => (
                  <Dropdown.Item
                    href={getURLForDownload(
                      axios,
                      searchId,
                      resourceId,
                      format,
                      language,
                      languageFilter
                    )}
                  >
                    As <strong>{label}</strong> file
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
            {/* TODO: show more visible message to user? */}
            <Button
              disabled={disableWeblicht}
              aria-disabled={disableWeblicht}
              href={getURLForWeblicht(
                axios,
                searchId,
                resourceId,
                languageForWeblicht,
                language,
                languageFilter
              )}
              target="_blank"
            >
              <i dangerouslySetInnerHTML={{ __html: envelopeArrowUpIcon }} /> Send to Weblicht
            </Button>
          </Col>
        </Row>
        <hr />
        {renderResults()}
      </Modal.Body>
      {/* diagnostics */}
      {showDiagnostics && hasDiagnostics && (
        <Modal.Body className="border-top">
          {result.exception && (
            <Alert variant="danger" aria-label="Error information">
              <Alert.Heading style={{ fontSize: '1rem' }}>
                <span className="text-uppercase">Exception:</span>{' '}
                <span aria-label="Error message">{result.exception.message}</span>
              </Alert.Heading>
              {result.exception.cause && (
                <p className="mb-0 small">Cause: {result.exception.cause}</p>
              )}
              {result.exception.klass && (
                <p className="mb-0 small">
                  Caused by: <code>{result.exception.klass}</code>
                </p>
              )}
            </Alert>
          )}
          {result.diagnostics
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
        </Modal.Body>
      )}
      {/* load more button */}
      {hasMoreResults() && (
        <Modal.Footer className="justify-content-center border-top py-2">
          <LoadMoreResultsButton
            searchId={searchId}
            resourceId={resourceId}
            numberOfResults={numberOfResults}
          />
        </Modal.Footer>
      )}
    </Modal>
  )
}

export default ResourceResultsModal
