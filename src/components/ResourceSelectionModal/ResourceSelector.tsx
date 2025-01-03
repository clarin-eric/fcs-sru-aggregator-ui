import type { FuzzyMatches } from '@nozbe/microfuzz'
import { Highlight } from '@nozbe/microfuzz/react'
import { useState } from 'react'
import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'

import { type Resource } from '@/utils/api'

import './styles.css'

import bankIcon from 'bootstrap-icons/icons/bank.svg?raw'
import houseDoorIcon from 'bootstrap-icons/icons/house-door.svg?raw'
import translateIcon from 'bootstrap-icons/icons/translate.svg?raw'

// --------------------------------------------------------------------------

function ResourceSelector({
  resource,
  selectedResourceIDs,
  highlighting,
  shouldBeShown,
  onSelectClick,
  languageCodeToName,
}: {
  resource: Resource
  selectedResourceIDs: string[]
  highlighting?: FuzzyMatches
  shouldBeShown: ((resource: Resource) => boolean) | boolean
  onSelectClick: (resource: Resource, selected: boolean) => void
  languageCodeToName: (code: string) => string
}) {
  const [expanded, setExpanded] = useState(false)
  const [showSubResources, setShowSubResources] = useState(false)

  if (highlighting === undefined) highlighting = [null, null, null]

  const isSelected = selectedResourceIDs.includes(resource.id)

  // --------------------------------------------------------------

  // check if resource should even be rendered
  if (typeof shouldBeShown === 'function' && !shouldBeShown(resource)) {
    return null
  } else if (shouldBeShown === false) {
    return null
  }

  // --------------------------------------------------------------

  function handleToggleExpansionClick() {
    // stop de-expansion toggle if user is selecting
    // see: https://stackoverflow.com/a/78044274/9360161
    if (expanded && document.getSelection()?.type === 'Range') return
    setExpanded((isExpanded) => !isExpanded)
  }

  function handleToggleSelectionClick() {
    onSelectClick(resource, !isSelected)
  }

  function handleToggleShowSubResourcesClick() {
    setShowSubResources((doShow) => !doShow)
  }

  // --------------------------------------------------------------

  return (
    <>
      <Row className={`p-2 m-1 ${expanded && 'border-bottom'}`}>
        <Col md="auto" sm={1} onClick={handleToggleSelectionClick}>
          <Form.Check
            id={`resource-selection-${resource.id}`}
            aria-label={`Checkbox for resource: ${resource.title}`}
          >
            <Form.Check.Input
              checked={isSelected}
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
            <Highlight text={resource.title} ranges={highlighting[0]} />{' '}
            {resource.landingPage && (
              <small>
                <a href={resource.landingPage} target="_blank">
                  More information <i dangerouslySetInnerHTML={{ __html: houseDoorIcon }} />
                </a>
              </small>
            )}
          </h4>
          <p className={`mb-0 ${expanded ? '' : 'text-truncate'}`}>
            {resource.description && (
              <Highlight text={resource.description} ranges={highlighting[2]} />
            )}
          </p>
        </Col>
        <Col
          md={{ span: 3, offset: 0 }}
          sm={{ span: 11, offset: 1 }}
          className={`${expanded ? '' : ' text-truncate'}`}
          onClick={handleToggleExpansionClick}
        >
          <i dangerouslySetInnerHTML={{ __html: bankIcon }} />{' '}
          <Highlight text={resource.institution} ranges={highlighting[1]} />
          <br />
          <i dangerouslySetInnerHTML={{ __html: translateIcon }} />{' '}
          {resource.languages.map(languageCodeToName).sort().join(', ')}
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
                {/* TODO: hint if view-selected-only and no children are selected --> empty */}
                {showSubResources ? 'Collapse' : 'Expand'} ({resource.subResources.length}{' '}
                subresources)
              </Button>
            </Col>
          </>
        )}
      </Row>
      {/* sub resources */}
      {showSubResources && (
        <Card className="ms-md-5 ms-sm-2 border-end-0 border-top-0 rounded-end-0 rounded-top-0">
          {resource.subResources.map((subResource: Resource) => (
            <ResourceSelector
              resource={subResource}
              selectedResourceIDs={selectedResourceIDs}
              shouldBeShown={shouldBeShown}
              onSelectClick={onSelectClick}
              languageCodeToName={languageCodeToName}
              key={subResource.id}
            />
          ))}
        </Card>
      )}
    </>
  )
}

export default ResourceSelector
