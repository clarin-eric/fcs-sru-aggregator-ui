import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Dropdown from 'react-bootstrap/Dropdown'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import Modal from 'react-bootstrap/Modal'
import Row from 'react-bootstrap/Row'
import { type AxiosInstance } from 'axios'
import { getInitData } from '@/utils/api'

// TODO: SVG, for inverted/specific colors: https://stackoverflow.com/a/52041765/9360161
import gearIcon from 'bootstrap-icons/icons/gear-fill.svg'
import fcsLogoUrl from '@images/logo-fcs.png'
import fcsLogoDarkModeUrl from '@images/logo-fcs-dark.png'

import './search.css'
import Resources from '@/utils/resources'
import { Resource } from '@/utils/resources'
import { queryTypeMap, queryTypes } from '@/utils/constants'

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
  languages?: LanguageCode2NameMap
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

function ResourceSelectionModal({
  show,
  resources,
  searchResourceIDs,
  onModalClose,
}: {
  show: boolean
  resources?: Resources
  searchResourceIDs?: string[]
  onModalClose: (result: { resourceIDs: string[]; action: string }) => void
}) {
  if (!resources) return null

  function handleClose(action: string) {
    onModalClose({ resourceIDs: [], action: action })
  }

  return (
    <Modal show={show} onHide={() => handleClose('close')} size="xl" fullscreen="lg-down" centered>
      <Modal.Header closeButton>
        <Modal.Title>Resources</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Container>
            <Row className="justify-content-evenly">
              <Col>
                <Form.Group controlId="resource-view-options-selection">
                  <Form.Label>View</Form.Label>
                  <Form.Select className="d-inline-block w-auto mx-1">
                    <option>All</option>
                    <option>Selected only</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col>
                <Form.Group controlId="resource-view-options-grouping">
                  <Form.Label>Group by</Form.Label>
                  <Form.Select className="d-inline-block w-auto mx-1">
                    <option>(Resource)</option>
                    <option>Institution</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col>
                <Form.Control type="text" placeholder="Search for ..." className="w-auto" />
              </Col>
              <Col>
                <Button>Select all</Button>
                <Button>Select visible</Button>
                <Button>Deselect all</Button>
              </Col>
            </Row>
          </Container>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={() => handleClose('confirm')}>
          Confirm and Close
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

function Search({ axios }: SearchProps) {
  const [showResourceSelectionModal, setShowResourceSelectionModal] = useState(false)
  const [showResourceSelectionModalGrouping, setShowResourceSelectionModalGrouping] =
    useState('resource')
  const [showLanguageSelectionModal, setShowLanguageSelectionModal] = useState(false)

  // user input search state
  const [searchLanguage, setSearchLanguage] = useState('mul')
  const [searchLanguageFilter, setSearchLanguageFilter] = useState<LanguageFilterOptions>('byMeta')
  const [queryType, setQueryType] = useState('cql')
  const [searchResourceIDs, setSearchResourceIDs] = useState<string[]>([])
  const [numberOfResults, setNumberOfResults] = useState(numberOfResultsOptions[0])

  //
  const [resources, setResources] = useState<Resources>(new Resources([]))
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
    const resources = new Resources(data.resources)
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
    console.log(
      'Update resource visibility',
      { queryType, searchLanguage, searchLanguageFilter },
      resources
    )
    resources.setVisibility(queryType, searchLanguageFilter === 'byGuess' ? 'mul' : searchLanguage)
    setSearchResourceIDs(resources.getSelectedIds())
  }, [resources, queryType, searchLanguage, searchLanguageFilter])

  // on state update, this component is re-evaluated which re-evaluates the expressions below, too
  const isInputDisabled = isLoading || isError
  // console.debug('isInputDisabled', isInputDisabled, 'isLoading', isLoading, 'isError', isError)

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
            <div id="fcs-query-filters" className="mt-2 lh-lg text-center">
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
            { searchLanguage, searchLanguageFilter, queryType, searchResourceIDs, numberOfResults },
            undefined,
            2
          )}
        </Col>
      </Row>
      <Row>
        <Col>{JSON.stringify(resources, undefined, 2)}</Col>
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
        searchResourceIDs={searchResourceIDs}
        show={showResourceSelectionModal}
        onModalClose={handleChangeResourceSelection}
      />
    </Container>
  )
}

export default Search
