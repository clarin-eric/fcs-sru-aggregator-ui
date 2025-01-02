import React, { useCallback, useEffect, useState } from 'react'
import Button from 'react-bootstrap/Button'
import Dropdown from 'react-bootstrap/Dropdown'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import { type AxiosInstance } from 'axios'

import LanguageModal, { type LanguageModelCloseActions } from '@/components/LanguageModal'
import ResourceSelectionModal from '@/components/ResourceSelectionModal'
import { type Resource } from '@/utils/api'
import { getAvailableResourceIDs, getInstitutions } from '@/utils/resources'
import {
  numberOfResultsOptions,
  queryTypeMap,
  queryTypes,
  type QueryTypeID,
} from '@/utils/constants'
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

import './styles.css'

// --------------------------------------------------------------------------
// types

export interface SearchProps {
  axios: AxiosInstance
}

export interface SearchInputProps {
  resources: Resource[]
  availableResources: string[] | null
  selectedResources: string[] | null
  languages?: LanguageCode2NameMap
  onSearch: (searchData: SearchData) => void
  hasSearch: boolean
  disabled?: boolean
}

export interface SearchData {
  language: string
  languageFilter: LanguageFilterOptions
  queryType: QueryTypeID
  query: string
  resourceIDs: string[]
  numberOfResults: number
}

export interface queryError {
  msg: string
  details: unknown
}

// --------------------------------------------------------------------------
// component

