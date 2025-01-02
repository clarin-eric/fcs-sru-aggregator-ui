import { useEffect, useMemo, useState } from 'react'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import FloatingLabel from 'react-bootstrap/FloatingLabel'
import Form from 'react-bootstrap/Form'
import Modal from 'react-bootstrap/Modal'
import Row from 'react-bootstrap/Row'
import { useFuzzySearchList } from '@nozbe/microfuzz/react'

import { getResourceIDs, isResourceAvailableDueToSubResource, SORT_FNS } from '@/utils/resources'
import { type Resource } from '@/utils/api'
import {
  DEFAULT_RESOURCE_VIEW_GROUPING,
  DEFAULT_RESOURCE_VIEW_SORTING,
  DEFAULT_RESOURCE_VIEW_VISIBILITY,
  languageCodeToName as languageCodeToNameHelper,
  type LanguageCode2NameMap,
  type ResourceSelectionModalViewOptionSorting,
  type ResourceSelectionModalViewOptionVisibility,
  type ResourceSelectionModalViewOptionGrouping,
} from '@/utils/search'
import DebouncedFuzzySearchInput from './DebouncedFuzzySearchInput'
import ResourceSelector from './ResourceSelector'
import GroupedResources from './GroupedResources'

import './styles.css'

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

function ResourceSelectionModal({
  show,
  showGrouping,
  resources,
  languages,
  availableResources,
  selectedResources,
  onModalClose,
}: {
  show: boolean
  showGrouping?: ResourceSelectionModalViewOptionGrouping
  resources: Resource[]
  languages?: LanguageCode2NameMap
  availableResources: string[]
  selectedResources: string[]
  onModalClose: (result: { resourceIDs: string[]; action: string }) => void
}) {
  // resources
  const [selectedResourceIDs, setSelectedResourceIDs] = useState(
    selectedResources || availableResources
  )

  // view options
  const [viewResourcesVisibility, setViewResourcesVisibility] =
    useState<ResourceSelectionModalViewOptionVisibility>(DEFAULT_RESOURCE_VIEW_VISIBILITY)
  const [viewResourcesGrouping, setViewResourcesGrouping] =
    useState<ResourceSelectionModalViewOptionGrouping>(DEFAULT_RESOURCE_VIEW_GROUPING)
  const [viewResourcesSorting, setViewResourcesSorting] =
    useState<ResourceSelectionModalViewOptionSorting>(DEFAULT_RESOURCE_VIEW_SORTING)

  // fuzzy filter
  const [filter, setFilter] = useState('')

  // TODO: grouping
  const [resourcesGroupedByInstitute, setResourcesGroupedByInstitute] =
    useState<ResourcesGroupedByKeyMap>({})
  const [resourcesGroupedByLanguage, setResourcesGroupedByLanguage] =
    useState<ResourcesGroupedByKeyMap>({})

  useEffect(() => {
    if (showGrouping) setViewResourcesGrouping(showGrouping)
    // NOTE: remove `show` dependency to let modal keep last state when re-opened with same arguments
  }, [show, showGrouping])

  // to update modal on open
  useEffect(() => setSelectedResourceIDs(selectedResources), [selectedResources])

  // sort resources
  const sortedResources = resources
    .filter((resource) => availableResources.includes(resource.id))
    .toSorted(SORT_FNS[viewResourcesSorting])

  // TODO: what happens with nested resources?, we will only use root resources for now
  const filteredResources = useFuzzySearchList({
    list: sortedResources,
    // TODO: only search in "resource" mode for now
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
  // console.debug('filtered resources', filter, filteredResources)

  // TODO: memo with state required?
  useMemo(() => {
    console.debug('recompute groupings')

    const instituteToResourcesMap: ResourcesGroupedByKeyMap = {}
    const instituteToLanguagesMap: ResourcesGroupedByKeyMap = {}
    // resources.recurse((resource: Resource) => {}) // TODO: subresources with different grouping-key than parent?
    resources.forEach((resource: Resource) => {
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

  const resourcesInfo = {
    total: getResourceIDs(resources).length, // how many resources from API
    totalRoot: resources.length, // how many resources from API (root only)
    available: availableResources.length, // how many selectable due to other filters
    selected: selectedResourceIDs.length, // how many selected
    visible: getResourceIDs(filteredResources.map((annotResource) => annotResource.item)).length, // how many visible (due to fuzzy filtering)
    visibleRoot: filteredResources.length, // how many visible (due to fuzzy filtering), root only
  }

  // --------------------------------------------------------------
  // helper

  function languageCodeToName(code: string) {
    return languageCodeToNameHelper(code, languages)
  }

  function changeSelectedResourceIDs(resourceIDs: string[], isSelected: boolean) {
    const nextResourceIDs = selectedResourceIDs.filter((rid) => !resourceIDs.includes(rid))
    if (isSelected) {
      setSelectedResourceIDs([...nextResourceIDs, ...resourceIDs])
    } else {
      setSelectedResourceIDs(nextResourceIDs)
    }
  }

  // --------------------------------------------------------------
  // event handlers

  function handleClose(action: string) {
    onModalClose({
      resourceIDs: selectedResourceIDs,
      action: action,
    })
  }

  function handleViewOptionsVisibilityChange(event: React.ChangeEvent<HTMLSelectElement>) {
    // console.debug('visibility#onchange', viewResourcesVisibility, '=>', event.target.value)
    setViewResourcesVisibility(event.target.value as ResourceSelectionModalViewOptionVisibility)
  }

  function handleViewOptionsGroupingChange(event: React.ChangeEvent<HTMLSelectElement>) {
    // console.debug('grouping#onchange', viewResourcesGrouping, '=>', event.target.value)
    setViewResourcesGrouping(event.target.value as ResourceSelectionModalViewOptionGrouping)
  }

  function handleViewOptionsSortingChange(event: React.ChangeEvent<HTMLSelectElement>) {
    // console.debug('sorting#onchange', viewResourcesSorting, '=>', event.target.value)
    setViewResourcesSorting(event.target.value as ResourceSelectionModalViewOptionSorting)
  }

  function handleSelectAllClick() {
    // select all available resources
    setSelectedResourceIDs(availableResources)
  }

  function handleDeselectAllClick() {
    // deselect all resources
    setSelectedResourceIDs([])
  }

  function handleSelectVisibleClick() {
    // select only visible resources (i.e. resources left after fuzzy filtering)
    setSelectedResourceIDs(filteredResources.map((annotResource) => annotResource.item.id))
  }

  function handleResourceOnSelectClick(resource: Resource, selected: boolean) {
    changeSelectedResourceIDs(getResourceIDs([resource]), selected)
  }

  function handleGroupedResourcesOnSelectAllClick(resourcesInGroup: Resource[]) {
    changeSelectedResourceIDs(getResourceIDs(resourcesInGroup), true)
  }

  function handleGroupedResourcesOnDeselectAllClick(resourcesInGroup: Resource[]) {
    changeSelectedResourceIDs(getResourceIDs(resourcesInGroup), false)
  }

  // --------------------------------------------------------------
  // rendering

  function shouldResourceBeShown(resource: Resource) {
    // invisibile resources should not be shown
    if (!availableResources.includes(resource.id)) return false

    // check view mode
    if (viewResourcesVisibility === 'selected') {
      // hide all not-selected resources
      if (
        // resource self is not selected
        !selectedResourceIDs.includes(resource.id) &&
        // AND none of its children are selected
        !isResourceAvailableDueToSubResource(resource, (subResource: Resource) =>
          selectedResourceIDs.includes(subResource.id)
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
              selectedResourceIDs={selectedResourceIDs}
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
              onDeselectAllClick={handleGroupedResourcesOnDeselectAllClick}
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
              selectedResourceIDs={selectedResourceIDs}
              expanded={expanded}
              shouldBeShown={shouldResourceBeShown}
              onSelectAllClick={handleGroupedResourcesOnSelectAllClick}
              onExpandToggleClick={(expanded) =>
                (resourcesGroupedByLanguage[language].expanded = expanded)
              }
              onDeselectAllClick={handleGroupedResourcesOnDeselectAllClick}
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
        selectedResourceIDs={selectedResourceIDs}
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
                    disabled={viewResourcesGrouping !== 'resource' || filter.trim() !== ''}
                  >
                    <option value="title-up">Title (up)</option>
                    <option value="title-down">Title (down)</option>
                    <option value="institution-up">Institution (up)</option>
                    <option value="institution-down">Institution (down)</option>
                  </Form.Select>
                </FloatingLabel>
              </Col>
              <Col md={3} sm={12}>
                <DebouncedFuzzySearchInput
                  disabled={viewResourcesGrouping !== 'resource'}
                  value={filter}
                  onChange={(value) => setFilter(value)}
                />
              </Col>
              <Col
                md={3}
                sm={12}
                className="gap-1 d-inline-flex column-gap-2 justify-content-evenly"
              >
                <Button onClick={handleSelectAllClick}>Select all</Button>
                <Button
                  onClick={handleSelectVisibleClick}
                  disabled={viewResourcesVisibility !== 'all' || filter.trim() === ''}
                >
                  Select visible
                </Button>
                <Button onClick={handleDeselectAllClick}>Deselect all</Button>
              </Col>
            </Row>
          </Container>
        </Form>
        {/* info */}
        <p className="m-4 mb-0">
          {resourcesInfo.selected} / {resourcesInfo.visible}{' '}
          {resourcesInfo.available !== resourcesInfo.visible && <>({resourcesInfo.available})</>}{' '}
          resources selected.
          {/* {JSON.stringify(resourcesInfo, undefined, 2)} */}
        </p>
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
