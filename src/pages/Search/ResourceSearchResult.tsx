import { useQuery } from '@tanstack/react-query'
import { type AxiosInstance } from 'axios'
import Badge from 'react-bootstrap/Badge'
import Card from 'react-bootstrap/Card'
import Table from 'react-bootstrap/Table'

import { getSearchResultDetails, type ResourceSearchResultMetaOnly } from '@/utils/api'

import './styles.css'

import link45degIcon from 'bootstrap-icons/icons/link-45deg.svg?raw'

// --------------------------------------------------------------------------
// types

export interface ResourceSearchResultProps {
  axios: AxiosInstance
  searchId: string
  resourceId: string
  resultInfo: ResourceSearchResultMetaOnly
}

// --------------------------------------------------------------------------
// component

function ResourceSearchResult({
  axios,
  searchId,
  resourceId,
  resultInfo,
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

  return (
    <Card className="my-1 resource-search-result">
      <Card.Header>
        <Badge bg="" className="text-bg-light border me-2">
          {renderResultsCounter()}
        </Badge>
        {data.resource.title}
        <small className="text-muted">{data.resource.institution}</small>
      </Card.Header>
      <Card.Body>
        <Table hover className="mb-0">
          <thead className="visually-hidden">
            <tr>
              <th>#</th>
              <th>Left Context</th>
              <th>Hit</th>
              <th>Right Context</th>
            </tr>
          </thead>
          <tbody>
            {data.kwics.map((kwic, index) => (
              <tr key={`${kwic.pid ?? kwic.reference ?? data.resource.id}-${index}`}>
                <td>
                  {kwic.reference && (
                    <a href={kwic.reference} target="_blank">
                      <i dangerouslySetInnerHTML={{ __html: link45degIcon }} />
                    </a>
                  )}
                </td>
                <td>{kwic.left}</td>
                <td>
                  <strong>{kwic.keyword}</strong>
                </td>
                <td>{kwic.right}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  )
}

export default ResourceSearchResult
