import { useState } from 'react'
import { Fragment } from 'react/jsx-runtime'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import Alert from 'react-bootstrap/Alert'
import Badge from 'react-bootstrap/Badge'
import Card from 'react-bootstrap/Card'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Nav from 'react-bootstrap/Nav'
import Row from 'react-bootstrap/Row'
import Tab from 'react-bootstrap/Tab'
import { type AxiosInstance } from 'axios'

import { getStatisticsData } from '@/utils/api'
import type { StatisticsSection, InstitutionEndpointInfo } from '@/utils/api'
import AppStore from '@/stores/app'

import './Statistics.css'

import eyeIcon from 'bootstrap-icons/icons/eye-fill.svg?raw'
import arrowClockwiseIcon from 'bootstrap-icons/icons/arrow-clockwise.svg?raw'

export interface StatisticsProps {
  axios: AxiosInstance
}

function EndpointStatistics({
  url,
  statistics,
  validatorUrl,
}: {
  url: string
  statistics: InstitutionEndpointInfo
  validatorUrl: string | null
}) {
  return (
    <div className="ps-sm-4 mt-sm-0 mt-2 pt-sm-0 pt-1" key={url}>
      <h4 className="h5">
        {url}
        {validatorUrl && (
          <>
            {' '}
            <a href={`${validatorUrl}?url=${encodeURIComponent(url)}`}>
              <i dangerouslySetInnerHTML={{ __html: eyeIcon }} className="align-baseline ms-2" />
            </a>
          </>
        )}
      </h4>
      <dl className="ps-sm-4">
        <dt>FCS Version</dt>
        <dd>{statistics.version}</dd>
        <dt>Search capabilities</dt>
        <dd>{statistics.searchCapabilities.join(', ')}</dd>
        <dt>Max concurrent scan requests</dt>
        <dd>{statistics.maxConcurrentRequests}</dd>
        <dt>Request statistics</dt>
        <dd className="mb-0">{statistics.numberOfRequests} request(s)</dd>
        {statistics.avgQueueTime !== 0 && (
          <dd className="mb-0">
            Queue time (in seconds): average: {statistics.avgQueueTime}, max:{' '}
            {statistics.maxQueueTime}
          </dd>
        )}
        <dd>
          Execution time (in seconds): average: {statistics.avgExecutionTime}, max:{' '}
          {statistics.maxExecutionTime}
        </dd>
        {statistics.rootResources?.length > 0 && (
          <>
            <dt>Resources</dt>
            <dd>{statistics.rootResources.length} root resources</dd>
            <dd>
              <ul>
                {statistics.rootResources.toSorted().map((name) => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
            </dd>
          </>
        )}
        <Fragment>
          {Object.entries(statistics.diagnostics || {}).map(([reason, info]) => (
            <Alert variant="warning" key={reason} style={{ fontSize: '0.85rem' }}>
              <Alert.Heading style={{ fontSize: '1rem' }}>
                <Badge bg="warning">{info.counter}x</Badge>{' '}
                <span className="text-uppercase">Diagnostic:</span> {info.diagnostic.message}
                {info.diagnostic.diagnostic && (
                  <>
                    {' - '}
                    <small>{info.diagnostic.diagnostic}</small>
                  </>
                )}
              </Alert.Heading>
              <p className="mb-0">
                Context: <a href={info.context}>{info.context}</a>
              </p>
            </Alert>
          ))}
          {Object.entries(statistics.errors || {}).map(([reason, info]) => (
            <Alert variant="danger" key={reason} style={{ fontSize: '0.85rem' }}>
              <Alert.Heading style={{ fontSize: '1rem' }}>
                <Badge bg="danger">{info.counter}x</Badge>{' '}
                <span className="text-uppercase">Exception:</span> {info.exception.message}
              </Alert.Heading>
              <p className="mb-0">
                Context: <a href={info.context}>{info.context}</a>
              </p>
              {info.exception.cause && <p className="mb-0">Caused by: {info.exception.cause}</p>}
            </Alert>
          ))}
        </Fragment>
      </dl>
    </div>
  )
}

function Statistics({ axios }: StatisticsProps) {
  const queryClient = useQueryClient()

  const { isPending, isError, data, error } = useQuery({
    queryKey: ['statistics'],
    queryFn: getStatisticsData.bind(null, axios),
  })

  const [validatorUrl, setValidatorUrl] = useState(AppStore.getState().validatorURL)
  AppStore.subscribe((state) => setValidatorUrl(state.validatorURL))

  function refreshData() {
    console.log('Invalidate data and refresh ...')
    queryClient.invalidateQueries({ queryKey: ['statistics'] })
  }

  return (
    <Container id="statistics" className="my-3">
      <h1 className="h1">Statistics</h1>
      {(isPending || isError) && (
        <Row>
          <Col>
            {isPending ? 'Loading ...' : null}
            <br />
            {isError ? error.message : null}
          </Col>
        </Row>
      )}
      {/* TODO: add some fuzzy search on title/endpoint/resource names */}
      {data && (
        <Tab.Container defaultActiveKey={Object.keys(data).concat(null as unknown as string)[0]}>
          <Nav className="nav-tabs" as="ul">
            {Object.keys(data).map((section: string) => (
              <Nav.Item as="li" role="presentation" key={section}>
                <Nav.Link as="button" eventKey={section}>
                  {section}
                </Nav.Link>
              </Nav.Item>
            ))}
            {/* custom right aligned "refresh" tab button */}
            <Nav.Item as="li" role="presentation" className="ms-auto">
              <Nav.Link as="button" onClick={refreshData}>
                <i dangerouslySetInnerHTML={{ __html: arrowClockwiseIcon }} /> Refresh
              </Nav.Link>
            </Nav.Item>
          </Nav>
          <Tab.Content>
            {Object.entries(data).map(([section, contents]: [string, StatisticsSection]) => (
              <Tab.Pane eventKey={section} key={section}>
                <Container className="d-grid gap-2 mt-3">
                  <Alert variant="info">
                    <dl className="mb-0">
                      <dt>Start date</dt>
                      <dd className="mb-0">{new Date(contents.date).toLocaleString()}</dd>
                      <dt>Timeout (in seconds)</dt>
                      <dd className="mb-0">{contents.timeout}</dd>
                    </dl>
                  </Alert>
                  {Object.entries(contents.institutions)
                    .toSorted()
                    .map(
                      ([institutionName, institutionEndpoints]: [
                        string,
                        { [endpointUrl: string]: InstitutionEndpointInfo }
                      ]) => (
                        <Card className="p-2" key={institutionName}>
                          <h3 className="h4 pb-1 border-bottom">{institutionName}</h3>
                          {Object.entries(institutionEndpoints)
                            .toSorted()
                            .map(([endpointUrl, endpointInfo]) => (
                              <EndpointStatistics
                                url={endpointUrl}
                                statistics={endpointInfo}
                                validatorUrl={validatorUrl}
                                key={endpointUrl}
                              />
                            ))}
                        </Card>
                      )
                    )}
                </Container>
              </Tab.Pane>
            ))}
          </Tab.Content>
        </Tab.Container>
      )}
    </Container>
  )
}

export default Statistics
