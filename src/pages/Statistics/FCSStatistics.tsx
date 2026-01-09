import { useAxios } from '@/providers/AxiosContext'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Table from 'react-bootstrap/Table'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router'

import type {
  AvailabilityRestriction,
  Capability,
  Consortium,
  ExtraScopingParams,
} from '@clarin-eric/fcs-sru-aggregator-api-adapter-typescript'
import {
  getLanguages,
  getResources,
  REQ_PARAM_CONSORTIA,
} from '@clarin-eric/fcs-sru-aggregator-api-adapter-typescript'

import LanguageModal from '@/components/LanguageModal'
import useKeepSearchParams from '@/hooks/useKeepSearchParams'
import usePrevious from '@/hooks/usePrevious'
import { useLocaleStore } from '@/stores/locale'
import type { Resource } from '@/utils/api'
import {
  flattenResources,
  fromApi,
  getBestFromMultilingualValuesTryByLanguage,
} from '@/utils/resources'
import type { LanguageCode2NameMap } from '@/utils/search'
import { REQ_PARAM_RESOURCE_ID } from './utils'

import eyeIcon from 'bootstrap-icons/icons/eye-fill.svg?raw'

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

const searchCapabilityPriority: Map<Capability, number> = new Map([
  ['BASIC_SEARCH', 0],
  ['ADVANCED_SEARCH', 1],
  ['LEX_SEARCH', 2],
  ['AUTHENTICATED_SEARCH', 3],
])

function compareSearchCapability(capabilityA: Capability, capabilityB: Capability) {
  const priorityA = searchCapabilityPriority.get(capabilityA)
  const priorityB = searchCapabilityPriority.get(capabilityB)
  // any unknown value is moved to end
  if (priorityA === undefined) return +1
  if (priorityB === undefined) return -1
  // default sort (with lookup searchCapabilityPriority)
  return priorityA - priorityB
}

// --------------------------------------------------------------------------
// component

