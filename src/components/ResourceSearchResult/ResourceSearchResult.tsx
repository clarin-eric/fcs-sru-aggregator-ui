import { useQuery } from '@tanstack/react-query'
import { useEffect, useId, useState } from 'react'
import Alert from 'react-bootstrap/Alert'
import Badge from 'react-bootstrap/Badge'
import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card'
import Collapse from 'react-bootstrap/Collapse'
import ToggleButton from 'react-bootstrap/ToggleButton'
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup'
import { Trans, useTranslation } from 'react-i18next'

import type {
  Resource,
  ResourceSearchResult,
  ResourceSearchResultMetaOnly,
} from 'fcs-sru-aggregator-api-adapter-typescript'
import { getSearchResultDetails } from 'fcs-sru-aggregator-api-adapter-typescript'

import { useAggregatorData } from '@/providers/AggregatorDataContext'
import { useAxios } from '@/providers/AxiosContext'
import { useSearchParams } from '@/providers/SearchParamsContext'
import { useLocaleStore } from '@/stores/locale'
import { NO_MORE_RECORDS_DIAGNOSTIC_URI } from '@/utils/constants'
import {
  findResourceByFilter,
  getBestFromMultilingualValuesTryByLanguage,
  getLanguagesFromResourceInfo,
} from '@/utils/resources'
import type { ResultsViewMode } from '@/utils/results'
import { languageCodeToName } from '@/utils/search'
import ResourceResultsModal from './ResourceResultsModal'
import ViewAdvancedTabular from './ViewAdvancedTabular'
import ViewKwic from './ViewKwic'
import ViewLex from './ViewLex'
import ViewLexPlain from './ViewLexPlain'
import ViewPlain from './ViewPlain'

import bankIcon from 'bootstrap-icons/icons/bank.svg?raw'
import eyeIcon from 'bootstrap-icons/icons/eye.svg?raw'
import infoCircleIcon from 'bootstrap-icons/icons/info-circle.svg?raw'
import translateIcon from 'bootstrap-icons/icons/translate.svg?raw'

import './styles.css'

// --------------------------------------------------------------------------
// types

export interface ResourceSearchResultProps {
  searchId: string
  resourceId: string
  resultInfo: ResourceSearchResultMetaOnly
  viewMode: ResultsViewMode
  showResourceDetails: boolean
  showDiagnostics: boolean
}

// --------------------------------------------------------------------------
// component

