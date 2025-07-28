import { useRef } from 'react'
import Badge from 'react-bootstrap/Badge'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Table from 'react-bootstrap/Table'
import Tooltip from 'react-bootstrap/Tooltip'

import {
  type AvailableLayer,
  type Resource,
  type AdvancedLayer,
  type ResourceSearchResult,
} from '@/utils/api'

import link45degIcon from 'bootstrap-icons/icons/link-45deg.svg?raw'

import './styles.css'

// --------------------------------------------------------------------------
// types

export interface ViewAdvancedTabularProps {
  data: ResourceSearchResult
  resource?: Resource
}

// --------------------------------------------------------------------------

function computeShortLayerIds(layerIds: string[], collapePlaceholder: string = '..') {
  // tokenize URI by "/"
  const layerIdTokens = layerIds.map((l) => l.split('/'))

  // match each URI's tokens to check which are same so that we can collapse them
  const maxTokens = Math.max(...layerIdTokens.map((l) => l.length))
  const layerIdTokensIdentity = Array.from(Array(maxTokens).keys()).map(
    (i) => new Set(layerIdTokens.map((l) => (l.length > i ? l[i] : false))).size === 1
  )

  // mapping to build short layer id (by collapePlaceholder/".." and token indices that differ between URIs)
  const layerIdTokenPattern = layerIdTokensIdentity.reduce(
    (acc, val, idx, _, plh = collapePlaceholder ?? '..') =>
      val ? (acc && acc[acc.length - 1] !== plh ? acc.concat([plh]) : acc) : acc.concat([idx]),
    [] as (string | number)[]
  )

  // mapping of layer id to short layer id
  const layerIdShort = layerIds
    .map((lId) => [lId, lId.split('/')])
    .map(
      ([lId, lParts]) =>
        [
          lId,
          layerIdTokenPattern
            .map((v) => (typeof v === 'number' ? lParts[v] : v))
            .join('/')
            .replace(/\/+$/, ''),
        ] as [string, string]
    )
    .reduce((map, [id, idShort]) => map.set(id, idShort), new Map<string, string>())

  return layerIdShort
}

// --------------------------------------------------------------------------
// component

function ViewAdvancedTabular({ data, resource }: ViewAdvancedTabularProps) {
  const ref = useRef(null)

  // mapping of result layer id to resource layer description
  const resourceLayers = resource?.availableLayers?.reduce(
    (map, availLayer) => map.set(availLayer.resultId, availLayer),
    new Map<string, AvailableLayer>()
  )

  function renderAdvancedLayers(layers: AdvancedLayer[]) {
    // mapping of layer id to short layer id for display
    // TODO: caching?
    const layerIds = layers.map((layer) => layer.id)
    const layerIdShort = computeShortLayerIds(layerIds)

    const numSpans = Math.max(...layers.map((layer) => layer.spans.length))

    // whether to show layer type and layer identifier columns
    const showLayerInfoColumns = layerIds.length > 1

    // TODO: maybe with column hover?
    // see: https://ianobermiller.com/blog/highlight-table-row-column-react

    return (
      <Table hover responsive className="mb-0 results-plain" style={{ width: 'unset' }}>
        <thead className="visually-hidden">
          <tr>
            {resourceLayers !== undefined && showLayerInfoColumns && (
              <th scope="col">Layer Type</th>
            )}
            {showLayerInfoColumns && <th scope="col">Layer Identifier</th>}
            {Array(numSpans)
              .fill(null)
              .map((_, index) => (
                <th scope="col" key={index}>
                  Token
                </th>
              ))}
          </tr>
        </thead>
        <tbody>
          {layers.map((layer) => (
            <tr key={layer.id}>
              {resourceLayers !== undefined && showLayerInfoColumns && (
                <td scope="row" className="text-uppercase">
                  {resourceLayers.get(layer.id)?.layerType}
                </td>
              )}
              {showLayerInfoColumns && (
                <td scope="row" title={layer.id}>
                  {layerIdShort.get(layer.id)}
                </td>
              )}
              {layer.spans.map((span, index) => (
                <td key={span.range?.join('-') ?? index}>
                  {span.hit ? (
                    <mark key={index}>
                      <strong>{span.text}</strong>
                    </mark>
                  ) : (
                    span.text
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
    )
  }

  return (
    <>
      <Table responsive striped className="mb-0 results-plain">
        <thead className="visually-hidden">
          <tr>
            <th scope="col">#</th>
            <th scope="col">References</th>
            <th scope="col">Result with Annotation Layers</th>
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
              <td>{renderAdvancedLayers(record.adv)}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      {/* overlay mounting point to avoid flickering due to redrawing */}
      <div ref={ref} className="tooltip-mounting-point"></div>
    </>
  )
}

export default ViewAdvancedTabular
