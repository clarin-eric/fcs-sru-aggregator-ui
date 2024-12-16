import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Dropdown from 'react-bootstrap/Dropdown'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import Modal from 'react-bootstrap/Modal'
import Row from 'react-bootstrap/Row'
import Tab from 'react-bootstrap/Tab'
import Tabs from 'react-bootstrap/Tabs'
import { type ToggleMetadata } from '@restart/ui/Dropdown'
import { type AxiosInstance } from 'axios'
import { getInitData } from '@/utils/api'

// TODO: SVG, for inverted/specific colors: https://stackoverflow.com/a/52041765/9360161
import gearIcon from 'bootstrap-icons/icons/gear-fill.svg'
import fcsLogoUrl from '@images/logo-fcs.png'
import fcsLogoDarkModeUrl from '@images/logo-fcs-dark.png'

import './search.css'

const numberOfResultsOptions = [10, 20, 50, 100, 200, 250]

export interface SearchProps {
  axios: AxiosInstance
}

interface LanguageCode2NameMap {
  [code: string]: string
}

type LanguageFilterOptions = 'byMeta' | 'byGuess' | 'byMetaAndGuess'
type LanguageModelCloseActions = 'close' | 'confirm' | 'abort'

function languageCodeToName(
  code: string,
  codeToLanguageMapping: LanguageCode2NameMap = undefined as unknown as LanguageCode2NameMap
) {
  if (code === 'mul') return 'Any Language'
  return codeToLanguageMapping?.[code] || 'Unknown Language'
}

function LanguageModal({
  show,
  languages,
  searchLanguage,
  searchLanguageFilter,
  onLanguageSelected,
  onModalClose,
}: {
  show: boolean
  languages: LanguageCode2NameMap
  searchLanguage?: string
  searchLanguageFilter?: LanguageFilterOptions
  onLanguageSelected?: (code: string) => void
  onModalClose: (result: {
    language: string
    filter: LanguageFilterOptions
    action: LanguageModelCloseActions
  }) => void
}) {
  //  = { languages: {}, searchLanguage: 'mul', searchLanguageFilter: 'byMeta' }
  const [selectedLanguage, setSelectedLanguage] = useState(searchLanguage || 'mul')
  const [selectedFilterOption, setSelectedFilterOption] = useState(searchLanguageFilter || 'byMeta')

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
        onClick={() => {
          setSelectedLanguage(code)
          onLanguageSelected?.(code)
        }}
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
    setSelectedLanguage(searchLanguage || 'mul')
    setSelectedFilterOption(searchLanguageFilter || 'byMeta')
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
              {renderLanguageOption('mul')}
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

function Search({ axios }: SearchProps) {
  const [showResourceSelectionModal, setShowResourceSelectionModal] = useState(false)
  const [showLanguageSelectionModal, setShowLanguageSelectionModal] = useState(false)
  const [searchLanguage, setSearchLanguage] = useState('mul')

  // ------------------------------------------------------------------------
  // initialization

  const {
    data, //: { languages, resources, weblichtLanguages },
  } = useQuery({
    queryKey: ['init'],
    queryFn: getInitData.bind(null, axios),
  })

  // data computation

  // ------------------------------------------------------------------------
  // event handlers

  function handleToggle(nextShow: boolean, meta: ToggleMetadata) {
    console.log('handleToggle', nextShow, meta)
  }
  function handleSelect(eventKey: string | null, event: React.SyntheticEvent<unknown>) {
    console.log('handleSelect', eventKey, event)
  }

  function handleChangeNumberOfResults(event: React.ChangeEvent<HTMLSelectElement>) {
    console.log('handleChangeNumberOfResults', event, event.target.value)
  }

  // ------------------------------------------------------------------------
  // utilities

  // ------------------------------------------------------------------------
  // UI

  return (
    <Container>
      <Row>
        <Col className="text-center">
          <picture>
            <source srcSet={fcsLogoUrl} media="(prefers-color-scheme: light)" />
            <source srcSet={fcsLogoDarkModeUrl} media="(prefers-color-scheme: dark)" />
            <img src={fcsLogoUrl} className="logo" alt="FCS logo" />
          </picture>
        </Col>
      </Row>

      <Row>
        <Col>
          <search id="fcs-query">
            <InputGroup size="lg">
              <Form.Control
                placeholder="Elephant"
                aria-label="search query input"
                aria-describedby="fcs-search-input-button"
                className="text-center"
              />
              <Button variant="outline-secondary" id="fcs-search-input-button">
                {/* TODO: visually-hidden span with description? */}
                Search
              </Button>
            </InputGroup>
            <div id="fcs-query-filters" className="mt-2 lh-lg text-center">
              Perform a{' '}
              <Dropdown className="d-inline-block" onToggle={handleToggle} onSelect={handleSelect}>
                <Dropdown.Toggle size="sm" variant="outline-dark" className="mx-1 pe-2 no-arrow">
                  Full-text Search{' '}
                  <img
                    src={gearIcon}
                    aria-hidden="true"
                    width={10}
                    className="align-top rounded-circle"
                  />
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item as="button" eventKey="cql">
                    Text layer Contextual Query Language (CQL)
                  </Dropdown.Item>
                  <Dropdown.Item as="button" eventKey="fcs">
                    Multi-layer Federated Content Search Query Language (FCS-QL)
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>{' '}
              in{' '}
              <Button size="sm" variant="outline-dark" className="mx-1 pe-2">
                XYZ Resources{' '}
                <img
                  src={gearIcon}
                  aria-hidden="true"
                  width={10}
                  className="align-top rounded-circle"
                />
              </Button>{' '}
              from{' '}
              <Button size="sm" variant="outline-dark" className="mx-1 pe-2">
                XYZ Institutions{' '}
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

      <Row>{/* <Col>{JSON.stringify(data?.resources, undefined, 2)}</Col> */}</Row>

      <LanguageModal
        show={showLanguageSelectionModal}
        languages={data?.languages || {}}
        searchLanguage={searchLanguage}
        onModalClose={({ language, filter, action }) => {
          console.log('onModalClose', { language, filter, action })
          // first close the modal
          setShowLanguageSelectionModal(false)
          // if 'abort' do nothing
          if (action === 'abort') return
          // use user inputs
          setSearchLanguage(language)
        }}
      />

    </Container>
  )
}

export default Search
