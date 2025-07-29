import { Highlight } from '@nozbe/microfuzz/react'
import { useEffect, useState } from 'react'
import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import ToggleButton from 'react-bootstrap/ToggleButton'
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup'
import { useTranslation } from 'react-i18next'

import { type FuzzyMatchesByField } from '@/hooks/useFuzzySearchListWithHierarchy'
import { useLocaleStore } from '@/stores/locale'
import { type Resource } from '@/utils/api'
import {
  getBestFromMultilingualValuesTryByLanguage,
  getLanguagesFromResourceInfo,
} from '@/utils/resources'

import bankIcon from 'bootstrap-icons/icons/bank.svg?raw'
import houseDoorIcon from 'bootstrap-icons/icons/house-door.svg?raw'
import translateIcon from 'bootstrap-icons/icons/translate.svg?raw'

import './styles.css'

// --------------------------------------------------------------------------

function ResourceSelector({
  resource,
  selectedResourceIDs,
  highlighting,
  highlightings,
  shouldBeShown,
  localeForInfos,
  onSelectClick,
  languageCodeToName,
}: {
  resource: Resource
  selectedResourceIDs: string[]
  highlighting?: FuzzyMatchesByField
  highlightings?: Map<string, FuzzyMatchesByField>
  shouldBeShown: ((resource: Resource) => boolean) | boolean
  localeForInfos?: string | null
  onSelectClick: (resource: Resource, selected: boolean) => void
  languageCodeToName: (code: string) => string
}) {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)
  const [showSubResources, setShowSubResources] = useState(false)

  highlighting ??= highlightings?.get(resource.id) ?? new Map()

  const isSelected = selectedResourceIDs.includes(resource.id)

  // --------------------------------------------------------------

  const languageForResource = getLanguagesFromResourceInfo(resource)

  const userLocale = useLocaleStore((state) => state.locale)

  const [locale, setLocale] = useState(userLocale)
  // update from outside
  useEffect(() => {
    if (userLocale) setLocale(userLocale)
  }, [userLocale])
  useEffect(() => {
    if (localeForInfos) setLocale(localeForInfos)
  }, [localeForInfos])

  // --------------------------------------------------------------

  // check if resource should even be rendered
  if (typeof shouldBeShown === 'function' && !shouldBeShown(resource)) {
    return null
  } else if (shouldBeShown === false) {
    return null
  }

  // whether the expand/collapse button should be shown
  // also, whether the sub-resources div should be shown
  const shouldExpandToggleBeShown =
    typeof shouldBeShown === 'function'
      ? resource.subResources.some((subresource) => shouldBeShown(subresource))
      : true

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
            aria-label={t('search.results.resourceInfo.checkboxResourceAriaLabel', {
              title: resource.title,
            })}
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
            <Highlight
              text={getBestFromMultilingualValuesTryByLanguage(resource.title, locale) ?? ''}
              ranges={highlighting.get('title') ?? null}
            />{' '}
            {resource.landingPage && (
              <small>
                <a href={resource.landingPage} className="matomo_link" target="_blank">
                  {t('search.resourcesModal.resource.moreInformation')}{' '}
                  <i dangerouslySetInnerHTML={{ __html: houseDoorIcon }} />
                </a>
              </small>
            )}
          </h4>
          <p className={`mb-0 ${expanded ? '' : 'text-truncate'}`}>
            {getBestFromMultilingualValuesTryByLanguage(resource.description, locale) && (
              <Highlight
                text={
                  getBestFromMultilingualValuesTryByLanguage(resource.description, locale) ?? ''
                }
                ranges={highlighting.get('description') ?? null}
              />
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
          <Highlight
            text={getBestFromMultilingualValuesTryByLanguage(resource.institution, locale) ?? ''}
            ranges={highlighting.get('institution') ?? null}
          />
          <br />
          <i dangerouslySetInnerHTML={{ __html: translateIcon }} />{' '}
          {resource.languages.map(languageCodeToName).sort().join(', ')}
          {expanded && languageForResource.length > 1 && (
            <>
              <br />
              <ToggleButtonGroup
                type="radio"
                name={`resources-${resource.id}-info-languages`}
                defaultValue={locale}
                onChange={(language) => setLocale(language)}
                onClick={(e) => e.stopPropagation()}
                className="mt-2"
              >
                {languageForResource.toSorted().map((language) => (
                  <ToggleButton
                    variant="outline-secondary"
                    size="sm"
                    key={language}
                    id={`resources-${resource.id}-info-languages-${language}`}
                    value={language}
                    type="radio"
                  >
                    {language}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </>
          )}
        </Col>
        {/* sub resources view button */}
        {shouldExpandToggleBeShown && resource.subResources.length > 0 && (
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
                {t('search.resourcesModal.resource.toggleExpand', {
                  context: showSubResources ? 'collapse' : 'expand',
                  count: resource.subResources.length,
                })}
              </Button>
            </Col>
          </>
        )}
      </Row>
      {/* sub resources */}
      {shouldExpandToggleBeShown && showSubResources && (
        <Card className="ms-md-5 ms-sm-2 border-end-0 border-top-0 rounded-end-0 rounded-top-0">
          {resource.subResources.map((subResource: Resource) => (
            <ResourceSelector
              resource={subResource}
              highlightings={highlightings}
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
