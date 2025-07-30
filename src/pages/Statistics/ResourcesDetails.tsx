import { Highlight } from '@nozbe/microfuzz/react'
import { useQuery } from '@tanstack/react-query'
import { Fragment, useEffect, useState } from 'react'
import Badge from 'react-bootstrap/Badge'
import Card from 'react-bootstrap/Card'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Dropdown from 'react-bootstrap/Dropdown'
import Form from 'react-bootstrap/Form'
import ListGroup from 'react-bootstrap/ListGroup'
import Row from 'react-bootstrap/Row'
import Table from 'react-bootstrap/Table'
import ToggleButton from 'react-bootstrap/ToggleButton'
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router'

import useFuzzySearchListWithHierarchy, {
  type FuzzyMatchesByField,
} from '@/hooks/useFuzzySearchListWithHierarchy'
import { useAxios } from '@/providers/AxiosContext'
import { useLocaleStore } from '@/stores/locale'
import {
  type ExtraScopingParams,
  getResources,
  REQ_PARAM_CONSORTIA,
  type Resource,
} from '@/utils/api'
import {
  findResourceByFilter,
  fromApi,
  getBestFromMultilingualValuesTryByLanguage,
  getBestLanguageFromMultilingualValuesTryByLanguage,
  getLanguagesFromResourceInfo,
  SORT_FNS,
} from '@/utils/resources'

import eyeIcon from 'bootstrap-icons/icons/eye-fill.svg?raw'
import houseDoorIcon from 'bootstrap-icons/icons/house-door.svg?raw'

import './styles.css'

// --------------------------------------------------------------------------

const REQ_PARAM_RESOURCE_ID = 'resource'

// --------------------------------------------------------------------------
// component

