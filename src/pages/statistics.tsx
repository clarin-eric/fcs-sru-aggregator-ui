import { Fragment } from 'react/jsx-runtime'
import { useQuery } from '@tanstack/react-query'
import Alert from 'react-bootstrap/Alert'
import Badge from 'react-bootstrap/Badge'
import Card from 'react-bootstrap/Card'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Tab from 'react-bootstrap/Tab'
import Tabs from 'react-bootstrap/Tabs'
import { type AxiosInstance } from 'axios'
import { getStatisticsData } from '@/utils/api'
import type { StatisticsSection, InstitutionEndpointInfo } from '@/utils/api'

import eyeIcon from 'bootstrap-icons/icons/eye-fill.svg'

export interface StatisticsProps {
  axios: AxiosInstance
}

function Statistics({ axios }: StatisticsProps) {
  const { isPending, isError, data, error } = useQuery({
    queryKey: ['statistics'],
    queryFn: getStatisticsData.bind(null, axios),
  })

  return (
    <Container className="my-3">
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
      {data && (
        <Tabs>
          {Object.entries(data).map(([section, contents]: [string, StatisticsSection]) => (
            <Tab eventKey={section} key={section} title={section}>
              <Container className="d-grid gap-2 mt-3">
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
                            <div className="ps-4" key={endpointUrl}>
                              <h4 className="h5">
                                {endpointUrl}{' '}
                                <a
                                  href={`${import.meta.env.VALIDATOR_URL}?url=${encodeURIComponent(
                                    endpointUrl
                                  )}`}
                                >
                                  <img src={eyeIcon} className="align-baseline ms-2" />
                                </a>
                              </h4>
                              <dl className="ps-4">
                                <dt>FCS Version</dt>
                                <dd>{endpointInfo.version}</dd>
                                <dt>Search capabilities</dt>
                                <dd>{endpointInfo.searchCapabilities.join(', ')}</dd>
                                <dt>Max concurrent scan requests</dt>
                                <dd>{endpointInfo.maxConcurrentRequests}</dd>
                                <dt>Request statistics</dt>
                                <dd className="mb-0">{endpointInfo.numberOfRequests} request(s)</dd>
                                {endpointInfo.avgQueueTime !== 0 && (
                                  <dd className="mb-0">
                                    Queue time: average: {endpointInfo.avgQueueTime}, max:{' '}
                                    {endpointInfo.maxQueueTime}
                                  </dd>
                                )}
                                <dd>
                                  Execution time: average: {endpointInfo.avgExecutionTime}, max:{' '}
                                  {endpointInfo.maxExecutionTime}
                                </dd>
                                {endpointInfo.rootResources?.length > 0 && (
                                  <>
                                    <dt>Resources</dt>
                                    <dd>{endpointInfo.rootResources.length} root resources</dd>
                                    <dd>
                                      <ul>
                                        {endpointInfo.rootResources.toSorted().map((name) => (
                                          <li key={name}>{name}</li>
                                        ))}
                                      </ul>
                                    </dd>
                                  </>
                                )}
                                <Fragment>
                                  {Object.entries(endpointInfo.diagnostics || {}).map(
                                    ([reason, info]) => (
                                      <Alert
                                        variant="warning"
                                        key={reason}
                                        style={{ fontSize: '0.85rem' }}
                                      >
                                        <Alert.Heading style={{ fontSize: '1rem' }}>
                                          <Badge bg="warning">{info.counter}x</Badge>{' '}
                                          <span className="text-uppercase">Diagnostic:</span>{' '}
                                          {info.diagnostic.message} -{' '}
                                          <small>{info.diagnostic.diagnostic}</small>
                                        </Alert.Heading>
                                        <p className="mb-0">
                                          Context: <a href={info.context}>{info.context}</a>
                                        </p>
                                      </Alert>
                                    )
                                  )}
                                  {Object.entries(endpointInfo.errors || {}).map(
                                    ([reason, info]) => (
                                      <Alert
                                        variant="danger"
                                        key={reason}
                                        style={{ fontSize: '0.85rem' }}
                                      >
                                        <Alert.Heading style={{ fontSize: '1rem' }}>
                                          <Badge bg="danger">{info.counter}x</Badge>{' '}
                                          <span className="text-uppercase">Exception:</span>{' '}
                                          {info.exception.message}
                                        </Alert.Heading>
                                        <p className="mb-0">
                                          Context: <a href={info.context}>{info.context}</a>
                                        </p>
                                        {info.exception.cause && (
                                          <p className="mb-0">Caused by: {info.exception.cause}</p>
                                        )}
                                      </Alert>
                                    )
                                  )}
                                </Fragment>
                              </dl>
                            </div>
                          ))}
                      </Card>
                    )
                  )}
              </Container>
            </Tab>
          ))}
        </Tabs>
      )}
    </Container>
  )
}

export default Statistics
