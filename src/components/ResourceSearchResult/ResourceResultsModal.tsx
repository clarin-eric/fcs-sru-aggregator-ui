import { useEffect, useState } from 'react'
import Alert from 'react-bootstrap/Alert'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Dropdown from 'react-bootstrap/Dropdown'
import FloatingLabel from 'react-bootstrap/FloatingLabel'
import Form from 'react-bootstrap/Form'
import Modal from 'react-bootstrap/Modal'
import Row from 'react-bootstrap/Row'
import ToggleButton from 'react-bootstrap/ToggleButton'
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup'
import { Trans, useTranslation } from 'react-i18next'

import type { Resource, ResourceSearchResult } from 'fcs-sru-aggregator-api-adapter-typescript'
import { getURLForDownload, getURLForWeblicht } from 'fcs-sru-aggregator-api-adapter-typescript'

import { useAggregatorData } from '@/providers/AggregatorDataContext'
import { useAxios } from '@/providers/AxiosContext'
import { useSearchParams } from '@/providers/SearchParamsContext'
import { useLocaleStore } from '@/stores/locale'
import { getSearchResultsURL } from '@/utils/api'

import { DOWNLOAD_FORMATS, NO_MORE_RECORDS_DIAGNOSTIC_URI } from '@/utils/constants'
import {
  findResourceByFilter,
  getBestFromMultilingualValuesTryByLanguage,
  getLanguagesFromResourceInfo,
} from '@/utils/resources'
import type { ResultsViewMode } from '@/utils/results'
import { languageCodeToName, MULTIPLE_LANGUAGE_CODE } from '@/utils/search'
import LoadMoreResultsButton from './LoadMoreResultsButton'
import ViewAdvancedTabular from './ViewAdvancedTabular'
import ViewKwic from './ViewKwic'
import ViewLex from './ViewLex'
import ViewLexPlain from './ViewLexPlain'
import ViewPlain from './ViewPlain'

import bankIcon from 'bootstrap-icons/icons/bank.svg?raw'
import downloadIcon from 'bootstrap-icons/icons/download.svg?raw'
import envelopeArrowUpIcon from 'bootstrap-icons/icons/envelope-arrow-up.svg?raw'
import fileEarmarkCodeIcon from 'bootstrap-icons/icons/file-earmark-code.svg?raw'
import houseDoorIcon from 'bootstrap-icons/icons/house-door.svg?raw'
import infoCircleIcon from 'bootstrap-icons/icons/info-circle.svg?raw'
import translateIcon from 'bootstrap-icons/icons/translate.svg?raw'

import './styles.css'

// --------------------------------------------------------------------------
// types

interface ResourceResultsModalProps {
  show: boolean
  searchId: string
  resourceId: string
  result: ResourceSearchResult
  viewMode: ResultsViewMode
  showDiagnostics: boolean
  onModalClose: () => void
}

// --------------------------------------------------------------------------
// component