function ResourcesDetails({ validatorUrl }: { validatorUrl: string | null }) {
  const axios = useAxios()
  const { t } = useTranslation()

  const userLocale = useLocaleStore((state) => state.locale)
  const [locale, setLocale] = useState(userLocale)

  const langNames = new Intl.DisplayNames([userLocale, 'en'], { type: 'language' })

  const [urlSearchParams, setUrlSearchParams] = useSearchParams()

  const [resources, setResources] = useState<Resource[]>([])
  const [filter, setFilter] = useState('')
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(
    urlSearchParams.get(REQ_PARAM_RESOURCE_ID)
  )

  const selectedResource = selectedResourceId
    ? findResourceByFilter(resources, (resource: Resource) => resource.id === selectedResourceId)
    : undefined

  // ------------------------------------------------------------------------
  // initialization

  const extraParams = {
    consortia: urlSearchParams.get(REQ_PARAM_CONSORTIA),
  } satisfies ExtraScopingParams
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['resources'],
    queryFn: getResources.bind(null, axios, extraParams),
  })

  useEffect(() => {
    if (!data) return
    // do some initialization (based on `data`)
    const newResources = fromApi(data)
    // set state
    setResources(newResources)
  }, [data])

  useEffect(() => {
    const newResourceId = urlSearchParams.get(REQ_PARAM_RESOURCE_ID)
    if (!newResourceId) return
    if (newResourceId === selectedResourceId) return
    // TODO: check if resource id exists?
    console.debug('Set selected resource from URLSearchParams', newResourceId)
    setSelectedResourceId(newResourceId)
  }, [urlSearchParams, selectedResourceId])

  // languages for resource infos (title/description/institution)
  const resourceInfoLanguages = resources
    .map((resource) => getLanguagesFromResourceInfo(resource))
    .flat()
  const resourceInfoLanguagesGrouped = resourceInfoLanguages.reduce(
    (acc, cur) => acc.set(cur, (acc.get(cur) ?? 0) + 1),
    new Map()
  )

  // sort resources
  const sortedResources = resources.toSorted(SORT_FNS['title-up'])
  // filter resources (dropdown)
  const { resources: filteredResources, matches: filteredResourcesHighlights } =
    useFuzzySearchListWithHierarchy(filter, sortedResources, locale, ['title', 'institution'])

  // ------------------------------------------------------------------------
  // event handlers

  function handleChangeResource(eventKey: string | null) {
    if (!eventKey) return

    const newResourceId = eventKey
    // set selection
    setSelectedResourceId(newResourceId)
    // update url search parameter
    urlSearchParams.set(REQ_PARAM_RESOURCE_ID, newResourceId)
    setUrlSearchParams(urlSearchParams)
  }

  // ------------------------------------------------------------------------
  // rendering

  function renderResourceDropdownItem(
    resource: Resource,
    highlightings?: Map<string, FuzzyMatchesByField>,
    nestLevel: number = 0
  ): JSX.Element {
    const highlighting = highlightings?.get(resource.id) ?? new Map()

    const item = (
      <Dropdown.Item
        key={resource.id}
        eventKey={resource.id}
        style={{ paddingInlineStart: `${1 + nestLevel * 1}em` }}
        // as="button"
        // onClick={(event) => event.preventDefault()}
      >
        <Highlight
          text={getBestFromMultilingualValuesTryByLanguage(resource.title, locale) ?? ''}
          ranges={highlighting.get('title') ?? null}
        />
      </Dropdown.Item>
    )

    if (resource.subResources && resource.subResources.length > 0) {
      return (
        <Fragment key={resource.id}>
          {item}
          {resource.subResources.map((subResource) =>
            renderResourceDropdownItem(subResource, filteredResourcesHighlights, nestLevel + 1)
          )}
        </Fragment>
      )
    }

    return item
  }

  function renderResourceMetadataField(
    fieldType: string,
    fieldValues: string | { [language: string]: string } | null,
    fallbackEmptyValue: string = '–'
  ) {
    if (fieldValues === null) return null

    const selectedLanguage = getBestLanguageFromMultilingualValuesTryByLanguage(
      fieldValues,
      userLocale
    )

    return (
      <Card className="my-2">
        <Card.Header>
          {t(`statistics.resources.cardHeader${fieldType[0].toUpperCase()}${fieldType.slice(1)}`)}
        </Card.Header>
        {typeof fieldValues === 'string' ? (
          <Card.Body>{fieldValues || fallbackEmptyValue}</Card.Body>
        ) : (
          <ListGroup className="list-group-flush">
            {Object.entries(fieldValues).map(([language, value]) => (
              <ListGroup.Item key={language}>
                <Badge
                  bg={selectedLanguage === language ? 'primary' : 'secondary'}
                  className="me-2"
                >
                  {langNames.of(language)} <sup>{language}</sup>
                </Badge>{' '}
                {value || fallbackEmptyValue}
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Card>
    )
  }

  function renderResourceHierarchy(resource: Resource) {
    if (!resources) return null
    if (!resource) return null

    const rootResource =
      resource.rootResourceId === null
        ? resource
        : findResourceByFilter(resources, (r: Resource) => r.id === resource.rootResourceId)
    if (!rootResource) return null

    function renderRecursiveResourceHierarchy(resourceInHierarchy: Resource) {
      return (
        <li key={resourceInHierarchy.id}>
          {resourceInHierarchy.id === resource.id ? (
            <strong>{resourceInHierarchy.handle}</strong>
          ) : (
            <>
              {resourceInHierarchy.handle}
              <a
                href={`?${REQ_PARAM_RESOURCE_ID}=${encodeURIComponent(resourceInHierarchy.id)}`}
                onClick={(event) => {
                  event.preventDefault()
                  handleChangeResource(resourceInHierarchy.id)
                }}
              >
                <i
                  dangerouslySetInnerHTML={{ __html: eyeIcon }}
                  className="align-baseline ms-2 me-1"
                />
              </a>
            </>
          )}{' '}
          – {getBestFromMultilingualValuesTryByLanguage(resourceInHierarchy.title, userLocale)}
          {resourceInHierarchy.subResources.length > 0 && (
            <ul>
              {resourceInHierarchy.subResources.map((subResource) =>
                renderRecursiveResourceHierarchy(subResource)
              )}
            </ul>
          )}
        </li>
      )
    }

    return <ul>{renderRecursiveResourceHierarchy(rootResource)}</ul>
  }

  // ------------------------------------------------------------------------

  const showLexDVInfo =
    selectedResource &&
    (selectedResource.availableDataViews?.find(
      (dv) => dv.mimeType === 'application/x-clarin-fcs-lex+xml'
    ) ||
      (selectedResource.availableLexFields && selectedResource.availableLexFields.length > 0))

  const showAdvDVInfo =
    selectedResource &&
    (selectedResource.availableDataViews?.find(
      (dv) => dv.mimeType === 'application/x-clarin-fcs-adv+xml'
    ) ||
      (selectedResource.availableLayers && selectedResource.availableLayers.length > 0))

  return (
    <Container className="d-grid gap-2 mt-3">
      {(isPending || isError) && (
        <Row>
          <Col>
            {isPending ? t('statistics.loading') : null}
            <br />
            {isError ? error.message : null}
          </Col>
        </Row>
      )}

      <Form onSubmit={(event) => event.preventDefault()}>
        <Dropdown onSelect={handleChangeResource}>
          <Dropdown.Toggle variant="outline-dark">
            {t('statistics.resources.dropdownLabel', { count: resources.length })}{' '}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.ItemText>
              <Form.Control value={filter} onChange={(event) => setFilter(event.target.value)} />

              {resourceInfoLanguagesGrouped.size > 1 && (
                <Form.Group as={Row} controlId="resource-info-language" className="mt-2">
                  <Form.Label column sm="auto" style={{ fontSize: '0.875rem' }}>
                    {t('search.resourcesModal.labelChangeResourceInfoLanguage')}
                  </Form.Label>
                  <Col sm="auto">
                    <ToggleButtonGroup
                      type="radio"
                      name="resource-info-languages"
                      defaultValue={locale}
                      onChange={(language) => setLocale(language)}
                    >
                      {Array.from(resourceInfoLanguagesGrouped.entries())
                        .toSorted()
                        .map(([language, amount]) => (
                          <ToggleButton
                            size="sm"
                            key={language}
                            id={`resource-info-languages-${language}`}
                            value={language}
                            variant="secondary"
                            title={t(
                              'search.resourcesModal.buttonChangeResourceInfoLanguageTitle',
                              {
                                count: amount,
                                language,
                                languageName: langNames.of(language),
                              }
                            )}
                          >
                            {langNames.of(language)} <sup>{language}</sup>
                          </ToggleButton>
                        ))}
                    </ToggleButtonGroup>
                  </Col>
                </Form.Group>
              )}
            </Dropdown.ItemText>

            <Dropdown.Divider />
            {filteredResources.map((resource) =>
              renderResourceDropdownItem(resource, filteredResourcesHighlights)
            )}
          </Dropdown.Menu>
        </Dropdown>
      </Form>

      {selectedResource && (
        <Card className="p-3 mt-3">
          <h3 className="h4 pb-1 mb-3 border-bottom">
            {getBestFromMultilingualValuesTryByLanguage(selectedResource.title, userLocale)}
          </h3>

          <h4 className="h5 pb-1 mb-3 border-bottom">
            {t('statistics.resources.titleBasicMetadata')}
          </h4>

          {renderResourceMetadataField('title', selectedResource.title)}
          {renderResourceMetadataField('description', selectedResource.description)}
          {renderResourceMetadataField('institution', selectedResource.institution)}
          {selectedResource.landingPage && (
            <Card className="my-2">
              <Card.Header>{t('statistics.resources.cardHeaderLandingPage')}</Card.Header>
              <Card.Body>
                <a href={selectedResource.landingPage} className="matomo_link" target="_blank">
                  {selectedResource.landingPage}
                </a>
              </Card.Body>
            </Card>
          )}

          <h4 className="h5 pb-1 mt-4 mb-3 border-bottom">
            {t('statistics.resources.titleTechnicalMetadata')}
          </h4>

          <Card className="my-2">
            <Card.Header>{t('statistics.resources.cardHeaderResource')}</Card.Header>
            <Card.Body>
              <dl className="mb-0">
                <dt>{t('statistics.labels.resourcePid')}</dt>
                <dd>{selectedResource.handle}</dd>
                <dt>{t('statistics.labels.resourceHierarchy')}</dt>
                <dd>{renderResourceHierarchy(selectedResource)}</dd>
              </dl>
            </Card.Body>
          </Card>

          <Card className="my-2">
            <Card.Header>{t('statistics.resources.cardHeaderEndpoint')}</Card.Header>
            <Card.Body>
              <dl className="mb-0">
                <dt>{t('statistics.labels.endpointUrl')}</dt>
                <dd>
                  {selectedResource.endpoint.url}{' '}
                  {validatorUrl && (
                    <>
                      {' '}
                      <a
                        href={`${validatorUrl}?url=${encodeURIComponent(
                          selectedResource.endpoint.url
                        )}`}
                        className="matomo_link"
                        target="_blank"
                      >
                        <i
                          dangerouslySetInnerHTML={{ __html: eyeIcon }}
                          className="align-baseline ms-2"
                        />
                      </a>
                    </>
                  )}
                </dd>
                <dt>{t('statistics.labels.fcsVersion')}</dt>
                <dd>{selectedResource.endpoint.protocol}</dd>
                <dt>{t('statistics.labels.searchCapabilities')}</dt>
                <dd>{selectedResource.endpoint.searchCapabilities.join(', ')}</dd>
                <dt>{t('statistics.labels.endpointInstitution')}</dt>
                <dd>
                  {selectedResource.endpointInstitution.name}
                  {selectedResource.endpointInstitution.link && (
                    <>
                      {' – '}
                      <a
                        href={selectedResource.endpointInstitution.link}
                        className="matomo_link"
                        target="_blank"
                      >
                        {t('statistics.labels.moreInformation')}{' '}
                        <i dangerouslySetInnerHTML={{ __html: houseDoorIcon }} />
                      </a>
                    </>
                  )}
                </dd>
              </dl>
            </Card.Body>
          </Card>

          <h4 className="h5 pb-1 mt-4 mb-3 border-bottom">
            {t('statistics.resources.titleSeachInformation')}
          </h4>

          <Card className="my-2">
            <Card.Header>{t('statistics.resources.cardHeaderDataViews')}</Card.Header>
            <Card.Body>
              {selectedResource.availableDataViews && (
                <Table hover responsive>
                  <thead>
                    <tr>
                      <th scope="col">{t('statistics.resources.thDataViewIdentifier')}</th>
                      <th scope="col">{t('statistics.resources.thDataViewMimeType')}</th>
                      <th scope="col">{t('statistics.resources.thDataViewDeliveryPolicy')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedResource.availableDataViews.map((dv) => (
                      <tr key={dv.identifier}>
                        <td>{dv.identifier}</td>
                        <td>{dv.mimeType}</td>
                        <td>{dv.deliveryPolicy}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>

          {showAdvDVInfo && (
            <Card className="my-2">
              <Card.Header>{t('statistics.resources.cardHeaderAdvancedDataView')}</Card.Header>
              <Card.Body>
                {selectedResource.availableLayers && (
                  <Table hover responsive>
                    <thead>
                      <tr>
                        <th scope="col">{t('statistics.resources.thLayerType')}</th>
                        <th scope="col">{t('statistics.resources.thQualifier')}</th>
                        <th scope="col">{t('statistics.resources.thResultId')}</th>
                        <th scope="col">{t('statistics.resources.thIdentifier')}</th>
                        <th scope="col">{t('statistics.resources.thEncoding')}</th>
                        <th scope="col">{t('statistics.resources.thAltValueInfo')}</th>
                        <th scope="col">{t('statistics.resources.thAltValueInfoURI')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedResource.availableLayers.map((layer) => (
                        <tr key={layer.identifier}>
                          <td>{layer.layerType}</td>
                          <td>{layer.qualifier}</td>
                          <td>{layer.resultId}</td>
                          <td>{layer.identifier}</td>
                          <td>{layer.encoding}</td>
                          <td>{layer.altValueInfo}</td>
                          <td>{layer.altValueInfoURI}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Card.Body>
            </Card>
          )}

          {showLexDVInfo && (
            <Card className="my-2">
              <Card.Header>{t('statistics.resources.cardHeaderLexDataView')}</Card.Header>
              <Card.Body>
                {selectedResource.availableLexFields && (
                  <Table hover responsive>
                    <thead>
                      <tr>
                        <th scope="col">{t('statistics.resources.thLexFieldType')}</th>
                        <th scope="col">{t('statistics.resources.thLexIdentifier')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedResource.availableLexFields.map((field) => (
                        <tr key={field.id}>
                          <td>{field.type}</td>
                          <td>{field.id}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Card.Body>
            </Card>
          )}
        </Card>
      )}
    </Container>
  )
}

export default ResourcesDetails
