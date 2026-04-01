import type { AxiosInstance } from 'axios'
import React, { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import Button from 'react-bootstrap/Button'
import Dropdown from 'react-bootstrap/Dropdown'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import ToggleButton from 'react-bootstrap/ToggleButton'
import { Trans, useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router'

import ContentEditable from '@/components/ContentEditable'
import type { LanguageModelCloseActions } from '@/components/LanguageModal'
import LanguageModal from '@/components/LanguageModal'
import QuerySuggestionsModal from '@/components/QuerySuggestionsModal'
import ResourceSelectionModal from '@/components/ResourceSelectionModal'
import { useModalsStore } from '@/stores/modals'
import type { SearchData } from '@/stores/searchinput'
import { useSearchInputStore } from '@/stores/searchinput'
import type { Resource } from '@/utils/api'
import type { NumberOfResults, QueryTypeID, QueryTypeIDForQueryBuilder } from '@/utils/constants'
import {
  NUMBER_OF_RESULTS,
  QUERY_TYPE_MAP,
  QUERY_TYPES,
  QUERY_TYPES_WITH_BUILDER_SUPPORT,
} from '@/utils/constants'
import { getAvailableResourceIDs, getInstitutions } from '@/utils/resources'
import type { LanguageCode2NameMap, LanguageFilterOptions } from '@/utils/search'
import { languageCodeToName, MULTIPLE_LANGUAGE_CODE } from '@/utils/search'
import type { ToastMessage } from './utils'

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
  languages?: LanguageCode2NameMap
  onSearch: (searchData: SearchData) => void
  onShowToast?: (toast: ToastMessage) => void
  hasSearch: boolean
  disabled?: boolean
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
  onShowToast,
  availableResources: availableResourcesProps = null,
  hasSearch = false,
  disabled = false,
}: SearchInputProps) {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()

  // input modals (trigger)
  const showResourceSelectionModal = useModalsStore((state) => state.showResourceSelection)
  const setShowResourceSelectionModal = useModalsStore((state) => state.setShowResourceSelection)
  const showLanguageSelectionModal = useModalsStore((state) => state.showLanguageSelection)
  const setShowLanguageSelectionModal = useModalsStore((state) => state.setShowLanguageSelection)
  const showQuerySuggestionsModal = useModalsStore((state) => state.showQuerySuggestions)
  const setShowQuerySuggestionsModal = useModalsStore((state) => state.setShowQuerySuggestions)
  const showQueryBuilderModal = useModalsStore((state) => state.showQueryBuilder)
  const setShowQueryBuilderModal = useModalsStore((state) => state.setShowQueryBuilder)

  const showResourceSelectionModalGrouping = useModalsStore(
    (state) => state.resourceSelectionGrouping
  )
  const setShowResourceSelectionModalGrouping = useModalsStore(
    (state) => state.setResourceSelectionGrouping
  )

  // user search input states
  const query = useSearchInputStore((state) => state.query)
  const setQuery = useSearchInputStore((state) => state.setQuery)
  const queryType = useSearchInputStore((state) => state.queryType)
  const setQueryType = useSearchInputStore((state) => state.setQueryType)

  // selected resource IDs for search
  const selectedResourceIDs = useSearchInputStore((state) => state.resourceIDs)
  const setSelectedResourceIDs = useSearchInputStore((state) => state.setResourceIDs)

  const language = useSearchInputStore((state) => state.language)
  const setLanguage = useSearchInputStore((state) => state.setLanguage)
  const languageFilter = useSearchInputStore((state) => state.languageFilter)
  const setLanguageFilter = useSearchInputStore((state) => state.setLanguageFilter)

  const numberOfResults = useSearchInputStore((state) => state.numberOfResults)
  const setNumberOfResults = useSearchInputStore((state) => state.setNumberOfResults)

  const makeSearchRequestParams = useSearchInputStore((state) => state.makeSearchRequestParams)

  const initialEndpointsResources = useSearchInputStore((state) => state.initialEndpointsResources)
  const initialMode = useSearchInputStore((state) => state.initialMode)

  // resource IDs the user can select (based on pre-filtering and search language selection)
  const [validResourceIDs, setValidResourceIDs] = useState<string[]>(availableResourcesProps ?? [])

  // query input validation
  const [queryError] = useState<queryError | null>(null)

  // query input syntax highlighting
  const [queryInputEnhanced, setQueryInputEnhanced] = useState(false)

  // ------------------------------------------------------------------------
  // data updates/computation

  const resetResourceSelection = useCallback(
    () => setSelectedResourceIDs(getAvailableResourceIDs(resources, 'cql', MULTIPLE_LANGUAGE_CODE)),
    [resources, setSelectedResourceIDs]
  )

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
  }, [resources, getAvailableResourceIDsCallback, setSelectedResourceIDs])

  // ------------------------------------------------------------------------

  // update URL with query params
  useEffect(() => {
    if (searchParams.get('query') === query) return
    // setSearchParams((params) => (params.set('query', query), params))
    searchParams.set('query', query)
    setSearchParams(searchParams)
  }, [query, searchParams, setSearchParams])
  useEffect(() => {
    if (searchParams.get('queryType') === queryType) return
    // setSearchParams((params) => (params.set('queryType', queryType), params))
    searchParams.set('queryType', queryType)
    setSearchParams(searchParams)
  }, [queryType, searchParams, setSearchParams])

  // ------------------------------------------------------------------------

  const doSearch = useCallback(() => {
    const searchParams = makeSearchRequestParams()
    console.debug('search for', searchParams)

    // validate and cancel if necessary
    if (searchParams.query === '') return
    if (searchParams.resourceIDs.length === 0) return

    // TODO: query validation
    // setQueryError({ msg: 'something went wrong (sad face emoji)', details: {} })

    onSearch(searchParams)
  }, [makeSearchRequestParams, onSearch])

  useEffect(() => {
    if (!initialEndpointsResources) {
      // wait until the aggregation context parameter has been evaluated (in another/parent component) (and then removed to trigger a reevaluation here)
      // and only then trigger possible automatic search if requested
      // this will (hopefully delay long enough to pre-select resources first before starting a search)
      if (initialMode === 'search') {
        console.log('Trigger search due to URL parameter!')
        doSearch()
      }
    }
  }, [doSearch, initialMode, initialEndpointsResources])

  // ------------------------------------------------------------------------

  const numberOfSelectedInstitutions = getInstitutions(resources, selectedResourceIDs ?? []).length

  const hasResourcesForQueryFCS =
    resources.find((resource) =>
      resource.searchCapabilitiesResolved.includes('ADVANCED_SEARCH')
    ) !== undefined
  const hasResourcesForQueryLex =
    resources.find((resource) => resource.searchCapabilitiesResolved.includes('LEX_SEARCH')) !==
    undefined

  const showQueryBuilderButton = QUERY_TYPES_WITH_BUILDER_SUPPORT.includes(
    queryType as QueryTypeIDForQueryBuilder
  )

  // ------------------------------------------------------------------------
  // event handlers

  function handleChangeQueryType(eventKey: string | null) {
    if (!eventKey) return

    const newQueryType = eventKey as QueryTypeID

    // process user inputs
    const hasQueryTypeChanged = newQueryType !== queryType
    if (hasQueryTypeChanged) {
      // reset resource selection as it automatically changes due to options
      console.debug('handleChangeQueryType', 'reset resource selection')
      resetResourceSelection()
    }
    setQueryType(newQueryType)
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
    language: newLanguage,
    filter: newLanguageFilter,
    action,
  }: {
    language: string
    filter: LanguageFilterOptions
    action: LanguageModelCloseActions
  }) {
    console.debug('handleChangeLanguageSelection', {
      language: newLanguage,
      filter: newLanguageFilter,
      action,
    })
    // first close the modal
    setShowLanguageSelectionModal(false)
    // if 'abort' do nothing
    if (action === 'abort') return

    // process user inputs
    const hasLanguageChanged = newLanguage !== language || newLanguageFilter !== languageFilter
    if (hasLanguageChanged) {
      // reset resource selection as it automatically changes due to options
      console.debug('handleChangeLanguageSelection', 'reset resource selection')
      resetResourceSelection()
    }
    setLanguage(newLanguage)
    setLanguageFilter(newLanguageFilter)
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

    const hasSelectionChanged = resourceIDs.length !== selectedResourceIDs.length
    console.debug('handleChangeResourceSelection', { hasSelectionChanged })

    setSelectedResourceIDs(resourceIDs)
  }

  function handleChangeQuerySuggestion({
    query: newQuery,
    queryType: newQueryType,
    resourceIDs: newResourceIDs,
    action,
  }: {
    query?: string
    queryType?: QueryTypeID
    resourceIDs?: string[] | undefined
    action: string
  }) {
    console.debug('handleChangeQuerySuggestion', {
      query: newQuery,
      queryType: newQueryType,
      resourceIDs: newResourceIDs,
      action,
    })
    // first close the modal
    setShowQuerySuggestionsModal(false)
    // if 'abort' do nothing
    if (action === 'abort') return
    // if 'close' (ESC / x button) then also do nothing
    if (action === 'close') return
    // if query/queryType is empty, do nothing
    if (!newQuery || !newQueryType) return

    // process user inputs
    // check if suggested query has resource selection to use (and check if valid for query type/language selection)
    const hasNewResourceSelection = newResourceIDs !== undefined && newResourceIDs.length > 0
    let hasValidNewResourceSelection = hasNewResourceSelection
    let newSelectedResourceIDs = newResourceIDs ?? []
    if (hasNewResourceSelection) {
      // check that the resources are valid
      // TODO: do we need to reset the language? (in case the suggested resources are not available there?)
      const availableResourceIDs = getAvailableResourceIDs(
        resources,
        newQueryType,
        languageFilter === 'byGuess' ? MULTIPLE_LANGUAGE_CODE : language
      )
      newSelectedResourceIDs = newSelectedResourceIDs.filter((resourceID) =>
        availableResourceIDs.includes(resourceID)
      )
      hasValidNewResourceSelection = newSelectedResourceIDs.length > 0
    }
    // update resource selection if required
    const hasQueryTypeChanged = newQueryType !== queryType
    if (hasQueryTypeChanged && !hasValidNewResourceSelection) {
      // reset resource selection as it automatically changes due to options
      console.debug('handleChangeQuerySuggestion', 'reset resource selection')
      resetResourceSelection()
    }
    if (hasValidNewResourceSelection) {
      // TODO: do we want to forcefully set the resource selection?
      setSelectedResourceIDs(newSelectedResourceIDs)
    } else if (hasNewResourceSelection) {
      console.warn(
        'Suggested query also had suggested resources but they do not fit the available resources (probably due to language filter)!',
        { language, queryType: newQueryType, resourceIDs: newResourceIDs }
      )
    }
    setQueryType(newQueryType)
    setQuery(newQuery)
  }

  function handleChangeQueryBuilderQuery({
    query,
    validResources,
    action,
  }: {
    query: string
    validResources: string[]
    action: string
  }) {
    console.debug('onModalClose', { query, validResources, action })
    // first close the modal
    setShowQueryBuilderModal(false)
    // if 'abort' do nothing
    if (action === 'abort') return
    // if 'close' (ESC / x button) then also do nothing
    if (action === 'close') return

    // explicitely wait for confirm
    // process user inputs
    setQuery(query)

    // show info to users
    // TODO: make diff of selected queries?
    // a bit basic but should be ok, resource selection is unlikely to increase
    if (selectedResourceIDs.length !== validResources.length) {
      onShowToast?.({
        title: t('search.toasts.searchInput.title'),
        body: (
          <>
            <p>{t('search.toasts.searchInput.msgResourcesChangedDueToQuery')}</p>
            <p>
              {t('search.toasts.searchInput.msgResourcesAmountChanged', {
                before: selectedResourceIDs.length,
                after: validResources.length,
              })}
            </p>
            <hr />
            <Button onClick={() => setSelectedResourceIDs(selectedResourceIDs)}>
              {t('search.toasts.searchInput.buttonRevertSelection')}
            </Button>
          </>
        ),
        variant: 'info',
        delay: 7_000,
      })
    }
    // update selected queries
    setSelectedResourceIDs(validResources)
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
    const context =
      resources.length === selected || validResourceIDs.length === selected ? 'all' : null
    return t('search.searchInput.buttonSelectedResources', { count: selected, context })
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
            aria-label={t('search.searchInput.buttonOpenQuerySuggestionsAriaLabel')}
            onClick={() => setShowQuerySuggestionsModal(true)}
          >
            <i dangerouslySetInnerHTML={{ __html: balloonIcon }} aria-hidden="true" />{' '}
            {t('search.searchInput.buttonOpenQuerySuggestions')}
          </Button>
          {/* @ts-expect-error: typing does not work for onChange handler, is correct so */}
          <Form.Control
            placeholder="Elephant"
            aria-label={t('search.searchInput.inputQueryAriaLabel')}
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
              aria-label={t('search.searchInput.buttonOpenQueryBuilderAriaLabel')}
              className="border-end-0 d-none d-md-block"
              onClick={() => {
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
            aria-label={t('search.searchInput.buttonEnhanceQueryAriaLabel', {
              context: queryInputEnhanced ? 'enabled' : 'disabled',
            })}
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
            aria-label={t('search.searchInput.buttonSearchAriaLabel')}
          >
            {/* TODO: visually-hidden span with description? */}
            <i
              dangerouslySetInnerHTML={{ __html: searchIcon }}
              aria-hidden="true"
              className="d-inline d-md-none"
            />
            <span className="d-none d-md-inline">{t('search.searchInput.buttonSearch')}</span>
          </Button>
          <Form.Control.Feedback type="invalid">{queryError?.msg}</Form.Control.Feedback>
        </InputGroup>
        <div id="fcs-query-filters" className="mt-2 mb-3 lh-lg text-center">
          <Trans
            i18nKey="search.searchInput.filtersSummary"
            components={[
              <Dropdown
                className="d-inline-block"
                onSelect={handleChangeQueryType}
                aria-disabled={disabled}
                aria-label={t('search.searchInput.dropdownQueryTypeAriaLabel')}
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
                  {t(`queryTypes.${queryType}.nameShort`, {
                    ns: 'common',
                    defaultValue: QUERY_TYPE_MAP[queryType]?.searchLabel ?? queryType.toUpperCase(),
                  })}{' '}
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
                      {t(`queryTypes.${info.id}.nameLong`, {
                        ns: 'common',
                        defaultValue: info.name,
                      })}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>,
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
              </Button>,
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
                {t('search.searchInput.buttonSelectedInstitutions', {
                  count: numberOfSelectedInstitutions,
                })}{' '}
                <i dangerouslySetInnerHTML={{ __html: gearIcon }} aria-hidden="true" />
              </Button>,
              <Button
                size="sm"
                variant="outline-dark"
                className="mx-1 pe-2"
                onClick={() => setShowLanguageSelectionModal(true)}
                disabled={disabled}
                aria-disabled={disabled}
              >
                {languageCodeToName(language, languages ?? {}, {
                  defaultAnyLanguage: t('languageCodeToName.any2', { ns: 'common' }),
                  defaultUnknownLanguage: t('languageCodeToName.unknown2', { ns: 'common' }),
                })}{' '}
                <i dangerouslySetInnerHTML={{ __html: gearIcon }} aria-hidden="true" />
              </Button>,
              <Form.Select
                size="sm"
                className="d-inline-block w-auto mx-1"
                onChange={handleChangeNumberOfResults}
                value={numberOfResults}
                aria-label={t('search.searchInput.selectNumberOfSearchResultsAriaLabel')}
                disabled={disabled}
                aria-disabled={disabled}
              >
                {NUMBER_OF_RESULTS.map((value) => (
                  <option value={value} key={value}>
                    {value}
                  </option>
                ))}
              </Form.Select>,
            ]}
          />
        </div>
      </Form>

      {/* search input modals */}
      {showLanguageSelectionModal && (
        <LanguageModal
          languages={languages}
          resources={resources}
          searchLanguage={language}
          show={showLanguageSelectionModal}
          onModalClose={handleChangeLanguageSelection}
        />
      )}
      {showResourceSelectionModal && (
        <ResourceSelectionModal
          resources={resources}
          languages={languages}
          availableResources={validResourceIDs}
          selectedResources={selectedResourceIDs ?? []}
          show={showResourceSelectionModal}
          showGrouping={showResourceSelectionModalGrouping}
          onModalClose={handleChangeResourceSelection}
        />
      )}
      {/* query suggestions modal */}
      {showQuerySuggestionsModal && (
        <QuerySuggestionsModal
          resources={resources}
          queryTypes={[queryType]} // TODO: or show all always?
          show={showQuerySuggestionsModal}
          onModalClose={handleChangeQuerySuggestion}
        />
      )}
      {/* query builder modal */}
      {import.meta.env.FEATURE_QUERY_BUILDER &&
        QUERY_TYPES_WITH_BUILDER_SUPPORT.includes(queryType as QueryTypeIDForQueryBuilder) &&
        showQueryBuilderModal && (
          // TODO: some fallback handling
          // NOTE: that translation resources might also be loading ...
          <Suspense
            fallback={
              <>
                {t('loading', {
                  ns: 'querybuilder',
                  defaultValue: t('generic.loadingComponent', { ns: 'common' }),
                })}
              </>
            }
          >
            {showQueryBuilderModal && (
              <QueryBuilderModal
                query={query}
                queryType={queryType as QueryTypeIDForQueryBuilder}
                resources={resources}
                selectedResources={selectedResourceIDs}
                show={showQueryBuilderModal}
                onModalClose={handleChangeQueryBuilderQuery}
              />
            )}
          </Suspense>
        )}
    </search>
  )
}

export default SearchInput
