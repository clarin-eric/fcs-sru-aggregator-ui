import { useEffect, useState } from 'react'
import Button from 'react-bootstrap/Button'
// import ButtonGroup from 'react-bootstrap/ButtonGroup'
import Card from 'react-bootstrap/Card'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import FloatingLabel from 'react-bootstrap/FloatingLabel'
import Form from 'react-bootstrap/Form'
import Modal from 'react-bootstrap/Modal'
import Row from 'react-bootstrap/Row'

import Resources, { Resource } from '@/utils/resources'
import {
  DEFAULT_RESOURCE_VIEW_GROUPING,
  type ResourceSelectionModalViewOptionGrouping,
} from '@/utils/search'

import './ResourceSelectionModal.css'

import houseDoorIcon from 'bootstrap-icons/icons/house-door.svg'
import bankIcon from 'bootstrap-icons/icons/bank.svg'
import translateIcon from 'bootstrap-icons/icons/translate.svg'

// --------------------------------------------------------------------------
// types

// --------------------------------------------------------------------------
// component

function ResourceSelector({
  resource,
  recurseResource,
}: {
  resource: Resource
  recurseResource: (resource: Resource, fn: (resource: Resource) => boolean | void) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [selected, setSelected] = useState(false)
  const [showSubResources, setShowSubResources] = useState(false)

  useEffect(() => {
    // console.log('resource.selected', resource.selected, resource.id)
    if (resource.selected !== undefined) setSelected(resource.selected)
  }, [resource.selected, resource])

  function handleToggleExpansionClick() {
    setExpanded((isExpanded) => !isExpanded)
  }

  function handleToggleSelectionClick() {
    // console.log('selected', selected)

    const changeTo = !selected
    recurseResource(resource, (r: Resource) => {
      r.selected = changeTo
    })

    setSelected((isSelected) => !isSelected)
  }

  function handleToggleShowSubResourcesClick() {
    setShowSubResources((doShow) => !doShow)
  }

  return (
    <>
      <Row className={`p-2 m-1 ${expanded && 'border-bottom'}`}>
        <Col md="auto" sm={1} onClick={handleToggleSelectionClick}>
          <Form.Check
            id={`resource-selection-${resource.id}`}
            aria-label={`Checkbox for resource: ${resource.title}`}
          >
            <Form.Check.Input
              checked={selected}
              onChange={() => {}} // to silence react warning, use handler from parent's parent
            />
          </Form.Check>
        </Col>
        <Col
          md={8}
          sm={11}
          className={`mb-sm-2 ${expanded ? '' : 'text-truncate'}`}
          // TODO: only if we want to have a larger clickable area for the selection checkbox, not so nice when we have sub-resources ...
          onClick={handleToggleExpansionClick}
        >
          <h4 className={`h5 ${expanded ? '' : 'text-truncate'}`}>
            {resource.title}{' '}
            {resource.landingPage && (
              <small>
                <a href={resource.landingPage} target="_blank">
                  More information <img src={houseDoorIcon} />
                </a>
              </small>
            )}
          </h4>
          <p className={`mb-0 ${expanded ? '' : 'text-truncate'}`}>{resource.description}</p>
        </Col>
        <Col
          md={{ span: 3, offset: 0 }}
          sm={{ span: 11, offset: 1 }}
          className={`${expanded ? '' : ' text-truncate'}`}
          onClick={handleToggleExpansionClick}
        >
          <img src={bankIcon} /> {resource.institution}
          <br />
          <img src={translateIcon} /> {resource.languages.join(', ')}
        </Col>
        {/* sub resources view button */}
        {resource.subResources.length > 0 && (
          <>
            <div className="w-100"></div>
            <Col md="auto" sm={1} style={{ width: '2.8rem' }}></Col>
            <Col md={{ span: 8, offset: 0 }} sm={{ span: 11, offset: 1 }}>
              <Button
                variant="link"
                size="sm"
                className="ps-0"
                onClick={handleToggleShowSubResourcesClick}
              >
                {showSubResources ? 'Collapse' : 'Expand'} ({resource.subResources.length}{' '}
                subresources)
              </Button>
            </Col>
          </>
        )}
      </Row>
      {/* sub resources */}
      {showSubResources && (
        <Card className="ms-5 ms-sm-2 border-end-0 border-top-0 rounded-end-0 rounded-top-0">
          {resource.subResources.map((subResource: Resource) => (
            <ResourceSelector
              resource={subResource}
              recurseResource={recurseResource}
              key={subResource.id}
            />
          ))}
        </Card>
      )}
    </>
  )
}

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
  const [viewResourcesGrouping, setViewResourcesGrouping] =
    useState<ResourceSelectionModalViewOptionGrouping>(DEFAULT_RESOURCE_VIEW_GROUPING)
  const viewSelectedOnly = true

  useEffect(() => {
    if (showGrouping) setViewResourcesGrouping(showGrouping)
    // NOTE: remove `show` dependency to let modal keep last state when re-opened with same arguments
  }, [show, showGrouping])

  if (!resources) return null

  function handleClose(action: string) {
    onModalClose({ resourceIDs: [], action: action })
  }

  return (
    <Modal
      id="resource-selection-modal"
      show={show}
      onHide={() => handleClose('close')}
      size="xl"
      fullscreen="xl-down"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Resources</Modal.Title>
      </Modal.Header>
      <Modal.Body className="px-0">
        {/* resource viewing options */}
        <Form className="px-3 pb-3 border-bottom">
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
                  <Form.Select
                    value={viewResourcesGrouping}
                    onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
                      console.log('onchange', viewResourcesGrouping, '=>', event.target.value)
                      setViewResourcesGrouping(
                        event.target.value as ResourceSelectionModalViewOptionGrouping
                      )
                    }}
                  >
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
        <Container className="px-3 pt-3">
          {resources.resources
            .filter(
              viewSelectedOnly ? (resource: Resource) => resource.selected ?? true : () => true
            )
            .map((resource: Resource) => (
              <ResourceSelector
                resource={resource}
                recurseResource={resources.recurseResource.bind(resources)}
                key={resource.id}
              />
            ))}
          {/* {JSON.stringify(resources)} */}
        </Container>
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
