import { Fragment } from 'react'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Modal from 'react-bootstrap/Modal'
import Row from 'react-bootstrap/Row'
import { useTranslation } from 'react-i18next'

import { QUERY_TYPE_MAP, QueryTypeID } from '@/utils/constants'
import { highlightSyntax } from '@/utils/prism'
import exampleQueries from './examples'

// --------------------------------------------------------------------------
// types

interface QuerySuggestionsModal {
  show: boolean
  queryTypes?: QueryTypeID[]
  onModalClose: (result: { query?: string; queryType?: QueryTypeID; action: string }) => void
}

// --------------------------------------------------------------------------
// component

function QuerySuggestionsModal({
  show,
  queryTypes: queryTypesProp,
  onModalClose,
}: QuerySuggestionsModal) {
  const { t } = useTranslation()

  const queryTypes: readonly QueryTypeID[] =
    queryTypesProp && queryTypesProp.length > 0 ? queryTypesProp : ['cql', 'fcs', 'lex']
  const requestedExamples = exampleQueries.filter((example) =>
    queryTypes.includes(example.queryType)
  )

  // if there are no examples queries for this set of queryTypes, then do not show anything
  if (requestedExamples.length === 0) {
    handleClose('abort')
    return null
  }

  // --------------------------------------------------------------
  // event handlers

  function handleClose(action: string) {
    onModalClose({ query: undefined, queryType: undefined, action: action })
  }

  function handleUseQueryClose(query: string, queryType: QueryTypeID) {
    // TODO: better action name? "use"
    onModalClose({ query: query, queryType: queryType, action: 'confirm' })
  }

  // --------------------------------------------------------------
  // rendering

  function renderExample(query: string, queryType: QueryTypeID, description?: string, nr?: number) {
    // TODO: get description from translation resource?
    return (
      <Row key={query}>
        <Col md={'auto'} className="d-none d-md-block">
          {nr && `${nr}.`}
        </Col>
        <Col className="d-flex flex-column">
          {description !== undefined && <div>{description}</div>}
          <div dangerouslySetInnerHTML={{ __html: highlightSyntax(query, queryType) }} />
        </Col>
        <Col md={'auto'} className="d-flex justify-content-end align-items-baseline">
          <Button size="sm" onClick={() => handleUseQueryClose(query, queryType)}>
            {t('search.suggestionsModal.buttonUseQuery')}
          </Button>
        </Col>
      </Row>
    )
  }

  return (
    <Modal
      id="search-query-suggestions-modal"
      show={show}
      onHide={() => handleClose('close')}
      size="xl"
      fullscreen="xl-down"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>{t('search.suggestionsModal.title')}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="px-0">
        {/* grouped by querytype or other category; each item with label/description, query, button to use */}
        {/* TODO: should use table instead? */}
        <Container fluid>
          {queryTypes.map((queryType) => {
            const examples = requestedExamples.filter((example) => example.queryType === queryType)

            // skip if no examples for this queryType
            if (examples.length === 0) return null

            return (
              <Fragment key={queryType}>
                <Row>
                  <Col>
                    <h4 className="border-bottom pb-2">
                      {t(`queryTypes.${queryType}.nameLong`, {
                        ns: 'common',
                        defaultValue: QUERY_TYPE_MAP[queryType]?.name ?? queryType.toUpperCase(),
                      })}
                    </h4>
                  </Col>
                </Row>
                {examples.map((example, index) =>
                  renderExample(example.query, example.queryType, example.description, index + 1)
                )}
              </Fragment>
            )
          })}
        </Container>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={() => handleClose('close')}>
          {t('search.suggestionsModal.buttonClose')}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default QuerySuggestionsModal
