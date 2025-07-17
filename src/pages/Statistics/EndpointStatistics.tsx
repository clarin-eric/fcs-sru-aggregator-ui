import type { HighlightRanges } from '@nozbe/microfuzz'
import { Highlight } from '@nozbe/microfuzz/react'
import Alert from 'react-bootstrap/Alert'
import Badge from 'react-bootstrap/Badge'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Tooltip from 'react-bootstrap/Tooltip'
import { useTranslation } from 'react-i18next'
import slugify from 'react-slugify'
import { Fragment } from 'react/jsx-runtime'

import type { InstitutionEndpointInfo, StatisticsResourceInfo } from '@/utils/api'

import exclamationTriangleIcon from 'bootstrap-icons/icons/exclamation-triangle.svg?raw'
import eyeIcon from 'bootstrap-icons/icons/eye-fill.svg?raw'

import './styles.css'

// --------------------------------------------------------------------------
// component

function EndpointStatistics({
  url,
  statistics,
  validatorUrl,
  isScan,
}: {
  url: string
  statistics: InstitutionEndpointInfo & {
    matchEndpoint: HighlightRanges | null
    matchResources: (HighlightRanges | null)[]
  }
  validatorUrl: string | null
  isScan: boolean
}) {
  const { t, i18n } = useTranslation()

  const secondsFormatter = new Intl.NumberFormat(i18n.language, {
    style: 'unit',
    unit: 'second',
    unitDisplay: 'short',
  })

  function renderResourceWithInfos(resInfo: StatisticsResourceInfo, idx: number) {
    const resourceInner = (
      <Highlight text={resInfo.title} ranges={statistics.matchResources?.[idx] ?? null} />
    )

    if (resInfo.valid && resInfo.notes.length === 0) {
      return resourceInner
    }

    return (
      <OverlayTrigger
        placement="auto-start"
        delay={{ show: 250, hide: 400 }}
        overlay={
          <Tooltip id={`resource-info-warning-${resInfo.handle}`}>
            {!resInfo.valid && t('statistics.errors.notAvailableInAggregator')}
            {!resInfo.valid && resInfo.notes.length >= 1 && <hr className="mt-2 mb-1" />}
            {resInfo.notes.length === 1 ? (
              resInfo.notes[0]
            ) : resInfo.notes.length >= 1 ? (
              <ul className="text-start m-0 my-1 ps-3">
                {resInfo.notes.map((note, idx) => (
                  <li key={idx}>{note}</li>
                ))}
              </ul>
            ) : null}
          </Tooltip>
        }
      >
        <span>
          <i
            dangerouslySetInnerHTML={{ __html: exclamationTriangleIcon }}
            className="align-baseline me-2"
          />

          {!resInfo.valid ? <s>{resourceInner}</s> : resourceInner}
        </span>
      </OverlayTrigger>
    )
  }

  return (
    <div className="ps-sm-4 mt-sm-0 mt-2 pt-sm-0 pt-1" key={url}>
      <h4 className="h5" id={`${slugify(url)}-${isScan ? 'scan' : 'search'}`}>
        <Highlight text={url} ranges={statistics.matchEndpoint} />
        {validatorUrl && (
          <>
            {' '}
            <a href={`${validatorUrl}?url=${encodeURIComponent(url)}`}>
              <i dangerouslySetInnerHTML={{ __html: eyeIcon }} className="align-baseline ms-2" />
            </a>
          </>
        )}
      </h4>
      <dl className="ps-sm-4">
        <dt>{t('statistics.labels.fcsVersion')}</dt>
        <dd>{statistics.version}</dd>
        <dt>{t('statistics.labels.searchCapabilities')}</dt>
        <dd>{statistics.searchCapabilities.join(', ')}</dd>
        <dt>{t('statistics.labels.maxConcurrentScanRequests')}</dt>
        <dd>{statistics.maxConcurrentRequests}</dd>
        <dt>{t('statistics.labels.requestStatistics')}</dt>
        <dd className="mb-0">
          {t('statistics.labels.numberOfRequests', { count: statistics.numberOfRequests })}
        </dd>
        {statistics.avgQueueTime !== 0 && (
          <dd className="mb-0">
            {t('statistics.labels.queueTime', {
              avg: secondsFormatter.format(statistics.avgQueueTime),
              max: secondsFormatter.format(statistics.maxQueueTime),
            })}
          </dd>
        )}
        <dd>
          {t('statistics.labels.executionTime', {
            avg: secondsFormatter.format(statistics.avgExecutionTime),
            max: secondsFormatter.format(statistics.maxExecutionTime),
          })}
        </dd>
        {statistics.rootResources?.length > 0 && (
          <>
            <dt>{t('statistics.labels.resources')}</dt>
            <dd>
              {t('statistics.labels.numberOfRootResources', {
                count: statistics.rootResources.length,
              })}
            </dd>
            <dd>
              <ul>
                {statistics.rootResources.map((nameOrResInfo, idx) =>
                  typeof nameOrResInfo === 'string' ? (
                    <li key={nameOrResInfo}>
                      <Highlight
                        text={nameOrResInfo}
                        ranges={statistics.matchResources?.[idx] ?? null}
                      />
                    </li>
                  ) : (
                    <li key={nameOrResInfo.handle}>
                      {renderResourceWithInfos(nameOrResInfo, idx)}
                    </li>
                  )
                )}
              </ul>
            </dd>
          </>
        )}
        <Fragment>
          {Object.entries(statistics.diagnostics || {}).map(([reason, info]) => (
            <Alert variant="warning" key={reason} style={{ fontSize: '0.85rem' }}>
              <Alert.Heading style={{ fontSize: '1rem' }}>
                <Badge bg="warning">{info.counter}x</Badge>{' '}
                <span className="text-uppercase">{t('statistics.diagnostic.diagnostic')}</span>{' '}
                {info.diagnostic.message}
                {info.diagnostic.diagnostic && (
                  <>
                    {' - '}
                    <small>{info.diagnostic.diagnostic}</small>
                  </>
                )}
              </Alert.Heading>
              <p className="mb-0">
                {t('statistics.diagnostic.context')} <a href={info.context}>{info.context}</a>
              </p>
            </Alert>
          ))}
          {Object.entries(statistics.errors || {}).map(([reason, info]) => (
            <Alert variant="danger" key={reason} style={{ fontSize: '0.85rem' }}>
              <Alert.Heading style={{ fontSize: '1rem' }}>
                <Badge bg="danger">{info.counter}x</Badge>{' '}
                <span className="text-uppercase">{t('statistics.diagnostic.exception')}</span>{' '}
                {info.exception.message}
              </Alert.Heading>
              <p className="mb-0">
                {t('statistics.diagnostic.context')} <a href={info.context}>{info.context}</a>
              </p>
              {info.exception.cause && (
                <p className="mb-0">
                  {t('statistics.diagnostic.causedBy')} {info.exception.cause}
                </p>
              )}
            </Alert>
          ))}
        </Fragment>
      </dl>
    </div>
  )
}

export default EndpointStatistics
