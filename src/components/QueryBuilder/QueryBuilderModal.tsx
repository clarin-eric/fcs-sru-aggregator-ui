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
import { FCSQueryBuilder, parseQuery } from './FCS'

import './styles.css'

import highlightsIcon from 'bootstrap-icons/icons/highlights.svg?raw'

// --------------------------------------------------------------------------
// types

interface QueryBuilderModalProps {
  show: boolean
  query?: string
  queryType: 'fcs'
  resources?: Resource[]
  delay?: number
  onModalClose: (result: { query: string; action: string }) => void
}

// --------------------------------------------------------------------------
// component

function QueryBuilderModal({
  show,
  query: queryProp,
  queryType,
  resources,
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

  // --------------------------------------------------------------
  // query syntax error handling

  const parsed = parseQuery(query)

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
        <Container className="px-3 pt-3">
          <FCSQueryBuilder query={queryDebounded} onChange={handleQueryBuilderQueryChange} />
        </Container>
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
