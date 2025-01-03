import { useQuery, useQueryClient } from '@tanstack/react-query'
import { type AxiosInstance } from 'axios'
import { useState } from 'react'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Nav from 'react-bootstrap/Nav'
import Row from 'react-bootstrap/Row'
import Tab from 'react-bootstrap/Tab'

import AppStore from '@/stores/app'
import type { StatisticsSection } from '@/utils/api'
import { getStatisticsData } from '@/utils/api'
import SectionStatistics from './SectionStatistics'

import './styles.css'

import arrowClockwiseIcon from 'bootstrap-icons/icons/arrow-clockwise.svg?raw'

// --------------------------------------------------------------------------
// types

export interface StatisticsProps {
  axios: AxiosInstance
}

// --------------------------------------------------------------------------
// component

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
