import { useEffect, useMemo, useRef, useState } from 'react'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Collapse from 'react-bootstrap/Collapse'
import Container from 'react-bootstrap/Container'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import { useTranslation } from 'react-i18next'
import slugify from 'react-slugify'

import type { FuzzyMatchesByField } from '@/hooks/useFuzzySearchListWithHierarchy'
import type { Resource } from '@/utils/api'
import { getResourceIDs } from '@/utils/resources'
import ResourceSelector from './ResourceSelector'

// --------------------------------------------------------------------------

function GroupedResources({
  title,
  titleId,
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
  titleId: string
  resources: Resource[]
  selectedResourceIDs: string[]
  resourceScores?: Map<string, number>
  highlightings?: Map<string, FuzzyMatchesByField>
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

  // checkbox state
  const flatResourceIds = useMemo(() => getResourceIDs(resources), [resources])
  const flatResourcesSelected = flatResourceIds.filter((resourceId) =>
    selectedResourceIDs.includes(resourceId)
  )
  const isAllSelected = flatResourcesSelected.length === flatResourceIds.length
  const isNoneSelected = flatResourcesSelected.length === 0
  const isSomeSelected = !isAllSelected && !isNoneSelected
  const isSelected = isAllSelected || !isNoneSelected

  const inputRef = useRef<HTMLInputElement | null>(null)
  if (inputRef.current) inputRef.current.indeterminate = isSomeSelected

  // resources we show
  // NOTE: buttons to "(de)select all" will affect all resources regardless of visibility
  const visibleResources = useMemo(
    () =>
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
        : resources,
    [resourceScores, resources]
  )

  // hide if no visible resources?
  if (visibleResources.length === 0) return null

  // --------------------------------------------------------------
  // event handlers

  function handleToggleExpandButton() {
    setExpanded((isExpanded) => !isExpanded)
    onExpandToggleClick(!expanded) // TODO: how fast is this update above?
  }

  function handleToggleSelectionClick() {
    if (isSomeSelected || !isSelected) {
      onSelectAllClick(resources)
    } else {
      onDeselectAllClick(resources)
    }
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
        <Col md="auto" sm={1} className="mt-1" onClick={handleToggleSelectionClick}>
          <Form.Check
            id={`resource-group-selection-${slugify(titleId)}`}
            aria-label={t('search.results.resourceInfo.checkboxResourceAriaLabel', {
              title: titleId,
            })}
          >
            <Form.Check.Input
              checked={isSelected}
              ref={inputRef}
              onChange={() => {}} // to silence react warning, use handler from parent's parent
              // search.resourcesModal.grouped.buttonSelectAll
              // search.resourcesModal.grouped.buttonDeselectAll
            />
          </Form.Check>
        </Col>
        <Col md={9} sm={11}>
          <h3>{title}</h3>
        </Col>
        <Col
          md={2}
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
          {/* <Button size="sm" onClick={() => onSelectAllClick(resources)}>
            {t('search.resourcesModal.grouped.buttonSelectAll')}
          </Button>
          <Button size="sm" onClick={() => onDeselectAllClick(resources)}>
            {t('search.resourcesModal.grouped.buttonDeselectAll')}
          </Button> */}
        </Col>
      </Row>
      <Row className="px-3 ps-4 ms-4">
        <Col md={{ span: 11, offset: 0 }} sm={{ span: 11, offset: 1 }}>
          {renderResourceCounts()}
        </Col>
      </Row>
      {/* <Row className="px-3">
        <Col>
          {flatResourceIds.length} - {flatResourcesSelected.length} | {isAllSelected && 'all'} -{' '}
          {isNoneSelected && 'none'} - {isSomeSelected && 'some'} - {isSelected && 'isSelected'}
        </Col>
      </Row> */}
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
