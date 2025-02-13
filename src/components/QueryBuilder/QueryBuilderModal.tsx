import { useEffect, useState } from 'react'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import Modal from 'react-bootstrap/Modal'
import Row from 'react-bootstrap/Row'
import ToggleButton from 'react-bootstrap/ToggleButton'

import ContentEditable from '@/components/ContentEditable'
import useDebounce from '@/hooks/useDebounce'
import useDebouncedState from '@/hooks/useDebouncedState'
import { type Resource } from '@/utils/api'
import { FCSQueryBuilder, parseQuery as parseFCSQuery } from './FCS'

import './styles.css'

import highlightsIcon from 'bootstrap-icons/icons/highlights.svg?raw'

// --------------------------------------------------------------------------
// types

interface QueryBuilderModalProps {
  show: boolean
  query?: string
  queryType: 'fcs'
  resources?: Resource[]
  selectedResources?: string[]
  delay?: number
  onModalClose: (result: { query: string; validResources: string[]; action: string }) => void
}

// --------------------------------------------------------------------------
// component

function QueryBuilderModal({
  show,
  query: queryProp,
  queryType,
  resources,
  selectedResources,
  delay = 1000,
  onModalClose,
}: QueryBuilderModalProps) {
  // query input
  const [query, setQuery] = useState(queryProp ?? '')
  useEffect(() => setQuery(queryProp ?? ''), [queryProp])

  const queryDebounded = useDebounce(query, delay)
  // query input syntax highlighting
  const [queryInputEnhanced, setQueryInputEnhanced] = useState(false)
  // query input validation
  const [queryError, setQueryError, setQueryErrorImmediate] = useDebouncedState<string | null>(
    null,
    delay
  )

  const resourcesForQueryBuilder = resources
    ? selectedResources // && selectedResources.length > 0
      ? resources.filter((resource) => selectedResources.includes(resource.id))
      : resources
    : undefined

  // --------------------------------------------------------------
  // query syntax error handling

  // queryType conditional parsing
  const parsed = parseFCSQuery(query)

  if (parsed) {
    if (parsed.errors.length > 0 && queryError !== parsed.errors[0]) {
      setQueryError(parsed.errors[0])
    }
  }
  if (!parsed || parsed.errors.length === 0) {
    if (queryError !== null) {
      setQueryErrorImmediate(null)
    }
  }

  // --------------------------------------------------------------
  // helper

  // --------------------------------------------------------------
  // event handlers

  function handleClose(action: string) {
    onModalClose({
      query: query,
      validResources: selectedResources ?? [], // TODO: implement filtering
      action: action,
    })
  }

  function handleQueryInputChange(query: string) {
    setQuery(query)
  }

  function handleQueryBuilderQueryChange(query: string) {
    setQuery(query)
  }

  // --------------------------------------------------------------
  // rendering

  const [enableWithin, setEnableWithin] = useState(false)
  const [enableWrapGroup, setEnableWrapGroup] = useState(false)
  const [enableWrapNegation, setEnableWrapNegation] = useState(false)
  const [enableImplicitQuery, setEnableImplicitQuery] = useState(false)
  const [enableMultipleQuerySegments, setEnableMultipleQuerySegments] = useState(true)
  const [enableQuantifiers, setEnableQuantifiers] = useState(false)
  const [enableRegexpFlags, setEnableRegexpFlags] = useState(false)
  const [showBasicLayer, setShowBasicLayer] = useState(true)
  const [showAllAdvancedLayers, setShowAllAdvancedLayers] = useState(true)
  const [showCustomLayers, setShowCustomLayers] = useState(true)

  function renderQueryBuilder() {
    // make conditional on query type
    return (
      <>
        {/* TODO: testing */}
        {queryType === 'fcs' && (
          <Form className="my-2 p-2 border rounded" style={{ textIndent: '3.6rem hanging' }}>
            <Form.Text className="me-3" style={{ verticalAlign: 'text-bottom' }}>
              Enable
            </Form.Text>
            <Form.Check
              inline
              label="Within"
              type="checkbox"
              name="enableWithin"
              id="enableWithin"
              checked={enableWithin}
              onChange={() => setEnableWithin((checked) => !checked)}
            />
            <Form.Check
              inline
              label="Expression Grouping"
              type="checkbox"
              name="enableWrapGroup"
              id="enableWrapGroup"
              checked={enableWrapGroup}
              onChange={() => setEnableWrapGroup((checked) => !checked)}
            />
            <Form.Check
              inline
              label="Expression Negation"
              type="checkbox"
              name="enableWrapNegation"
              id="enableWrapNegation"
              checked={enableWrapNegation}
              onChange={() => setEnableWrapNegation((checked) => !checked)}
            />
            <Form.Check
              inline
              label="Implicit Query"
              type="checkbox"
              name="enableImplicitQuery"
              id="enableImplicitQuery"
              checked={enableImplicitQuery}
              onChange={() => setEnableImplicitQuery((checked) => !checked)}
            />
            <Form.Check
              inline
              label="Multiple Query Segments"
              type="checkbox"
              name="enableMultipleQuerySegments"
              id="enableMultipleQuerySegments"
              checked={enableMultipleQuerySegments}
              onChange={() => setEnableMultipleQuerySegments((checked) => !checked)}
              disabled
            />
            <Form.Check
              inline
              label="Quantifiers"
              type="checkbox"
              name="enableQuantifiers"
              id="enableQuantifiers"
              checked={enableQuantifiers}
              onChange={() => setEnableQuantifiers((checked) => !checked)}
            />
            <Form.Check
              inline
              label="Regex Flags"
              type="checkbox"
              name="enableRegexpFlags"
              id="enableRegexpFlags"
              checked={enableRegexpFlags}
              onChange={() => setEnableRegexpFlags((checked) => !checked)}
              disabled
            />
            <Form.Check
              inline
              label="BASIC Layer"
              type="checkbox"
              name="showBasicLayer"
              id="showBasicLayer"
              checked={showBasicLayer}
              onChange={() => setShowBasicLayer((checked) => !checked)}
            />
            <Form.Check
              inline
              label="All Advanced Layers"
              type="checkbox"
              name="showAllAdvancedLayers"
              id="showAllAdvancedLayers"
              checked={showAllAdvancedLayers}
              onChange={() => setShowAllAdvancedLayers((checked) => !checked)}
            />
            <Form.Check
              inline
              label="Custom Layers"
              type="checkbox"
              name="showCustomLayers"
              id="showCustomLayers"
              checked={showCustomLayers}
              onChange={() => setShowCustomLayers((checked) => !checked)}
            />
          </Form>
        )}
        <FCSQueryBuilder
          query={queryDebounded}
          onChange={handleQueryBuilderQueryChange}
          resources={resourcesForQueryBuilder}
          // feature flags
          enableWithin={enableWithin}
          enableWrapGroup={enableWrapGroup}
          enableWrapNegation={enableWrapNegation}
          enableImplicitQuery={enableImplicitQuery}
          enableMultipleQuerySegments={enableMultipleQuerySegments}
          enableQuantifiers={enableQuantifiers}
          enableRegexpFlags={enableRegexpFlags}
          showBasicLayer={showBasicLayer}
          showAllAdvancedLayers={showAllAdvancedLayers}
          showCustomLayers={showCustomLayers}
        />
      </>
    )
  }

  return (
    <Modal
      id="query-builder-modal"
      show={show}
      onHide={() => handleClose('close')}
      // size="xl"
      // fullscreen="xl-down"
      fullscreen={true}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Query Builder</Modal.Title>
      </Modal.Header>
      <Modal.Body className="px-0">
        {/* resource viewing options */}
        <Form className="px-1 pb-3 border-bottom" onSubmit={(event) => event.preventDefault()}>
          <Container>
            <Row className="d-sm-flex row-gap-2 justify-content-around">
              <Col>
                <InputGroup hasValidation>
                  {/* @ts-expect-error: typing does not work for onChange handler, is correct so */}
                  <Form.Control
                    placeholder='"Elephant"'
                    aria-label="query builder input"
                    className="text-center query-builder-input"
                    value={query}
                    isInvalid={!!queryError}
                    {...(queryInputEnhanced
                      ? {
                          as: ContentEditable,
                          queryType: queryType,
                          onChange: handleQueryInputChange,
                        }
                      : {
                          onChange: (event) => handleQueryInputChange(event.target.value),
                        })}
                  />
                  <ToggleButton
                    id="fcs-query-builder-input-enhanced-button"
                    value="enhance-query" // just a dummy value
                    type="checkbox"
                    checked={queryInputEnhanced}
                    onChange={() => setQueryInputEnhanced((isChecked) => !isChecked)}
                    variant="outline-secondary"
                    aria-label="Enable enhanced visual input support"
                    className="d-flex align-items-center"
                  >
                    <i dangerouslySetInnerHTML={{ __html: highlightsIcon }} aria-hidden="true" />
                  </ToggleButton>
                  <Form.Control.Feedback type="invalid">{queryError}</Form.Control.Feedback>
                </InputGroup>
              </Col>
            </Row>
          </Container>
        </Form>
        {/* query builder */}
        <Container className="px-3 pt-3">{renderQueryBuilder()}</Container>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => handleClose('abort')}>
          Cancel
        </Button>
        <Button variant="primary" onClick={() => handleClose('confirm')}>
          Use Query
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default QueryBuilderModal
