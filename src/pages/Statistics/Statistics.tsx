import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Nav from 'react-bootstrap/Nav'
import Row from 'react-bootstrap/Row'
import Tab from 'react-bootstrap/Tab'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { useParams, useSearchParams } from 'react-router'

import useNavigate from '@/hooks/useNavigate'
import useRouteMatch from '@/hooks/useRouteMatch'
import { useAxios } from '@/providers/AxiosContext'
import AppStore from '@/stores/app'
import type { ExtraScopingParams, StatisticsSection } from '@/utils/api'
import { getStatisticsData, REQ_PARAM_CONSORTIA } from '@/utils/api'
import ResourcesDetails from './ResourcesDetails'
import SectionStatistics from './SectionStatistics'

import arrowClockwiseIcon from 'bootstrap-icons/icons/arrow-clockwise.svg?raw'

import './styles.css'

// --------------------------------------------------------------------------
// types

// --------------------------------------------------------------------------
// constants

const CATEGORY_LABELS = [
  { id: 'last-scan', label: 'Last Scan' },
  { id: 'recent-searches', label: 'Recent Searches' },
] as const
const CATEGORY_LABELS_MAP = Object.fromEntries(CATEGORY_LABELS.map((item) => [item.id, item]))

const OTHER_TABS = ['resources']

// --------------------------------------------------------------------------
// component

function Statistics() {
  const axios = useAxios()
  const queryClient = useQueryClient()
  const [urlSearchParams] = useSearchParams()
  const { t } = useTranslation()

  const { categoryId } = useParams()
  const routeMatch = useRouteMatch()
  const navigate = useNavigate()
  console.debug('route', { routeMatch, categoryId })

  const extraParams = {
    consortia: urlSearchParams.get(REQ_PARAM_CONSORTIA),
  } satisfies ExtraScopingParams
  const { isPending, isError, data, error } = useQuery({
    queryKey: ['statistics'],
    queryFn: getStatisticsData.bind(null, axios, extraParams),
  })

  const [validatorUrl, setValidatorUrl] = useState(AppStore.getState().validatorURL)
  AppStore.subscribe((state) => setValidatorUrl(state.validatorURL))

  const appTitleHead = AppStore.getState().appTitleHead

  const categoryKeys = data !== undefined ? Object.keys(data).toSorted() : []
  // check if path param of to-be-selected statistics category exists and is valid otherwise default
  const defaultCategoryTab =
    categoryId != undefined &&
    (categoryKeys.includes(categoryId) || OTHER_TABS.includes(categoryId))
      ? categoryId
      : categoryKeys.length > 0
      ? categoryKeys[0]
      : undefined

  // --------------------------------------------------------------

  function refreshData() {
    console.debug('Invalidate data and refresh ...')
    queryClient.invalidateQueries({ queryKey: ['statistics'] })
  }

  function handleTabChange(eventKey: string | null) {
    console.debug('eventKey', { eventKey, routeMatch, categoryId: routeMatch?.params.categoryId })
    if (routeMatch) {
      if (routeMatch.params.categoryId !== eventKey) {
        if (routeMatch.route.path) {
          navigate(routeMatch.route.path, { categoryId: eventKey })
        }
      }
    }
  }

  // --------------------------------------------------------------

  return (
    <>
      <Helmet>
        <title>{appTitleHead} – Statistics</title>
      </Helmet>
      <Container id="statistics" className="my-4">
        <h1 className="h1">{t('statistics.title')}</h1>
        {(isPending || isError) && (
          <Row>
            <Col>
              {isPending ? t('statistics.loading') : null}
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
                    {t(`statistics.tabs.${section}`, {
                      defaultValue: CATEGORY_LABELS_MAP[section]?.label ?? section,
                    })}
                  </Nav.Link>
                </Nav.Item>
              ))}
              <Nav.Item as="li" role="presentation" key="resources">
                <Nav.Link as="button" eventKey="resources">
                  {t('statistics.tabs.resources')}
                </Nav.Link>
              </Nav.Item>
              {/* custom right aligned "refresh" tab button */}
              <Nav.Item as="li" role="presentation" className="ms-auto">
                <Nav.Link as="button" onClick={refreshData}>
                  <i dangerouslySetInnerHTML={{ __html: arrowClockwiseIcon }} />{' '}
                  {t('statistics.tabs.btnRefresh')}
                </Nav.Link>
              </Nav.Item>
            </Nav>
            <Tab.Content>
              {Object.entries(data).map(([section, contents]: [string, StatisticsSection]) => (
                <Tab.Pane eventKey={section} key={section}>
                  <SectionStatistics data={contents} validatorUrl={validatorUrl} />
                </Tab.Pane>
              ))}
              <Tab.Pane eventKey="resources" key="resources">
                <ResourcesDetails validatorUrl={validatorUrl} />
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        )}
      </Container>
    </>
  )
}

export default Statistics
