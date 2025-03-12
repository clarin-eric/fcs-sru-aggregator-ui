import { useEffect, useMemo, useState } from 'react'
import Alert from 'react-bootstrap/Alert'
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
import { type QueryTypeIDForQueryBuilder } from '@/utils/constants'
import {
  FCSQueryBuilder,
  getLayersUsedInQuery,
  getResourcesLayerSupportInfo,
  parseQuery as parseFCSQuery,
} from './FCS'
import { LexCQLQueryBuilder, parseQuery as parseLexCQLQuery } from './lex'

import './styles.css'

import highlightsIcon from 'bootstrap-icons/icons/highlights.svg?raw'

// --------------------------------------------------------------------------
// types

interface QueryBuilderModalProps {
  show: boolean
  query?: string
  queryType: QueryTypeIDForQueryBuilder
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
  const [cursorPos, setCursorPos] = useState<[number, number] | number | null>(null)
  useEffect(() => {
    setQuery(queryProp ?? '')
    setCursorPos(null)
  }, [queryProp])

  const queryDebounced = useDebounce(query, delay)
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
  const parsed = useMemo(() => {
    console.debug('parse query for input validation', { query, queryType })
    if (queryType === 'fcs') {
      return parseFCSQuery(query)
    }
    if (queryType === 'lex') {
      return parseLexCQLQuery(query)
    }
    console.warn('Unexpected queryType, so will not parse query!', queryType)
    return null
  }, [query, queryType])

  // NOTE: do not wrap in `useEffect` as it causes flickering and hinders debouncing
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

  const [unavailableResources, setUnavailableResources] = useState<number>(0)
  const [unavailableResourcesByValue, setUnavailableResourcesByValue] = useState<
    Map<string, Resource[]> | undefined
  >(undefined)

  // conditional update with custom equality check since objects ...
  if (resources && parsed) {
    const layersUsedInQuery = getLayersUsedInQuery(parsed?.tree)
    const resourcesWithMissingLayers = getResourcesLayerSupportInfo(resources, layersUsedInQuery)

    const newUnavailable = resourcesWithMissingLayers.unsupported.length
    if (newUnavailable !== unavailableResources) {
      setUnavailableResources(newUnavailable)
    }
    const newLayers = [...resourcesWithMissingLayers.unsupportedByLayer.keys()]
    const oldLayers = unavailableResourcesByValue ? [...unavailableResourcesByValue.keys()] : []
    if (
      newLayers.length !== oldLayers.length ||
      !newLayers.every((layer) => oldLayers.includes(layer))
    ) {
      setUnavailableResourcesByValue(resourcesWithMissingLayers.unsupportedByLayer)
    }
  }
  if (!parsed) {
    if (unavailableResources !== 0) {
      setUnavailableResources(0)
      setUnavailableResourcesByValue(undefined)
    }
  }

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

  function handleQueryInputCursorChange(
    event:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | React.KeyboardEvent<HTMLInputElement>
      | React.MouseEvent<HTMLInputElement>
  ) {
    if ((event.target as HTMLElement).nodeName === 'INPUT') {
      const start = (event.target as HTMLInputElement).selectionStart
      const end = (event.target as HTMLInputElement).selectionEnd
      if (start !== null && end !== null && start !== end) {
        setCursorPos([start, end])
      } else {
        setCursorPos(start)
      }
    }
  }

  function handleQueryBuilderQueryChange(query: string) {
    setQuery(query)
  }

  // --------------------------------------------------------------
  // rendering

  // fcs
  const [enableWithin, setEnableWithin] = useState(false)
  const [enableWrapGroup, setEnableWrapGroup] = useState(false)
  const [enableWrapNegation, setEnableWrapNegation] = useState(false)
  const [enableImplicitQuery, setEnableImplicitQuery] = useState(false)
  const [enableMultipleQuerySegments, setEnableMultipleQuerySegments] = useState(true)
  const [enableQuantifiers, setEnableQuantifiers] = useState(false)
  const [enableRegexpFlags, setEnableRegexpFlags] = useState(false)
  const [showBasicLayer, setShowBasicLayer] = useState(false)
  const [showAllAdvancedLayers, setShowAllAdvancedLayers] = useState(false)
  const [showCustomLayers, setShowCustomLayers] = useState(true)
  const [showLayerQualifiers, setShowLayerQualifiers] = useState(true)
  const [showResourceCountForLayer, setShowResourceCountForLayer] = useState(true)
  // lexcql
  const [forceSearchTermQuoting, setForceSearchTermQuoting] = useState(false)
  const [enableRelationModifiers, setEnableRelationModifiers] = useState(true)

