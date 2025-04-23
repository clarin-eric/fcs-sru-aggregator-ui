import type { HighlightRanges } from '@nozbe/microfuzz'
import { Highlight, useFuzzySearchList } from '@nozbe/microfuzz/react'
import { useMemo, useState } from 'react'
import Alert from 'react-bootstrap/Alert'
import Card from 'react-bootstrap/Card'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import slugify from 'react-slugify'

import type { InstitutionEndpointInfo, StatisticsSection } from '@/utils/api'
import EndpointStatistics from './EndpointStatistics'

import './styles.css'

// --------------------------------------------------------------------------
// types

type FilterField = 'institution' | 'endpoint' | 'resources'

// --------------------------------------------------------------------------
// component

function SectionStatistics({
  data,
  validatorUrl,
}: {
  data: StatisticsSection
  validatorUrl: string | null
}) {
  const [filter, setFilter] = useState('')
  const [filterFields, setFilterFields] = useState<FilterField[]>([
    'institution',
    'endpoint',
    'resources',
  ])
  const [showIssuesOnly, setShowIssuesOnly] = useState(false)

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
        .flat(1)
        .filter(
          showIssuesOnly
            ? (item) =>
                Object.keys(item.endpointInfo.diagnostics).length > 0 ||
                Object.keys(item.endpointInfo.errors).length > 0
            : () => true
        ),
    [data, showIssuesOnly]
  )
  const endpointsWithIssues = flatData.filter(
    (item) =>
      Object.keys(item.endpointInfo.diagnostics).length > 0 ||
      Object.keys(item.endpointInfo.errors).length > 0
  )

  // filter by user query
  const filteredData = useFuzzySearchList({
    list: flatData,
    queryText: filter,
    // search on institution name, endpoint url and on each (root) resource name
    getText: (item) => {
      const strings = []
      if (filterFields.length === 0) {
        strings.push(
          ...[item.institutionName, item.endpointUrl, ...item.endpointInfo.rootResources]
        )
      } else {
        if (filterFields.includes('institution')) strings.push(item.institutionName)
        if (filterFields.includes('endpoint')) strings.push(item.endpointUrl)
        if (filterFields.includes('resources')) strings.push(...item.endpointInfo.rootResources)
      }
      return strings
    },
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
          match:
            filterFields.length === 0 || filterFields.includes('institution')
              ? cur.matches[0]
              : null, // TODO: this is repeated for each endpoint that matches, so not sure what highlighting will work best here (hopefully the first)
          endpoints: {},
        }
      }
      // add endpoint info with highlight info
      acc[institutionName].endpoints[endpointUrl] = {
        ...endpointInfo,
        matchEndpoint:
          filterFields.length === 0 || filterFields.includes('endpoint')
            ? cur.matches[filterFields.length === 0 || filterFields.includes('institution') ? 1 : 0]
            : null,
        matchResources:
          filterFields.length === 0 || filterFields.includes('resources')
            ? cur.matches.slice(
                0 +
                  (filterFields.length === 0 || filterFields.includes('institution') ? 1 : 0) +
                  (filterFields.length === 0 || filterFields.includes('endpoint') ? 1 : 0)
              )
            : [],
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

  // --------------------------------------------------------------

  function handleFilterOptionToggleChange(field: FilterField) {
    if (filterFields.includes(field)) {
      setFilterFields(filterFields.filter((f) => f !== field))
    } else {
      setFilterFields([...filterFields, field])
    }
  }

  // --------------------------------------------------------------

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
        <Row className="gy-2">
          <Col lg={6} md={12}>
            <Form.Control
              placeholder="Type to filter statistics ..."
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            />
          </Col>
          <Col id="filter-checkboxes" lg={6} md={12}>
            <Form.Text className="me-2">Apply filter to:</Form.Text>
            <Form.Check
              type="checkbox"
              checked={filterFields.includes('institution')}
              onChange={() => handleFilterOptionToggleChange('institution')}
              id="filter-institution-name"
              label="Institution"
            />
            <Form.Check
              type="checkbox"
              checked={filterFields.includes('endpoint')}
              onChange={() => handleFilterOptionToggleChange('endpoint')}
              id="filter-endpoint-url"
              label="Endpoint"
            />
            <Form.Check
              type="checkbox"
              checked={filterFields.includes('resources')}
              onChange={() => handleFilterOptionToggleChange('resources')}
              id="filter-resource-names"
              label="Resources"
            />
          </Col>
        </Row>
      </Form>
      <Row>
        <Col>
          <Form.Check
            type="checkbox"
            checked={showIssuesOnly}
            onChange={() => setShowIssuesOnly(!showIssuesOnly)}
            id="filter-show-issues-only"
            label={`Only show endpoints with issues (errors or warnings, currently affects ${
              endpointsWithIssues.length
            } endpoint${endpointsWithIssues.length !== 1 ? 's' : ''})`}
          />
        </Col>
      </Row>
      {Object.entries(institutionData).map(
        ([institutionName, { match: institutionMatch, endpoints: institutionEndpoints }]) => (
          <Card className="p-2" key={institutionName}>
            <h3
              className="h4 pb-1 border-bottom"
              id={`${slugify(institutionName)}-${data.isScan ? 'scan' : 'search'}`}
            >
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
                  isScan={data.isScan}
                />
              ))}
          </Card>
        )
      )}
    </Container>
  )
}

export default SectionStatistics
