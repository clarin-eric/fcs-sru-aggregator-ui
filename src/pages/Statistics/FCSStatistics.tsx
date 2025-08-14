import { useAxios } from '@/providers/AxiosContext'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Table from 'react-bootstrap/Table'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router'

import LanguageModal from '@/components/LanguageModal'
import { useLocaleStore } from '@/stores/locale'
import {
  type ExtraScopingParams,
  getLanguages,
  getResources,
  REQ_PARAM_CONSORTIA,
  type Resource,
} from '@/utils/api'
import {
  flattenResources,
  fromApi,
  getBestFromMultilingualValuesTryByLanguage,
} from '@/utils/resources'
import { type LanguageCode2NameMap } from '@/utils/search'

import './styles.css'

// --------------------------------------------------------------------------

type ResourceInstitutionVariantOptions = 'institution' | 'hoster'
type URLVariantOptions = 'url' | 'domain' | 'tld'

const DEFAULT_RESOURCE_INSTITUTION_VARIANT: ResourceInstitutionVariantOptions = 'institution'
const DEFAULT_URL_VARIANT: URLVariantOptions = 'url'

// --------------------------------------------------------------------------

function extractTLD(url: string): string {
  // TODO: best effort TLD extraction
  const domain = new URL(url).hostname
  const parts = domain.split('.')

  // this should not be possible
  if (parts.length <= 1) return domain

  const lastTLDPart = parts.at(-1)!

  // if only two parts, the last is the TLD
  if (parts.length === 2) return lastTLDPart

  const preLastTLDPart = parts.at(-2)!

  // NOTE: heuristic to check if parts are too short...
  if (
    (lastTLDPart.length === 2 && preLastTLDPart.length === 2) ||
    (lastTLDPart.length === 3 && preLastTLDPart.length === 2)
  ) {
    return `${preLastTLDPart}.${lastTLDPart}`
  }

  return lastTLDPart
}

function extractMainDomain(url: string): string {
  const tld = extractTLD(url)

  const parsed = new URL(url)
  const domain = parsed.hostname
  const domainWithoutTLD = domain.slice(0, -(tld.length + 1))

  const parts = domainWithoutTLD.split('.')
  const mainDomainPart = parts.slice(-1)

  const shortDomain = `${mainDomainPart}.${tld}`

  if (parsed.port) {
    return `${shortDomain}:${parsed.port}`
  }
  return shortDomain
}

function getSURT(url: string): string[] {
  const parsed = new URL(url)
  const domain = parsed.hostname
  const domainSURT = domain.split('.').toReversed()
  const restOfURL = url.substring(
    url.indexOf('/', parsed.protocol.length + 2 + parsed.hostname.length)
  )
  // ignore protocol
  return [...domainSURT, parsed.port, restOfURL]
}

function sortBySURT(urlA: string, urlB: string) {
  const surtA = getSURT(urlA)
  const surtB = getSURT(urlB)
  const len = Math.min(surtA.length, surtB.length)
  for (let i = 0; i < len; i++) {
    const fragmentA = surtA[i]
    const fragmentB = surtB[i]
    const res = fragmentA.localeCompare(fragmentB)
    if (res !== 0) return res
  }
  return 0
}

// --------------------------------------------------------------------------
// component

