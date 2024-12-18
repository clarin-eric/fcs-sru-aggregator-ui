import { useEffect, useState } from 'react'
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
import gearIcon from 'bootstrap-icons/icons/gear-fill.svg'
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
    const resources = new Resources(data.resources, updateResourcesFn)
    resources.prepare()
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

  // ------------------------------------------------------------------------
  // utilities

  // ------------------------------------------------------------------------
  // UI

  return (
    <Container>
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
            <InputGroup size="lg">
              <Form.Control
                placeholder="Elephant"
                aria-label="search query input"
                aria-describedby="fcs-search-input-button"
                className="text-center"
                disabled={isInputDisabled}
                aria-disabled={isInputDisabled}
              />
              <Button
                variant="outline-secondary"
                id="fcs-search-input-button"
                disabled={isInputDisabled}
                aria-disabled={isInputDisabled}
              >
                {/* TODO: visually-hidden span with description? */}
                Search
              </Button>
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
                  <img
                    src={gearIcon}
                    aria-hidden="true"
                    width={10}
                    className="align-top rounded-circle"
                  />
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {queryTypes.map((info) => (
                    <Dropdown.Item as="button" eventKey={info.id} key={info.id}>
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
                <img
                  src={gearIcon}
                  aria-hidden="true"
                  width={10}
                  className="align-top rounded-circle"
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
                <img
                  src={gearIcon}
                  aria-hidden="true"
                  width={10}
                  className="align-top rounded-circle"
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
                <img
                  src={gearIcon}
                  aria-hidden="true"
                  width={10}
                  className="align-top rounded-circle"
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
          </search>
        </Col>
      </Row>

      {/* TODO: temporary output */}
      <Row>
        <Col>
          {JSON.stringify(
            { searchLanguage, searchLanguageFilter, queryType, searchResourceIDs: searchResourceIDs.length, numberOfResults },
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
