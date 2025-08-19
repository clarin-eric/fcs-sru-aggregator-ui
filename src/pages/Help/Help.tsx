import Badge from 'react-bootstrap/Badge'
import Card from 'react-bootstrap/Card'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import { Helmet } from 'react-helmet-async'
import { Trans, useTranslation } from 'react-i18next'

import AppStore from '@/stores/app'

import eyeFillIcon from 'bootstrap-icons/icons/eye-fill.svg?raw'
import magicIcon from 'bootstrap-icons/icons/magic.svg?raw'

import arrowClockwiseIcon from 'bootstrap-icons/icons/arrow-clockwise.svg?raw'
import balloonIcon from 'bootstrap-icons/icons/balloon.svg?raw'
import bankIcon from 'bootstrap-icons/icons/bank.svg?raw'
import bracesIcon from 'bootstrap-icons/icons/braces.svg?raw'
import downloadIcon from 'bootstrap-icons/icons/download.svg?raw'
import envelopeArrowUpIcon from 'bootstrap-icons/icons/envelope-arrow-up.svg?raw'
import exclamationTriangleIcon from 'bootstrap-icons/icons/exclamation-triangle.svg?raw'
import eyeIcon from 'bootstrap-icons/icons/eye.svg?raw'
import gearIcon from 'bootstrap-icons/icons/gear-fill.svg?raw'
import highlightsIcon from 'bootstrap-icons/icons/highlights.svg?raw'
import houseDoorIcon from 'bootstrap-icons/icons/house-door.svg?raw'
import infoCircleIcon from 'bootstrap-icons/icons/info-circle.svg?raw'
import link45degIcon from 'bootstrap-icons/icons/link-45deg.svg?raw'
import personIcon from 'bootstrap-icons/icons/person.svg?raw'
import plusCircleIcon from 'bootstrap-icons/icons/plus-circle.svg?raw'
import repeatIcon from 'bootstrap-icons/icons/repeat.svg?raw'
import searchIcon from 'bootstrap-icons/icons/search.svg?raw'
import shieldCheckIcon from 'bootstrap-icons/icons/shield-check.svg?raw'
import shieldLockIcon from 'bootstrap-icons/icons/shield-lock.svg?raw'
import threeDotsIcon from 'bootstrap-icons/icons/three-dots.svg?raw'
import translateIcon from 'bootstrap-icons/icons/translate.svg?raw'
import xCircleIcon from 'bootstrap-icons/icons/x-circle.svg?raw'

// a mapping of all icons used
const iconMap: { [iconKey: string]: string } = {
  'arrow-clockwise': arrowClockwiseIcon,
  'envelope-arrow-up': envelopeArrowUpIcon,
  'exclamation-triangle': exclamationTriangleIcon,
  'eye-fill': eyeFillIcon,
  'gear-fill': gearIcon,
  'house-door': houseDoorIcon,
  'info-circle': infoCircleIcon,
  'link-45deg': link45degIcon,
  'three-dots': threeDotsIcon,
  balloon: balloonIcon,
  bank: bankIcon,
  download: downloadIcon,
  eye: eyeIcon,
  highlights: highlightsIcon,
  // TODO: adjust help texts to support no-querybuilder distributions
  magic: magicIcon,
  search: searchIcon,
  translate: translateIcon,
}
// optional icons based on build
if (import.meta.env.FEATURE_QUERY_BUILDER) {
  Object.assign(iconMap, {
    'plus-circle': plusCircleIcon,
    'x-circle': xCircleIcon,
    braces: bracesIcon,
    magic: magicIcon,
    repeat: repeatIcon,
  } as { [iconKey: string]: string })
}
if (import.meta.env.FEATURE_AUTHENTICATION) {
  Object.assign(iconMap, {
    'shield-check': shieldCheckIcon,
    'shield-lock': shieldLockIcon,
    person: personIcon,
  } as { [iconKey: string]: string })
}

interface I18NIconsLegendInfo {
  label: string
  description: string
  context?: string[]
}
interface I18NIconsLegendInfoList {
  [key: string]: I18NIconsLegendInfo
}