function ResourceResultsModal({
  show,
  searchId,
  resourceId,
  result,
  viewMode: viewModeProps,
  showDiagnostics: showDiagnosticsProps,
  onModalClose,
}: ResourceResultsModalProps) {
  const axios = useAxios()
  const { t } = useTranslation()
  const userLocale = useLocaleStore((state) => state.locale)
  const { languages, resources, weblichtLanguages } = useAggregatorData()
  const { numberOfResults, queryType, language, languageFilter } = useSearchParams()

  const [locale, setLocale] = useState(userLocale)
  useEffect(() => {
    if (userLocale) setLocale(userLocale)
  }, [userLocale])

  const langNames = new Intl.DisplayNames([userLocale, 'en'], { type: 'language' })

  const [showDiagnostics, setShowDiagnostics] = useState(showDiagnosticsProps)
  useEffect(() => setShowDiagnostics(showDiagnosticsProps), [showDiagnosticsProps])
  const [viewMode, setViewMode] = useState(viewModeProps)
  useEffect(() => setViewMode(viewModeProps), [viewModeProps])

  const languageForResource = getLanguagesFromResourceInfo(result.resource)

  const hasDiagnostics =
    result.exception ||
    result.diagnostics?.filter((diagnostic) => diagnostic.uri !== NO_MORE_RECORDS_DIAGNOSTIC_URI)
      .length > 0

  // --------------------------------------------------------------
  // helper

  function hasMoreResults() {
    if (!result) return false
    if (result.nextRecordPosition === -1) return false
    if (result.numberOfRecords === -1) return false
    if (result.numberOfRecords === result.records.length) return true // TODO: maybe?
    return true
  }

  let languageForWeblicht = null
  let disableWeblicht = false
  if (!weblichtLanguages.includes(language)) {
    // the search language is either AnyLanguage or unsupported
    if (language === MULTIPLE_LANGUAGE_CODE) {
      if (result.resource.languages && result.resource.languages.length === 1) {
        languageForWeblicht = result.resource.languages[0]
      } else {
        const languagesFromKwic = [
          ...new Set(
            result.records.map((record) => record.lang).filter((language) => language !== null)
          ),
        ]
        if (languagesFromKwic.length === 1) {
          languageForWeblicht = languagesFromKwic[0]
        }
      }
    }
    if (!languageForWeblicht) {
      console.warn('Cannot use WebLicht: unsupported language', { language, languageFilter })
      disableWeblicht = true
    }
  }

  // ------------------------------------------------------------------------
  // event handlers

  function handleViewModeChange(event: React.ChangeEvent<HTMLSelectElement>) {
    setViewMode(event.target.value as ResultsViewMode)
  }

  // ------------------------------------------------------------------------
  // UI

  function renderResults() {
    if (!result) return null // TODO: loading spinner? but should not reach here

    if (viewMode === 'annotation-layers' && result.hasAdvResults) {
      const resource = findResourceByFilter(
        resources,
        (resource: Resource) => resource.id === result.id
      )
      return <ViewAdvancedTabular data={result} resource={resource} />
    }
    if (viewMode === 'kwic' && (queryType !== 'lex' || !result.isLexHits)) {
      return <ViewKwic data={result} />
    }
    if (viewMode === 'lexical-entry' && result.hasLexResults) {
      return <ViewLex data={result} />
    }
    if (queryType === 'lex' && result.isLexHits) {
      return <ViewLexPlain data={result} />
    }
    // 'plain' (fallback)
    return <ViewPlain data={result} />
  }

  return (
    <Modal
      show={show}
      onHide={() => onModalClose()}
      size="xl"
      fullscreen="lg-down"
      centered
      className="resource-search-result-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          {getBestFromMultilingualValuesTryByLanguage(result.resource.title, locale)}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="resource-info">
        <dl className="mb-0" aria-label={t('search.results.resourceInfo.infoTableAriaLabel')}>
          <dt>
            <i dangerouslySetInnerHTML={{ __html: bankIcon }} />{' '}
            {t('search.results.resourceInfo.labelInstitution')}
          </dt>
          <dd className="mb-0">
            {getBestFromMultilingualValuesTryByLanguage(result.resource.institution, locale)}
          </dd>
          <dt>
            <i dangerouslySetInnerHTML={{ __html: infoCircleIcon }} />{' '}
            {t('search.results.resourceInfo.labelDescription')}
          </dt>
          {getBestFromMultilingualValuesTryByLanguage(result.resource.description, locale) && (
            <>
              <dd className="mb-0">
                {getBestFromMultilingualValuesTryByLanguage(result.resource.description, locale)}
              </dd>
              <dt>
                <i dangerouslySetInnerHTML={{ __html: translateIcon }} />{' '}
                {t('search.results.resourceInfo.labelLanguages')}
              </dt>
            </>
          )}
          <dd className="mb-0">
            {result.resource.languages
              .map(
                languages
                  ? (code) =>
                      languageCodeToName(code, languages, {
                        defaultAnyLanguage: t('languageCodeToName.any', { ns: 'common' }),
                        defaultUnknownLanguage: t('languageCodeToName.unknown', { ns: 'common' }),
                      })
                  : (x) => x
              )
              .toSorted()
              .join(', ')}
          </dd>

          {languageForResource && languageForResource.length > 1 && (
            <ToggleButtonGroup
              type="radio"
              name={`${result.resource.id}-result-modal-info-languages`}
              defaultValue={locale}
              onChange={(language) => setLocale(language)}
              className="mt-2 mb-3"
            >
              {languageForResource.toSorted().map((language) => (
                <ToggleButton
                  variant="outline-secondary"
                  size="sm"
                  key={language}
                  id={`${result.resource.id}-result-modal-info-languages-${language}`}
                  value={language}
                >
                  {langNames.of(language)} <sup>{language}</sup>
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          )}

          <dt>{t('search.results.resourceInfo.labelPID')}</dt>
          <dd>{result.resource.handle}</dd>
        </dl>

        {result.resource.landingPage && (
          <a href={result.resource.landingPage} className="matomo_link" target="_blank">
            <i dangerouslySetInnerHTML={{ __html: houseDoorIcon }} />{' '}
            {t('search.results.resourceInfo.moreInformation')}
          </a>
        )}
        <hr />
        <Row className="row-gap-2">
          <Col lg={'auto'} md={3} sm={6}>
            <FloatingLabel
              label={t('search.results.displayOptions.viewModeLabel')}
              controlId="results-view-mode"
            >
              <Form.Select value={viewMode} onChange={handleViewModeChange}>
                <option value="plain">
                  {t('search.results.displayOptions.viewModeOptions.plain')}
                </option>
                {(queryType !== 'lex' || !result.isLexHits) && (
                  <option value="kwic">
                    {t('search.results.displayOptions.viewModeOptions.kwic')}
                  </option>
                )}
                {queryType === 'fcs' && (
                  <option value="annotation-layers">
                    {t('search.results.displayOptions.viewModeOptions.annotation-layers')}
                  </option>
                )}
                {queryType === 'lex' && (
                  <option value="lexical-entry">
                    {t('search.results.displayOptions.viewModeOptions.lexical-entry')}
                  </option>
                )}
              </Form.Select>
            </FloatingLabel>
          </Col>
          <Col lg={3} md={3} sm={6} className="align-content-center">
            <Form.Check
              disabled={!hasDiagnostics}
              checked={showDiagnostics}
              onChange={() => setShowDiagnostics((show) => !show)}
              id="results-modal-view-warnings-errors"
              label={t('search.results.displayOptions.optionShowWarningsErrors')}
            />
          </Col>
          <Col
            lg={'auto'}
            md={6}
            sm={6}
            className="d-flex flex-grow-1 column-gap-3 align-items-center justify-content-end"
          >
            <Dropdown>
              <Dropdown.Toggle>
                <i dangerouslySetInnerHTML={{ __html: downloadIcon }} />{' '}
                {t('search.results.buttonDownload')}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {DOWNLOAD_FORMATS.map(({ id: format, label }) => (
                  <Dropdown.Item
                    href={getURLForDownload(
                      axios,
                      searchId,
                      resourceId,
                      format,
                      language,
                      languageFilter
                    )}
                    className="matomo_download"
                    key={format}
                  >
                    <Trans
                      i18nKey="search.results.msgButtonDownloadOption"
                      values={{
                        label: t(`downloadFormats.${format}.name`, {
                          ns: 'common',
                          defaultValue: label,
                        }),
                      }}
                    />
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
            {/* TODO: show more visible message to user? */}
            <Button
              disabled={disableWeblicht}
              aria-disabled={disableWeblicht}
              href={getURLForWeblicht(
                axios,
                searchId,
                resourceId,
                languageForWeblicht ?? null,
                language,
                languageFilter
              )}
              className="matomo_link"
              target="_blank"
            >
              <i dangerouslySetInnerHTML={{ __html: envelopeArrowUpIcon }} />{' '}
              {t('search.results.buttonSendToWeblicht')}
            </Button>
            {import.meta.env.SHOW_SEARCH_RESULT_DEV_URLS && (
              <Dropdown>
                <Dropdown.Toggle>
                  <i dangerouslySetInnerHTML={{ __html: fileEarmarkCodeIcon }} />{' '}
                  {t('search.results.buttonDevelopStuff')}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {result.requestUrl && (
                    <Dropdown.Item href={result.requestUrl} target="_blank">
                      {t('search.results.msgButtonDevelopStuffOptionSRURequestURL')}
                    </Dropdown.Item>
                  )}
                  <Dropdown.Item
                    href={getSearchResultsURL(axios, searchId, resourceId, false)}
                    target="_blank"
                  >
                    {t('search.results.msgButtonDevelopStuffOptionSRUResponseParsed')}
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )}
          </Col>
        </Row>
        <hr />
        {/* results */}
        <p>
          <Trans
            i18nKey="search.results.msgShowingXresults"
            values={{
              count: result.records.length,
              context: hasMoreResults() ? 'hasmore' : null,
              total: result.numberOfRecords,
            }}
          />
        </p>
        {renderResults()}
      </Modal.Body>
      {/* diagnostics */}
      {showDiagnostics && hasDiagnostics && (
        <Modal.Body className="border-top">
          {result.exception && (
            <Alert variant="danger" aria-label={t('search.results.diagnostics.alertAriaLabel')}>
              <Alert.Heading style={{ fontSize: '1rem' }}>
                <span className="text-uppercase">
                  {t('search.results.diagnostics.titleException')}
                </span>{' '}
                <span aria-label={t('search.results.diagnostics.msgAriaLabel')}>
                  {result.exception.message}
                </span>
              </Alert.Heading>
              {result.exception.cause && (
                <p className="mb-0 small">
                  {t('search.results.diagnostics.msgCause', { cause: result.exception.cause })}
                </p>
              )}
              {result.exception.klass && (
                <p className="mb-0 small">
                  <Trans
                    i18nKey="search.results.diagnostics.msgCausedBy"
                    values={{ class: result.exception.klass }}
                  />
                </p>
              )}
            </Alert>
          )}
          {result.diagnostics
            .filter((diagnostic) => diagnostic.uri !== NO_MORE_RECORDS_DIAGNOSTIC_URI)
            .map((diagnostic) => (
              <Alert
                variant="warning"
                key={`${diagnostic.uri}-${diagnostic.message}-${diagnostic.diagnostic}`}
              >
                <Alert.Heading style={{ fontSize: '1rem' }}>{diagnostic.message}</Alert.Heading>
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
        </Modal.Body>
      )}
      {/* load more button */}
      {hasMoreResults() && (
        <Modal.Footer className="justify-content-center border-top py-2">
          {/* TODO: maybe split button to choose how many to load? */}
          <LoadMoreResultsButton
            searchId={searchId}
            resourceId={resourceId}
            numberOfResults={numberOfResults}
          />
        </Modal.Footer>
      )}
    </Modal>
  )
}

export default ResourceResultsModal
