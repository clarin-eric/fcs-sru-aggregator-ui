import type { FuzzyMatches } from '@nozbe/microfuzz'
import { Highlight, useFuzzySearchList } from '@nozbe/microfuzz/react'
import { useMemo, useState } from 'react'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Form from 'react-bootstrap/Form'
import Modal from 'react-bootstrap/Modal'
import Row from 'react-bootstrap/Row'

import { type Resource } from '@/utils/api'
import {
  DEFAULT_SEARCH_LANGUAGE_FILTER,
  MULTIPLE_LANGUAGE_CODE,
  languageCodeToName,
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
  onModalClose,
}: LanguageModalProps) {
  //  = { languages: {}, searchLanguage: MULTIPLE_LANGUAGE_CODE, searchLanguageFilter: DEFAULT_SEARCH_LANGUAGE_FILTER }
  const [selectedLanguage, setSelectedLanguage] = useState(searchLanguage || MULTIPLE_LANGUAGE_CODE)
  const [selectedFilterOption, setSelectedFilterOption] = useState(
    searchLanguageFilter || DEFAULT_SEARCH_LANGUAGE_FILTER
  )
  const [languageFilter, setLanguageFilter] = useState('')
  const [showResourceCounts, setShowResourceCounts] = useState(false)

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
          <> ({languageToNumberOfResources.get(code)})</>
        )}
      </Button>
    )
  }

  return (
    <Modal show={show} onHide={() => handleClose('close')} size="xl" fullscreen="lg-down" centered>
      <Modal.Header closeButton>
        <Modal.Title>Languages</Modal.Title>
      </Modal.Header>
      <Modal.Body className="px-0">
        <Container className="px-4 pb-3 border-bottom">
          <Row>
            <Col sm></Col>
            <Col sm className="mb-3 mb-sm-2 align-content-end">
              {renderLanguageOption(
                MULTIPLE_LANGUAGE_CODE,
                languageCodeToName(MULTIPLE_LANGUAGE_CODE)
              )}
            </Col>
            <Col sm>
              <Form.Control
                size="sm"
                placeholder="Filter languages ..."
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
                  label="Show number of resources per language"
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
        <Form>
          <Container className="px-4 pt-3">
            <Form.Check
              type="radio"
              name="filterOpts"
              value="byMeta"
              id="filterOpts-byMeta"
              checked={selectedFilterOption === 'byMeta'}
              onChange={() => setSelectedFilterOption('byMeta')}
              label="Use the resources' specified language to filter results"
            />
            <Form.Check
              type="radio"
              name="filterOpts"
              value="byGuess"
              id="filterOpts-byGuess"
              checked={selectedFilterOption === 'byGuess'}
              onChange={() => setSelectedFilterOption('byGuess')}
              label="Filter results by using a language detector"
            />
            <Form.Check
              type="radio"
              name="filterOpts"
              value="byMetaAndGuess"
              id="filterOpts-byMetaAndGuess"
              checked={selectedFilterOption === 'byMetaAndGuess'}
              onChange={() => setSelectedFilterOption('byMetaAndGuess')}
              label="First use the resources' specified language then also use a language detector"
            />
          </Container>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleReset}>
          Revert Selection
        </Button>
        <Button variant="secondary" onClick={() => handleClose('abort')}>
          Abort
        </Button>
        <Button variant="primary" onClick={() => handleClose('confirm')}>
          Confirm and Close
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default LanguageModal
