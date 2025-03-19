import { useRef } from 'react'
import Badge from 'react-bootstrap/Badge'
import Card from 'react-bootstrap/Card'
import ListGroup from 'react-bootstrap/ListGroup'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Tooltip from 'react-bootstrap/Tooltip'

import { type ResourceSearchResult } from '@/utils/api'

import './styles.css'

import link45degIcon from 'bootstrap-icons/icons/link-45deg.svg?raw'

// --------------------------------------------------------------------------
// types

export interface ViewLexProps {
  data: ResourceSearchResult
}

// --------------------------------------------------------------------------
// component

function ViewLex({ data }: ViewLexProps) {
  const ref = useRef(null)

  return (
    <div className="results-lexical-entry d-flex flex-column flex-wrap column-gap-2 row-gap-2">
      {data.lexEntries.map((lexEntry, index) => (
        <Card
          key={`${lexEntry.pid ?? lexEntry.reference ?? data.resource.id}-${index}`}
          className="flex-grow-1"
        >
          <Card.Body>
            <Card.Title>
              {lexEntry.fields
                .filter((field) => field.type === 'lemma')
                .map((field) => field.values)
                .flat(1)
                .map((value) => (
                  <span>{value.value}</span>
                ))}
            </Card.Title>
            <ListGroup variant="flush">
              {lexEntry.fields
                .filter((field) => field.type !== 'lemma')
                .map((field) => (
                  <ListGroup.Item key={field.type}>
                    <strong>{field.type}</strong>:
                    {field.values.map((value, index) => (
                      <span key={index} className="ms-2 lex-value">
                        {value.value}
                      </span>
                    ))}
                  </ListGroup.Item>
                ))}
            </ListGroup>
            <Card.Link>
              {lexEntry.reference && (
                <a href={lexEntry.reference} className="matomo_link" target="_blank">
                  <i dangerouslySetInnerHTML={{ __html: link45degIcon }} />
                </a>
              )}{' '}
              {lexEntry.pid && (
                <OverlayTrigger
                  placement="auto-start"
                  container={ref}
                  delay={{ show: 250, hide: 400 }}
                  overlay={<Tooltip id={`ttip-${lexEntry.pid}-${index}`}>{lexEntry.pid}</Tooltip>}
                >
                  {/* TODO: maybe with on mouse-over stay? see: https://github.com/react-bootstrap/react-bootstrap/issues/1622*/}
                  <Badge bg="secondary" className="pid-badge">
                    PID
                  </Badge>
                </OverlayTrigger>
              )}
            </Card.Link>
          </Card.Body>
        </Card>
      ))}
      {/* overlay mounting point to avoid flickering due to redrawing */}
      <div ref={ref} className="tooltip-mounting-point"></div>
    </div>
  )
}

export default ViewLex
