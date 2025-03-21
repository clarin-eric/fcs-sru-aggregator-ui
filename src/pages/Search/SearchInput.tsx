import { type AxiosInstance } from 'axios'
import React, { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import Button from 'react-bootstrap/Button'
import Dropdown from 'react-bootstrap/Dropdown'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import ToggleButton from 'react-bootstrap/ToggleButton'
import { useSearchParams } from 'react-router'

import ContentEditable from '@/components/ContentEditable'
import LanguageModal, { type LanguageModelCloseActions } from '@/components/LanguageModal'
import QuerySuggestionsModal from '@/components/QuerySuggestionsModal'
import ResourceSelectionModal from '@/components/ResourceSelectionModal'
import useFlipOnceTrue from '@/hooks/useFlipOnceTrue'
import { type Resource } from '@/utils/api'
import {
  DEFAULT_QUERY_TYPE,
  NUMBER_OF_RESULTS,
  QUERY_TYPE_MAP,
  QUERY_TYPES,
  QUERY_TYPES_WITH_BUILDER_SUPPORT,
  type NumberOfResults,
  type QueryTypeID,
  type QueryTypeIDForQueryBuilder,
} from '@/utils/constants'
import { getAvailableResourceIDs, getInstitutions } from '@/utils/resources'
import {
  DEFAULT_RESOURCE_VIEW_GROUPING,
  DEFAULT_SEARCH_LANGUAGE_FILTER,
  languageCodeToName,
  MULTIPLE_LANGUAGE_CODE,
  type LanguageCode2NameMap,
  type LanguageFilterOptions,
  type ResourceSelectionModalViewOptionGrouping,
} from '@/utils/search'

// SVG, for inverted/specific colors: https://stackoverflow.com/a/52041765/9360161
import balloonIcon from 'bootstrap-icons/icons/balloon.svg?raw'
import gearIcon from 'bootstrap-icons/icons/gear-fill.svg?raw'
import highlightsIcon from 'bootstrap-icons/icons/highlights.svg?raw'
import magicIcon from 'bootstrap-icons/icons/magic.svg?raw'
import searchIcon from 'bootstrap-icons/icons/search.svg?raw'

import './styles.css'

// --------------------------------------------------------------------------
// lazy components

const QueryBuilderModal = /*#__PURE__*/ lazy(() => import('@/components/QueryBuilder'))

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
  numberOfResults: NumberOfResults
}

export interface queryError {
  msg: string
  details: unknown
}

// --------------------------------------------------------------------------

function getQueryFromSearchParams(params: URLSearchParams, fallback: string = '') {
  const newQuery = params.get('query')
  if (newQuery) {
    return newQuery
  }
  return fallback
}

