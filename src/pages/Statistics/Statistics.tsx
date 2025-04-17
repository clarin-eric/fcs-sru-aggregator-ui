import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Nav from 'react-bootstrap/Nav'
import Row from 'react-bootstrap/Row'
import Tab from 'react-bootstrap/Tab'
import { Helmet } from 'react-helmet-async'
import { useParams } from 'react-router'

import useRouteGoTo from '@/hooks/useRouteGoTo'
import useRouteMatch from '@/hooks/useRouteMatch'
import { useAxios } from '@/providers/AxiosContext'
import AppStore from '@/stores/app'
import type { StatisticsSection } from '@/utils/api'
import { getStatisticsData } from '@/utils/api'
import SectionStatistics from './SectionStatistics'

import './styles.css'

import arrowClockwiseIcon from 'bootstrap-icons/icons/arrow-clockwise.svg?raw'

// --------------------------------------------------------------------------
// types

// --------------------------------------------------------------------------
// constants

const CATEGORY_LABELS = [
  { id: 'last-scan', label: 'Last Scan' },
  { id: 'recent-searches', label: 'Recent Searches' },
] as const
const CATEGORY_LABELS_MAP = Object.fromEntries(CATEGORY_LABELS.map((item) => [item.id, item]))

// --------------------------------------------------------------------------
// component

function Statistics() {
  const axios = useAxios()
  const queryClient = useQueryClient()

  const { categoryId } = useParams()
  const routeMatch = useRouteMatch()
  const doNavigation = useRouteGoTo()
  console.debug('route', { routeMatch, categoryId })

  const { isPending, isError, data, error } = useQuery({
    queryKey: ['statistics'],
    queryFn: getStatisticsData.bind(null, axios),
  })

  const [validatorUrl, setValidatorUrl] = useState(AppStore.getState().validatorURL)
  AppStore.subscribe((state) => setValidatorUrl(state.validatorURL))

  const appTitleHead = AppStore.getState().appTitleHead

  const categoryKeys = data !== undefined ? Object.keys(data) : []
  // check if path param of to-be-selected statistics category exists and is valid otherwise default
  const defaultCategoryTab =
    categoryId != undefined && categoryKeys.includes(categoryId)
      ? categoryId
      : categoryKeys.length > 0
      ? categoryKeys[0]
      : undefined

  function refreshData() {
    console.debug('Invalidate data and refresh ...')
    queryClient.invalidateQueries({ queryKey: ['statistics'] })
  }

  function handleTabChange(activeKey: string) {
    console.log('activeKey', { activeKey, routeMatch, categoryId: routeMatch?.params.categoryId })
    if (routeMatch) {
      if (routeMatch.params.categoryId !== activeKey) {
        if (routeMatch.route.path) {
          doNavigation(routeMatch.route.path, { categoryId: activeKey })
        }
      }
    }
  }

  return (
    <>
      <Helmet>
        <title>{appTitleHead} – Statistics</title>
      </Helmet>
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
          <Tab.Container defaultActiveKey={defaultCategoryTab} onSelect={handleTabChange}>
            <Nav className="nav-tabs" as="ul">
              {Object.keys(data).map((section: string) => (
                <Nav.Item as="li" role="presentation" key={section}>
                  <Nav.Link as="button" eventKey={section}>
                    {CATEGORY_LABELS_MAP[section]?.label ?? section}
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
    </>
  )
}

export default Statistics
