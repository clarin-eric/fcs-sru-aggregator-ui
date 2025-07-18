import { useFuzzySearchList } from '@nozbe/microfuzz/react'
import { useEffect, useMemo, useState } from 'react'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import FloatingLabel from 'react-bootstrap/FloatingLabel'
import Form from 'react-bootstrap/Form'
import Modal from 'react-bootstrap/Modal'
import Row from 'react-bootstrap/Row'
import ToggleButton from 'react-bootstrap/ToggleButton'
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup'
import { useTranslation } from 'react-i18next'

import DebouncedFuzzySearchInput from '@/components/DebouncedFuzzySearchInput'
import { useLocaleStore } from '@/stores/locale'
import { type Resource } from '@/utils/api'
import {
  getBestFromMultilingualValuesTryByLanguage,
  getLanguagesFromResourceInfo,
  getResourceIDs,
  isResourceAvailableDueToSubResource,
  SORT_FNS,
} from '@/utils/resources'
import {
  DEFAULT_RESOURCE_VIEW_GROUPING,
  DEFAULT_RESOURCE_VIEW_SORTING,
  DEFAULT_RESOURCE_VIEW_VISIBILITY,
  languageCodeToName as languageCodeToNameHelper,
  type LanguageCode2NameMap,
  type ResourceSelectionModalViewOptionGrouping,
  type ResourceSelectionModalViewOptionSorting,
  type ResourceSelectionModalViewOptionVisibility,
} from '@/utils/search'
import GroupedResources from './GroupedResources'
import ResourceSelector from './ResourceSelector'

import bankIcon from 'bootstrap-icons/icons/bank.svg?raw'
import translateIcon from 'bootstrap-icons/icons/translate.svg?raw'

import './styles.css'

// --------------------------------------------------------------------------
// types

interface ResourcesGroupedByKeyMap {
  [key: string]: {
    expanded: boolean
    resources: Resource[]
  }
}