function getQueryTypeFromSearchParams(params: URLSearchParams, fallback: QueryTypeID = 'cql') {
  const newQueryType = params.get('queryType')
  if (newQueryType) {
    if (QUERY_TYPES.find((qt) => qt.id === newQueryType) !== undefined) {
      return newQueryType as QueryTypeID
    }
    console.warn('Found unsupported queryType in search params', newQueryType)
  }
  return fallback
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
  const [searchParams, setSearchParams] = useSearchParams()

  // input modals (trigger)
  const [showResourceSelectionModal, setShowResourceSelectionModal] = useState(false)
  const [showResourceSelectionModalGrouping, setShowResourceSelectionModalGrouping] =
    useState<ResourceSelectionModalViewOptionGrouping>(DEFAULT_RESOURCE_VIEW_GROUPING)
  const [showLanguageSelectionModal, setShowLanguageSelectionModal] = useState(false)
  const [showQuerySuggestionsModal, setShowQuerySuggestionsModal] = useState(false)
  const [showQueryBuilderModal, setShowQueryBuilderModal] = useState(false)
  const [isLoadQueryBuilderModalTriggered, triggerLoadQueryBuilderModal] = useFlipOnceTrue()

  // user search input states
  const [language, setLanguage] = useState(MULTIPLE_LANGUAGE_CODE)
  const [languageFilter, setLanguageFilter] = useState<LanguageFilterOptions>(
    DEFAULT_SEARCH_LANGUAGE_FILTER
  )

  const [queryType, setQueryType] = useState<QueryTypeID>(
    getQueryTypeFromSearchParams(searchParams, DEFAULT_QUERY_TYPE)
  )

  // resource IDs the user can select (based on pre-filtering and search language selection)
  const [validResourceIDs, setValidResourceIDs] = useState<string[]>(availableResourcesProps ?? [])
  // selected resource IDs for search
  const [selectedResourceIDs, setSelectedResourceIDs] = useState<string[]>(
    selectedResourcesProps ?? []
  )

  const [numberOfResults, setNumberOfResults] = useState<NumberOfResults>(NUMBER_OF_RESULTS[0])

  const [query, setQuery] = useState(getQueryFromSearchParams(searchParams, ''))
  // query input validation
  const [queryError] = useState<queryError | null>(null)

  // query input syntax highlighting
  const [queryInputEnhanced, setQueryInputEnhanced] = useState(false)

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

  const doSearch = useCallback(() => {
    const searchParams = {
      language: language,
      languageFilter: languageFilter,
      queryType: queryType,
      query: query,
      resourceIDs: selectedResourceIDs ?? [],
      numberOfResults: numberOfResults,
    }
    console.debug('search for', searchParams)

    // validate and cancel if necessary
    if (searchParams.query === '') return
    if (searchParams.resourceIDs.length === 0) return

    // TODO: query validation
    // setQueryError({ msg: 'something went wrong (sad face emoji)', details: {} })

    onSearch(searchParams)
  }, [language, languageFilter, numberOfResults, onSearch, query, queryType, selectedResourceIDs])

  useEffect(() => {
    console.debug('searchParams', searchParams)

    if (searchParams) {
      setQuery((query) => getQueryFromSearchParams(searchParams, query))
      setQueryType((queryType) => getQueryTypeFromSearchParams(searchParams, queryType))

      const aggregationContext = searchParams.get('x-aggregation-context')
      if (!aggregationContext) {
        // wait until the aggregation context parameter has been evaluated (in another/parent component) (and then removed to trigger a reevaluation here)
        // and only then trigger possible automatic search if requested
        // this will (hopefully delay long enough to pre-select resources first before starting a search)
        const mode = searchParams.get('mode')
        if (mode) {
          if (mode === 'search') {
            console.log('Trigger search due to URL parameter!')
            doSearch()
          }
          setSearchParams((params) => (params.delete('mode'), params))
        }
      }
    }
  }, [searchParams, setSearchParams, doSearch])

  // update URL with query params
  useEffect(
    () => setSearchParams((params) => (params.set('query', query), params)),
    [query, setSearchParams]
  )
  useEffect(
    () => setSearchParams((params) => (params.set('queryType', queryType), params)),
    [queryType, setSearchParams]
  )

  // ------------------------------------------------------------------------

  const numberOfSelectedInstitutions = getInstitutions(resources, selectedResourceIDs ?? []).length

  const hasResourcesForQueryFCS =
    resources.find((resource) =>
      resource.searchCapabilitiesResolved.includes('ADVANCED_SEARCH')
    ) !== undefined
  const hasResourcesForQueryLex =
    resources.find((resource) => resource.searchCapabilitiesResolved.includes('LEX_SEARCH')) !==
    undefined

  const showQueryBuilderButton = QUERY_TYPES_WITH_BUILDER_SUPPORT.includes(queryType as QueryTypeIDForQueryBuilder)

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
    if (!(NUMBER_OF_RESULTS as unknown as number[]).includes(value)) {
      console.warn('Invalid number of results?!', { valid: NUMBER_OF_RESULTS, value })
    }
    setNumberOfResults(value as NumberOfResults)
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

  function handleChangeQuerySuggestion({
    query,
    queryType,
    action,
  }: {
    query?: string
    queryType?: QueryTypeID
    action: string
  }) {
    console.debug('onModalClose', { query, queryType, action })
    // first close the modal
    setShowQuerySuggestionsModal(false)
    // if 'abort' do nothing
    if (action === 'abort') return
    // if 'close' (ESC / x button) then also do nothing
    if (action === 'close') return
    // if query/queryType is empty, do nothing
    if (!query || !queryType) return
    // process user inputs
    setQueryType(queryType)
    setQuery(query)
  }

  function handleChangeQueryBuilderQuery({ query, action }: { query: string; action: string }) {
    console.debug('onModalClose', { query, action })
    // first close the modal
    setShowQueryBuilderModal(false)
    // if 'abort' do nothing
    if (action === 'abort') return
    // if 'close' (ESC / x button) then also do nothing
    if (action === 'close') return
    // explicitely wait for confirm
    // process user inputs
    setQuery(query)
  }

  function handleQueryChange(value: string) {
    // TODO: maybe input validation / syntax highlighting etc.
    setQuery(value)

    // TODO: demo
    // setQueryError(
    //   value.length % 2 === 1
    //     ? { msg: 'even number of characters', details: null }
    //     : null
    // )
  }

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    doSearch()
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
          <Button
            variant="outline-secondary"
            type="button"
            id="fcs-search-query-suggestions-button"
            aria-label="Open modal with suggestions for search queries"
            onClick={() => setShowQuerySuggestionsModal(true)}
          >
            <i dangerouslySetInnerHTML={{ __html: balloonIcon }} aria-hidden="true" />
          </Button>
          {/* @ts-expect-error: typing does not work for onChange handler, is correct so */}
          <Form.Control
            placeholder="Elephant"
            aria-label="search query input"
            aria-describedby="fcs-search-input-button"
            className="text-center search-query-input"
            disabled={disabled}
            aria-disabled={disabled}
            value={query}
            isInvalid={!!queryError} // TODO: add syntax validation for more complex queries
            {...(queryInputEnhanced
              ? {
                  as: ContentEditable,
                  queryType: queryType,
                  onChange: handleQueryChange,
                }
              : {
                  onChange: (event) => handleQueryChange(event.target.value),
                })}
          />
          {import.meta.env.FEATURE_QUERY_BUILDER && showQueryBuilderButton && (
            <Button
              id="fcs-search-input-query-builder-button"
              variant="outline-secondary"
              aria-label="Open modal to use the visual query builder to construct a search query"
              className="border-end-0 d-none d-md-block"
              onClick={() => {
                triggerLoadQueryBuilderModal()
                setShowQueryBuilderModal(true)
              }}
            >
              <i dangerouslySetInnerHTML={{ __html: magicIcon }} aria-hidden="true" />
            </Button>
          )}
          <ToggleButton
            id="fcs-search-input-enhanced-button"
            value="enhance-query" // just a dummy value
            type="checkbox"
            checked={queryInputEnhanced}
            onChange={() => setQueryInputEnhanced((isChecked) => !isChecked)}
            variant="outline-secondary"
            aria-label="Enable enhanced visual input support with syntax highlighting"
            className="d-flex align-items-center border-end-0"
          >
            <i dangerouslySetInnerHTML={{ __html: highlightsIcon }} aria-hidden="true" />
          </ToggleButton>
          <Button
            variant="outline-primary"
            type="submit"
            id="fcs-search-input-button"
            disabled={disabled || query.trim().length === 0}
            aria-disabled={disabled}
            aria-label="Start the search"
          >
            {/* TODO: visually-hidden span with description? */}
            <i
              dangerouslySetInnerHTML={{ __html: searchIcon }}
              aria-hidden="true"
              className="d-inline d-md-none"
            />
            <span className="d-none d-md-inline">Search</span>
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
              style={
                QUERY_TYPE_MAP[queryType]
                  ? {
                      '--color': QUERY_TYPE_MAP[queryType].color,
                    }
                  : {}
              }
            >
              {QUERY_TYPE_MAP[queryType]?.searchLabel || '???'}{' '}
              <i dangerouslySetInnerHTML={{ __html: gearIcon }} aria-hidden="true" />
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {QUERY_TYPES.filter(
                (info) =>
                  info.id === 'cql' ||
                  (info.id === 'fcs' && hasResourcesForQueryFCS) ||
                  (info.id === 'lex' && hasResourcesForQueryLex)
              ).map((info) => (
                <Dropdown.Item
                  as="button"
                  eventKey={info.id}
                  key={info.id}
                  onClick={(event) => event.preventDefault()}
                  style={{
                    '--color': info.color,
                    background: 'color-mix(in srgb, var(--color) 50%, transparent)',
                  }}
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
            {NUMBER_OF_RESULTS.map((value) => (
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
        resources={resources}
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
      {/* query suggestions modal */}
      <QuerySuggestionsModal
        queryTypes={[queryType]} // TODO: or show all always?
        show={showQuerySuggestionsModal}
        onModalClose={handleChangeQuerySuggestion}
      />
      {/* query builder modal */}
      {import.meta.env.FEATURE_QUERY_BUILDER &&
        QUERY_TYPES_WITH_BUILDER_SUPPORT.includes(queryType as QueryTypeIDForQueryBuilder) &&
        isLoadQueryBuilderModalTriggered && (
          // TODO: some fallback handling
          <Suspense fallback={<>Trying to load Query Builder extension ...</>}>
            <QueryBuilderModal
              query={query}
              queryType={queryType as QueryTypeIDForQueryBuilder}
              resources={resources}
              selectedResources={selectedResourceIDs}
              show={showQueryBuilderModal}
              onModalClose={handleChangeQueryBuilderQuery}
            />
          </Suspense>
        )}
    </search>
  )
}

export default SearchInput