  function renderFCSQueryBuilder() {
    // make conditional on query type
    return (
      <>
        {/* TODO: testing */}
        <Form className="my-2 p-2 border rounded" style={{ textIndent: '3.6rem hanging' }}>
          <Form.Text className="me-3" style={{ verticalAlign: 'text-bottom' }}>
            Enable
          </Form.Text>
          {/* query structures */}
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
          {/* inputs */}
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
          {/* layers */}
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
          <Form.Check
            inline
            label="Layer Qualifiers"
            type="checkbox"
            name="showLayerQualifiers"
            id="showLayerQualifiers"
            checked={showLayerQualifiers}
            onChange={() => setShowLayerQualifiers((checked) => !checked)}
          />
          <Form.Check
            inline
            label="Resource Count for Layer"
            type="checkbox"
            name="showResourceCountForLayer"
            id="showResourceCountForLayer"
            checked={showResourceCountForLayer}
            onChange={() => setShowResourceCountForLayer((checked) => !checked)}
          />
        </Form>
        <FCSQueryBuilder
          query={queryDebounced}
          cursorPos={cursorPos ?? undefined}
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
          showLayerQualifiers={showLayerQualifiers}
          showResourceCountForLayer={showResourceCountForLayer}
        />
      </>
    )
  }

  function renderLexCQLQueryBuilder() {
    return (
      <>
        {/* TODO: testing */}
        <Form className="my-2 p-2 border rounded" style={{ textIndent: '3.6rem hanging' }}>
          <Form.Text className="me-3" style={{ verticalAlign: 'text-bottom' }}>
            Enable
          </Form.Text>
          <Form.Check
            inline
            label="Forced Search Term Quoting"
            type="checkbox"
            name="forceSearchTermQuoting"
            id="forceSearchTermQuoting"
            checked={forceSearchTermQuoting}
            onChange={() => setForceSearchTermQuoting((checked) => !checked)}
          />
          <Form.Check
            inline
            label="Relation Modifiers"
            type="checkbox"
            name="enableRelationModifiers"
            id="enableRelationModifiers"
            checked={enableRelationModifiers}
            onChange={() => setEnableRelationModifiers((checked) => !checked)}
          />
        </Form>
        <LexCQLQueryBuilder
          query={queryDebounced}
          cursorPos={cursorPos ?? undefined}
          onChange={handleQueryBuilderQueryChange}
          resources={resourcesForQueryBuilder}
          // feature flags
          enableRelationModifiers={enableRelationModifiers}
          forceSearchTermQuoting={forceSearchTermQuoting}
        />
      </>
    )
  }

  function renderQueryBuilder() {
    if (queryType === 'fcs') {
      return renderFCSQueryBuilder()
    }
    if (queryType === 'lex') {
      return renderLexCQLQueryBuilder()
    }
    return null
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
      <Modal.Header className="py-2" closeButton>
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
                    // remove cursor highlight if not in focus anymore
                    onBlur={() => setCursorPos(null)}
                    {...(queryInputEnhanced
                      ? {
                          as: ContentEditable,
                          queryType: queryType,
                          onChange: handleQueryInputChange,
                          onCursorChange: (start: number | null, end?: number) => {
                            if (start !== end && start !== null && end !== undefined) {
                              setCursorPos([start, end])
                            } else {
                              setCursorPos(start)
                            }
                          },
                        }
                      : {
                          onChange: (event) => {
                            handleQueryInputChange(event.target.value)
                            handleQueryInputCursorChange(event)
                          },
                          onKeyUp: handleQueryInputCursorChange,
                          onClick: handleQueryInputCursorChange,
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
        {/* resource warning message */}
        {unavailableResources > 0 && (
          <Container className="px-3">
            <Alert variant="warning" className="mb-0 mt-3" dismissible>
              For this query, {unavailableResources} of {resources?.length} resources will not be
              available! Certain layers are not supported by some resources.
              {unavailableResourcesByValue && (
                <ul className="mb-0">
                  {[...unavailableResourcesByValue.keys()].map((name) => (
                    <li>
                      <strong>{name}</strong>: {unavailableResourcesByValue.get(name)?.length}{' '}
                      unsupported resources
                    </li>
                  ))}
                </ul>
              )}
            </Alert>
          </Container>
        )}
        {/* query builder */}
        <Container className="px-3 pt-3">{renderQueryBuilder()}</Container>
      </Modal.Body>
      <Modal.Footer className="py-2">
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