function SearchInput({
  resources,
  languages,
  onSearch,
  availableResources: availableResourcesProps = null,
  selectedResources: selectedResourcesProps = null,
  hasSearch = false,
  disabled = false,
}: SearchInputProps) {
  // input modals (trigger)
  const [showResourceSelectionModal, setShowResourceSelectionModal] = useState(false)
  const [showResourceSelectionModalGrouping, setShowResourceSelectionModalGrouping] =
    useState<ResourceSelectionModalViewOptionGrouping>(DEFAULT_RESOURCE_VIEW_GROUPING)
  const [showLanguageSelectionModal, setShowLanguageSelectionModal] = useState(false)

  // user search input states
  const [language, setLanguage] = useState(MULTIPLE_LANGUAGE_CODE)
  const [languageFilter, setLanguageFilter] = useState<LanguageFilterOptions>(
    DEFAULT_SEARCH_LANGUAGE_FILTER
  )

  const [queryType, setQueryType] = useState<QueryTypeID>('cql')

  // resource IDs the user can select (based on pre-filtering and search language selection)
  const [validResourceIDs, setValidResourceIDs] = useState<string[]>(availableResourcesProps ?? [])
  // selected resource IDs for search
  const [selectedResourceIDs, setSelectedResourceIDs] = useState<string[]>(
    selectedResourcesProps ?? []
  )

  const [numberOfResults, setNumberOfResults] = useState(numberOfResultsOptions[0])

  const [query, setQuery] = useState('')
  // query input validation
  const [queryError, setQueryError] = useState<queryError | null>(null)

  // ------------------------------------------------------------------------
  // data updates/computation

  // to update modal on open
  useEffect(() => {
    setSelectedResourceIDs(selectedResourcesProps ?? [])
  }, [selectedResourcesProps])

  const getAvailableResourceIDsCallback = useCallback(
    (resources: Resource[]) => {
      const availableResourceIDs = getAvailableResourceIDs(
        resources,
        queryType,
        languageFilter === 'byGuess' ? MULTIPLE_LANGUAGE_CODE : language
      )
      if (availableResourcesProps && availableResourcesProps.length > 0) {
        // if updated from outside via props (e.g. restriction)
        // TODO: needs testing
        return availableResourceIDs.filter((rid) => availableResourcesProps.includes(rid))
      }
      return availableResourceIDs
    },
    [queryType, language, languageFilter, availableResourcesProps]
  )

  useEffect(() => {
    const availableResourceIDs = getAvailableResourceIDsCallback(resources)
    console.debug(
      'Update resource availability',
      // { queryType, language, languageFilter },
      availableResourceIDs
    )
    // TODO: evaluate xAggregationContext
    setValidResourceIDs(availableResourceIDs)

    // TODO: handle case where availableResourceIDs is empty on init? (maybe due to props usage)
    // setSelectedResourceIDs((resourceIDs) =>
    //   resourceIDs === null
    //     ? // initialization, if `null` then check available resources
    //       availableResourceIDs.length > 0
    //       ? // only update when we have available resources
    //         availableResourceIDs
    //       : // otherwise keep `null` to "delay" init for full default selection
    //         null
    //     : // incremental update
    //       resourceIDs.filter((id) => availableResourceIDs.includes(id))
    // )
    // we update from outside (Search.tsx#useEffect#data)
    setSelectedResourceIDs((resourceIDs) =>
      resourceIDs.filter((id) => availableResourceIDs.includes(id))
    )
  }, [resources, getAvailableResourceIDsCallback])

  // ------------------------------------------------------------------------

  const numberOfSelectedInstitutions = getInstitutions(resources, selectedResourceIDs ?? []).length

  // ------------------------------------------------------------------------
  // event handlers

  function handleChangeQueryType(eventKey: string | null) {
    if (!eventKey) return
    setQueryType(eventKey as QueryTypeID)
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
    console.debug('onModalClose', { language, filter, action })
    // first close the modal
    setShowLanguageSelectionModal(false)
    // if 'abort' do nothing
    if (action === 'abort') return
    // process user inputs
    setLanguage(language)
    setLanguageFilter(filter)
  }

  function handleChangeResourceSelection({
    resourceIDs,
    action,
  }: {
    resourceIDs: string[]
    action: string
  }) {
    console.debug('onModalClose', { resourceIDs, action })
    // first close the modal
    setShowResourceSelectionModal(false)
    // if 'abort' do nothing
    if (action === 'abort') return
    // process user inputs
    setSelectedResourceIDs(resourceIDs)
  }

  function handlequeryChange(event: React.ChangeEvent<HTMLInputElement>) {
    // TODO: maybe input validation / syntax highlighting etc.
    setQuery(event.target.value)

    // TODO: demo
    setQueryError(
      event.target.value.length % 2 === 1
        ? { msg: 'even number of characters', details: null }
        : null
    )
  }

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    console.debug('search for', {
      language,
      languageFilter,
      queryType,
      query,
      selectedResourceIDs: selectedResourceIDs,
      numberOfResults,
    })

    // query validation
    setQueryError({ msg: 'something went wrong (sad face emoji)', details: {} })

    onSearch({
      language: language,
      languageFilter: languageFilter,
      queryType: queryType,
      query: query,
      resourceIDs: selectedResourceIDs ?? [],
      numberOfResults: numberOfResults,
    })
  }

  // ------------------------------------------------------------------------
  // UI

  function renderSelectedResourcesMsg() {
    const selected = (selectedResourceIDs ?? []).length
    if (selected === 1) {
      return '1 selected resource'
    }
    if (resources.length === selected || validResourceIDs.length === selected) {
      return `All available resources (${selected})`
    }
    return `${selected} selected resources`
  }

  return (
    <search id="fcs-query">
      {/* search input form */}
      <Form noValidate onSubmit={handleSearchSubmit}>
        <InputGroup size={!hasSearch ? 'lg' : undefined} hasValidation>
          <Form.Control
            placeholder="Elephant"
            aria-label="search query input"
            aria-describedby="fcs-search-input-button"
            className="text-center"
            disabled={disabled}
            aria-disabled={disabled}
            value={query}
            onChange={handlequeryChange} // TODO: onInput? (before)
            isInvalid={!!queryError} // TODO: add syntax validation for more complex queries
          />
          <Button
            variant="outline-primary"
            type="submit"
            id="fcs-search-input-button"
            disabled={disabled || query.trim().length === 0}
            aria-disabled={disabled}
          >
            {/* TODO: visually-hidden span with description? */}
            Search
          </Button>
          <Form.Control.Feedback type="invalid">{queryError?.msg}</Form.Control.Feedback>
        </InputGroup>
        <div id="fcs-query-filters" className="mt-2 mb-3 lh-lg text-center">
          Perform a{' '}
          <Dropdown
            className="d-inline-block"
            onSelect={handleChangeQueryType}
            aria-disabled={disabled}
            aria-label="Search query type"
          >
            <Dropdown.Toggle
              size="sm"
              variant="outline-dark"
              className="mx-1 pe-2 no-arrow"
              disabled={disabled}
              aria-disabled={disabled}
            >
              {queryTypeMap[queryType]?.searchLabel}{' '}
              <i dangerouslySetInnerHTML={{ __html: gearIcon }} aria-hidden="true" />
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
            disabled={disabled}
            aria-disabled={disabled}
            onClick={() => {
              setShowResourceSelectionModalGrouping('resource')
              setShowResourceSelectionModal(true)
            }}
          >
            {renderSelectedResourcesMsg()}{' '}
            <i dangerouslySetInnerHTML={{ __html: gearIcon }} aria-hidden="true" />
          </Button>{' '}
          from{' '}
          <Button
            size="sm"
            variant="outline-dark"
            className="mx-1 pe-2"
            disabled={disabled}
            aria-disabled={disabled}
            onClick={() => {
              setShowResourceSelectionModalGrouping('institution')
              setShowResourceSelectionModal(true)
            }}
          >
            {numberOfSelectedInstitutions} Institution
            {numberOfSelectedInstitutions !== 1 ? 's' : ''}{' '}
            <i dangerouslySetInnerHTML={{ __html: gearIcon }} aria-hidden="true" />
          </Button>{' '}
          in{' '}
          <Button
            size="sm"
            variant="outline-dark"
            className="mx-1 pe-2"
            onClick={() => setShowLanguageSelectionModal(true)}
            disabled={disabled}
            aria-disabled={disabled}
          >
            {languageCodeToName(language, languages ?? {})}{' '}
            <i dangerouslySetInnerHTML={{ __html: gearIcon }} aria-hidden="true" />
          </Button>{' '}
          with up to{' '}
          <Form.Select
            size="sm"
            className="d-inline-block w-auto mx-1"
            onChange={handleChangeNumberOfResults}
            value={numberOfResults}
            aria-label="Number of search results per endpoint"
            disabled={disabled}
            aria-disabled={disabled}
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

      {/* search input modals */}
      <LanguageModal
        languages={languages}
        searchLanguage={language}
        show={showLanguageSelectionModal}
        onModalClose={handleChangeLanguageSelection}
      />
      <ResourceSelectionModal
        resources={resources}
        languages={languages}
        availableResources={validResourceIDs}
        selectedResources={selectedResourceIDs ?? []}
        show={showResourceSelectionModal}
        showGrouping={showResourceSelectionModalGrouping}
        onModalClose={handleChangeResourceSelection}
      />
    </search>
  )
}

export default SearchInput
