import React, { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Dropdown from 'react-bootstrap/Dropdown'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import Row from 'react-bootstrap/Row'
import { type AxiosInstance } from 'axios'

import LanguageModal, { type LanguageModelCloseActions } from '@/components/LanguageModal'
import ResourceSelectionModal from '@/components/ResourceSelectionModal'
import { getInitData } from '@/utils/api'
import Resources, { type Resource } from '@/utils/resources'
import { numberOfResultsOptions, queryTypeMap, queryTypes } from '@/utils/constants'
import {
  DEFAULT_SEARCH_LANGUAGE_FILTER,
  DEFAULT_RESOURCE_VIEW_GROUPING,
  MULTIPLE_LANGUAGE_CODE,
  languageCodeToName,
  type LanguageCode2NameMap,
  type LanguageFilterOptions,
  type ResourceSelectionModalViewOptionGrouping,
} from '@/utils/search'

// TODO: SVG, for inverted/specific colors: https://stackoverflow.com/a/52041765/9360161
import gearIcon from 'bootstrap-icons/icons/gear-fill.svg?raw'
import fcsLogoUrl from '@images/logo-fcs.png'
import fcsLogoDarkModeUrl from '@images/logo-fcs-dark.png'

import './Search.css'

// --------------------------------------------------------------------------
// types

export interface SearchProps {
  axios: AxiosInstance
}

// --------------------------------------------------------------------------
// component

function Search({ axios }: SearchProps) {
  const [showResourceSelectionModal, setShowResourceSelectionModal] = useState(false)
  const [showResourceSelectionModalGrouping, setShowResourceSelectionModalGrouping] =
    useState<ResourceSelectionModalViewOptionGrouping>(DEFAULT_RESOURCE_VIEW_GROUPING)
  const [showLanguageSelectionModal, setShowLanguageSelectionModal] = useState(false)

  // user input search state
  const [searchLanguage, setSearchLanguage] = useState(MULTIPLE_LANGUAGE_CODE)
  const [searchLanguageFilter, setSearchLanguageFilter] = useState<LanguageFilterOptions>(
    DEFAULT_SEARCH_LANGUAGE_FILTER
  )
  const [queryType, setQueryType] = useState('cql')
  const [searchResourceIDs, setSearchResourceIDs] = useState<string[]>([])
  const [numberOfResults, setNumberOfResults] = useState(numberOfResultsOptions[0])

  const [searchQuery, setSearchQuery] = useState('')
  const [searchQueryError, setSearchQueryError] = useState<{
    msg: string
    details: unknown
  } | null>(null)

  // REST API state
  const [resources, setResources] = useState<Resources>(new Resources([], () => {}))
  const [languages, setLanguages] = useState<LanguageCode2NameMap>()
  const [weblichtLanguages, setWeblichtLanguages] = useState<string[]>()

  // ------------------------------------------------------------------------
  // initialization

  const { data, isLoading, isError } = useQuery({
    queryKey: ['init'],
    queryFn: getInitData.bind(null, axios),
  })

  useEffect(() => {
    if (!data) return

    // do some initialization (based on `data`)
    const updateResourcesFn = (resources: Resources) => {
      // NOTE: trigger for updating resources on nested change
      // identity ob resources needs to change! --> clone object
      setResources(new Resources(resources.resources, updateResourcesFn))
    }
    const resources = Resources.fromApi(data.resources, updateResourcesFn)
    resources.recurse((resource: Resource) => {
      if (resource.visible) resource.selected = true
      // resource.selected |= resource.visible
    })

    // TODO: evaluate xAggregationContext

    // set state
    setLanguages(data.languages)
    setWeblichtLanguages(data.weblichtLanguages)
    setResources(resources)
    setSearchResourceIDs(resources.getSelectedIds())
  }, [data])

  // ------------------------------------------------------------------------
  // data updates/computation

  useEffect(() => {
    console.debug(
      'Update resource visibility',
      { queryType, searchLanguage, searchLanguageFilter },
      resources
    )
    resources.setVisibility(
      queryType,
      searchLanguageFilter === 'byGuess' ? MULTIPLE_LANGUAGE_CODE : searchLanguage
    )
    // resources.update() // TODO: will cause infinite callbacks
    setSearchResourceIDs(resources.getSelectedIds())
  }, [resources, queryType, searchLanguage, searchLanguageFilter])

  // TODO: debugging only until we find a use
  useEffect(() => {
    console.log('weblichtLanguages', weblichtLanguages)
  }, [weblichtLanguages])

  // ------------------------------------------------------------------------

  // on state update, this component is re-evaluated which re-evaluates the expressions below, too
  const isInputDisabled = isLoading || isError
  // console.debug('isInputDisabled', isInputDisabled, 'isLoading', isLoading, 'isError', isError)

  const numberOfSelectedInstitutions = resources.getSelectedInstitutions().length

  // ------------------------------------------------------------------------
  // event handlers

  function handleChangeQueryType(eventKey: string | null) {
    if (!eventKey) return
    setQueryType(eventKey)
  }

  function handleChangeNumberOfResults(event: React.ChangeEvent<HTMLSelectElement>) {
    let value = Number.parseInt(event.target.value)
    // input validation
    if (value < 10) value = 10
    if (value > 250) value = 250
    setNumberOfResults(value)
  }

  function handleChangeLanguageSelection({
    language,
    filter,
    action,
  }: {
    language: string
    filter: LanguageFilterOptions
    action: LanguageModelCloseActions
  }) {
    console.log('onModalClose', { language, filter, action })
    // first close the modal
    setShowLanguageSelectionModal(false)
    // if 'abort' do nothing
    if (action === 'abort') return
    // process user inputs
    setSearchLanguage(language)
    setSearchLanguageFilter(filter)
  }

  function handleChangeResourceSelection({
    resourceIDs,
    action,
  }: {
    resourceIDs: string[]
    action: string
  }) {
    // first close the modal
    setShowResourceSelectionModal(false)
    // if 'abort' do nothing
    if (action === 'abort') return
    // process user inputs
    // TODO:
    console.log('resourceIDs', resourceIDs)
  }

  function handleSearchQueryChange(event: React.ChangeEvent<HTMLInputElement>) {
    // TODO: maybe input validation / syntax highlighting etc.
    setSearchQuery(event.target.value)

    setSearchQueryError(
      event.target.value.length % 2 === 1
        ? { msg: 'even number of characters', details: null }
        : null
    )
  }

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    console.debug('search for', {
      searchLanguage,
      searchLanguageFilter,
      queryType,
      searchResourceIDs: searchResourceIDs,
      numberOfResults,
    })

    setSearchQueryError({ msg: 'something went wrong (sad face emoji)', details: {} })
  }

  // ------------------------------------------------------------------------
  // utilities

  // ------------------------------------------------------------------------
  // UI

  return (
    <Container id="search">
      {/* logo image */}
      <Row>
        <Col className="text-center">
          <picture>
            <source srcSet={fcsLogoUrl} media="(prefers-color-scheme: light)" />
            <source srcSet={fcsLogoDarkModeUrl} media="(prefers-color-scheme: dark)" />
            <img src={fcsLogoUrl} className="logo" alt="FCS logo" />
          </picture>
        </Col>
      </Row>

      {/* search input */}
      <Row>
        <Col>
          <search id="fcs-query">
            <Form noValidate onSubmit={handleSearchSubmit}>
              <InputGroup size="lg" hasValidation>
                <Form.Control
                  placeholder="Elephant"
                  aria-label="search query input"
                  aria-describedby="fcs-search-input-button"
                  className="text-center"
                  disabled={isInputDisabled}
                  aria-disabled={isInputDisabled}
                  value={searchQuery}
                  onChange={handleSearchQueryChange} // TODO: onInput? (before)
                  isInvalid={!!searchQueryError} // TODO: add syntax validation for more complex queries
                />
                <Button
                  variant="outline-primary"
                  type="submit"
                  id="fcs-search-input-button"
                  disabled={isInputDisabled || searchQuery.trim().length === 0}
                  aria-disabled={isInputDisabled}
                >
                  {/* TODO: visually-hidden span with description? */}
                  Search
                </Button>
                <Form.Control.Feedback type="invalid">
                  {searchQueryError?.msg}
                </Form.Control.Feedback>
              </InputGroup>
              <div id="fcs-query-filters" className="mt-2 mb-3 lh-lg text-center">
                Perform a{' '}
                <Dropdown
                  className="d-inline-block"
                  onSelect={handleChangeQueryType}
                  aria-disabled={isInputDisabled}
                  aria-label="Search query type"
                >
                  <Dropdown.Toggle
                    size="sm"
                    variant="outline-dark"
                    className="mx-1 pe-2 no-arrow"
                    disabled={isInputDisabled}
                    aria-disabled={isInputDisabled}
                  >
                    {queryTypeMap[queryType]?.searchLabel}{' '}
                    <i
                      dangerouslySetInnerHTML={{__html: gearIcon}}
                      aria-hidden="true"
                    />
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    {queryTypes.map((info) => (
                      <Dropdown.Item
                        as="button"
                        eventKey={info.id}
                        key={info.id}
                        onClick={(event) => event.preventDefault()}
                      >
                        {info.name}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>{' '}
                in{' '}
                <Button
                  size="sm"
                  variant="outline-dark"
                  className="mx-1 pe-2"
                  disabled={isInputDisabled}
                  aria-disabled={isInputDisabled}
                  onClick={() => {
                    setShowResourceSelectionModalGrouping('resource')
                    setShowResourceSelectionModal(true)
                  }}
                >
                  {resources.getSelectedMessage()}{' '}
                  <i
                    dangerouslySetInnerHTML={{__html: gearIcon}}
                    aria-hidden="true"
                  />
                </Button>{' '}
                from{' '}
                <Button
                  size="sm"
                  variant="outline-dark"
                  className="mx-1 pe-2"
                  disabled={isInputDisabled}
                  aria-disabled={isInputDisabled}
                  onClick={() => {
                    setShowResourceSelectionModalGrouping('institution')
                    setShowResourceSelectionModal(true)
                  }}
                >
                  {numberOfSelectedInstitutions} Institution
                  {numberOfSelectedInstitutions !== 1 ? 's' : ''}{' '}
                  <i
                    dangerouslySetInnerHTML={{__html: gearIcon}}
                    aria-hidden="true"
                  />
                </Button>{' '}
                in{' '}
                <Button
                  size="sm"
                  variant="outline-dark"
                  className="mx-1 pe-2"
                  onClick={() => setShowLanguageSelectionModal(true)}
                  disabled={isInputDisabled}
                  aria-disabled={isInputDisabled}
                >
                  {languageCodeToName(searchLanguage, data?.languages ?? {})}{' '}
                  <i
                    dangerouslySetInnerHTML={{__html: gearIcon}}
                    aria-hidden="true"
                  />
                </Button>{' '}
                with up to{' '}
                <Form.Select
                  size="sm"
                  className="d-inline-block w-auto mx-1"
                  onChange={handleChangeNumberOfResults}
                  value={numberOfResults}
                  aria-label="Number of search results per endpoint"
                  disabled={isInputDisabled}
                  aria-disabled={isInputDisabled}
                >
                  {numberOfResultsOptions.map((value) => (
                    <option value={value} key={value}>
                      {value}
                    </option>
                  ))}
                </Form.Select>{' '}
                results per endpoint.
              </div>
            </Form>
          </search>
        </Col>
      </Row>

      {/* TODO: temporary output */}
      <Row>
        <Col>
          {JSON.stringify(
            {
              searchLanguage,
              searchLanguageFilter,
              queryType,
              searchResourceIDs: searchResourceIDs.length,
              numberOfResults,
            },
            undefined,
            2
          )}
        </Col>
      </Row>

      {/* input modals */}
      <LanguageModal
        languages={languages}
        searchLanguage={searchLanguage}
        show={showLanguageSelectionModal}
        onModalClose={handleChangeLanguageSelection}
      />
      <ResourceSelectionModal
        resources={resources}
        languages={languages}
        show={showResourceSelectionModal}
        showGrouping={showResourceSelectionModalGrouping}
        onModalClose={handleChangeResourceSelection}
      />
    </Container>
  )
}

export default Search
