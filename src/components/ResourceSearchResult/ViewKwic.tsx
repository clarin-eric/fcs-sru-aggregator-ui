import { useRef } from 'react'
import Badge from 'react-bootstrap/Badge'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Table from 'react-bootstrap/Table'
import Tooltip from 'react-bootstrap/Tooltip'

import type { ResourceSearchResult } from '@clarin-eric/fcs-sru-aggregator-api-adapter-typescript'

import link45degIcon from 'bootstrap-icons/icons/link-45deg.svg?raw'

import './styles.css'

// --------------------------------------------------------------------------
// types

export interface ViewKwicProps {
  data: ResourceSearchResult
}

// --------------------------------------------------------------------------
// component

function ViewKwic({ data }: ViewKwicProps) {
  const ref = useRef(null)

  return (
    <>
      <Table hover responsive className="mb-0 results-kwic">
        <thead className="visually-hidden">
          <tr>
            <th scope="col">#</th>
            <th scope="col">References</th>
            <th scope="col">Left Context</th>
            <th scope="col">Hit</th>
            <th scope="col">Right Context</th>
          </tr>
        </thead>
        <tbody>
          {data.records.map((record, index) => (
            <tr key={`${record.pid ?? record.ref ?? data.resource.id}-${index}`}>
              <td scope="row" className="result-idx text-end text-muted d-none d-sm-table-cell">
                {index + 1}
              </td>
              <td scope="row" className="result-refs">
                {record.ref && (
                  <a href={record.ref} className="matomo_link" target="_blank">
                    <i dangerouslySetInnerHTML={{ __html: link45degIcon }} />
                  </a>
                )}{' '}
                {record.pid && (
                  <OverlayTrigger
                    placement="auto-start"
                    container={ref}
                    delay={{ show: 250, hide: 400 }}
                    overlay={<Tooltip id={`ttip-${record.pid}-${index}`}>{record.pid}</Tooltip>}
                  >
                    {/* TODO: maybe with on mouse-over stay? see: https://github.com/react-bootstrap/react-bootstrap/issues/1622*/}
                    <Badge bg="secondary" className="pid-badge">
                      PID
                    </Badge>
                  </OverlayTrigger>
                )}
              </td>
              <td>{record.hits.left}</td>
              <td>
                {record.hits.keyword && (
                  <mark>
                    <strong>{record.hits.keyword}</strong>
                  </mark>
                )}
              </td>
              <td>{record.hits.right}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      {/* overlay mounting point to avoid flickering due to redrawing */}
      <div ref={ref} className="tooltip-mounting-point"></div>
    </>
  )
}

export default ViewKwic
