import type { FuzzyMatches } from '@nozbe/microfuzz'
import { Highlight, useFuzzySearchList } from '@nozbe/microfuzz/react'
import { useMemo, useState } from 'react'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Form from 'react-bootstrap/Form'
import Modal from 'react-bootstrap/Modal'
import Row from 'react-bootstrap/Row'
import { useTranslation } from 'react-i18next'

import { type Resource } from '@/utils/api'
import {
  DEFAULT_SEARCH_LANGUAGE_FILTER,
  MULTIPLE_LANGUAGE_CODE,
  type LanguageCode2NameMap,
  type LanguageFilterOptions,
} from '@/utils/search'

// --------------------------------------------------------------------------
// types

export type LanguageModelCloseActions = 'close' | 'confirm' | 'abort'

interface LanguageModalProps {
  show: boolean
  languages?: LanguageCode2NameMap
  resources?: Resource[]
  searchLanguage?: string
  searchLanguageFilter?: LanguageFilterOptions
  showResourceCounts?: boolean
  showLanguageFilterOptions?: boolean
  onModalClose: (result: {
    language: string
    filter: LanguageFilterOptions
    action: LanguageModelCloseActions
  }) => void
}

// --------------------------------------------------------------------------
// component

function LanguageModal({
  show,
  languages,
  resources,
  searchLanguage,
  searchLanguageFilter,
  showResourceCounts: paramShowResourceCounts,
  showLanguageFilterOptions = true,
  onModalClose,
}: LanguageModalProps) {
  const { t } = useTranslation()

  //  = { languages: {}, searchLanguage: MULTIPLE_LANGUAGE_CODE, searchLanguageFilter: DEFAULT_SEARCH_LANGUAGE_FILTER }
  const [selectedLanguage, setSelectedLanguage] = useState(searchLanguage || MULTIPLE_LANGUAGE_CODE)
  const [selectedFilterOption, setSelectedFilterOption] = useState(
    searchLanguageFilter || DEFAULT_SEARCH_LANGUAGE_FILTER
  )
  const [languageFilter, setLanguageFilter] = useState('')
  const [showResourceCounts, setShowResourceCounts] = useState(paramShowResourceCounts ?? false)

  const languageToNumberOfResources = useMemo(() => {
    const counts = new Map<string, number>()

    if (resources) {
      resources.forEach((resource) =>
        resource.languages.forEach((language) =>
          counts.set(language, (counts.get(language) ?? 0) + 1)
        )
      )
      counts.set(MULTIPLE_LANGUAGE_CODE, resources.length)
    }

    return counts
  }, [resources])

  const filteredLanguages = useFuzzySearchList({
    list: Object.entries(languages ?? {}).toSorted(),
    // If `queryText` is blank, `list` is returned in whole
    queryText: languageFilter,
    getText: (item) => [item[0], item[1]],
    mapResultItem: ({ item, score, matches }) => ({ item, matches, score }),
  })

  if (!languages) return null

  const oneThird = Math.floor((filteredLanguages.length + 2) / 3)

  // ------------------------------------------------------------------------
  // event handlers

  function handleClose(action: LanguageModelCloseActions) {
    onModalClose({
      language: selectedLanguage,
      filter: selectedFilterOption,
      action: action,
    })
  }

  function handleReset() {
    setSelectedLanguage(searchLanguage || MULTIPLE_LANGUAGE_CODE)
    setSelectedFilterOption(searchLanguageFilter || DEFAULT_SEARCH_LANGUAGE_FILTER)
  }

  function handleToggleShowResourceCountsChange() {
    setShowResourceCounts((show) => !show)
  }

  // ------------------------------------------------------------------------
  // UI

  function renderLanguageOption(
    code: string,
    language: string,
    highlights?: FuzzyMatches,
    score?: number
  ) {
    const isSelected = selectedLanguage === code
    let className = 'd-block py-0 my-1 border-0'
    if (isSelected) className += ' fw-semibold selected'

    if (highlights === undefined) highlights = [null, null]

    return (
      <Button
        size="sm"
        // variant="outline-dark"
        className={className}
        style={{
          color: `var(${isSelected ? '--bs-green' : '--bs-body-colors'})`,
          backgroundColor: 'var(--bs-body-bg)',
        }}
        onClick={() => setSelectedLanguage(code)}
        data-filter-score={score}
        key={code}
      >
        {isSelected && <span className="selected-marker me-1">✓</span>}
        <Highlight ranges={highlights[1]} text={language} />{' '}
        <sup>
          <Highlight ranges={highlights[0]} text={code} />
        </sup>
        {showResourceCounts && languageToNumberOfResources.has(code) && (
          <>
            {' '}
            <span className="text-muted">({languageToNumberOfResources.get(code)})</span>
          </>
        )}
      </Button>
    )
  }

  return (
    <Modal show={show} onHide={() => handleClose('close')} size="xl" fullscreen="lg-down" centered>
      <Modal.Header closeButton>
        <Modal.Title>{t('search.languagesModal.title')}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="px-0">
        <Container
          className={['px-4']
            .concat(showLanguageFilterOptions ? ['pb-3 border-bottom'] : [])
            .join(' ')}
        >
          <Row>
            <Col sm></Col>
            <Col sm className="mb-3 mb-sm-2 align-content-end">
              {renderLanguageOption(
                MULTIPLE_LANGUAGE_CODE,
                t('languageCodeToName.any', { ns: 'common' })
              )}
            </Col>
            <Col sm>
              <Form.Control
                size="sm"
                placeholder={t('search.languagesModal.filterInputPlaceholder')}
                name="languages-filter"
                value={languageFilter}
                onChange={(event) => setLanguageFilter(event.target.value)}
              />
              {resources && (
                <Form.Check
                  name="languages-show-count"
                  id="languages-show-count"
                  checked={showResourceCounts}
                  onChange={handleToggleShowResourceCountsChange}
                  type="checkbox"
                  label={t('search.languagesModal.checkboxShowNumberOfResources')}
                  className="mt-1"
                />
              )}
            </Col>
          </Row>
          <Row>
            <Col sm>
              {filteredLanguages
                .slice(0, oneThird)
                .map(({ item: [code, language], matches, score }) =>
                  renderLanguageOption(code, language, matches, score)
                )}
            </Col>
            <Col sm>
              {filteredLanguages
                .slice(oneThird, 2 * oneThird)
                .map(({ item: [code, language], matches, score }) =>
                  renderLanguageOption(code, language, matches, score)
                )}
            </Col>
            <Col sm>
              {filteredLanguages
                .slice(2 * oneThird)
                .map(({ item: [code, language], matches, score }) =>
                  renderLanguageOption(code, language, matches, score)
                )}
            </Col>
          </Row>
        </Container>
        {showLanguageFilterOptions && (
          <Form>
            <Container className="px-4 pt-3">
              {(['byMeta', 'byGuess', 'byMetaAndGuess'] as LanguageFilterOptions[]).map((type) => (
                <Form.Check
                  key={type}
                  type="radio"
                  name="filterOpts"
                  value={type}
                  id={`filterOpts-${type}`}
                  checked={selectedFilterOption === type}
                  onChange={() => setSelectedFilterOption(type)}
                  label={t(`search.languagesModal.optionLanguage${type}`)}
                />
              ))}
            </Container>
          </Form>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleReset}>
          {t('search.languagesModal.buttonReset')}
        </Button>
        <Button variant="secondary" onClick={() => handleClose('abort')}>
          {t('search.languagesModal.buttonAbort')}
        </Button>
        <Button variant="primary" onClick={() => handleClose('confirm')}>
          {t('search.languagesModal.buttonConfirm')}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default LanguageModal