function ResourceSearchResult({
  searchId,
  resourceId,
  resultInfo,
  viewMode,
  showResourceDetails,
  showDiagnostics,
}: ResourceSearchResultProps) {
  const axios = useAxios()
  const { t } = useTranslation()
  const userLocale = useLocaleStore((state) => state.locale)
  const { languages, resources } = useAggregatorData()
  const { queryType } = useSearchParams()

  const [locale, setLocale] = useState(userLocale)
  useEffect(() => {
    if (userLocale) setLocale(userLocale)
  }, [userLocale])

  const langNames = new Intl.DisplayNames([userLocale, 'en'], { type: 'language' })

  const htmlId = useId()
  const [expanded, setExpanded] = useState(true)
  const [showModal, setShowModal] = useState(false)

  const inProgress = resultInfo.inProgress
  const hasResults = resultInfo.numberOfRecordsLoaded > 0 // number of required default KWIC rows loaded
  const hasDiagnostics =
    resultInfo.exception ||
    resultInfo.diagnostics?.filter(
      (diagnostic) => diagnostic.uri !== NO_MORE_RECORDS_DIAGNOSTIC_URI
    ).length > 0

  const { data, isLoading, isError } = useQuery({
    queryKey: ['search-result-details', searchId, resourceId],
    queryFn: getSearchResultDetails.bind(null, axios, searchId, resourceId),
    enabled: !inProgress, // && hasResults,
  })
  console.debug(
    'resource results',
    { searchId, resourceId, inProgress, hasResults, hasDiagnostics },
    { data, isLoading, isError }
  )

  const languageForResource = data ? getLanguagesFromResourceInfo(data.resource) : []

  // TODO: filter for language "byGuess" mode

  // do not show when
  // (a) still in progress
  if (inProgress) return null
  // (b) if no results, check if diags and diags should be shown
  if (!hasResults) {
    // if show diags but do not have diags => hide
    if (showDiagnostics && !hasDiagnostics) return null
    // if no results && do not want to show diags => hide
    if (!showDiagnostics) return null
  }
  // (c) does not yet have data
  if (!data) return null

  // --------------------------------------------------------------
  // event handlers

  function handleViewClick() {
    setShowModal(true)
  }

  function handleModalClose() {
    setShowModal(false)
  }

  // ------------------------------------------------------------------------
  // UI

  function renderResultsCounter() {
    if (!data) return null // TODO

    if (data.numberOfRecords === -1) {
      // probably at end, since endpoints respond with -1 when trying to request more than available
      return data.records.length
    } else if (data.numberOfRecords === data.records.length && data.nextRecordPosition === -1) {
      // either everything or possibly more
      return `${data.records.length} / ${data.numberOfRecords}?`
    } else {
      return `${data.records.length} / ${data.numberOfRecords}`
    }
  }

  function renderResults() {
    if (!data) return null // TODO: loading spinner? but should not reach here

    if (viewMode === 'annotation-layers' && data.hasAdvResults) {
      const resource = findResourceByFilter(
        resources,
        (resource: Resource) => resource.id === data.id
      )
      return <ViewAdvancedTabular data={data} resource={resource} />
    }
    if (viewMode === 'kwic' && (queryType !== 'lex' || !data.isLexHits)) {
      return <ViewKwic data={data} />
    }
    if (viewMode === 'lexical-entry' && data.hasLexResults) {
      return <ViewLex data={data} />
    }
    if (queryType === 'lex' && data.isLexHits) {
      return <ViewLexPlain data={data} />
    }
    // 'plain' (fallback)
    return <ViewPlain data={data} />
  }

  return (
    <>
      <Card
        className="my-1 resource-search-result"
        role="group"
        aria-label={t('search.results.resultResourceAriaLabel', { title: data.resource.title })}
      >
        <Card.Header className="d-flex accordion">
          <button
            type="button"
            onClick={() => setExpanded((expanded) => !expanded)}
            aria-controls={htmlId}
            aria-expanded={expanded}
            className={`me-3 w-auto flex-grow-1 d-block text-start collapse-toggle-btn ${
              expanded ? '' : 'collapsed'
            }`}
          >
            <Badge
              bg=""
              className="text-bg-light border me-2 user-select-text"
              aria-label={t('search.results.resultCountAriaLabel')}
            >
              {renderResultsCounter()}
            </Badge>
            <span
              aria-label={t('search.results.resultResourceTitleAriaLabel')}
              className="user-select-text"
            >
              {getBestFromMultilingualValuesTryByLanguage(data.resource.title, locale)}
            </span>
            <small
              className="text-muted user-select-text"
              aria-label={t('search.results.resultResourceInstitutionAriaLabel')}
            >
              {getBestFromMultilingualValuesTryByLanguage(data.resource.institution, locale)}
            </small>
          </button>
          <div className="d-inline-block ms-auto">
            <Button size="sm" onClick={handleViewClick}>
              <i dangerouslySetInnerHTML={{ __html: eyeIcon }} /> View
            </Button>
          </div>
        </Card.Header>
        {/* data-bs-toggle="collapse" data-bs-target="#collapseExample" aria-expanded="false" aria-controls="collapseExample" */}
        <Collapse in={expanded}>
          <div id={htmlId}>
            {/* result details */}
            {showResourceDetails && (
              <Card.Body className="border-bottom resource-info">
                <dl
                  className="mb-0"
                  aria-label={t('search.results.resourceInfo.infoTableAriaLabel')}
                >
                  <dt>
                    <i dangerouslySetInnerHTML={{ __html: bankIcon }} />{' '}
                    {t('search.results.resourceInfo.labelInstitution')}
                  </dt>
                  <dd className="mb-0">
                    {getBestFromMultilingualValuesTryByLanguage(data.resource.institution, locale)}
                  </dd>
                  <dt>
                    <i dangerouslySetInnerHTML={{ __html: infoCircleIcon }} />{' '}
                    {t('search.results.resourceInfo.labelDescription')}
                  </dt>
                  {getBestFromMultilingualValuesTryByLanguage(
                    data.resource.description,
                    locale
                  ) && (
                    <>
                      <dd className="mb-0">
                        {getBestFromMultilingualValuesTryByLanguage(
                          data.resource.description,
                          locale
                        )}
                      </dd>
                      <dt>
                        <i dangerouslySetInnerHTML={{ __html: translateIcon }} />{' '}
                        {t('search.results.resourceInfo.labelLanguages')}
                      </dt>
                    </>
                  )}
                  <dd className="mb-0">
                    {data.resource.languages
                      .map(
                        languages
                          ? (code) =>
                              languageCodeToName(code, languages, {
                                defaultAnyLanguage: t('languageCodeToName.any', { ns: 'common' }),
                                defaultUnknownLanguage: t('languageCodeToName.unknown', {
                                  ns: 'common',
                                }),
                              })
                          : (x) => x
                      )
                      .toSorted()
                      .join(', ')}
                  </dd>
                </dl>

                {languageForResource && languageForResource.length > 1 && (
                  <ToggleButtonGroup
                    type="radio"
                    name={`${data.resource.id}-result-info-languages`}
                    defaultValue={locale}
                    onChange={(language) => setLocale(language)}
                    className="mt-2"
                  >
                    {languageForResource.toSorted().map((language) => (
                      <ToggleButton
                        variant="outline-secondary"
                        size="sm"
                        key={language}
                        id={`${data.resource.id}-result-info-languages-${language}`}
                        value={language}
                      >
                        {langNames.of(language)} <sup>{language}</sup>
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                )}
              </Card.Body>
            )}
            {/* results */}
            {hasResults && <Card.Body>{renderResults()}</Card.Body>}
            {/* diagnostics */}
            {showDiagnostics && hasDiagnostics && (
              <Card.Body className={hasResults ? 'border-top' : ''}>
                {/* TODO: aria invisible heading, adjust levels */}
                {data.exception && (
                  <Alert
                    variant="danger"
                    aria-label={t('search.results.diagnostics.alertAriaLabel')}
                  >
                    <Alert.Heading style={{ fontSize: '1rem' }}>
                      <span className="text-uppercase">
                        {t('search.results.diagnostics.titleException')}
                      </span>{' '}
                      <span aria-label={t('search.results.diagnostics.msgAriaLabel')}>
                        {data.exception.message}
                      </span>
                    </Alert.Heading>
                    {data.exception.cause && (
                      <p className="mb-0 small">
                        {t('search.results.diagnostics.msgCause', { cause: data.exception.cause })}
                      </p>
                    )}
                    {data.exception.klass && (
                      <p className="mb-0 small">
                        <Trans
                          i18nKey="search.results.diagnostics.msgCausedBy"
                          values={{ class: data.exception.klass }}
                        />
                      </p>
                    )}
                  </Alert>
                )}
                {data.diagnostics
                  .filter((diagnostic) => diagnostic.uri !== NO_MORE_RECORDS_DIAGNOSTIC_URI)
                  .map((diagnostic) => (
                    <Alert
                      variant="warning"
                      key={`${diagnostic.uri}-${diagnostic.message}-${diagnostic.diagnostic}`}
                    >
                      <Alert.Heading style={{ fontSize: '1rem' }}>
                        {diagnostic.message}
                      </Alert.Heading>
                      {diagnostic.diagnostic && (
                        <p className="mb-0 small">
                          {t('search.results.diagnostics.msgDiagnosticDetails', {
                            details: diagnostic.diagnostic,
                          })}
                        </p>
                      )}
                      <p className="mb-0 small">
                        <Trans
                          i18nKey="search.results.diagnostics.msgDiagnosticType"
                          values={{ uri: diagnostic.uri }}
                        />
                        {/* add link to list? */}
                      </p>
                    </Alert>
                  ))}
              </Card.Body>
            )}
          </div>
        </Collapse>
      </Card>
      <ResourceResultsModal
        show={showModal}
        searchId={searchId}
        resourceId={resourceId}
        result={data}
        viewMode={viewMode}
        showDiagnostics={showDiagnostics}
        onModalClose={handleModalClose}
      />
    </>
  )
}

export default ResourceSearchResult
