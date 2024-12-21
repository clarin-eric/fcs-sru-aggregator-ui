import { useEffect, useMemo, useState } from 'react'
import Alert from 'react-bootstrap/Alert'
import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card'
import Col from 'react-bootstrap/Col'
import Collapse from 'react-bootstrap/Collapse'
import Container from 'react-bootstrap/Container'
import FloatingLabel from 'react-bootstrap/FloatingLabel'
import Form from 'react-bootstrap/Form'
import Modal from 'react-bootstrap/Modal'
import Row from 'react-bootstrap/Row'
import { useFuzzySearchList, Highlight } from '@nozbe/microfuzz/react'
import type { FuzzyMatches } from '@nozbe/microfuzz'

import Resources, { Resource } from '@/utils/resources'
import {
  DEFAULT_RESOURCE_VIEW_GROUPING,
  DEFAULT_RESOURCE_VIEW_SORTING,
  DEFAULT_RESOURCE_VIEW_VISIBILITY,
  LanguageCode2NameMap,
  languageCodeToName as languageCodeToNameHelper,
  ResourceSelectionModalViewOptionSorting,
  ResourceSelectionModalViewOptionVisibility,
  type ResourceSelectionModalViewOptionGrouping,
} from '@/utils/search'

import './ResourceSelectionModal.css'

import houseDoorIcon from 'bootstrap-icons/icons/house-door.svg?raw'
import bankIcon from 'bootstrap-icons/icons/bank.svg?raw'
import translateIcon from 'bootstrap-icons/icons/translate.svg?raw'

// --------------------------------------------------------------------------
// types

interface ResourcesGroupedByKeyMap {
  [key: string]: {
    expanded: boolean
    resources: Resource[]
  }
}

// --------------------------------------------------------------------------
// component

function ResourceSelector({
  resource,
  highlighting,
  shouldBeShown,
  onSelectClick,
  languageCodeToName,
}: {
  resource: Resource
  highlighting?: FuzzyMatches
  shouldBeShown: ((resource: Resource) => boolean) | boolean
  onSelectClick: (resource: Resource, selected: boolean) => void
  languageCodeToName: (code: string) => string
}) {
  const [expanded, setExpanded] = useState(false)
  const [selected, setSelected] = useState(false)
  const [showSubResources, setShowSubResources] = useState(false)

  useEffect(() => {
    // console.log('resource.selected', resource.selected, resource.id)
    if (resource.selected !== undefined) setSelected(resource.selected)
  }, [resource.selected])

  if (highlighting === undefined) highlighting = [null, null, null]

  // --------------------------------------------------------------

  // check if resource should even be rendered
  if (typeof shouldBeShown === 'function' && !shouldBeShown(resource)) {
    return null
  } else if (shouldBeShown === false) {
    return null
  }

  // --------------------------------------------------------------

  function handleToggleExpansionClick() {
    setExpanded((isExpanded) => !isExpanded)
  }

  function handleToggleSelectionClick() {
    console.log('selected', selected)

    onSelectClick(resource, !selected)
    // setSelected((isSelected) => !isSelected)
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

function GroupedResources({
  title,
  resources,
  expanded: expandedProp,
  shouldBeShown,
  onSelectClick,
  onExpandToggleClick,
  onSelectAllClick,
  onDeselectAllClick,
  languageCodeToName,
}: {
  title: React.ReactNode
  resources: Resource[]
  expanded: boolean
  shouldBeShown: ((resource: Resource) => boolean) | boolean
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

  // TODO: hide if no visible resources

  function handleToggleExpandButton() {
    setExpanded((isExpanded) => !isExpanded)
    onExpandToggleClick(!expanded) // TODO: how fast is this update above?
  }

  function renderResourceCounts() {
    return <>{resources.length} Resources</>
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
              shouldBeShown={shouldBeShown}
              onSelectClick={onSelectClick}
              languageCodeToName={languageCodeToName}
              key={resource.id}
            />
          ))}
        </Container>
      </Collapse>
    </Container>
  )
}

