import { useMemo, useState } from 'react'
import { Fragment } from 'react/jsx-runtime'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import Alert from 'react-bootstrap/Alert'
import Badge from 'react-bootstrap/Badge'
import Card from 'react-bootstrap/Card'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Form from 'react-bootstrap/Form'
import Nav from 'react-bootstrap/Nav'
import Row from 'react-bootstrap/Row'
import Tab from 'react-bootstrap/Tab'
import { type AxiosInstance } from 'axios'
import { useFuzzySearchList, Highlight } from '@nozbe/microfuzz/react'
import type { HighlightRanges } from '@nozbe/microfuzz'

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
  statistics: InstitutionEndpointInfo & {
    matchEndpoint: HighlightRanges | null
    matchResources: (HighlightRanges | null)[]
  }
  validatorUrl: string | null
}) {
  return (
    <div className="ps-sm-4 mt-sm-0 mt-2 pt-sm-0 pt-1" key={url}>
      <h4 className="h5">
        <Highlight text={url} ranges={statistics.matchEndpoint} />
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
                {statistics.rootResources.map((name, idx) => (
                  <li key={name}>
                    <Highlight text={name} ranges={statistics.matchResources?.[idx] ?? null} />
                  </li>
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

function SectionStatistics({
  data,
  validatorUrl,
}: {
  data: StatisticsSection
  validatorUrl: string | null
}) {
  const [filter, setFilter] = useState('')

  // make it flat
  const flatData = useMemo(
    () =>
      Object.entries(data.institutions)
        .toSorted()
        .map(([institutionName, institutionEndpoints]) =>
          Object.entries(institutionEndpoints)
            .toSorted()
            .map(([endpointUrl, endpointInfo]) => ({
              institutionName,
              endpointUrl,
              endpointInfo: {
                ...endpointInfo,
                rootResources: endpointInfo.rootResources.toSorted(),
              },
            }))
        )
        .flat(1),
    [data]
  )

  // filter by user query
  const filteredData = useFuzzySearchList({
    list: flatData,
    queryText: filter,
    // search on institution name, endpoint url and on each (root) resource name
    getText: (item) => [item.institutionName, item.endpointUrl, ...item.endpointInfo.rootResources],
    mapResultItem: ({ item, score, matches }) => ({ item, matches, score }),
    // strategy: 'off'
  })

  // rebuild nested structure, group by first occuring institution name
  // add highlight information
  const institutionData = filteredData.reduce(
    (acc, cur) => {
      const { institutionName, endpointUrl, endpointInfo } = cur.item

      // check if we have not yet seen this institution name, then add it
      if (!Object.getOwnPropertyNames(acc).includes(institutionName)) {
        acc[institutionName] = {
          match: cur.matches[0], // TODO: this is repeated for each endpoint that matches, so not sure what highlighting will work best here (hopefully the first)
          endpoints: {},
        }
      }
      // add endpoint info with highlight info
      acc[institutionName].endpoints[endpointUrl] = {
        ...endpointInfo,
        matchEndpoint: cur.matches[1],
        matchResources: cur.matches.slice(2),
      }
      return acc
    },
    {} as {
      // map with key institution name
      [institutionName: string]: {
        // to institution name highlight match
        match: HighlightRanges | null
        endpoints: {
          // and a map with endpoint url as key
          [endpointUrl: string]: InstitutionEndpointInfo & {
            // information augmented with highlight match information for endpoint url and each (root) resource
            matchEndpoint: HighlightRanges | null
            matchResources: (HighlightRanges | null)[]
          }
        }
      }
    }
  )

  return (
    <Container className="d-grid gap-2 mt-3">
      <Alert variant="info" className="mb-0">
        <dl className="mb-0">
          <dt>Start date</dt>
          <dd className="mb-0">{new Date(data.date).toLocaleString()}</dd>
          <dt>Timeout (in seconds)</dt>
          <dd className="mb-0">{data.timeout}</dd>
        </dl>
      </Alert>
      <Form onSubmit={(event) => event.preventDefault()}>
        <Form.Control
          placeholder="Type to filter statistics ..."
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
        />
      </Form>
      {Object.entries(institutionData).map(
        ([institutionName, { match: institutionMatch, endpoints: institutionEndpoints }]) => (
          <Card className="p-2" key={institutionName}>
            <h3 className="h4 pb-1 border-bottom">
              <Highlight text={institutionName} ranges={institutionMatch} />
            </h3>
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
    console.debug('Invalidate data and refresh ...')
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
                <SectionStatistics data={contents} validatorUrl={validatorUrl} />
              </Tab.Pane>
            ))}
          </Tab.Content>
        </Tab.Container>
      )}
    </Container>
  )
}

export default Statistics
