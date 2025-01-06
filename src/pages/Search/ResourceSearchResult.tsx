import { useQuery } from '@tanstack/react-query'
import { type AxiosInstance } from 'axios'
import { useRef } from 'react'
import Badge from 'react-bootstrap/Badge'
import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Table from 'react-bootstrap/Table'
import Tooltip from 'react-bootstrap/Tooltip'

import {
  getSearchResultDetails,
  type ResourceSearchResult,
  type ResourceSearchResultMetaOnly,
} from '@/utils/api'
import { type ResultsViewMode } from '@/utils/results'

import './styles.css'

import eyeIcon from 'bootstrap-icons/icons/eye.svg?raw'
import link45degIcon from 'bootstrap-icons/icons/link-45deg.svg?raw'

// --------------------------------------------------------------------------
// types

export interface ResourceSearchResultProps {
  axios: AxiosInstance
  searchId: string
  resourceId: string
  resultInfo: ResourceSearchResultMetaOnly
  viewMode: ResultsViewMode
}

export interface ViewPlainProps {
  data: ResourceSearchResult
}

export interface ViewKwicProps {
  data: ResourceSearchResult
}

// --------------------------------------------------------------------------
// component

function ViewPlain({ data }: ViewPlainProps) {
  const ref = useRef(null)

  return (
    <>
      <Table hover responsive className="mb-0">
        <tbody>
          {data.kwics.map((kwic, index) => (
            <tr key={`${kwic.pid ?? kwic.reference ?? data.resource.id}-${index}`}>
              <td className="result-refs">
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
      <Table hover responsive className="mb-0">
        <thead className="visually-hidden">
          <tr>
            <th>References</th>
            <th>Left Context</th>
            <th>Hit</th>
            <th>Right Context</th>
          </tr>
        </thead>
        <tbody>
          {data.kwics.map((kwic, index) => (
            <tr key={`${kwic.pid ?? kwic.reference ?? data.resource.id}-${index}`}>
              <td className="result-refs">
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

function ResourceSearchResult({
  axios,
  searchId,
  resourceId,
  resultInfo,
  viewMode,
}: ResourceSearchResultProps) {
  const inProgress = resultInfo.inProgress
  const hasResults = resultInfo.numberOfRecords > 0

  const { data, isLoading, isError } = useQuery({
    queryKey: ['search-result-details', searchId, resourceId],
    queryFn: getSearchResultDetails.bind(null, axios, searchId, resourceId),
    enabled: !inProgress && hasResults,
  })
  console.log('results for', { searchId, resourceId, inProgress }, { data, isLoading, isError })

  if (inProgress) return null
  if (!hasResults) return null
  if (!data) return null

  // ------------------------------------------------------------------------
  // UI

  function renderResultsCounter() {
    if (!data) return null // TODO

    if (data.nextRecordPosition === -1) {
      return data.numberOfRecords
    } else if (data.numberOfRecords === data.kwics.length) {
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
    <Card className="my-1 resource-search-result">
      <Card.Header className="d-flex">
        <div>
          <Badge bg="" className="text-bg-light border me-2">
            {renderResultsCounter()}
          </Badge>
          {data.resource.title}
          <small className="text-muted">{data.resource.institution}</small>
        </div>
        <div className="d-inline-block ms-auto">
          <Button size="sm">
            <i dangerouslySetInnerHTML={{ __html: eyeIcon }} /> View
          </Button>
        </div>
      </Card.Header>
      <Card.Body>{renderResults()}</Card.Body>
    </Card>
  )
}

export default ResourceSearchResult