function ResourceSelectionModal({
  show,
  showGrouping,
  resources,
  languages,
  onModalClose,
}: {
  show: boolean
  showGrouping?: ResourceSelectionModalViewOptionGrouping
  resources: Resources
  languages?: LanguageCode2NameMap
  onModalClose: (result: { resourceIDs: string[]; action: string }) => void
}) {
  const [viewResourcesVisibility, setViewResourcesVisibility] =
    useState<ResourceSelectionModalViewOptionVisibility>(DEFAULT_RESOURCE_VIEW_VISIBILITY)
  const [viewResourcesGrouping, setViewResourcesGrouping] =
    useState<ResourceSelectionModalViewOptionGrouping>(DEFAULT_RESOURCE_VIEW_GROUPING)
  const [viewResourcesSorting, setViewResourcesSorting] =
    useState<ResourceSelectionModalViewOptionSorting>(DEFAULT_RESOURCE_VIEW_SORTING)

  const [filter, setFilter] = useState('')

  const [resourcesGroupedByInstitute, setResourcesGroupedByInstitute] =
    useState<ResourcesGroupedByKeyMap>({})
  const [resourcesGroupedByLanguage, setResourcesGroupedByLanguage] =
    useState<ResourcesGroupedByKeyMap>({})

  // TODO: sort resources
  const rawResources = useMemo(() => resources.resources, [resources])

  // TODO: what happens with nested resources?
  const filteredResources = useFuzzySearchList({
    list: rawResources,
    // TODO: only search on "resource" mode for now
    queryText: viewResourcesGrouping === 'resource' ? filter : '',
    getText: (item) => [
      item.title,
      item.institution,
      item.description,
      // ...item.languages.map((code) => languageCodeToNameHelper(code, languages)).toSorted(),
    ],
    // TODO: structure matches for better access?
    mapResultItem: ({ item, score, matches }) => ({ item, matches, score }),
  })
  console.debug('filtered', filter, filteredResources)

  useEffect(() => {
    if (showGrouping) setViewResourcesGrouping(showGrouping)
    // NOTE: remove `show` dependency to let modal keep last state when re-opened with same arguments
  }, [show, showGrouping])

  useMemo(() => {
    console.debug('recompute groupings')

    const instituteToResourcesMap: ResourcesGroupedByKeyMap = {}
    const instituteToLanguagesMap: ResourcesGroupedByKeyMap = {}
    // resources.recurse((resource: Resource) => {}) // TODO: subresources with different grouping-key than parent?
    resources.resources.forEach((resource: Resource) => {
      const institution = resource.institution
      if (!Object.getOwnPropertyNames(instituteToResourcesMap).includes(institution)) {
        instituteToResourcesMap[institution] = {
          // expanded: resourcesGroupedByInstitute?.[institution]?.expanded ?? true,
          expanded: true,
          resources: [],
        }
      }
      instituteToResourcesMap[institution].resources.push(resource)

      resource.languages.forEach((language: string) => {
        if (!Object.getOwnPropertyNames(instituteToLanguagesMap).includes(language)) {
          instituteToLanguagesMap[language] = {
            // expanded: resourcesGroupedByLanguage?.[language]?.expanded ?? true,
            expanded: true,
            resources: [],
          }
        }
        instituteToLanguagesMap[language].resources.push(resource)

        // TODO: handle children with different language than parent?
      })
    })

    setResourcesGroupedByInstitute(instituteToResourcesMap)
    setResourcesGroupedByLanguage(instituteToLanguagesMap)
  }, [resources])

  // --------------------------------------------------------------

  if (!resources) return null

  // --------------------------------------------------------------
  // state?

  // TODO: keep or remove? (counters are not intuitive enough)
  const resourcesInfo = {
    selected: 0,
    selectedIgnoreVisible: 0,
    selectable: 0, // how many available to be selected
    visible: 0, // TODO: should change by language/search ...
    available: 0, // how many resources from API
  }
  resources.recurse((resource: Resource) => {
    resourcesInfo.available += 1
    if (resource.visible) resourcesInfo.visible += 1
    if (resource.visible) resourcesInfo.selectable += 1
    if (resource.selected) resourcesInfo.selectedIgnoreVisible += 1
    if (resource.visible && resource.selected) resourcesInfo.selected += 1
  })

  // --------------------------------------------------------------
  // helper

  function languageCodeToName(code: string) {
    return languageCodeToNameHelper(code, languages)
  }

  // --------------------------------------------------------------
  // event handlers

  function handleClose(action: string) {
    onModalClose({ resourceIDs: [], action: action })
  }

  function handleViewOptionsVisibilityChange(event: React.ChangeEvent<HTMLSelectElement>) {
    console.log('visibility#onchange', viewResourcesVisibility, '=>', event.target.value)
    setViewResourcesVisibility(event.target.value as ResourceSelectionModalViewOptionVisibility)
    // resources.update()
  }

  function handleViewOptionsGroupingChange(event: React.ChangeEvent<HTMLSelectElement>) {
    console.debug('grouping#onchange', viewResourcesGrouping, '=>', event.target.value)
    setViewResourcesGrouping(event.target.value as ResourceSelectionModalViewOptionGrouping)
  }

  function handleViewOptionsSortingChange(event: React.ChangeEvent<HTMLSelectElement>) {
    console.log('sorting#onchange', viewResourcesSorting, '=>', event.target.value)
    setViewResourcesSorting(event.target.value as ResourceSelectionModalViewOptionSorting)
  }

  function handleSelectAllClick() {
    resources.recurse((resource: Resource) => {
      if (resource.visible) {
        resource.selected = true
      }
    })
    resources.update()
  }

  function handleDeselectAllClick() {
    resources.recurse((resource: Resource) => {
      if (resource.visible) {
        resource.selected = false
      }
    })
    resources.update()
  }

  function handleSelectVisibleClick() {
    console.debug('handleSelectVisibleClick')
  }

  function handleResourceOnSelectClick(resource: Resource, selected: boolean) {
    resources.recurseResource(resource, (r: Resource) => {
      r.selected = selected
    })
    resources.update()
  }

  function handleGroupedResourcesOnSelectAllClick(resourcesInGroup: Resource[]) {
    resources.recurseResources(resourcesInGroup, (resource: Resource) => {
      if (resource.visible) {
        resource.selected = true
      }
    })
    resources.update()
  }

  function handleGroupedResourcesOnDeelectAllClick(resourcesInGroup: Resource[]) {
    resources.recurseResources(resourcesInGroup, (resource: Resource) => {
      if (resource.visible) {
        resource.selected = false
      }
    })
    resources.update()
  }

  // --------------------------------------------------------------
  // rendering

  function shouldResourceBeShown(resource: Resource) {
    // invisibile resources should not be shown
    if (!resource.visible) return false

    // check view mode
    if (viewResourcesVisibility === 'selected') {
      // hide all not-selected resources
      if (
        !resources.isResourceVisibilityRequiredForChildren(
          resource,
          (resource: Resource) => !!resource.selected
        )
      ) {
        return false
      }
    }

    return true
  }

  function renderResources() {
    if (viewResourcesGrouping === 'institution') {
      return Object.entries(resourcesGroupedByInstitute)
        .toSorted()
        .map(
          ([institution, { expanded, resources }]: [
            string,
            { expanded: boolean; resources: Resource[] }
          ]) => (
            <GroupedResources
              title={
                <>
                  <i dangerouslySetInnerHTML={{ __html: bankIcon }} /> {institution}
                </>
              }
              resources={resources}
              expanded={expanded}
              shouldBeShown={shouldResourceBeShown}
              onSelectAllClick={handleGroupedResourcesOnSelectAllClick}
              onExpandToggleClick={(expanded) => {
                console.debug('expanded', expanded, institution)
                setResourcesGroupedByInstitute({
                  ...resourcesGroupedByInstitute,
                  [institution]: {
                    ...resourcesGroupedByInstitute[institution],
                    expanded: expanded,
                  },
                })
              }}
              onDeselectAllClick={handleGroupedResourcesOnDeelectAllClick}
              onSelectClick={handleResourceOnSelectClick}
              languageCodeToName={languageCodeToName}
              key={institution}
            />
          )
        )
    }
    if (viewResourcesGrouping === 'language') {
      return Object.entries(resourcesGroupedByLanguage)
        .toSorted()
        .map(
          ([language, { expanded, resources }]: [
            string,
            { expanded: boolean; resources: Resource[] }
          ]) => (
            <GroupedResources
              title={
                <>
                  <i dangerouslySetInnerHTML={{ __html: translateIcon }} />{' '}
                  {languageCodeToName(language)} [{language}]
                </>
              }
              resources={resources}
              expanded={expanded}
              shouldBeShown={shouldResourceBeShown}
              onSelectAllClick={handleGroupedResourcesOnSelectAllClick}
              onExpandToggleClick={(expanded) =>
                (resourcesGroupedByLanguage[language].expanded = expanded)
              }
              onDeselectAllClick={handleGroupedResourcesOnDeelectAllClick}
              onSelectClick={handleResourceOnSelectClick}
              languageCodeToName={languageCodeToName}
              key={language}
            />
          )
        )
    }
    return filteredResources.map(({ item: resource, matches }) => (
      <ResourceSelector
        resource={resource}
        highlighting={matches}
        shouldBeShown={shouldResourceBeShown}
        onSelectClick={handleResourceOnSelectClick}
        languageCodeToName={languageCodeToName}
        key={resource.id}
      />
    ))
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
        <Form className="px-3 pb-3 border-bottom" onSubmit={(event) => event.preventDefault()}>
          <Container>
            <Row className="d-sm-flex row-gap-2 justify-content-around">
              <Col md={2} sm={6}>
                <FloatingLabel label="View" controlId="resource-view-options-visibility">
                  <Form.Select
                    value={viewResourcesVisibility}
                    onChange={handleViewOptionsVisibilityChange}
                  >
                    <option value="all">All</option>
                    <option value="selected">Selected only</option>
                  </Form.Select>
                </FloatingLabel>
              </Col>
              <Col md={2} sm={6}>
                <FloatingLabel label="Group by" controlId="resource-view-options-grouping">
                  <Form.Select
                    value={viewResourcesGrouping}
                    onChange={handleViewOptionsGroupingChange}
                  >
                    <option value="resource">(Resource)</option>
                    <option value="institution">Institution</option>
                    <option value="language">Language</option>
                  </Form.Select>
                </FloatingLabel>
              </Col>
              <Col md={2} sm={6}>
                <FloatingLabel label="Sort by" controlId="resource-view-options-sorting">
                  <Form.Select
                    value={viewResourcesSorting}
                    onChange={handleViewOptionsSortingChange}
                  >
                    <option value="title-up">Title (up)</option>
                    <option value="title-down">Title (down)</option>
                    <option value="institution-up">Institution (up)</option>
                    <option value="institution-down">Institution (down)</option>
                  </Form.Select>
                </FloatingLabel>
              </Col>
              <Col md={3} sm={12}>
                <FloatingLabel
                  label="Resource filter query"
                  controlId="resource-view-options-filter"
                >
                  <Form.Control
                    type="text"
                    placeholder="Search for ..."
                    value={filter}
                    onChange={(event) => setFilter(event.target.value)}
                  />
                </FloatingLabel>
              </Col>
              <Col
                md={3}
                sm={12}
                className="gap-1 d-inline-flex column-gap-2 justify-content-evenly"
              >
                <Button onClick={handleSelectAllClick}>Select all</Button>
                {/* TODO: what did this one do? */}
                <Button
                  onClick={handleSelectVisibleClick}
                  disabled={viewResourcesVisibility !== 'all'}
                  className="d-none"
                >
                  Select visible
                </Button>
                <Button onClick={handleDeselectAllClick}>Deselect all</Button>
              </Col>
            </Row>
          </Container>
        </Form>
        {/* info */}
        <Alert variant="info" className="m-4 mb-0">
          Selected {resourcesInfo.selected} ({resourcesInfo.selectedIgnoreVisible}) /{' '}
          {resourcesInfo.selectable} resources. {resourcesInfo.visible} resources are shown.{' '}
          {resourcesInfo.available} resources are available.
        </Alert>
        {/* resources */}
        <Container className="px-3 pt-3">{renderResources()}</Container>
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