function FCSStatistics() {
  const axios = useAxios()
  const { t } = useTranslation()

  const userLocale = useLocaleStore((state) => state.locale)
  // const [locale, setLocale] = useState(userLocale)
  // const langNames = new Intl.DisplayNames([userLocale, 'en'], { type: 'language' })

  const [urlSearchParams] = useSearchParams()

  const [resources, setResources] = useState<Resource[]>([])
  const [languages, setLanguages] = useState<LanguageCode2NameMap>({})

  const [selectedResourceInstitutionVariantOption, setSelectedResourceInstitutionVariantOption] =
    useState<ResourceInstitutionVariantOptions>(DEFAULT_RESOURCE_INSTITUTION_VARIANT)
  const [selectedEndpointURLVariantOption, setSelectedEndpointURLVariantOption] =
    useState<URLVariantOptions>(DEFAULT_URL_VARIANT)
  const [showLanguageSelectionModal, setShowLanguageSelectionModal] = useState(false)

  // ------------------------------------------------------------------------
  // initialization

  const extraParams = {
    consortia: urlSearchParams.get(REQ_PARAM_CONSORTIA),
  } satisfies ExtraScopingParams
  const {
    data: dataResources,
    isPending: isPendingResources,
    isError: isErrorResources,
    error: errorResources,
  } = useQuery({
    queryKey: ['resources'],
    queryFn: getResources.bind(null, axios, extraParams),
  })
  const {
    data: dataLanguages,
    isPending: isPendingLanguages,
    isError: isErrorLanguages,
    error: errorLanguages,
  } = useQuery({
    queryKey: ['languages'],
    queryFn: getLanguages.bind(null, axios, extraParams),
  })

  useEffect(() => {
    if (!dataResources) return
    // do some initialization (based on `data`)
    const newResources = fromApi(dataResources)
    // set state
    setResources(newResources)
  }, [dataResources])
  useEffect(() => {
    if (!dataLanguages) return
    setLanguages(dataLanguages)
  }, [dataLanguages])

  // ------------------------------------------------------------------------

  const flatResources = flattenResources(resources)

  const endpointURLsWithResources = flatResources.reduce((map, resource) => {
    const url = resource.endpoint.url
    if (!map.has(url)) {
      map.set(url, [])
    }
    map.get(url)!.push(resource)
    return map
  }, new Map<string, Resource[]>())
  const endpointDomainsWithURLs = Array.from(endpointURLsWithResources.keys()).reduce(
    (map, url) => {
      const domain = extractMainDomain(url)
      if (!map.has(domain)) {
        map.set(domain, [])
      }
      map.get(domain)!.push(url)
      return map
    },
    new Map<string, string[]>()
  )
  const endpointTLDsWithURLs = Array.from(endpointURLsWithResources.keys()).reduce((map, url) => {
    const tld = extractTLD(url)
    if (!map.has(tld)) {
      map.set(tld, [])
    }
    map.get(tld)!.push(url)
    return map
  }, new Map<string, string[]>())

  const institutionsWithResources = flatResources.reduce((map, resource) => {
    const institution =
      getBestFromMultilingualValuesTryByLanguage(resource.institution, userLocale) ??
      resource.endpointInstitution.name
    if (!map.has(institution)) {
      map.set(institution, [])
    }
    map.get(institution)!.push(resource)
    return map
  }, new Map<string, Resource[]>())
  const endpointInstitutionsWithResources = flatResources.reduce((map, resource) => {
    const institution = resource.endpointInstitution.name
    if (!map.has(institution)) {
      map.set(institution, [])
    }
    map.get(institution)!.push(resource)
    return map
  }, new Map<string, Resource[]>())

  const hasResources = resources && resources.length > 0
  const hasLanguages = languages && Object.getOwnPropertyNames(languages).length > 0
  const enableResourceLanguageSelectionModal = hasResources && hasLanguages

  // ------------------------------------------------------------------------
  // event handlers

  // ------------------------------------------------------------------------
  // rendering

  function renderEndpointURLTable() {
    if (selectedEndpointURLVariantOption === 'tld') {
      return (
        <Table hover responsive className="mt-2">
          <thead>
            <tr>
              <th scope="col">{t('statistics.fcs.thEndpointDomain')}</th>
              <th scope="col">{t('statistics.fcs.thCountURLsForDomain')}</th>
              <th scope="col">{t('statistics.fcs.thCountResourcesFromEndpoint')}</th>
            </tr>
          </thead>
          <tbody>
            {Array.from(endpointTLDsWithURLs.entries())
              .toSorted(([tldA], [tldB]) => sortBySURT(`http://${tldA}`, `http://${tldB}`))
              .map(([domain, urls]) => {
                const resources = urls.map((url) => endpointURLsWithResources.get(url)).flat()

                return (
                  <tr key={domain}>
                    <td>{domain}</td>
                    <td>{urls.length}</td>
                    <td>{resources.length}</td>
                  </tr>
                )
              })}
          </tbody>
        </Table>
      )
    }

    if (selectedEndpointURLVariantOption === 'domain') {
      return (
        <Table hover responsive className="mt-2">
          <thead>
            <tr>
              <th scope="col">{t('statistics.fcs.thEndpointDomain')}</th>
              <th scope="col">{t('statistics.fcs.thCountURLsForDomain')}</th>
              <th scope="col">{t('statistics.fcs.thCountResourcesFromEndpoint')}</th>
            </tr>
          </thead>
          <tbody>
            {Array.from(endpointDomainsWithURLs.entries())
              .toSorted(([urlA], [urlB]) => sortBySURT(`http://${urlA}`, `http://${urlB}`))
              .map(([domain, urls]) => {
                const resources = urls.map((url) => endpointURLsWithResources.get(url)).flat()

                return (
                  <tr key={domain}>
                    <td>{domain}</td>
                    <td>{urls.length}</td>
                    <td>{resources.length}</td>
                  </tr>
                )
              })}
          </tbody>
        </Table>
      )
    }

    return (
      <Table hover responsive className="mt-2">
        <thead>
          <tr>
            <th scope="col">{t('statistics.fcs.thEndpointUrl')}</th>
            <th scope="col">{t('statistics.fcs.thCountResourcesFromEndpoint')}</th>
          </tr>
        </thead>
        <tbody>
          {Array.from(endpointURLsWithResources.entries())
            .toSorted(([urlA], [urlB]) => sortBySURT(urlA, urlB))
            .map(([url, resources]) => (
              <tr key={url}>
                <td>{url}</td>
                <td>{resources.length}</td>
              </tr>
            ))}
        </tbody>
      </Table>
    )
  }

  // ------------------------------------------------------------------------

  return (
    <Container className="d-grid gap-2 mt-3">
      {(isPendingResources || isErrorResources) && (
        <Row>
          <Col>
            {isPendingResources ? t('statistics.loading') : null}
            <br />
            {isErrorResources ? errorResources.message : null}
          </Col>
        </Row>
      )}
      {(isPendingLanguages || isErrorLanguages) && (
        <Row>
          <Col>
            {isPendingLanguages ? t('statistics.loading') : null}
            <br />
            {isErrorLanguages ? errorLanguages.message : null}
          </Col>
        </Row>
      )}

      <Card className="p-3">
        <h3 className="h4 pb-1 mb-3 border-bottom">{t('statistics.fcs.title')}</h3>

        <h4 className="h5 pb-1 mb-3 border-bottom" id="overview">
          {t('statistics.fcs.titleOverall')}
        </h4>

        <Table hover responsive>
          <thead className="visually-hidden">
            <tr>
              <th scope="col">{t('statistics.fcs.thStatsKey')}</th>
              <th scope="col">{t('statistics.fcs.thStatsValue')}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td scope="row">{t('statistics.fcs.tdLabelResourceCount')}</td>
              <td>{flatResources.length}</td>
            </tr>
            <tr>
              <td scope="row">{t('statistics.fcs.tdLabelEndpointCount')}</td>
              <td>{endpointURLsWithResources.size}</td>
            </tr>
            <tr>
              <td scope="row">{t('statistics.fcs.tdLabelInstitutionCount')}</td>
              <td>{endpointInstitutionsWithResources.size}</td>
            </tr>
          </tbody>
        </Table>

        <h4 className="h5 pb-1 mb-3 border-bottom" id="institutions">
          {t('statistics.fcs.titleInstitutions')}
        </h4>

        <Card className="my-2">
          <Card.Header>{t('statistics.fcs.cardHeaderInstitutionStats')}</Card.Header>
          <Card.Body>
            <dl className="mb-0">
              <dt>{t('statistics.fcs.tdLabelInstitutionCount')}</dt>
              <dd>{institutionsWithResources.size}</dd>
              <dt>{t('statistics.fcs.tdLabelInstitutionHosterCount')}</dt>
              <dd>{endpointInstitutionsWithResources.size}</dd>
            </dl>
          </Card.Body>
        </Card>

        <Card className="my-2">
          <Card.Header>{t('statistics.fcs.cardHeaderInstitutions')}</Card.Header>
          <Card.Body>
            <Form onSubmit={(event) => event.preventDefault()}>
              <Col className="filter-checkboxes" lg={12} md={12}>
                <Form.Text className="me-2">
                  {t('statistics.fcs.labelForResourceInstitutionVariants')}
                </Form.Text>
                {(['institution', 'hoster'] as ResourceInstitutionVariantOptions[]).map((type) => (
                  <Form.Check
                    key={type}
                    type="radio"
                    name="resourceInstitutionVariant"
                    value={type}
                    id={`resourceInstitutionVariant-${type}`}
                    checked={selectedResourceInstitutionVariantOption === type}
                    onChange={() => setSelectedResourceInstitutionVariantOption(type)}
                    label={t(`statistics.fcs.resourceInstitutionVariant${type}`)}
                  />
                ))}
              </Col>
            </Form>

            <Table hover responsive className="mt-2">
              <thead>
                <tr>
                  <th scope="col">{t('statistics.fcs.thInstitutionName')}</th>
                  <th scope="col">{t('statistics.fcs.thCountResourcesFromInstitution')}</th>
                </tr>
              </thead>
              <tbody>
                {Array.from(
                  (selectedResourceInstitutionVariantOption === 'hoster'
                    ? endpointInstitutionsWithResources
                    : institutionsWithResources
                  ).entries()
                ).map(([institution, resources]) => (
                  <tr key={institution}>
                    <td>{institution}</td>
                    <td>{resources.length}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>

        <h4 className="h5 pb-1 mt-4 mb-3 border-bottom" id="endpoints">
          {t('statistics.fcs.titleEndpoints')}
        </h4>

        <Card className="my-2">
          <Card.Header>{t('statistics.fcs.cardHeaderEndpointStats')}</Card.Header>
          <Card.Body>
            <dl className="mb-0">
              <dt>{t('statistics.fcs.tdLabelEndpointCount')}</dt>
              <dd>{endpointURLsWithResources.size}</dd>
              <dt>{t('statistics.fcs.tdLabelEndpointDomainCount')}</dt>
              <dd>{endpointDomainsWithURLs.size}</dd>
            </dl>
          </Card.Body>
        </Card>

        <Card className="my-2">
          <Card.Header>{t('statistics.fcs.cardHeaderEndpoints')}</Card.Header>
          <Card.Body>
            <Form onSubmit={(event) => event.preventDefault()}>
              <Col className="filter-checkboxes" lg={12} md={12}>
                <Form.Text className="me-2">
                  {t('statistics.fcs.labelForResourceInstitutionVariants')}
                </Form.Text>
                {(['url', 'domain', 'tld'] as URLVariantOptions[]).map((type) => (
                  <Form.Check
                    key={type}
                    type="radio"
                    name="endpointURLVariant"
                    value={type}
                    id={`endpointURLVariant-${type}`}
                    checked={selectedEndpointURLVariantOption === type}
                    onChange={() => setSelectedEndpointURLVariantOption(type)}
                    label={t(`statistics.fcs.endpointURLVariant${type}`)}
                  />
                ))}
              </Col>
            </Form>

            {renderEndpointURLTable()}
          </Card.Body>
        </Card>

        <h4 className="h5 pb-1 mb-3 border-bottom" id="resources">
          {t('statistics.fcs.titleResources')}
        </h4>

        <Card className="my-2">
          <Card.Header>{t('statistics.fcs.cardHeaderResourceStats')}</Card.Header>
          <Card.Body>
            <dl className="mb-0">
              <dt>{t('statistics.fcs.tdLabelResourceCount')}</dt>
              <dd>{flatResources.length}</dd>
              <dt>{t('statistics.fcs.tdLabelRootResourceCount')}</dt>
              <dd>{resources.length}</dd>
            </dl>
          </Card.Body>
          {enableResourceLanguageSelectionModal && (
            <Card.Footer className="d-flex gap-2">
              <Button variant="primary" onClick={() => setShowLanguageSelectionModal(true)}>
                {t('statistics.fcs.btnOpenResourceLanguageSelectionModal')}
              </Button>
            </Card.Footer>
          )}
        </Card>
      </Card>

      <LanguageModal
        languages={languages}
        resources={resources}
        showResourceCounts={true}
        showLanguageFilterOptions={false}
        show={showLanguageSelectionModal}
        onModalClose={() => setShowLanguageSelectionModal(false)}
      />
    </Container>
  )
}

export default FCSStatistics
