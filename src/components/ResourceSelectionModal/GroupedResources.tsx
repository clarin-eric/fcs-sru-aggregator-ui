import { useEffect, useState } from 'react'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Collapse from 'react-bootstrap/Collapse'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'

import { type Resource } from '@/utils/api'
import { getResourceIDs } from '@/utils/resources'
import ResourceSelector from './ResourceSelector'

// --------------------------------------------------------------------------

function GroupedResources({
  title,
  resources,
  selectedResourceIDs,
  expanded: expandedProp,
  shouldBeShown,
  localeForInfos,
  onSelectClick,
  onExpandToggleClick,
  onSelectAllClick,
  onDeselectAllClick,
  languageCodeToName,
}: {
  title: React.ReactNode
  resources: Resource[]
  selectedResourceIDs: string[]
  expanded: boolean
  shouldBeShown: ((resource: Resource) => boolean) | boolean
  localeForInfos?: string | null
  onSelectClick: (resource: Resource, selected: boolean) => void
  onExpandToggleClick: (expanded: boolean) => void
  onSelectAllClick: (resources: Resource[]) => void
  onDeselectAllClick: (resources: Resource[]) => void
  languageCodeToName: (code: string) => string
}) {
  const [expanded, setExpanded] = useState(expandedProp)

  useEffect(() => {
    // console.log('resource.selected', resource.selected, resource.id)
    setExpanded(expandedProp)
  }, [expandedProp])

  // TODO: hide if no visible resources?

  // --------------------------------------------------------------
  // event handlers

  function handleToggleExpandButton() {
    setExpanded((isExpanded) => !isExpanded)
    onExpandToggleClick(!expanded) // TODO: how fast is this update above?
  }

  // --------------------------------------------------------------
  // rendering

  function renderResourceCounts() {
    const numResources = getResourceIDs(resources).length
    const numResourcesRoot = resources.length
    const numResourcesSelected = getResourceIDs(resources).filter((rid) =>
      selectedResourceIDs.includes(rid)
    ).length

    return (
      <>
        {numResourcesRoot}{' '}
        {numResources !== numResourcesRoot && <>(+ {numResources - numResourcesRoot} nested)</>}{' '}
        Resource{numResources !== 1 ? 's' : ''}
        {numResourcesSelected !== numResources && (
          <>
            , {numResourcesSelected} Resource{numResourcesSelected !== 1 ? 's' : ''} selected
          </>
        )}
      </>
    )
  }

  return (
    <Container className="border-bottom pb-2 mb-4 px-0">
      <Row className="px-3">
        <Col md={9} sm={12}>
          <h3>{title}</h3>
        </Col>
        <Col
          md={3}
          sm={12}
          className="gap-1 d-inline-flex column-gap-2 justify-content-evenly"
          style={{ height: 'fit-content' }}
        >
          <Button
            size="sm"
            variant="secondary"
            onClick={handleToggleExpandButton}
            aria-expanded={expanded}
          >
            {expanded ? 'Hide' : 'Show'} Resources
          </Button>
          <Button size="sm" onClick={() => onSelectAllClick(resources)}>
            Select All
          </Button>
          <Button size="sm" onClick={() => onDeselectAllClick(resources)}>
            Deselect All
          </Button>
        </Col>
      </Row>
      <Row className="px-3">
        <Col>{renderResourceCounts()}</Col>
      </Row>
      <Collapse in={expanded}>
        <Container>
          {resources.map((resource: Resource) => (
            <ResourceSelector
              resource={resource}
              selectedResourceIDs={selectedResourceIDs}
              shouldBeShown={shouldBeShown}
              onSelectClick={onSelectClick}
              languageCodeToName={languageCodeToName}
              localeForInfos={localeForInfos}
              key={resource.id}
            />
          ))}
        </Container>
      </Collapse>
    </Container>
  )
}

export default GroupedResources
