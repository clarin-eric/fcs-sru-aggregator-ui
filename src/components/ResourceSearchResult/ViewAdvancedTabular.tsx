import { useRef } from 'react'
import Badge from 'react-bootstrap/Badge'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Table from 'react-bootstrap/Table'
import Tooltip from 'react-bootstrap/Tooltip'

import type {
  AdvancedLayer,
  AvailableLayer,
  Resource,
  ResourceSearchResult,
} from 'fcs-sru-aggregator-api-adapter-typescript'

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

function filterMainLayerIds(layers: AdvancedLayer[], resourceLayers?: Map<string, AvailableLayer>) {
  // check if spans match the text
  // TODO: can there be issues for non-latin characters?
  // TODO: can there be issues for inclusive vs. exclusive indexing -- inclusive
  // TODO: can there be issues with zero-based vs. one-based indexing -- one based
  const layersWithMatchingSpanRanges = layers.filter(
    (layer) =>
      // exclusive end index
      layer.spans.every(
        (span) => span.text && span.text.length === (span.range?.[1] ?? 0) - (span.range?.[0] ?? 0)
      ) ||
      // inclusive end index
      layer.spans.every(
        (span) =>
          span.text && span.text.length === (span.range?.[1] ?? 0) - (span.range?.[0] ?? 0) + 1
      )
    // zero-based indices with exclusive end index?
    // || layer.spans.every(
    //   (span) =>
    //     span.text && span.text.length === (span.range?.[1] ?? 0) - (span.range?.[0] ?? 0) - 1
    // )
  )

  // no resource information, then everything is ok and we also can't sort
  if (!resourceLayers) return layersWithMatchingSpanRanges

  const mainLayerIds = layersWithMatchingSpanRanges
    // first for multiple layers based on layer type
    .filter((layer) => {
      // no information about this layer, it might be ok?
      const layerInfo = resourceLayers.get(layer.id)
      if (!layerInfo) return true

      // can only be one of text (word) to be valid (probably)
      if (!['text', 'word'].includes(layerInfo.layerType.toLowerCase())) return false

      return true
    })
    // sort based on layer infos (do they exist, has the layer no qualifier)
    .toSorted((layerA, layerB) => {
      const layerAInfo = resourceLayers.get(layerA.id)
      const layerBInfo = resourceLayers.get(layerB.id)

      // no information about this layer (order layers with information first)
      if (layerAInfo === undefined || layerBInfo === undefined) {
        if (layerAInfo === layerBInfo) return 0
        // B is smaller/first if no information about A
        if (layerAInfo === undefined) return 1
        // A is smaller/first if no information about B
        if (layerBInfo === undefined) return -1
      }

      // maybe sort "word" before "text" layer (legacy)
      const layerAType = layerAInfo.layerType.toLowerCase()
      const layerBType = layerBInfo.layerType.toLowerCase()
      if (layerAType === 'word' || layerBType === 'word') {
        if (layerAType === layerBType) return 0
        // if A is "word", then smaller/first
        if (layerAType === 'word') return -1
        // if B is "word", then smaller/first
        if (layerBType === 'word') return 1
      }

      // order layer without qualifier first
      if (
        (layerAInfo.qualifier !== null && layerAInfo.qualifier !== undefined) ||
        (layerBInfo.qualifier !== null && layerBInfo.qualifier !== undefined)
      ) {
        // TODO: sort based on some layer qualifiers?
        if (
          layerAInfo.qualifier !== null &&
          layerAInfo.qualifier !== undefined &&
          layerBInfo.qualifier !== null &&
          layerBInfo.qualifier !== undefined
        )
          return 0

        // B is smaller/first if A has a qualifier
        if (layerAInfo.qualifier !== null && layerAInfo.qualifier !== undefined) return 1
        // A is smaller/first if B has a qualifier
        if (layerBInfo.qualifier !== null && layerBInfo.qualifier !== undefined) return -1
      }

      return 0
    })
  return mainLayerIds
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

    const mainLayerIds = filterMainLayerIds(layers, resourceLayers)
    const mainLayerId = mainLayerIds?.[0]?.id
    // if (mainLayerId === undefined) {
    //   console.warn('No main layer found!', { layers, resourceLayers, resourceId: resource?.id })
    // } else if (mainLayerIds.length > 1) {
    //   console.debug('multiple possible mainLayerIds', mainLayerIds, resourceLayers, resource?.id)
    // }

    // console.debug(
    //   'layer span ranges',
    //   resource?.id,
    //   layers.map((layer) => ({
    //     ...layer,
    //     spans: layer.spans.map((span) => ({
    //       ...span,
    //       textlen: span.text?.length,
    //       rangeDiff: (span.range?.[1] ?? 0) - (span.range?.[0] ?? 0),
    //     })),
    //     startIndex: layer.spans?.[0].range?.[0],
    //     variant: layer.spans.every((span) => span.text && span.text.length === (span.range?.[1] ?? 0) - (span.range?.[0] ?? 0))
    //       ? 'exclusive end index'
    //       : layer.spans.every((span) => span.text && span.text.length === (span.range?.[1] ?? 0) - (span.range?.[0] ?? 0) + 1)
    //       ? 'inclusive end index'
    //       : layer.spans.every((span) => span.text && span.text.length === (span.range?.[1] ?? 0) - (span.range?.[0] ?? 0) - 1)
    //       ? 'exclusive end index and ?'
    //       : layer.spans.reduce((acc, span) => acc + (span.text?.length ?? 0), 0) == (layer.spans[layer.spans.length - 1]?.range?.[1] ?? 0) - (layer.spans?.[0].range?.[0] ?? 0)
    //       ? 'total length matches'
    //       : '?',
    //   }))
    // )

    layers.sort((layerA, layerB) => {
      if (mainLayerId === undefined) return 0
      if (layerA.id === mainLayerId) return -1
      if (layerB.id === mainLayerId) return 1

      if (!resourceLayers) return 0

      return 0
    })

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
            <tr
              key={layer.id}
              className={(['text-nowrap'] as (string | null)[])
                .concat([layer.id === mainLayerId && layers.length > 1 ? 'table-primary' : null])
                .filter(Boolean)
                .join(' ')}
            >
              {resourceLayers !== undefined && showLayerInfoColumns && (
                <td scope="row" className="text-uppercase">
                  {resourceLayers.get(layer.id)?.layerType}
                </td>
              )}
              {showLayerInfoColumns && (
                <td scope="row" title={layer.id} className="border-end">
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
          {data.records
            .filter((record) => record.adv !== null)
            .map((record, index) => (
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
                <td>{renderAdvancedLayers(record.adv!)}</td>
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