function FCSStatistics() {
  const axios = useAxios()
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const userLocale = useLocaleStore((state) => state.locale)
  // const [locale, setLocale] = useState(userLocale)
  // const langNames = new Intl.DisplayNames([userLocale, 'en'], { type: 'language' })

  const [, getLinkSearch] = useKeepSearchParams()
  const [urlSearchParams, setUrlSearchParams] = useSearchParams()

  const [resources, setResources] = useState<Resource[]>([])
  const [resourcesAll, setResourcesAll] = useState<Resource[]>([])
  const [languages, setLanguages] = useState<LanguageCode2NameMap>({})

  const [selectedResourceInstitutionVariantOption, setSelectedResourceInstitutionVariantOption] =
    useState<ResourceInstitutionVariantOptions>(DEFAULT_RESOURCE_INSTITUTION_VARIANT)
  const [selectedEndpointURLVariantOption, setSelectedEndpointURLVariantOption] =
    useState<URLVariantOptions>(DEFAULT_URL_VARIANT)
  const [showLanguageSelectionModal, setShowLanguageSelectionModal] = useState(false)

  // ------------------------------------------------------------------------
  // initialization

  const consortia = urlSearchParams.get(REQ_PARAM_CONSORTIA)?.split(',') ?? []

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

  // conditional data
  const {
    data: dataResourcesAll,
    isPending: isPendingResourcesAll,
    isError: isErrorResourcesAll,
    error: errorResourcesAll,
  } = useQuery({
    queryKey: ['resources-all'],
    queryFn: import.meta.env.SHOW_CONSORTIA_INFO
      ? getResources.bind(null, axios, undefined)
      : () => [],
  })

  useEffect(() => {
    if (!dataResources) return
    // do some initialization (based on `dataResources`)
    const newResources = fromApi(dataResources)
    // set state
    setResources(newResources)
  }, [dataResources])
  useEffect(() => {
    if (!dataLanguages) return
    setLanguages(dataLanguages)
  }, [dataLanguages])

  if (import.meta.env.SHOW_CONSORTIA_INFO) {
    // NOTE: intential for conditional build (either it exists or not)
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      if (!dataResourcesAll) return
      setResourcesAll(fromApi(dataResourcesAll))
    }, [dataResourcesAll])

    // invalidate every query to refresh data
    // BUT only run if consortia query param changed
    // NOTE: needs to be delayed as API requests and URL change race each other...
    const consortia = urlSearchParams.get(REQ_PARAM_CONSORTIA)
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const prevConsortia = usePrevious(consortia)
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      const newConsortia = urlSearchParams.get(REQ_PARAM_CONSORTIA)
      if (prevConsortia !== newConsortia) queryClient.invalidateQueries()
    }, [prevConsortia, queryClient, urlSearchParams])
  }

  // ------------------------------------------------------------------------

  const flatResources = flattenResources(resources)

  const endpointURLsWithResources = flatResources.reduce((map, resource) => {
    const url = resource.endpoint.url
    if (!map.has(url)) map.set(url, [])
    map.get(url)!.push(resource)
    return map
  }, new Map<string, Resource[]>())
  const endpointDomainsWithURLs = Array.from(endpointURLsWithResources.keys()).reduce(
    (map, url) => {
      const domain = extractMainDomain(url)
      if (!map.has(domain)) map.set(domain, [])
      map.get(domain)!.push(url)
      return map
    },
    new Map<string, string[]>()
  )
  const endpointTLDsWithURLs = Array.from(endpointURLsWithResources.keys()).reduce((map, url) => {
    const tld = extractTLD(url)
    if (!map.has(tld)) map.set(tld, [])
    map.get(tld)!.push(url)
    return map
  }, new Map<string, string[]>())
  const endpointURLsWithSearchCapabilities = flatResources.reduce((map, resource) => {
    const url = resource.endpoint.url
    if (!map.has(url)) map.set(url, new Set())
    const searchCapabilities = map.get(url)!
    resource.endpoint.searchCapabilities.forEach((capability) => searchCapabilities.add(capability))
    return map
  }, new Map<string, Set<Capability>>())

  const institutionsWithResources = flatResources.reduce((map, resource) => {
    const institution =
      getBestFromMultilingualValuesTryByLanguage(resource.institution, userLocale) ??
      resource.endpointInstitution.name
    if (!map.has(institution)) map.set(institution, [])
    map.get(institution)!.push(resource)
    return map
  }, new Map<string, Resource[]>())
  const endpointInstitutionsWithResources = flatResources.reduce((map, resource) => {
    const institution = resource.endpointInstitution.name
    if (!map.has(institution)) map.set(institution, [])
    map.get(institution)!.push(resource)
    return map
  }, new Map<string, Resource[]>())

  const searchCapabilitiesWithResources = flatResources.reduce((map, resource) => {
    const capabilities = resource.searchCapabilitiesResolved
    for (const capability of capabilities) {
      if (!map.has(capability)) map.set(capability, [])
      map.get(capability)!.push(resource)
    }
    return map
  }, new Map<Capability, Resource[]>())
  const availabilityRestrictionsWithResources = flatResources.reduce((map, resource) => {
    const restriction = resource.availabilityRestriction
    if (!map.has(restriction)) map.set(restriction, [])
    map.get(restriction)!.push(resource)
    return map
  }, new Map<AvailabilityRestriction, Resource[]>())

  const consortiaWithResources = import.meta.env.SHOW_CONSORTIA_INFO
    ? flattenResources(resourcesAll).reduce((map, resource) => {
        const consortium = resource.endpointInstitution.consortium ?? null
        if (!map.has(consortium)) {
          map.set(consortium, { resources: [], endpoints: new Set<string>() })
        }
        const consortiumData = map.get(consortium)!
        consortiumData.resources.push(resource)
        consortiumData.endpoints.add(resource.endpoint.url)
        return map
      }, new Map<Consortium | null, { resources: Resource[]; endpoints: Set<string> }>())
    : new Map<Consortium | null, { resources: Resource[]; endpoints: Set<string> }>()

  const hasResources = resources && resources.length > 0
  const hasLanguages = languages && Object.getOwnPropertyNames(languages).length > 0
  const enableResourceLanguageSelectionModal = hasResources && hasLanguages

  const hasResourcesWithAvailabilityRestriction =
    Array.from(availabilityRestrictionsWithResources.keys()).filter(
      (restriction) => restriction !== 'NONE'
    ).length > 0

  // ------------------------------------------------------------------------
  // event handlers

  function toggleConsortium(consortium: string) {
    // compute the new list of consortia
    const consortia = urlSearchParams.get(REQ_PARAM_CONSORTIA)?.split(',').filter(Boolean) ?? []
    console.debug('Toggle consortia', { consortia, consortium })
    const newConsortia = consortia.includes(consortium)
      ? consortia.filter((c) => c !== consortium)
      : consortia.concat([consortium])

    // update our persistent query param
    if (newConsortia.length === 0) {
      urlSearchParams.delete(REQ_PARAM_CONSORTIA)
    } else {
      urlSearchParams.set(REQ_PARAM_CONSORTIA, newConsortia.join(','))
    }
    setUrlSearchParams(urlSearchParams)

    // query invalidation happens above with usePrevious hook/state machine
  }

  // ------------------------------------------------------------------------
  // rendering

  function shortCapabilitiesForUrls(urls: string[]) {
    return (
      Array.from(
        urls
          .map((url) => endpointURLsWithSearchCapabilities.get(url))
          .filter((caps) => caps !== undefined)
          .reduce((set, caps) => {
            caps.forEach((cap) => set.add(cap))
            return set
          }, new Set<Capability>())
      )
        // .filter((cap) => cap !== 'BASIC_SEARCH')
        .toSorted(compareSearchCapability)
        .map((cap) => (cap.endsWith('_SEARCH') ? cap.substring(0, cap.indexOf('_SEARCH')) : cap))
    )
  }

  function renderInstitutionsTable() {
    return (
      <Table hover responsive className="mt-2">
        <thead>
          <tr>
            <th scope="col">{t('statistics.fcs.thInstitutionName')}</th>
            <th scope="col">{t('statistics.fcs.thCountResources')}</th>
            <th scope="col">{t('statistics.fcs.thSearchCapabilities')}</th>
            {import.meta.env.SHOW_CONSORTIA_INFO && (
              <th scope="col">{t('statistics.fcs.thConsortia')}</th>
            )}
          </tr>
        </thead>
        <tbody>
          {Array.from(
            (selectedResourceInstitutionVariantOption === 'hoster'
              ? endpointInstitutionsWithResources
              : institutionsWithResources
            ).entries()
          )
            .toSorted()
            .map(([institution, resources]) => {
              const urls = Array.from(
                resources
                  .map((resource) => resource.endpoint.url)
                  .reduce((set, url) => set.add(url), new Set<string>())
              )
              const capabilities = shortCapabilitiesForUrls(urls)
              const consortia = import.meta.env.SHOW_CONSORTIA_INFO
                ? Array.from(
                    resources
                      .map((resource) => resource.endpointInstitution.consortium)
                      .filter((consortium) => consortium !== undefined)
                      .reduce((set, consortium) => set.add(consortium), new Set<string>())
                  )
                : []

              return (
                <tr key={institution}>
                  <td>{institution}</td>
                  <td>{resources.length}</td>
                  <td>{capabilities.join(', ')}</td>
                  {import.meta.env.SHOW_CONSORTIA_INFO && <td>{consortia.join(', ')}</td>}
                </tr>
              )
            })}
        </tbody>
      </Table>
    )
  }

  function renderEndpointURLTable() {
    if (selectedEndpointURLVariantOption === 'tld') {
      return (
        <Table hover responsive className="mt-2">
          <thead>
            <tr>
              <th scope="col">{t('statistics.fcs.thEndpointDomain')}</th>
              <th scope="col">{t('statistics.fcs.thCountURLsForDomain')}</th>
              <th scope="col">{t('statistics.fcs.thCountResources')}</th>
              <th scope="col">{t('statistics.fcs.thSearchCapabilities')}</th>
              {import.meta.env.SHOW_CONSORTIA_INFO && (
                <th scope="col">{t('statistics.fcs.thConsortia')}</th>
              )}
            </tr>
          </thead>
          <tbody>
            {Array.from(endpointTLDsWithURLs.entries())
              .toSorted(([tldA], [tldB]) => sortBySURT(`http://${tldA}`, `http://${tldB}`))
              .map(([domain, urls]) => {
                const resources = urls
                  .map((url) => endpointURLsWithResources.get(url))
                  .filter((list) => list !== undefined)
                  .flat()
                const capabilities = shortCapabilitiesForUrls(urls)
                const consortia = import.meta.env.SHOW_CONSORTIA_INFO
                  ? Array.from(
                      resources
                        .map((resource) => resource.endpointInstitution.consortium)
                        .filter((consortium) => consortium !== undefined)
                        .reduce((set, consortium) => set.add(consortium), new Set<string>())
                    )
                  : []

                return (
                  <tr key={domain}>
                    <td>{domain}</td>
                    <td>{urls.length}</td>
                    <td>{resources.length}</td>
                    <td>{capabilities.join(', ')}</td>
                    {import.meta.env.SHOW_CONSORTIA_INFO && <td>{consortia.join(', ')}</td>}
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
              <th scope="col">{t('statistics.fcs.thCountResources')}</th>
              <th scope="col">{t('statistics.fcs.thSearchCapabilities')}</th>
              {import.meta.env.SHOW_CONSORTIA_INFO && (
                <th scope="col">{t('statistics.fcs.thConsortia')}</th>
              )}
            </tr>
          </thead>
          <tbody>
            {Array.from(endpointDomainsWithURLs.entries())
              .toSorted(([urlA], [urlB]) => sortBySURT(`http://${urlA}`, `http://${urlB}`))
              .map(([domain, urls]) => {
                const resources = urls
                  .map((url) => endpointURLsWithResources.get(url))
                  .filter((list) => list !== undefined)
                  .flat()
                const capabilities = shortCapabilitiesForUrls(urls)
                const consortia = import.meta.env.SHOW_CONSORTIA_INFO
                  ? Array.from(
                      resources
                        .map((resource) => resource.endpointInstitution.consortium)
                        .filter((consortium) => consortium !== undefined)
                        .reduce((set, consortium) => set.add(consortium), new Set<string>())
                    )
                  : []

                return (
                  <tr key={domain}>
                    <td>{domain}</td>
                    <td>{urls.length}</td>
                    <td>{resources.length}</td>
                    <td>{capabilities.join(', ')}</td>
                    {import.meta.env.SHOW_CONSORTIA_INFO && <td>{consortia.join(', ')}</td>}
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
            <th scope="col">{t('statistics.fcs.thCountResources')}</th>
            <th scope="col">{t('statistics.fcs.thSearchCapabilities')}</th>
            {import.meta.env.SHOW_CONSORTIA_INFO && (
              <th scope="col">{t('statistics.fcs.thConsortium')}</th>
            )}
          </tr>
        </thead>
        <tbody>
          {Array.from(endpointURLsWithResources.entries())
            .toSorted(([urlA], [urlB]) => sortBySURT(urlA, urlB))
            .map(([url, resources]) => {
              const capabilities = shortCapabilitiesForUrls([url])
              const consortia = import.meta.env.SHOW_CONSORTIA_INFO
                ? Array.from(
                    resources
                      .map((resource) => resource.endpointInstitution.consortium)
                      .filter((consortium) => consortium !== undefined)
                      .reduce((set, consortium) => set.add(consortium), new Set<string>())
                  )
                : []

              return (
                <tr key={url}>
                  <td>{url}</td>
                  <td>{resources.length}</td>
                  <td>{capabilities.join(', ')}</td>
                  {import.meta.env.SHOW_CONSORTIA_INFO && <td>{consortia.join(', ')}</td>}
                </tr>
              )
            })}
        </tbody>
      </Table>
    )
  }

  // ------------------------------------------------------------------------

  return (
    <Container className="d-grid gap-2 mt-3">
      {/* error / loading indicators */}
      {(isPendingResources || isErrorResources) && (
        <Row>
          <Col>
            {isPendingResources
              ? t('statistics.loading', { context: 'what', what: 'resources' })
              : null}
            <br />
            {isErrorResources ? errorResources.message : null}
          </Col>
        </Row>
      )}
      {(isPendingLanguages || isErrorLanguages) && (
        <Row>
          <Col>
            {isPendingLanguages
              ? t('statistics.loading', { context: 'what', what: 'languages' })
              : null}
            <br />
            {isErrorLanguages ? errorLanguages.message : null}
          </Col>
        </Row>
      )}
      {import.meta.env.SHOW_CONSORTIA_INFO && (
        <>
          {(isPendingResourcesAll || isErrorResourcesAll) && (
            <Row>
              <Col>
                {isPendingResourcesAll
                  ? t('statistics.loading', { context: 'what', what: 'resources-all' })
                  : null}
                <br />
                {isErrorResourcesAll ? errorResourcesAll.message : null}
              </Col>
            </Row>
          )}
        </>
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
            {import.meta.env.SHOW_CONSORTIA_INFO && consortiaWithResources.size > 1 && (
              <tr>
                <td scope="row">{t('statistics.fcs.tdLabelConsortiaCount')}</td>
                <td>{consortiaWithResources.size}</td>
              </tr>
            )}
          </tbody>
        </Table>

        {import.meta.env.SHOW_CONSORTIA_INFO && consortiaWithResources.size > 1 && (
          <>
            <h4 className="h5 pb-1 mb-3 border-bottom" id="consortia">
              {t('statistics.fcs.titleConsortia')}
            </h4>

            <Card className="my-2">
              <Card.Header>{t('statistics.fcs.cardHeaderConsortia')}</Card.Header>
              <Card.Body>
                <Table hover responsive className="mt-2">
                  <thead>
                    <tr>
                      <th scope="col">{t('statistics.fcs.thConsortium')}</th>
                      <th scope="col">{t('statistics.fcs.thCountEndpoints')}</th>
                      <th scope="col">{t('statistics.fcs.thCountResources')}</th>
                      <th scope="col">{t('statistics.fcs.thSearchCapabilities')}</th>
                      <th scope="col">{t('statistics.fcs.thActions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from(consortiaWithResources.entries()).map(
                      ([consortium, { resources, endpoints }]) => {
                        const urls = Array.from(endpoints)
                        const capabilities = shortCapabilitiesForUrls(urls)

                        return (
                          <tr
                            key={consortium}
                            className={
                              consortium && consortia.includes(consortium)
                                ? 'table-primary'
                                : undefined
                            }
                          >
                            <td>{consortium ?? t('statistics.fcs.tdNoConsortium')}</td>
                            <td>{endpoints.size}</td>
                            <td>{resources.length}</td>
                            <td>{capabilities.join(', ')}</td>
                            <td className={consortium === null ? '' : 'py-0 align-middle'}>
                              {consortium === null ? (
                                '–'
                              ) : (
                                <Button size="sm" onClick={() => toggleConsortium(consortium)}>
                                  {t('statistics.fcs.btnToggleConsortium', {
                                    context: consortia.includes(consortium) ? 'remove' : 'add',
                                  })}
                                </Button>
                              )}
                            </td>
                          </tr>
                        )
                      }
                    )}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </>
        )}

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

            {renderInstitutionsTable()}
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
              <dt>{t('statistics.fcs.tdLabelResourceWithAvailabilityRestrictionCount')}</dt>
              <dd>
                {
                  Array.from(availabilityRestrictionsWithResources.entries())
                    .filter(([restriction]) => restriction !== 'NONE')
                    .map(([, resources]) => resources)
                    .flat().length
                }
              </dd>
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

        <Card className="my-2">
          <Card.Header>{t('statistics.fcs.cardHeaderSearchCapabilities')}</Card.Header>
          <Card.Body>
            <Table hover responsive className="mt-2">
              <thead>
                <tr>
                  <th scope="col">{t('statistics.fcs.thSearchCapability')}</th>
                  <th scope="col">{t('statistics.fcs.thCountResources')}</th>
                </tr>
              </thead>
              <tbody>
                {Array.from(searchCapabilitiesWithResources.entries()).map(
                  ([capability, resources]) => (
                    <tr key={capability}>
                      <td>{capability}</td>
                      <td>{resources.length}</td>
                    </tr>
                  )
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>

        {hasResourcesWithAvailabilityRestriction && (
          <Card className="my-2">
            <Card.Header>
              {t('statistics.fcs.cardHeaderResourcesWithAvailabilityRestrictions')}
            </Card.Header>
            <Card.Body>
              <Table hover responsive className="mt-2">
                <caption>{t('statistics.fcs.tblAvailabilityRestrictionCaption')}</caption>
                <thead>
                  <tr>
                    <th scope="col">{t('statistics.fcs.thAvailabilityRestriction')}</th>
                    <th scope="col">{t('statistics.fcs.thResourceTitle')}</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from(availabilityRestrictionsWithResources.entries())
                    .filter(([restriction]) => restriction !== 'NONE')
                    .map(([restriction, resources]) =>
                      resources.map((resource) => (
                        <tr key={resource.id}>
                          <td>{restriction}</td>
                          <td>
                            {getBestFromMultilingualValuesTryByLanguage(resource.title, userLocale)}{' '}
                            <Link
                              to={{
                                pathname: '/stats/resources',
                                search: getLinkSearch({ [REQ_PARAM_RESOURCE_ID]: resource.id }),
                              }}
                            >
                              <i
                                dangerouslySetInnerHTML={{ __html: eyeIcon }}
                                className="align-baseline ms-2"
                              />
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        )}
      </Card>

      {showLanguageSelectionModal && (
        <LanguageModal
          languages={languages}
          resources={resources}
          showResourceCounts={true}
          showLanguageFilterOptions={false}
          show={showLanguageSelectionModal}
          onModalClose={() => setShowLanguageSelectionModal(false)}
        />
      )}
    </Container>
  )
}

export default FCSStatistics
