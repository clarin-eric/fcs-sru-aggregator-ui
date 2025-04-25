import type { HighlightRanges } from '@nozbe/microfuzz'
import { Highlight } from '@nozbe/microfuzz/react'
import Alert from 'react-bootstrap/Alert'
import Badge from 'react-bootstrap/Badge'
import slugify from 'react-slugify'
import { Fragment } from 'react/jsx-runtime'

import type { InstitutionEndpointInfo } from '@/utils/api'

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
        <dt>FCS Version</dt>
        <dd>{statistics.version}</dd>
        <dt>Search capabilities</dt>
        <dd>{statistics.searchCapabilities.join(', ')}</dd>
        <dt>Max concurrent scan requests</dt>
        <dd>{statistics.maxConcurrentRequests}</dd>
        <dt>Request statistics</dt>
        <dd className="mb-0">{statistics.numberOfRequests} request(s)</dd>
        {statistics.avgQueueTime !== 0 && (
          <dd className="mb-0">
            Queue time (in seconds): average: {statistics.avgQueueTime}, max:{' '}
            {statistics.maxQueueTime}
          </dd>
        )}
        <dd>
          Execution time (in seconds): average: {statistics.avgExecutionTime}, max:{' '}
          {statistics.maxExecutionTime}
        </dd>
        {statistics.rootResources?.length > 0 && (
          <>
            <dt>Resources</dt>
            <dd>{statistics.rootResources.length} root resources</dd>
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
                      {!nameOrResInfo.valid ? (
                        <s>
                          <Highlight
                            text={nameOrResInfo.title}
                            ranges={statistics.matchResources?.[idx] ?? null}
                          />
                          {/* TODO: maybe add exclamation icon, why invalid */}
                        </s>
                      ) : (
                        <Highlight
                          text={nameOrResInfo.title}
                          ranges={statistics.matchResources?.[idx] ?? null}
                        />
                      )}
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
                <span className="text-uppercase">Diagnostic:</span> {info.diagnostic.message}
                {info.diagnostic.diagnostic && (
                  <>
                    {' - '}
                    <small>{info.diagnostic.diagnostic}</small>
                  </>
                )}
              </Alert.Heading>
              <p className="mb-0">
                Context: <a href={info.context}>{info.context}</a>
              </p>
            </Alert>
          ))}
          {Object.entries(statistics.errors || {}).map(([reason, info]) => (
            <Alert variant="danger" key={reason} style={{ fontSize: '0.85rem' }}>
              <Alert.Heading style={{ fontSize: '1rem' }}>
                <Badge bg="danger">{info.counter}x</Badge>{' '}
                <span className="text-uppercase">Exception:</span> {info.exception.message}
              </Alert.Heading>
              <p className="mb-0">
                Context: <a href={info.context}>{info.context}</a>
              </p>
              {info.exception.cause && <p className="mb-0">Caused by: {info.exception.cause}</p>}
            </Alert>
          ))}
        </Fragment>
      </dl>
    </div>
  )
}

export default EndpointStatistics
