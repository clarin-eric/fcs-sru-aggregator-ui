import { useRef } from 'react'
import Badge from 'react-bootstrap/Badge'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Table from 'react-bootstrap/Table'
import Tooltip from 'react-bootstrap/Tooltip'

import { type ResourceSearchResult } from '@/utils/api'

import link45degIcon from 'bootstrap-icons/icons/link-45deg.svg?raw'

import './styles.css'

// --------------------------------------------------------------------------
// types

export interface ViewLexPlainProps {
  data: ResourceSearchResult
}

// --------------------------------------------------------------------------
// component

function ViewLexPlain({ data }: ViewLexPlainProps) {
  const ref = useRef(null)

  return (
    <>
      <Table hover responsive className="mb-0 results-lex-plain">
        <thead className="visually-hidden">
          <tr>
            <th scope="col">#</th>
            <th scope="col">References</th>
            <th scope="col">Result with Hit</th>
          </tr>
        </thead>
        <tbody>
          {data.kwics.map((kwic, index) => (
            <tr key={`${kwic.pid ?? kwic.reference ?? data.resource.id}-${index}`}>
              <td scope="row" className="result-idx text-end text-muted d-none d-sm-table-cell">
                {index + 1}
              </td>
              <td scope="row" className="result-refs">
                {kwic.reference && (
                  <a href={kwic.reference} className="matomo_link" target="_blank">
                    <i dangerouslySetInnerHTML={{ __html: link45degIcon }} />
                  </a>
                )}{' '}
                {kwic.pid && (
                  <OverlayTrigger
                    placement="auto-start"
                    container={ref}
                    delay={{ show: 250, hide: 400 }}
                    overlay={<Tooltip id={`ttip-${kwic.pid}-${index}`}>{kwic.pid}</Tooltip>}
                  >
                    {/* TODO: maybe with on mouse-over stay? see: https://github.com/react-bootstrap/react-bootstrap/issues/1622*/}
                    <Badge bg="secondary" className="pid-badge">
                      PID
                    </Badge>
                  </OverlayTrigger>
                )}
              </td>
              <td>
                {kwic.fragments.map((fragment, index) =>
                  fragment.hit && !fragment.hitKind ? (
                    <mark key={index}>
                      <strong>{fragment.text}</strong>
                    </mark>
                  ) : fragment.hit && fragment.hitKind ? (
                    <span
                      key={index}
                      className={`lex-hitkind-${fragment.hitKind}`}
                      title={`Annotated as "${fragment.hitKind.split('-').slice(1).join('-')}"`}
                    >
                      {fragment.text}
                    </span>
                  ) : (
                    <span key={index}>{fragment.text}</span>
                  )
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      {/* overlay mounting point to avoid flickering due to redrawing */}
      <div ref={ref} className="tooltip-mounting-point"></div>
    </>
  )
}

export default ViewLexPlain