function Help() {
  const { t } = useTranslation()
  const appTitleHead = AppStore.getState().appTitleHead

  function renderIconsLegend() {
    const icons = t('icons', { ns: 'common', returnObjects: true }) as I18NIconsLegendInfoList
    const iconKeys = Object.getOwnPropertyNames(icons)
      .filter((iconKey) => Object.getOwnPropertyNames(iconMap).includes(iconKey))
      .toSorted((a, b) => {
        const idA = icons[a]
        const idB = icons[b]
        // no context at front
        if (!idA.context || idA.context.length === 0) return -1
        if (!idB.context || idB.context.length === 0) return +1
        // statistics at end
        if (idA.context.includes('statistics')) return +1
        if (idB.context.includes('statistics')) return -1
        // querybuilder before
        if (idA.context.includes('querybuilder')) return +1
        if (idB.context.includes('querybuilder')) return -1
        // otherwise alphabetical
        return idA.context[0].localeCompare(idB.context[0])
      })

    return (
      // <Container fluid>
      <Row xs={1} md={2} xl={3}>
        {iconKeys.map((iconKey) => {
          const context = t(`icons.${iconKey}.context`, {
            ns: 'common',
            returnObjects: true,
            defaultValue: [],
          }) as string[] | string
          return (
            <Col key={iconKey}>
              <Card className="border-0">
                <Card.Body>
                  <Card.Title>
                    <i
                      dangerouslySetInnerHTML={{ __html: iconMap[iconKey] }}
                      aria-hidden="true"
                      className="rounded border px-2 pb-1"
                    />{' '}
                    {t(`icons.${iconKey}.label`, { ns: 'common' })}
                  </Card.Title>
                  <Card.Text className="mb-0">
                    {t(`icons.${iconKey}.description`, { ns: 'common' })}
                  </Card.Text>
                  {context.length > 0 && (
                    <Card.Text className="mt-1">
                      {(context as string[]).map((c) => (
                        <Badge key={c}>{c}</Badge>
                      ))}
                    </Card.Text>
                  )}
                </Card.Body>
              </Card>
            </Col>
          )
        })}
      </Row>
      // </Container>
    )
  }

  return (
    <>
      <Helmet>
        <title>{appTitleHead} – Help</title>
      </Helmet>
      <Container className="my-4">
        <h1 className="h1">{t('help.title')}</h1>
        <h2 className="h2" id="performing-a-fcs-search-in-resources">
          {t('help.performSearch.title')}
        </h2>
        <p>
          <Trans i18nKey="help.performSearch.textBasicSearch" />
        </p>
        <p>
          <Trans
            i18nKey="help.performSearch.textAdvancedSearch"
            components={{
              iconMagicWand: (
                <i dangerouslySetInnerHTML={{ __html: magicIcon }} aria-hidden="true" />
              ),
            }}
          />
        </p>
        <p>
          <Trans
            i18nKey="help.performSearch.textLexicalSearch"
            components={{
              iconMagicWand: (
                <i dangerouslySetInnerHTML={{ __html: magicIcon }} aria-hidden="true" />
              ),
            }}
          />
        </p>
        <p>
          <Trans i18nKey="help.performSearch.textSearchProgress" />
        </p>
        <p>
          <Trans
            i18nKey="help.performSearch.textViewResource"
            components={{
              iconEye: <i dangerouslySetInnerHTML={{ __html: eyeFillIcon }} aria-hidden="true" />,
            }}
          />
        </p>
        <h2 className="h2" id="adjusting-search-criteria">
          {t('help.adjustSearchCriteria.title')}
        </h2>
        <p>
          <Trans i18nKey="help.adjustSearchCriteria.text" />
        </p>
        <p>
          <Trans i18nKey="help.adjustSearchCriteria.textOtherSearchTypes" />
        </p>
        <h2 className="h2" id="more-help">
          {t('help.moreHelp.title')}
        </h2>
        <p>
          <Trans
            i18nKey="help.moreHelp.text"
            components={[
              <a href="https://www.clarin.eu/content/content-search-tutorial">
                Content Search: Tutorial at CLARIN.eu
              </a>,
              <a title={t('help.contactTitle')} href={t('urls.contact', { ns: 'common' })}>
                CLARIN FCS Helpdesk
              </a>,
            ]}
          />
        </p>
        <h2 className="h2" id="more-help">
          {t('help.icons.title')}
        </h2>
        {renderIconsLegend()}
      </Container>
    </>
  )
}

export default Help
