import { Fragment, useEffect, useState } from 'react'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Form from 'react-bootstrap/Form'
import Modal from 'react-bootstrap/Modal'
import Row from 'react-bootstrap/Row'
import ToggleButton from 'react-bootstrap/ToggleButton'
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup'
import { useTranslation } from 'react-i18next'

import { useLocaleStore } from '@/stores/locale'
import type { MultilingualStrings, Resource } from '@/utils/api'
import type { QueryTypeID } from '@/utils/constants'
import { QUERY_TYPE_MAP } from '@/utils/constants'
import { highlightSyntax } from '@/utils/prism'
import {
  getBestFromMultilingualValuesTryByLanguage,
  isResourceAvailableForAnyOfQueryTypes,
} from '@/utils/resources'

import exampleQueries from './examples'

import './styles.css'

// --------------------------------------------------------------------------
// types

interface QuerySuggestionsModal {
  show: boolean
  queryTypes?: QueryTypeID[]
  resources?: Resource[]
  onModalClose: (result: {
    query?: string
    queryType?: QueryTypeID
    resourceIDs?: string[]
    action: string
  }) => void
}

interface _ExampleQueryFromResourceStep1 {
  id: string
  queryType: QueryTypeID
  query: string
  description: MultilingualStrings
  resourceID: string
}

interface ExampleQueryFromResource {
  queryType: QueryTypeID
  query: string
  description: MultilingualStrings
  resourceIDs: string[]
}

// --------------------------------------------------------------------------

function mapExamplesQueryFromResourcesToQueryType(
  resources: Resource[],
  queryTypes?: readonly QueryTypeID[]
) {
  const examples = resources
    .map((resource) => {
      if (!resource.exampleQueries) return []
      return resource.exampleQueries.map((exampleQuery) => {
        const exampleDescriptionString = Object.entries(exampleQuery.description)
          .toSorted()
          .map(([lang, text]) => `${lang}:${text}`)
          .join('|')
        const exampleId = `${exampleQuery.queryType}|${exampleQuery.query}|${exampleDescriptionString}`

        return {
          id: exampleId,
          queryType: exampleQuery.queryType,
          query: exampleQuery.query,
          description: exampleQuery.description,
          resourceID: resource.id,
        } as _ExampleQueryFromResourceStep1
      })
    })
    .flat()

  const examplesFilteredByQueryType = queryTypes
    ? examples.filter((example) => queryTypes.includes(example.queryType))
    : examples

  const groupedExamples = examplesFilteredByQueryType.reduce((map, example) => {
    if (!map.has(example.id)) {
      map.set(example.id, [])
    }
    map.get(example.id)!.push(example)
    return map
  }, new Map<string, _ExampleQueryFromResourceStep1[]>())

  const examplesGroupedList = Array.from(groupedExamples.values()).map(
    (examples) =>
      ({
        queryType: examples[0].queryType,
        query: examples[0].query,
        description: examples[0].description,
        resourceIDs: examples.map((example) => example.resourceID).toSorted(),
      }) as ExampleQueryFromResource
  )

  const examplesByQuerytype = examplesGroupedList.reduce((map, example) => {
    if (!map.has(example.queryType)) {
      map.set(example.queryType, [])
    }
    map.get(example.queryType)!.push(example)
    return map
  }, new Map<QueryTypeID, ExampleQueryFromResource[]>())

  return examplesByQuerytype
}

// --------------------------------------------------------------------------
// component

