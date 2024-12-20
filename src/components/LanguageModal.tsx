import { useState } from 'react'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Form from 'react-bootstrap/Form'
import Modal from 'react-bootstrap/Modal'
import Row from 'react-bootstrap/Row'

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

// --------------------------------------------------------------------------
// component

function LanguageModal({
  show,
  languages,
  searchLanguage,
  searchLanguageFilter,
  onModalClose,
}: {
  show: boolean
  languages?: LanguageCode2NameMap
  searchLanguage?: string
  searchLanguageFilter?: LanguageFilterOptions
  onModalClose: (result: {
    language: string
    filter: LanguageFilterOptions
    action: LanguageModelCloseActions
  }) => void
}) {
  //  = { languages: {}, searchLanguage: MULTIPLE_LANGUAGE_CODE, searchLanguageFilter: DEFAULT_SEARCH_LANGUAGE_FILTER }
  const [selectedLanguage, setSelectedLanguage] = useState(searchLanguage || MULTIPLE_LANGUAGE_CODE)
  const [selectedFilterOption, setSelectedFilterOption] = useState(
    searchLanguageFilter || DEFAULT_SEARCH_LANGUAGE_FILTER
  )

  if (!languages) return null

  const sortedLanguageCodes = Object.keys(languages).toSorted()
  const oneThird = Math.floor((sortedLanguageCodes.length + 2) / 3)

  function renderLanguageOption(code: string) {
    const isSelected = selectedLanguage === code
    let className = 'd-block py-0 my-1 border-0'
    if (isSelected) className += ' fw-semibold selected'

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
        key={code}
      >
        {isSelected && <span className="selected-marker me-1">✓</span>}
        {languageCodeToName(code, languages)} <sup>{code}</sup>
      </Button>
    )
  }

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

  return (
    <Modal show={show} onHide={() => handleClose('close')} size="xl" fullscreen="lg-down" centered>
      <Modal.Header closeButton>
        <Modal.Title>Languages</Modal.Title>
      </Modal.Header>
      <Modal.Body className="px-0">
        <Container className="px-4 pb-3 border-bottom">
          <Row>
            <Col sm></Col>
            <Col sm className="mb-3 mb-sm-2">
              {renderLanguageOption(MULTIPLE_LANGUAGE_CODE)}
            </Col>
            <Col sm></Col>
          </Row>
          <Row>
            <Col sm>
              {sortedLanguageCodes.slice(0, oneThird).map((code) => renderLanguageOption(code))}
            </Col>
            <Col sm>
              {sortedLanguageCodes
                .slice(oneThird, 2 * oneThird)
                .map((code) => renderLanguageOption(code))}
            </Col>
            <Col sm>
              {sortedLanguageCodes.slice(2 * oneThird).map((code) => renderLanguageOption(code))}
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
