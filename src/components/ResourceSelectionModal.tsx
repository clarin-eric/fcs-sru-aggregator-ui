// import { useEffect, useState } from 'react'
import Button from 'react-bootstrap/Button'
// import ButtonGroup from 'react-bootstrap/ButtonGroup'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import FloatingLabel from 'react-bootstrap/FloatingLabel'
import Form from 'react-bootstrap/Form'
import Modal from 'react-bootstrap/Modal'
import Row from 'react-bootstrap/Row'

import Resources from '@/utils/resources'

// --------------------------------------------------------------------------
// types

export type ResourceSelectionModalViewOptionGrouping = 'resource' | 'institution'

// --------------------------------------------------------------------------
// component

function ResourceSelectionModal({
  show,
  showGrouping,
  resources,
  searchResourceIDs,
  onModalClose,
}: {
  show: boolean
  showGrouping?: ResourceSelectionModalViewOptionGrouping
  resources: Resources
  searchResourceIDs?: string[]
  onModalClose: (result: { resourceIDs: string[]; action: string }) => void
}) {
  if (!resources) return null

  console.log('searchResourceIDs', searchResourceIDs)

  function handleClose(action: string) {
    onModalClose({ resourceIDs: [], action: action })
  }

  return (
    <Modal show={show} onHide={() => handleClose('close')} size="xl" fullscreen="xl-down" centered>
      <Modal.Header closeButton>
        <Modal.Title>Resources</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* resource viewing options */}
        <Form className="form-floating">
          <Container>
            <Row className="d-sm-flex row-gap-2 justify-content-around">
              <Col md={2} sm={6}>
                <FloatingLabel label="View" controlId="resource-view-options-selection">
                  <Form.Select>
                    <option>All</option>
                    <option>Selected only</option>
                  </Form.Select>
                </FloatingLabel>
              </Col>
              <Col md={2} sm={6}>
                <FloatingLabel label="Group by" controlId="resource-view-options-grouping">
                  <Form.Select value={showGrouping ?? 'resource'}>
                    <option value="resource">(Resource)</option>
                    <option value="institution">Institution</option>
                  </Form.Select>
                </FloatingLabel>
              </Col>
              <Col md={4} sm={12}>
                <FloatingLabel
                  label="Resource filter query"
                  controlId="resource-view-options-filter"
                >
                  <Form.Control type="text" placeholder="Search for ..." />
                </FloatingLabel>
              </Col>
              <Col
                md={4}
                sm={12}
                className="gap-1 d-inline-flex column-gap-2 justify-content-evenly"
              >
                <Button>Select all</Button>
                <Button>Select visible</Button>
                <Button>Deselect all</Button>
              </Col>
            </Row>
          </Container>
        </Form>
        {/* resources */}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={() => handleClose('confirm')}>
          Confirm and Close
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ResourceSelectionModal