function QuerySuggestionsModal({
  show,
  queryTypes: queryTypesProp,
  resources: resourcesProp,
  onModalClose,
}: QuerySuggestionsModal) {
  const { t } = useTranslation()

  // locale/language information
  const userLocale = useLocaleStore((state) => state.locale)
  const [locale, setLocale] = useState(userLocale)
  useEffect(() => {
    if (userLocale) setLocale(userLocale)
  }, [userLocale])

  const langNames = new Intl.DisplayNames([userLocale, 'en'], { type: 'language' })

  const queryTypes: readonly QueryTypeID[] =
    queryTypesProp && queryTypesProp.length > 0 ? queryTypesProp : ['cql', 'fcs', 'lex']
  const requestedExamples = exampleQueries.filter((example) =>
    queryTypes.includes(example.queryType)
  )

  const resources = resourcesProp
    ? resourcesProp
        .filter((resource) => resource.exampleQueries)
        .filter((resource) => isResourceAvailableForAnyOfQueryTypes(resource, queryTypes))
    : []
  const resourceExamples = mapExamplesQueryFromResourcesToQueryType(resources, queryTypes)

  const exampleDescriptionLanguages = Array.from(resourceExamples.values())
    .flat()
    .map((example) => Object.keys(example.description))
    .flat()
    .reduce((set, lang) => set.set(lang, 1 + (set.get(lang) ?? 0)), new Map<string, number>())

  // if there are no examples queries for this set of queryTypes, then do not show anything
  if (requestedExamples.length === 0 && resourceExamples.size === 0) {
    handleClose('abort')
    return null
  }

  // --------------------------------------------------------------
  // event handlers

  function handleClose(action: string) {
    onModalClose({ query: undefined, queryType: undefined, resourceIDs: undefined, action: action })
  }

  function handleUseQueryClose(
    query: string,
    queryType: QueryTypeID,
    resourceIDs: string[] | undefined = undefined
  ) {
    // TODO: better action name? "use"
    onModalClose({
      query: query,
      queryType: queryType,
      resourceIDs: resourceIDs,
      action: 'confirm',
    })
  }

  // --------------------------------------------------------------
  // rendering

  function renderExample(
    query: string,
    queryType: QueryTypeID,
    description: MultilingualStrings,
    resourceIDs?: string[] | undefined,
    nr?: number
  ) {
    return (
      <Row key={query} className="mb-2">
        <Col md={'auto'} className="d-none d-md-block">
          {nr && `${nr}.`}
        </Col>
        <Col className="d-flex flex-column">
          <div>{getBestFromMultilingualValuesTryByLanguage(description, locale) ?? ''}</div>
          <div
            className="query"
            dangerouslySetInnerHTML={{ __html: highlightSyntax(query, queryType) }}
          />
          {resourceIDs && (
            <div>
              <em>
                {t('search.suggestionsModal.msgApplicableResources', { count: resourceIDs.length })}
              </em>
            </div>
          )}
        </Col>
        <Col md={'auto'} className="d-flex justify-content-end align-items-baseline">
          <Button size="sm" onClick={() => handleUseQueryClose(query, queryType, resourceIDs)}>
            {t('search.suggestionsModal.buttonUseQuery')}
          </Button>
        </Col>
      </Row>
    )
  }

  return (
    <Modal
      id="search-query-suggestions-modal"
      show={show}
      onHide={() => handleClose('close')}
      size="xl"
      fullscreen="xl-down"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>{t('search.suggestionsModal.title')}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="px-0">
        {/* grouped by querytype or other category; each item with label/description, query, button to use */}
        {/* TODO: should use table instead? */}
        <Container fluid>
          <Form className="px-3 pb-3" onSubmit={(event) => event.preventDefault()}>
            {exampleDescriptionLanguages.size > 1 && (
              <Form.Group as={Row} controlId="resource-info-language" className="mt-2">
                <Form.Label column sm="auto" style={{ fontSize: '0.875rem' }}>
                  {t('search.suggestionsModal.labelChangeExampleDescriptionLanguage')}
                </Form.Label>
                <Col sm="auto">
                  <ToggleButtonGroup
                    type="radio"
                    name="resource-info-languages"
                    defaultValue={locale}
                    onChange={(language) => setLocale(language)}
                  >
                    {Array.from(exampleDescriptionLanguages.entries())
                      .toSorted()
                      .map(([language, amount]) => (
                        <ToggleButton
                          size="sm"
                          key={language}
                          id={`example-description-languages-${language}`}
                          value={language}
                          variant="secondary"
                          title={t(
                            'search.suggestionsModal.buttonChangeExampleDescriptionLanguageTitle',
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
          </Form>

          {queryTypes.map((queryType) => {
            const resourceExamplesForQueryType = resourceExamples.get(queryType) ?? []
            const examples = requestedExamples.filter((example) => example.queryType === queryType)

            // skip if no examples for this queryType
            if (examples.length === 0 && resourceExamplesForQueryType.length === 0) return null

            return (
              <Fragment key={queryType}>
                <Row>
                  <Col>
                    <h4 className="border-bottom pb-2">
                      {t(`queryTypes.${queryType}.nameLong`, {
                        ns: 'common',
                        defaultValue: QUERY_TYPE_MAP[queryType]?.name ?? queryType.toUpperCase(),
                      })}
                    </h4>
                  </Col>
                </Row>
                {resourceExamplesForQueryType.map((example, index) =>
                  renderExample(
                    example.query,
                    example.queryType,
                    example.description,
                    example.resourceIDs,
                    index + 1
                  )
                )}
                {resourceExamplesForQueryType.length > 0 && examples.length > 0 && <hr />}
                {examples.map((example, index) =>
                  renderExample(
                    example.query,
                    example.queryType,
                    example.description ?? {},
                    example.resourceIDs,
                    index + 1 + resourceExamplesForQueryType.length
                  )
                )}
              </Fragment>
            )
          })}
        </Container>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={() => handleClose('close')}>
          {t('search.suggestionsModal.buttonClose')}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default QuerySuggestionsModal