interface ResourceSelectionModalProps {
  show: boolean
  showGrouping?: ResourceSelectionModalViewOptionGrouping
  resources: Resource[]
  languages?: LanguageCode2NameMap
  availableResources: string[]
  selectedResources: string[]
  onModalClose: (result: { resourceIDs: string[]; action: string }) => void
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
}: ResourceSelectionModalProps) {
  const { t } = useTranslation()
  // locale/language information
  const userLocale = useLocaleStore((state) => state.locale)
  const [locale, setLocale] = useState(userLocale)
  useEffect(() => {
    if (userLocale) setLocale(userLocale)
  }, [userLocale])

  const langNames = new Intl.DisplayNames([userLocale, 'en'], { type: 'language' })

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

  // list of nested resources (IDs)
  const resourceChildrenIDs = resources
    .map((resource) => resource.subResources.map((resource) => resource.id))
    .flat()

  // sort resources
  const sortedResources = resources
    .filter((resource) => availableResources.includes(resource.id))
    .toSorted(SORT_FNS[viewResourcesSorting])

  // languages for resource infos (title/description/institution)
  const resourceInfoLanguages = sortedResources
    .map((resource) => getLanguagesFromResourceInfo(resource))
    .flat()
  const resourceInfoLanguagesGrouped = resourceInfoLanguages.reduce(
    (acc, cur) => acc.set(cur, (acc.get(cur) ?? 0) + 1),
    new Map()
  )

  // TODO: what happens with nested resources?, we will only use root resources for now
  const filteredResources = useFuzzySearchList({
    list: sortedResources,
    // TODO: only search in "resource" mode for now
    queryText: viewResourcesGrouping === 'resource' ? filter : '',
    getText: (item) => [
      getBestFromMultilingualValuesTryByLanguage(item.title, locale),
      getBestFromMultilingualValuesTryByLanguage(item.institution, locale),
      getBestFromMultilingualValuesTryByLanguage(item.description, locale),
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
      const institution =
        getBestFromMultilingualValuesTryByLanguage(resource.institution, locale) ?? ''
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
  }, [resources, locale])

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
    return languageCodeToNameHelper(code, languages, {
      defaultAnyLanguage: t('languageCodeToName.any', { ns: 'common' }),
      defaultUnknownLanguage: t('languageCodeToName.unknown', { ns: 'common' }),
    })
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

  function isResourceRoot(resource: Resource) {
    return !resourceChildrenIDs.includes(resource.id)
  }

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
              isResourceRoot={isResourceRoot}
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
              localeForInfos={locale}
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
              isResourceRoot={isResourceRoot}
              expanded={expanded}
              shouldBeShown={shouldResourceBeShown}
              onSelectAllClick={handleGroupedResourcesOnSelectAllClick}
              onExpandToggleClick={(expanded) =>
                (resourcesGroupedByLanguage[language].expanded = expanded)
              }
              onDeselectAllClick={handleGroupedResourcesOnDeselectAllClick}
              onSelectClick={handleResourceOnSelectClick}
              languageCodeToName={languageCodeToName}
              localeForInfos={locale}
              key={language}
            />
          )
        )
    }
    // TODO: filter out resources that appear as sub-resource?
    return (
      filteredResources
        // TODO: do we want to restore the hierarchy? -- we need to forward the highlighting ...
        // .concat(filteredResourcesParents)
        // .toSorted((a, b) => a.score - b.score)
        // .filter(({ item }) => {
        //   if (isResourceRoot !== undefined && isResourceRoot(item)) return true
        //   // return shouldResourceBeShown(item)
        //   // return true
        //   return false
        // })
        .filter(({ item }) => {
          if (filter === '') {
            return isResourceRoot !== undefined && isResourceRoot(item)
          }
          return true
        })
        .map(({ item: resource, matches }) => (
          <ResourceSelector
            resource={resource}
            selectedResourceIDs={selectedResourceIDs}
            highlighting={matches}
            shouldBeShown={shouldResourceBeShown}
            onSelectClick={handleResourceOnSelectClick}
            languageCodeToName={languageCodeToName}
            localeForInfos={locale}
            key={resource.id}
          />
        ))
    )
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
        <Modal.Title>{t('search.resourcesModal.title')}</Modal.Title>
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
                <FloatingLabel
                  label="Resource filter query"
                  controlId="resource-view-options-filter"
                >
                  <DebouncedFuzzySearchInput
                    disabled={viewResourcesGrouping !== 'resource'}
                    value={filter}
                    onChange={(value) => setFilter(value)}
                  />
                </FloatingLabel>
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
            {resourceInfoLanguagesGrouped.size > 1 && (
              <Form.Group as={Row} controlId="resource-info-language" className="mt-2">
                <Form.Label column sm="auto" style={{ fontSize: '0.875rem' }}>
                  {t('search.resourcesModal.labelChangeResourceInfoLanguage')}
                </Form.Label>
                <Col sm="auto">
                  <ToggleButtonGroup
                    type="radio"
                    name="resource-info-languages"
                    defaultValue={locale}
                    onChange={(language) => setLocale(language)}
                  >
                    {Array.from(resourceInfoLanguagesGrouped.entries())
                      .toSorted()
                      .map(([language, amount]) => (
                        <ToggleButton
                          size="sm"
                          key={language}
                          id={`resource-info-languages-${language}`}
                          value={language}
                          variant="secondary"
                          title={t('search.resourcesModal.buttonChangeResourceInfoLanguageTitle', {
                            count: amount,
                            language,
                            languageName: langNames.of(language),
                          })}
                        >
                          {langNames.of(language)} <sup>{language}</sup>
                        </ToggleButton>
                      ))}
                  </ToggleButtonGroup>
                </Col>
              </Form.Group>
            )}
          </Container>
        </Form>
        {/* info */}
        <p className="m-4 mb-0">
          {t('search.resourcesModal.msgResourcesSelected', {
            count: resourcesInfo.selected,
            total: resourcesInfo.visible,
            available: resourcesInfo.available,
            context: resourcesInfo.available !== resourcesInfo.visible ? 'available' : null,
          })}
        </p>
        {/* resources */}
        <Container className="px-3 pt-3">{renderResources()}</Container>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={() => handleClose('confirm')}>
          {t('search.resourcesModal.buttonConfirm')}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ResourceSelectionModal
