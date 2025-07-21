import type { FuzzyMatches } from '@nozbe/microfuzz'
import { useEffect, useState } from 'react'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Collapse from 'react-bootstrap/Collapse'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import { useTranslation } from 'react-i18next'

import { type Resource } from '@/utils/api'
import { getResourceIDs } from '@/utils/resources'
import ResourceSelector from './ResourceSelector'

// --------------------------------------------------------------------------

function GroupedResources({
  title,
  resources,
  selectedResourceIDs,
  resourceScores,
  highlightings,
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
  resourceScores?: Map<string, number>
  highlightings?: Map<string, FuzzyMatches>
  expanded: boolean
  shouldBeShown: ((resource: Resource) => boolean) | boolean
  localeForInfos?: string | null
  onSelectClick: (resource: Resource, selected: boolean) => void
  onExpandToggleClick: (expanded: boolean) => void
  onSelectAllClick: (resources: Resource[]) => void
  onDeselectAllClick: (resources: Resource[]) => void
  languageCodeToName: (code: string) => string
}) {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(expandedProp)

  useEffect(() => {
    // console.log('resource.selected', resource.selected, resource.id)
    setExpanded(expandedProp)
  }, [expandedProp])

  // resources we show
  // NOTE: buttons to "(de)select all" will affect all resources regardless of visibility
  const visibleResources =
    resourceScores !== undefined
      ? resources
          .filter((resource) => resourceScores.has(resource.id))
          .toSorted((a, b) => {
            const aScore = resourceScores.get(a.id)
            const bScore = resourceScores.get(b.id)
            if (aScore === bScore) return 0
            if (aScore === undefined) return 1
            if (bScore === undefined) return -1
            return aScore - bScore
          })
      : resources

  // hide if no visible resources?
  if (visibleResources.length === 0) return null

  // --------------------------------------------------------------
  // event handlers

  function handleToggleExpandButton() {
    setExpanded((isExpanded) => !isExpanded)
    onExpandToggleClick(!expanded) // TODO: how fast is this update above?
  }

  // --------------------------------------------------------------
  // rendering

  function renderResourceCounts() {
    const rootResources = resources.filter((resource) => !resource.rootResourceId)
    const numResources = getResourceIDs(rootResources).length
    const numResourcesRoot = rootResources.length
    const numResourcesSelected = getResourceIDs(rootResources).filter((rid) =>
      selectedResourceIDs.includes(rid)
    ).length

    return (
      t('search.resourcesModal.grouped.msgResources', {
        count: numResourcesRoot,
        nested: numResources - numResourcesRoot,
        context: numResources - numResourcesRoot ? 'nested' : null,
      }) +
      (numResourcesSelected !== numResources
        ? t('search.resourcesModal.grouped.msgResourcesSelected', { count: numResourcesSelected })
        : '')
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
            {t('search.resourcesModal.grouped.buttonExpand', {
              context: expanded ? 'hide' : 'show',
            })}
          </Button>
          <Button size="sm" onClick={() => onSelectAllClick(resources)}>
            {t('search.resourcesModal.grouped.buttonSelectAll')}
          </Button>
          <Button size="sm" onClick={() => onDeselectAllClick(resources)}>
            {t('search.resourcesModal.grouped.buttonDeselectAll')}
          </Button>
        </Col>
      </Row>
      <Row className="px-3">
        <Col>{renderResourceCounts()}</Col>
      </Row>
      <Collapse in={expanded}>
        <Container>
          {visibleResources.map((resource: Resource) => (
            <ResourceSelector
              resource={resource}
              highlightings={highlightings}
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
