import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import Button from 'react-bootstrap/Button'
import Dropdown from 'react-bootstrap/Dropdown'
import Form from 'react-bootstrap/Form'

import {
  Expression_andContext,
  Expression_basicContext,
  Expression_groupContext,
  Expression_notContext,
  Expression_orContext,
  ExpressionContext,
  FCSParser,
  QuantifierContext,
  Query_disjunctionContext,
  Query_groupContext,
  Query_sequenceContext,
  Query_simpleContext,
  QueryContext,
} from '@/parsers/FCSParser'
import { type Resource } from '@/utils/api'
import { type ParseTree, TerminalNode, TokenStreamRewriter } from 'antlr4ng'
import { isCursorOnContext } from '../utils'
import {
  ADVANCED_LAYERS,
  ADVANCED_LAYERS_MAP,
  CHANGE_TO_EXPRESSION_LIST,
  CHANGE_TO_EXPRESSION_LIST_MAP,
  type ChangeToExpressionListType,
  DEFAULT_NEW_QUANTIFIER,
  EXPRESSION_OPERATORS,
  EXPRESSION_OPERATORS_MAP,
  type ExpressionChild,
  LAYER_VALUE_OPTIONS_MAP,
  type LayerInfo,
  NEW_EXPRESSIONS,
  NEW_EXPRESSIONS_MAP,
  NEW_QUERY_SEGMENTS,
  NEW_QUERY_SEGMENTS_MAP,
  type NewExpressionType,
  type NewQuerySegmentType,
  QUANTIFIER_CHOICES,
  QUANTIFIER_CHOICES_MAP,
  type QuantifierChoicesType,
  type ResourceLayerIDInfo,
  WITHIN_CHOICES,
  WRAP_EXPRESSION,
  WRAP_EXPRESSION_MAP,
  type WrapExpressionType,
} from './constants'
import { FCSParserLexerProvider, useFCSParserLexer } from './FCSParserLexerContext'
import {
  type FCSQueryBuilderConfig,
  FCSQueryBuilderConfigProvider,
  useFCSQueryBuilderConfig,
} from './FCSQueryBuilderConfigContext'
import { FCSQueryUpdaterProvider, useFCSQueryUpdater } from './FCSQueryUpdaterContext'
import {
  FCSResourceLayerInfoProvider,
  useFCSResourceLayerInfo,
} from './FCSResourceLayerInfoContext'
import {
  checkIfContainsRegex,
  escapeQuotes,
  escapeRegexValue,
  parseQuery,
  unescapeQuotes,
  unescapeRegexValue,
} from './utils'

import bracesIcon from 'bootstrap-icons/icons/braces.svg?raw'
import plusCircleIcon from 'bootstrap-icons/icons/plus-circle.svg?raw'
import repeatIcon from 'bootstrap-icons/icons/repeat.svg?raw'
import xCircleIcon from 'bootstrap-icons/icons/x-circle.svg?raw'

// TODO: prefix most rules with ".fcs-query"
import './styles.css'

// --------------------------------------------------------------------------

interface FCSQueryBuilderProps {
  query?: string
  /** cursor position in query */
  cursorPos?: [number, number] | number
  resources?: Resource[]
  onChange?: (query: string) => void
}

export function FCSQueryBuilder({
  query: queryProp,
  cursorPos,
  resources: resourcesProp,
  onChange,
  ...props
}: FCSQueryBuilderProps & Partial<FCSQueryBuilderConfig>) {
  const [query, setQuery] = useState(queryProp ?? '')
  useEffect(() => setQuery(queryProp ?? ''), [queryProp])

  // let's again filter for resources that have the ADV Data View? or ADVANCED_SEARCH search capability and at least one layer
  const resources = useMemo(() => {
    const filtered =
      resourcesProp?.filter(
        (resource) =>
          (resource.availableDataViews?.find(
            (dataview) => dataview.mimeType === 'application/x-clarin-fcs-adv+xml'
          ) !== undefined ||
            resource.searchCapabilitiesResolved.includes('ADVANCED_SEARCH')) &&
          resource.availableLayers !== null &&
          resource.availableLayers.length > 0
      ) ?? []

    if (resourcesProp && resourcesProp.length !== filtered.length) {
      const resourcesDiff = resourcesProp.filter((resource) => !filtered.includes(resource))
      console.warn(
        'Filter out resource(s) that do(es) not correctly declare ADV query support',
        resourcesDiff
      )
    }

    return filtered
  }, [resourcesProp])

  // compute list of layers we know and want to make available
  const layerInfo = useMemo(() => {
    return resources
      .map((resource) => {
        const layerTypeToID = new Map<string, ResourceLayerIDInfo>()
        resource.availableLayers!.forEach((layer) => {
          if (!layerTypeToID.has(layer.layerType)) {
            layerTypeToID.set(layer.layerType, { resultIDs: [], qualifiers: [] })
          }
          const data = layerTypeToID.get(layer.layerType)!
          data.resultIDs.push(layer.resultId)
          if (layer.qualifier !== null) {
            data.qualifiers.push(layer.qualifier)
          }
        })
        return [...layerTypeToID.entries()].map(([layerType, layerIDs]) => ({
          layerType,
          resource,
          layerIDs,
        }))
      })
      .reduce((map, item) => {
        item.forEach(({ layerType, resource, layerIDs }) => {
          if (!map.has(layerType)) {
            map.set(layerType, { resources: [], qualifiers: new Map() })
          }
          const data = map.get(layerType)!
          data.resources.push({ resource, layerIDs })
          if (layerIDs.qualifiers.length > 0) {
            layerIDs.qualifiers.forEach((qualifier) => {
              if (!data.qualifiers.has(qualifier)) {
                data.qualifiers.set(qualifier, [])
              }
              data.qualifiers.get(qualifier)!.push(resource)
            })
          }
        })
        return map
      }, new Map<string, LayerInfo>())
  }, [resources])
  // console.debug('layerInfo', { resources, layerInfo })

  // console.debug('Parse query', { query, queryProp })
  const parsed = useMemo(() => parseQuery(query), [query])

  // ------------------------------------------------------------------------
  // event handlers

  function handleQueryChange() {
    if (parsed) {
      const { rewriter } = parsed

      // TODO: maybe prune some whitespaces?
      // NOTE: but do not interfere with user input!
      // maybe separete input from query builder stuff

      const newQuery = rewriter.getText()
      setQuery(newQuery)
      onChange?.(newQuery) // TODO: or do we wait for parsing to finish?
    } else {
      console.warn('No parsed query! Unable to handle change request', parsed)
    }
  }

  function handleAddQuery(type: NewQuerySegmentType) {
    // add text query to trigger adding of gui element
    const text = NEW_QUERY_SEGMENTS_MAP[type].new
    setQuery(text)
    onChange?.(text)
  }

  // ------------------------------------------------------------------------
  // UI

  return (
    <div id="query-builder" className="fcs-query d-flex justify-content-center">
      <FCSQueryBuilderConfigProvider
        enableWithin={props.enableWithin ?? false}
        enableWrapGroup={props.enableWrapGroup ?? false}
        enableWrapNegation={props.enableWrapNegation ?? false}
        enableImplicitQuery={props.enableImplicitQuery ?? false}
        enableMultipleQuerySegments={props.enableMultipleQuerySegments ?? true}
        enableQuantifiers={props.enableQuantifiers ?? true}
        enableRegexpFlags={props.enableRegexpFlags ?? false}
        showBasicLayer={props.showBasicLayer ?? true}
        showAllAdvancedLayers={props.showAllAdvancedLayers ?? false}
        showCustomLayers={props.showCustomLayers ?? true}
        showLayerQualifiers={props.showLayerQualifiers ?? true}
        showResourceCountForLayer={props.showResourceCountForLayer ?? true}
      >
        <FCSResourceLayerInfoProvider resources={resources} layerInfo={layerInfo}>
          {parsed ? (
            <FCSParserLexerProvider
              parser={parsed.parser}
              lexer={parsed.lexer}
              cursorPos={cursorPos}
            >
              <FCSQueryUpdaterProvider rewriter={parsed.rewriter}>
                <Query tree={parsed.tree} onChange={handleQueryChange} />
              </FCSQueryUpdaterProvider>
            </FCSParserLexerProvider>
          ) : (
            <AddQuerySegmentButton onClick={handleAddQuery} />
          )}
        </FCSResourceLayerInfoProvider>
      </FCSQueryBuilderConfigProvider>
    </div>
  )
}

// --------------------------------------------------------------------------

function flattenQueryChildren(ctx: ParseTree, strict: boolean = true): Query_simpleContext[] {
  if (ctx instanceof Query_disjunctionContext) {
    if (strict) throw Error('Unsupported syntax: Query-Disjunction')
    return []
  }
  if (ctx instanceof Query_groupContext) {
    if (strict) throw Error('Unsupported syntax: Query-Group')
    return []
  }

  if (ctx instanceof Query_simpleContext) {
    return [ctx]
  }
  if (ctx instanceof Query_sequenceContext) {
    return ctx.children.map((childCtx) => flattenQueryChildren(childCtx, strict)).flat(1)
  }

  if (strict)
    throw Error(
      `Invalid ParseTree for tokens ${ctx.getSourceInterval().toString()}: ${ctx.getText()}`
    )
  return []
}

function removeExpressionChild(ctx: ExpressionChild, rewriter: TokenStreamRewriter) {
  rewriter.delete(ctx.start!, ctx.stop!)

  // TODO: do we want to check for whitespaces around to collapse/remove?

  // check upwards for things to delete to remain valid
  const parentCtx = ctx.parent

  // OR/AND expression lists
  if (parentCtx instanceof Expression_andContext || parentCtx instanceof Expression_orContext) {
    // if last child, then remove whole AND/OR expression
    // NOTE: might not happen normally, as single expressions are not AND/OR
    if (parentCtx.children.length === 1) {
      removeExpressionChild(parentCtx, rewriter)
      return
    }

    // remove bool symbol (if at start then next else the one before)
    const childIdx = parentCtx.children.findIndex((childCtx) => childCtx === ctx)
    if (childIdx === 0) {
      const nextCtx = parentCtx.getChild(childIdx + 1)! as TerminalNode
      rewriter.delete(nextCtx.symbol)
    } else {
      const prevCtx = parentCtx.getChild(childIdx - 1)! as TerminalNode
      rewriter.delete(prevCtx.symbol)
    }

    // check if only one other sibling that is a group and parent's parent is a group
    if (parentCtx.children.length === 3) {
      const parentParentCtx = parentCtx.parent
      const otherSiblingCtx = parentCtx.getChild(childIdx + (childIdx === 0 ? +2 : -2))
      if (
        parentParentCtx instanceof Expression_groupContext &&
        otherSiblingCtx instanceof Expression_groupContext
      ) {
        // reduce double grouping
        rewriter.delete(otherSiblingCtx.L_PAREN().symbol)
        rewriter.delete(otherSiblingCtx.R_PAREN().symbol)
      }
    }

    return
  }

  // for groups, simply collapse
  if (parentCtx instanceof Expression_groupContext) {
    removeExpressionChild(parentCtx, rewriter)
    return
  }

  // for negation, also collapse?
  if (parentCtx instanceof Expression_notContext) {
    removeExpressionChild(parentCtx, rewriter)
    return
  }

  console.warn('Unexpected other parent to remove?', { parentCtx, ctx })
}

// --------------------------------------------------------------------------
// modify query buttons

function AddQuerySegmentButton({ onClick }: { onClick?: (type: NewQuerySegmentType) => void }) {
  const { enableImplicitQuery } = useFCSQueryBuilderConfig()

  function handleAddSelection(eventKey: string | null) {
    if (!eventKey) return
    onClick?.(eventKey as NewQuerySegmentType)
  }

  return (
    <>
      <Dropdown
        className="d-inline-block"
        onSelect={handleAddSelection}
        aria-label="Add query segment"
      >
        <Dropdown.Toggle variant="link" className="add-query-segment-btn action-btn no-arrow">
          <i dangerouslySetInnerHTML={{ __html: plusCircleIcon }} aria-hidden="true" />
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {NEW_QUERY_SEGMENTS.filter(
            !enableImplicitQuery ? (item) => item.id !== 'string' : () => true
          ).map((item) => (
            <Dropdown.Item
              eventKey={item.id}
              key={item.id}
              // as="button"
              // onClick={(event) => event.preventDefault()}
            >
              {item.label}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    </>
  )
}

function AddExpressionButton({
  allowedIds,
  onClick,
}: {
  allowedIds?: NewExpressionType[]
  onClick?: (type: NewExpressionType) => void
}) {
  function handleAddSelection(eventKey: string | null) {
    if (!eventKey) return
    onClick?.(eventKey as NewExpressionType)
  }

  return (
    <>
      <Dropdown
        className="d-inline-block"
        onSelect={handleAddSelection}
        aria-label="Add expression"
      >
        <Dropdown.Toggle variant="link" className="add-expression-btn action-btn no-arrow">
          <i dangerouslySetInnerHTML={{ __html: plusCircleIcon }} aria-hidden="true" />
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {NEW_EXPRESSIONS.filter(
            allowedIds && allowedIds.length > 0
              ? (item) => allowedIds.includes(item.id)
              : () => true
          ).map((item) => (
            <Dropdown.Item eventKey={item.id} key={item.id}>
              {item.label}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    </>
  )
}

function ChangeToExpressionListButton({
  className,
  onClick,
}: {
  className?: string
  onClick?: (type: ChangeToExpressionListType) => void
}) {
  function handleAddSelection(eventKey: string | null) {
    if (!eventKey) return
    onClick?.(eventKey as ChangeToExpressionListType)
  }

  return (
    <>
      <Dropdown
        className={['d-inline-block'].concat(className ?? []).join(' ')}
        onSelect={handleAddSelection}
        aria-label="Change to expressions list"
      >
        <Dropdown.Toggle
          variant="link"
          className="change-to-expression-list-btn action-btn no-arrow"
        >
          <i dangerouslySetInnerHTML={{ __html: plusCircleIcon }} aria-hidden="true" />
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {CHANGE_TO_EXPRESSION_LIST.map((item) => (
            <Dropdown.Item
              eventKey={item.id}
              key={item.id}
              // as="button"
              // onClick={(event) => event.preventDefault()}
            >
              {item.label}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    </>
  )
}

function WrapExpressionButton({
  allowedIds,
  className,
  onClick,
}: {
  allowedIds?: WrapExpressionType[]
  className?: string
  onClick?: (type: WrapExpressionType) => void
}) {
  const { enableWrapGroup, enableWrapNegation } = useFCSQueryBuilderConfig()

  function handleWrapSelection(eventKey: string | null) {
    if (!eventKey) return
    onClick?.(eventKey as WrapExpressionType)
  }

  if (!(enableWrapGroup || enableWrapNegation)) return null

  return (
    <>
      <Dropdown
        className={['d-inline-block'].concat(className ?? []).join(' ')}
        onSelect={handleWrapSelection}
        aria-label="Wrap expression"
      >
        <Dropdown.Toggle
          variant="link"
          className="wrap-expression-btn action-btn rounded-circle p-1 no-arrow"
        >
          <i dangerouslySetInnerHTML={{ __html: bracesIcon }} aria-hidden="true" />
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {WRAP_EXPRESSION.filter(
            allowedIds && allowedIds.length > 0
              ? (item) => allowedIds.includes(item.id)
              : () => true
          )
            .filter(!enableWrapGroup ? (item) => item.id !== 'group' : () => true)
            .filter(!enableWrapNegation ? (item) => item.id !== 'not' : () => true)
            .map((item) => (
              <Dropdown.Item eventKey={item.id} key={item.id}>
                {item.label}
              </Dropdown.Item>
            ))}
        </Dropdown.Menu>
      </Dropdown>
    </>
  )
}

function RemoveButton({ className, onClick }: { className?: string; onClick?: () => void }) {
  return (
    <Button
      variant="link"
      className={['del-btn action-btn rounded-circle p-1'].concat(className ?? []).join(' ')}
      onClick={onClick}
    >
      <i dangerouslySetInnerHTML={{ __html: xCircleIcon }} aria-hidden="true" />
    </Button>
  )
}

function AddQuantifierButton({ className, onClick }: { className?: string; onClick?: () => void }) {
  return (
    <Button
      variant="link"
      className={['add-quantifier-btn action-btn rounded-circle p-1']
        .concat(className ?? [])
        .join(' ')}
      onClick={onClick}
    >
      <i dangerouslySetInnerHTML={{ __html: repeatIcon }} aria-hidden="true" />
    </Button>
  )
}

// --------------------------------------------------------------------------
// query (sequences)

function Query({ tree, onChange }: { tree: QueryContext; onChange?: () => void }) {
  const { rewriter } = useFCSQueryUpdater()
  const { enableWithin } = useFCSQueryBuilderConfig()

  // required child if valid query, so should not be null
  const queryCtx = tree.main_query()

  const queryChildCtx = queryCtx.getChild(0)
  const queryChildrenCtx = flattenQueryChildren(queryChildCtx!, false)

  const withinCtx = enableWithin ? tree.within_part() : null
  const withinValue = withinCtx?.getText() ?? ''

  const [within, setWithin] = useState(withinValue)
  useEffect(() => setWithin(withinValue), [withinValue])

  // ------------------------------------------------------------------------
  // event handlers

  function handleAddWithinClause() {
    const newWithin = 'sentence'
    setWithin(newWithin)

    const tokenIndex = queryCtx.stop?.tokenIndex
    if (tokenIndex !== undefined) {
      rewriter.insertAfter(tokenIndex, ` within ${newWithin}`)
      onChange?.()
    } else {
      // TODO: throw instead?
      console.warn('Unable to add within part. End token index not found!', { queryCtx })
    }
  }

  function handleWithinChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const newWithin = event.target.value
    setWithin(newWithin)

    if (withinCtx) {
      const withinPartCtx = withinCtx.within_part_simple()
      const token = withinPartCtx?.SIMPLE_WITHIN_SCOPE()
      if (token) {
        rewriter.replaceSingle(token.symbol, newWithin)
        onChange?.()
      } else {
        console.warn('Error trying to update within part. Token not found!', {
          withinCtx,
          withinPartCtx,
          token,
        })
      }
    } else {
      console.warn('Error trying to update within part. Context not found!', { tree, withinCtx })
    }
  }

  function handleDeleteWithinClause() {
    if (withinCtx) {
      setWithin('')

      rewriter.delete(tree.WITHIN()!.symbol, withinCtx.stop!)
      onChange?.()
    } else {
      console.warn('Error trying to remove within part. Context not found!', { tree, withinCtx })
    }
  }

  // ------------------------------------------------------------------------
  // UI

  return (
    <div className="block query flex-grow-1 justify-content-center d-flex flex-wrap row-gap-2 column-gap-1 border rounded p-1">
      <QuerySequence children={queryChildrenCtx} onChange={onChange} />
      {enableWithin &&
        (within ? (
          <div className="block within-clause position-relative d-flex column-gap-2 align-items-center border rounded p-1">
            <code className="keyword">within</code>
            <Form.Select className="w-auto" value={within} onChange={handleWithinChange}>
              {WITHIN_CHOICES.map((value) => (
                <option value={value} key={value}>
                  {value}
                </option>
              ))}
            </Form.Select>
            <RemoveButton
              className="del-within-clause-btn position-absolute top-0 start-100 translate-middle"
              onClick={handleDeleteWithinClause}
            />
          </div>
        ) : (
          <Button size="sm" onClick={handleAddWithinClause} style={{ alignSelf: 'center' }}>
            Add within clause
          </Button>
        ))}
    </div>
  )
}

function QuerySequence({
  children,
  onChange,
}: {
  children: Query_simpleContext[]
  onChange?: () => void
}) {
  const { rewriter } = useFCSQueryUpdater()
  const { enableMultipleQuerySegments } = useFCSQueryBuilderConfig()

  // ------------------------------------------------------------------------
  // event handlers

  // TODO: callbacks probably not required due to re-rendering

  const handleAddFirst = useCallback(
    (type: NewQuerySegmentType) => {
      const tokenIndex = children && children.length > 0 ? children[0].start!.tokenIndex : 0
      const text = NEW_QUERY_SEGMENTS_MAP[type].new
      rewriter.insertBefore(tokenIndex, `${text} `)
      onChange?.()
    },
    [rewriter, children, onChange]
  )
  const handleAddAfterQuery = useCallback(
    (type: NewQuerySegmentType, ctx: Query_simpleContext) => {
      const tokenIndex = ctx.stop!.tokenIndex
      const text = NEW_QUERY_SEGMENTS_MAP[type].new
      rewriter.insertAfter(tokenIndex, ` ${text}`)
      onChange?.()
    },
    [rewriter, onChange]
  )

  // ------------------------------------------------------------------------
  // UI

  return (
    <div className="block query-simple-or-sequence border rounded py-1 px-2 d-flex flex-wrap row-gap-3 column-gap-2 align-items-center">
      {enableMultipleQuerySegments && (
        <AddQuerySegmentButton key={`add-0`} onClick={handleAddFirst} />
      )}
      {children.map((ctx) => (
        <Fragment key={`query-${ctx.getSourceInterval().toString()}`}>
          <QuerySimple ctx={ctx} onChange={onChange} />
          {enableMultipleQuerySegments && (
            <AddQuerySegmentButton onClick={(type) => handleAddAfterQuery(type, ctx)} />
          )}
        </Fragment>
      ))}
    </div>
  )
}

// --------------------------------------------------------------------------
// query/expression input

function ImplicitQueryInput({
  value: valueProp,
  onChange,
}: {
  value: string
  onChange?: (value: string) => void
}) {
  const [value, setValue] = useState(valueProp)
  useEffect(() => setValue(valueProp), [valueProp])

  return (
    <Form.Control
      className="d-inline"
      style={{ width: '10ch' }}
      value={value}
      onChange={(event) => setValue(event.target.value)}
      onBlur={() => onChange?.(value)}
    />
  )
}

function BasicExpressionInput({
  ctx,
  showChangeToExpressionListButton = false,
  onChange,
}: {
  ctx: Expression_basicContext
  showChangeToExpressionListButton?: boolean
  onChange?: () => void
}) {
  const { rewriter } = useFCSQueryUpdater()
  const { layerInfo } = useFCSResourceLayerInfo()
  const {
    showBasicLayer,
    showAllAdvancedLayers,
    showCustomLayers,
    showLayerQualifiers,
    showResourceCountForLayer,
  } = useFCSQueryBuilderConfig()
  const { cursorPos } = useFCSParserLexer()

  const isCursorOnMe = isCursorOnContext(ctx, cursorPos)

  const basicLayer = 'word'
  const advancedLayers = Object.keys(ADVANCED_LAYERS_MAP)
  const standardLayers = [basicLayer, ...advancedLayers]
  const customLayers = showCustomLayers
    ? [...layerInfo.keys()].filter((layer) => !standardLayers.includes(layer)).toSorted()
    : []

  const hasBasicLayer = layerInfo.has(basicLayer)
  const hasAdvancedLayers =
    [...layerInfo.keys()].filter((layer) => Object.keys(ADVANCED_LAYERS_MAP).includes(layer))
      .length > 0
  const hasCustomLayers = customLayers.length > 0

  const attributeCtx = ctx.attribute()
  const operatorNode = ctx.getChild(1) as TerminalNode
  const regexpNode = ctx.regexp().regexp_pattern().REGEXP()

  const [layer, setLayer] = useState('text')
  const [operator, setOperator] = useState('is')
  const [value, setValue] = useState('')
  const oldOperatorRef = useRef(operator)

  // update from outside (query input change)
  useEffect(() => {
    const identifierCtx = attributeCtx.identifier()
    const qualifierCtx = attributeCtx.qualifier()
    const newLayer =
      qualifierCtx !== null
        ? `${qualifierCtx.getText()}:${identifierCtx.getText()}`
        : `${identifierCtx.getText()}`

    const isOpEq = operatorNode.symbol.type === FCSParser.OPERATOR_EQ

    const valueQuoted = regexpNode.symbol.text
    const valueUnquoted = valueQuoted?.slice(1, -1)

    const processedInput = getInputParsed(valueUnquoted ?? '', isOpEq)
    let newOperator = processedInput.operator
    let newValue = unescapeValue(processedInput.value, newOperator)!
    console.debug('parsed input', { valueUnquoted, processedInput, newValue })

    // TODO: we may not want to change the operator if we simply switch from "regex" to "not-regex"
    // TODO: or lets simply delay, so that we only update the UI if required? --> onBlur on whole expression?
    if (
      oldOperatorRef.current !== newOperator &&
      ['regex', 'not-regex'].includes(oldOperatorRef.current)
    ) {
      console.debug('overwriting computed newOperator?', {
        newOperator,
        oldOperatorRef: oldOperatorRef.current,
      })
      newOperator = oldOperatorRef.current
    }

    // check for layers with vocabulary if value is known, otherwise replace with defaul
    const layerInfo = LAYER_VALUE_OPTIONS_MAP[newLayer]
    if (
      layerInfo &&
      layerInfo.options &&
      layerInfo.options.length > 0 &&
      // @ts-expect-error: we do want to check here
      (!layerInfo.options.map((option) => option.value).includes(newValue) || !newValue)
    ) {
      newValue = layerInfo.options[0]?.value ?? ''
      newOperator = 'is'

      // TODO: if we change here, then we need to update the query, too ...
      // BUT will need to prevent recursive updates, too
    }

    setLayer(newLayer ?? '')
    setOperator(newOperator)
    setValue(newValue)
    oldOperatorRef.current = newOperator
  }, [attributeCtx, operatorNode, regexpNode])

  const parentCtx = ctx.parent
  const allowedWrapIds = (Object.keys(WRAP_EXPRESSION_MAP) as WrapExpressionType[])
    .filter(parentCtx instanceof Expression_groupContext ? (id) => id !== 'group' : () => true)
    .filter(parentCtx instanceof Expression_notContext ? (id) => id !== 'group' : () => true)

  const layerValueInputInfo = LAYER_VALUE_OPTIONS_MAP[layer]

  // ------------------------------------------------------------------------
  // helpers

  function getInputParsed(value: string, isOpEq: boolean) {
    const startsWithAnything = value.startsWith('.*')
    const endsWithAnything = value.endsWith('.*')

    const valueWithoutAnythingMatcher =
      startsWithAnything && endsWithAnything
        ? value.slice(2, -2)
        : startsWithAnything
        ? value.slice(2)
        : endsWithAnything
        ? value.slice(0, -2)
        : value

    const containsRegexExpressions = checkIfContainsRegex(valueWithoutAnythingMatcher)

    if (!containsRegexExpressions) {
      if (isOpEq) {
        if (startsWithAnything && endsWithAnything) {
          return { operator: 'contains', value: valueWithoutAnythingMatcher }
        }
        if (startsWithAnything) {
          return { operator: 'ends-with', value: value.slice(2) }
        }
        if (endsWithAnything) {
          return { operator: 'starts-with', value: value.slice(0, -2) }
        }
        return { operator: 'is', value: value }
      }
      if (startsWithAnything || endsWithAnything) {
        return { operator: 'not-regex', value: value }
      }
      return { operator: 'is-not', value: value }
    }
    return { operator: isOpEq ? 'regex' : 'not-regex', value: value }
  }

  function unescapeValue(value: string | undefined, operator: string) {
    return ['regex', 'not-regex'].includes(operator)
      ? unescapeQuotes(value)
      : unescapeRegexValue(value)
  }

  function escapeValue(value: string | undefined, operator: string) {
    return ['regex', 'not-regex'].includes(operator) ? escapeQuotes(value) : escapeRegexValue(value)
  }

  // ------------------------------------------------------------------------
  // event handlers

  function handleLayerChange(eventKey: string | null) {
    const newLayer = eventKey
    if (!newLayer) return
    if (newLayer === layer) return

    // TODO: need to clear value/regexp?
    // TODO: update operator if not fitting?

    setLayer(newLayer) // unnecessary if we completely rebuild UI?
    rewriter.replace(attributeCtx.start!, attributeCtx.stop!, newLayer)
    onChange?.()
  }

  function handleOperatorChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const newOperator = event.target.value
    const oldOperator = operator
    setOperator(newOperator) // unnecessary if we completely rebuild UI
    oldOperatorRef.current = newOperator

    const opSybmol = ['is-not', 'not-regex'].includes(newOperator) ? '!=' : '='
    rewriter.replaceSingle(operatorNode.symbol, opSybmol)

    let newValue = value ?? ''

    const newOpInfo = EXPRESSION_OPERATORS_MAP[newOperator]
    const oldOpInfo = EXPRESSION_OPERATORS_MAP[oldOperator]
    // bail out if unexpected
    if (!newOpInfo) {
      console.warn('Unexpected state, did not find known operator value!', {
        newOpInfo,
        oldOpInfo,
        newOperator,
        oldOperator,
      })
      return
    }

    newValue = escapeValue(newValue, newOperator)!

    // TODO: do we want to use the regex input value from "contains"/"starts-with"/"ends-with" when changing to "regex"/"not-regex"?
    // if (['regex', 'not-regex'].includes(newOperator)) {
    //   newValue = `${oldOpInfo.valueBefore ?? ''}${newValue}${oldOpInfo.valueAfter ?? ''}`
    // }

    rewriter.replaceSingle(
      regexpNode.symbol,
      `"${newOpInfo.valueBefore ?? ''}${newValue}${newOpInfo.valueAfter ?? ''}"`
    )

    onChange?.()
  }

  function handleRegexpChange() {
    // escape if quotes!
    const escapedValue = ['regex', 'not-regex'].includes(operator)
      ? escapeQuotes(value)
      : escapeRegexValue(value)

    const opInfo = EXPRESSION_OPERATORS_MAP[operator]

    rewriter.replaceSingle(
      regexpNode.symbol,
      `"${opInfo?.valueBefore ?? ''}${escapedValue}${opInfo?.valueAfter ?? ''}"`
    )
    // do we want to build a query and return? or use a custom rewrite program to extract our change?
    onChange?.()
  }

  function handleChangeToExpressionList(type: ChangeToExpressionListType, isBefore: boolean) {
    const change = CHANGE_TO_EXPRESSION_LIST_MAP[type]

    if (isBefore) {
      rewriter.insertBefore(ctx.start!, `${change.newBefore} `)
    } else {
      rewriter.insertAfter(ctx.stop!, ` ${change.newAfter}`)
    }

    // const parentCtx = ctx.parent
    // const insertParens = !(
    //   parentCtx instanceof Expression_notContext || parentCtx instanceof Expression_groupContext
    // )
    // if (insertParens) {
    //   rewriter.insertBefore(ctx.start!, `( `)
    //   rewriter.insertAfter(ctx.stop!, ` )`)
    // }

    onChange?.()
  }

  function handleWrap(type: WrapExpressionType) {
    const change = WRAP_EXPRESSION_MAP[type]

    if (change.newBefore) rewriter.insertBefore(ctx.start!, change.newBefore)
    if (change.newAfter) rewriter.insertAfter(ctx.stop!, change.newAfter)

    onChange?.()
  }

  function handleRemove() {
    removeExpressionChild(ctx, rewriter)
    onChange?.()
  }

  // ------------------------------------------------------------------------
  // UI

  function renderLayerItem(layerId: string, description: string | undefined = undefined) {
    if (!description) {
      return (
        <>
          <strong>{layerId}</strong>
          {renderLayerResourceCount(layerId)}
        </>
      )
    }

    return (
      <>
        <strong>{layerId}</strong>: {description}
        {renderLayerResourceCount(layerId)}
      </>
    )
  }

  function renderLayerResourceCount(layer: string, qualifier: string | undefined = undefined) {
    if (!showResourceCountForLayer) return null

    const countLayer = layerInfo.get(layer)?.resources.length ?? 0
    const countQualifier = qualifier
      ? layerInfo.get(layer)?.qualifiers?.get(qualifier)?.length ?? 0
      : undefined

    // if same counts, then do not output
    if (qualifier && countLayer === countQualifier) return null

    const count = qualifier ? countQualifier : countLayer

    return (
      <>
        <br />
        <small className="text-body-secondary">Supported by {count} resources.</small>
      </>
    )
  }

  function renderLayerQualifiers(layerId: string) {
    if (!showLayerQualifiers) return null

    const qualifiers = layerInfo.get(layerId)?.qualifiers
    if (!qualifiers || qualifiers.size === 0) return null

    const qualifierKeys = [...qualifiers.keys()]

    return qualifierKeys.map((qualifierId) => {
      const id = `${qualifierId}:${layerId}`

      return (
        <Dropdown.Item eventKey={id} active={layer === id} key={id}>
          <div className="ms-3">
            <strong>{qualifierId}</strong>:{layerId}
            {renderLayerResourceCount(layerId, qualifierId)}
          </div>
        </Dropdown.Item>
      )
    })
  }

  function renderRegexpInput() {
    if (layerValueInputInfo && layerValueInputInfo.options?.length > 0) {
      return (
        <Dropdown
          onSelect={(eventKey) => setValue(eventKey ?? '')}
          // TODO: does onBlur reliably fire after onSelect has finished processing the state update?
          onBlur={handleRegexpChange}
        >
          <Dropdown.Toggle className="form-select">{value}</Dropdown.Toggle>
          <Dropdown.Menu>
            {layerValueInputInfo.options.map((option) => (
              <Dropdown.Item
                eventKey={option.value}
                key={option.value}
                active={value === option.value}
              >
                {option.label}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      )
    }

    return (
      <Form.Control
        className="d-inline"
        style={{ width: '10ch' }}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onBlur={handleRegexpChange}
      />
    )
  }

  return (
    <div
      className={[
        'block input-block basic-expression position-relative focus-ring border rounded py-3 ps-2 pe-3 my-2 ms-1 me-2',
      ]
        .concat([isCursorOnMe ? 'cursor-focus' : ''])
        .join(' ')}
    >
      {showChangeToExpressionListButton && (
        <ChangeToExpressionListButton
          className="position-absolute top-0 start-50 translate-middle rounded-circle p-1"
          onClick={(type) => handleChangeToExpressionList(type, true)}
        />
      )}

      <div className="d-flex justify-content-center column-gap-2">
        {/* field */}
        <Dropdown onSelect={handleLayerChange}>
          <Dropdown.Toggle className="form-select">{layer}</Dropdown.Toggle>
          <Dropdown.Menu>
            <div className="d-flex">
              <div
                className={([] as string[])
                  .concat(showCustomLayers && hasCustomLayers ? ['border-end pe-1'] : [])
                  .join(' ')}
              >
                {/* custom user input? - "unknown layer" category */}
                {showBasicLayer && (
                  <>
                    <Dropdown.Header>Basic Search Layer</Dropdown.Header>
                    <Dropdown.Item eventKey={basicLayer} active={layer === basicLayer}>
                      {renderLayerItem(basicLayer)}
                    </Dropdown.Item>
                    <Dropdown.Divider />
                  </>
                )}
                {(showBasicLayer || (showCustomLayers && customLayers.length > 0)) && (
                  <Dropdown.Header>Advanced Search Layers</Dropdown.Header>
                )}
                {ADVANCED_LAYERS.filter(
                  !showAllAdvancedLayers ? (layerData) => layerInfo.has(layerData.id) : () => true
                ).map((layerData) => (
                  <Fragment key={layerData.id}>
                    <Dropdown.Item eventKey={layerData.id} active={layer === layerData.id}>
                      <strong>{layerData.id}</strong>: {layerData.label}
                      {renderLayerResourceCount(layerData.id)}
                    </Dropdown.Item>
                    {renderLayerQualifiers(layerData.id)}
                  </Fragment>
                ))}
                {!showBasicLayer && !showAllAdvancedLayers && customLayers.length === 0 && (
                  // real exception case, probably for resources that specify ADVANCED_SEARCH capability but no supported layers?
                  // and no other normal resources are selected!
                  <Dropdown.ItemText style={{ width: 'max-content' }}>
                    <em className="text-warning-emphasis">No supported layers available?!</em>
                    <br />
                    <em className="text-secondary">Maybe select a few more resources.</em>
                  </Dropdown.ItemText>
                )}
              </div>
              <div
                className={([] as string[])
                  .concat((showBasicLayer && hasBasicLayer) || hasAdvancedLayers ? ['ps-1'] : [])
                  .join(' ')}
              >
                {showCustomLayers && customLayers.length > 0 && (
                  <>
                    <Dropdown.Header>Custom Layers</Dropdown.Header>
                    {customLayers.map((layerId) => (
                      <Fragment key={layerId}>
                        <Dropdown.Item eventKey={layerId} active={layer === layerId}>
                          <strong>{layerId}</strong>
                          {renderLayerResourceCount(layerId)}
                        </Dropdown.Item>
                        {renderLayerQualifiers(layerId)}
                      </Fragment>
                    ))}
                  </>
                )}
              </div>
            </div>
          </Dropdown.Menu>
        </Dropdown>
        {/* op */}
        <Form.Select
          style={{ width: 'fit-content' }}
          value={operator}
          onChange={handleOperatorChange}
        >
          {EXPRESSION_OPERATORS.map((operator) => (
            <option key={operator.id} value={operator.id}>
              {operator.label}
            </option>
          ))}
        </Form.Select>
        {/* regexp */}
        {renderRegexpInput()}
      </div>

      {showChangeToExpressionListButton && (
        <ChangeToExpressionListButton
          className="position-absolute top-100 start-50 translate-middle rounded-circle p-1"
          onClick={(type) => handleChangeToExpressionList(type, false)}
        />
      )}

      <div className="actions position-absolute top-0 d-flex">
        <WrapExpressionButton allowedIds={allowedWrapIds} onClick={handleWrap} />
        <RemoveButton onClick={handleRemove} />
      </div>
    </div>
  )
}

function QuantifierInput({ ctx, onChange }: { ctx: QuantifierContext; onChange?: () => void }) {
  const { rewriter } = useFCSQueryUpdater()

  // check what type of quantifier, symbol vs. range expression
  const isZeroOrMore = ctx.Q_ZERO_OR_MORE() !== null // *
  const isOneOrMore = ctx.Q_ONE_OR_MORE() !== null // +
  const isZeroOrOne = ctx.Q_ZERO_OR_ONE() !== null // ?
  const isRange = !(isZeroOrMore || isOneOrMore || isZeroOrOne) // { ... }
  const numChildren = ctx.getChildCount()
  const hasCommaRange = numChildren >= 4

  // { N } or { N ,
  const nodeN =
    isRange && (numChildren === 3 || ctx.Q_COMMA() === ctx.getChild(2))
      ? (ctx.getChild(1) as TerminalNode).symbol
      : null
  // { , M } or { N, M }
  const nodeM =
    isRange && numChildren >= 4 && ctx.Q_COMMA() === ctx.getChild(numChildren - 3)
      ? (ctx.getChild(numChildren - 2) as TerminalNode).symbol
      : null
  // store temporarily here first for useEffect updating
  const valueN = nodeN !== null ? Number.parseInt(nodeN.text!) : null
  const valueM = nodeM !== null ? Number.parseInt(nodeM.text!) : null

  const valueSelection = isRange
    ? valueN !== null && valueM !== null
      ? 'n-m'
      : valueN !== null
      ? hasCommaRange
        ? 'n-'
        : 'n-n'
      : valueM !== null
      ? '-m'
      : null // this should not really happen
    : isZeroOrMore
    ? '*'
    : isZeroOrOne
    ? '?'
    : isOneOrMore
    ? '+'
    : null // this should not really happen

  const [quantifierSelection, setQuantifierSelection] = useState<QuantifierChoicesType>(
    valueSelection ?? '?'
  )
  const [quantifierN, setQuantifierN] = useState<number | null>(valueN)
  const [quantifierM, setQuantifierM] = useState<number | null>(valueM)
  useEffect(() => {
    setQuantifierN(valueN)
    setQuantifierM(valueM)
  }, [valueN, valueM])

  const isInvalidRange =
    (quantifierN !== null && quantifierM !== null && quantifierN > quantifierM) ||
    (quantifierN !== null && quantifierN < 0) ||
    (quantifierM !== null && quantifierM < 1) // makes this somewhat invalid

  // ------------------------------------------------------------------------
  // event handlers

  function handleQuantifierSelectionChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const newQuantifierSelection = event.target.value
    setQuantifierSelection(newQuantifierSelection as QuantifierChoicesType)

    // TODO: extract defauls
    // TODO: replace template with user inputs (if changed between numbers)
    const text = QUANTIFIER_CHOICES_MAP[newQuantifierSelection].new ?? '?'
    rewriter.replace(ctx.start!, ctx.stop!, text)
    onChange?.()
  }

  function handleQuantifierNChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = Number.parseInt(event.target.value)
    setQuantifierN(!Number.isNaN(value) ? value : null)

    if (nodeN !== null && !Number.isNaN(value)) {
      rewriter.replaceSingle(nodeN, value.toString())
      onChange?.()
    }
  }

  function handleQuantifierMChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = Number.parseInt(event.target.value)
    setQuantifierM(!Number.isNaN(value) ? value : null)

    if (nodeM !== null && !Number.isNaN(value)) {
      rewriter.replaceSingle(nodeM, value.toString())
      onChange?.()
    }
  }

  function handleRemove() {
    rewriter.delete(ctx.start!, ctx.stop!)
    onChange?.()
  }

  // ------------------------------------------------------------------------
  // UI

  return (
    <div
      className={[
        'block input-block quantifier position-relative border rounded p-1 pt-3 px-1 m-1 me-2 mt-2',
      ]
        .concat(isInvalidRange ? ['invalid-range'] : [])
        .join(' ')}
    >
      <div className="d-flex flex-column align-items-center row-gap-1">
        <Form.Select
          size="sm"
          style={{ width: 'fit-content' }}
          value={quantifierSelection}
          onChange={handleQuantifierSelectionChange}
        >
          {/* feature flags for symbols/ranges? */}
          {QUANTIFIER_CHOICES.map((item) => (
            <option value={item.id} key={item.id}>
              {item.label}
            </option>
          ))}
        </Form.Select>
        <div className="d-flex align-items-baseline column-gap-1">
          {['+', '*', '?'].includes(quantifierSelection) ? (
            <code className="keyword">{quantifierSelection}</code>
          ) : (
            <>
              <code className="keyword">{'{'}</code>
              <Form.Text>Repeat</Form.Text>
              {['n-m', 'n-', 'n-n'].includes(quantifierSelection) && (
                <Form.Control
                  size="sm"
                  style={{ width: '8ch' }}
                  type="number"
                  min={quantifierSelection === 'n-n' ? 1 : 0}
                  max={quantifierSelection === 'n-m' ? quantifierM ?? undefined : undefined}
                  value={quantifierN ?? 0}
                  onChange={handleQuantifierNChange}
                />
              )}
              {quantifierSelection === 'n-m' && <Form.Text>to</Form.Text>}
              {['n-m', '-m'].includes(quantifierSelection) && (
                <Form.Control
                  size="sm"
                  style={{ width: '8ch' }}
                  type="number"
                  min={quantifierSelection === 'n-m' ? quantifierN || 1 : 1}
                  value={quantifierM ?? quantifierN ?? 1}
                  onChange={handleQuantifierMChange}
                />
              )}
              <code className="keyword">{'}'}</code>
            </>
          )}
        </div>
      </div>

      <RemoveButton
        className="del-quantifier-btn position-absolute top-0 start-100 translate-middle"
        onClick={handleRemove}
      />
    </div>
  )
}

// --------------------------------------------------------------------------
// query segments and expressions

function QuerySimple({ ctx, onChange }: { ctx: Query_simpleContext; onChange?: () => void }) {
  const { rewriter } = useFCSQueryUpdater()
  const { enableQuantifiers } = useFCSQueryBuilderConfig()
  const { cursorPos } = useFCSParserLexer()

  const queryImplicitCtx = ctx.query_implicit()
  const querySegmentCtx = ctx.query_segment()
  const quantifierCtx = ctx.quantifier()

  const isImplicit = queryImplicitCtx !== null

  const isCursorOnMe = isImplicit
    ? isCursorOnContext(queryImplicitCtx, cursorPos)
    : isCursorOnContext(querySegmentCtx, cursorPos)

  // ------------------------------------------------------------------------
  // event handlers

  function handleRemove() {
    // TODO: validation required?
    rewriter.delete(ctx.start!, ctx.stop!)
    onChange?.()
  }

  function handleAddQuantifier() {
    rewriter.insertAfter(ctx.stop!, ` ${DEFAULT_NEW_QUANTIFIER}`)
    onChange?.()
  }

  // ------------------------------------------------------------------------
  // UI

  function renderQuery() {
    if (queryImplicitCtx !== null) {
      const regexpNode = queryImplicitCtx.regexp().regexp_pattern().REGEXP()
      const valueQuoted = regexpNode.symbol.text
      // const quoteChar = valueQuoted?.charAt(0)
      const value = unescapeQuotes(valueQuoted?.slice(1, -1))

      function handleValueChange(value: string) {
        rewriter.replaceSingle(regexpNode.symbol, `"${escapeQuotes(value)}"`)
        onChange?.()
      }

      return <ImplicitQueryInput value={value ?? ''} onChange={handleValueChange} />
    }

    if (querySegmentCtx !== null) {
      const expressionCtx = querySegmentCtx.expression()

      // empty (placeholder) query segment
      if (!expressionCtx) {
        function handleAddExpressionList(type: NewExpressionType) {
          const text = NEW_EXPRESSIONS_MAP[type].new
          rewriter.insertAfter(ctx.start!, ` ${text} `)
          onChange?.()
        }

        return <AddExpressionButton onClick={(type) => handleAddExpressionList(type)} />
      }

      return <Expression ctx={expressionCtx} onChange={onChange} />
    }

    throw Error('Invalid parse tree. Expected "query-segment" context.')
  }

  return (
    <div
      className={[
        'block query-simple focus-ring border rounded p-1 pe-2 my-2 position-relative d-flex align-items-center',
      ]
        .concat(isCursorOnMe ? 'cursor-focus' : '')
        .join(' ')}
    >
      {isImplicit ? <code className="delims">"</code> : <code className="delims">[</code>}
      {renderQuery()}
      {isImplicit ? <code className="delims">"</code> : <code className="delims">]</code>}
      {enableQuantifiers && quantifierCtx !== null && (
        <QuantifierInput ctx={quantifierCtx} onChange={onChange} />
      )}
      <RemoveButton
        className="del-query-segment-btn position-absolute top-0 start-100 translate-middle"
        onClick={handleRemove}
      />
      {enableQuantifiers && quantifierCtx === null && (
        <AddQuantifierButton
          className="position-absolute top-100 start-100 translate-middle"
          onClick={handleAddQuantifier}
        />
      )}
    </div>
  )
}

// TODO: is more or less virtual, maybe fold into QuerySimple
function Expression({ ctx, onChange }: { ctx: ExpressionContext; onChange?: () => void }) {
  const expressionCtx = ctx.getChild(0)! as ExpressionChild

  // terminal expression
  if (expressionCtx instanceof Expression_basicContext) {
    return (
      <BasicExpressionInput
        ctx={expressionCtx}
        showChangeToExpressionListButton={true}
        onChange={onChange}
      />
    )
  }

  // wrapper: not/group
  if (
    expressionCtx instanceof Expression_notContext ||
    expressionCtx instanceof Expression_groupContext
  ) {
    return <ExpressionWrap ctx={expressionCtx} onChange={onChange} />
  }

  // list: or/and
  return <ExpressionList ctx={expressionCtx} onChange={onChange} />
}

function ExpressionWrap({
  ctx,
  onChange,
}: {
  ctx: Expression_notContext | Expression_groupContext
  onChange?: () => void
}) {
  const isNegation = ctx instanceof Expression_notContext
  const isGroup = ctx instanceof Expression_groupContext

  const innerCtx = ctx.getChild(1)! as ExpressionChild

  return (
    <div
      className={['block expression-wrap position-relative p-1 m-1 border rounded']
        .concat(isNegation ? ['negation-expression d-flex align-items-center'] : [])
        .concat(isGroup ? ['group-expression d-flex align-items-center'] : [])
        .join(' ')}
    >
      {isNegation && <code className="delims">!</code>}
      {isGroup && <code className="delims">(</code>}
      {innerCtx instanceof Expression_basicContext ? (
        <BasicExpressionInput
          ctx={innerCtx}
          showChangeToExpressionListButton={!isNegation}
          onChange={onChange}
        />
      ) : innerCtx instanceof Expression_notContext ||
        innerCtx instanceof Expression_groupContext ? (
        <ExpressionWrap ctx={innerCtx} onChange={onChange} />
      ) : (
        <ExpressionList ctx={innerCtx} onChange={onChange} />
      )}
      {isGroup && <code className="delims">)</code>}
    </div>
  )
}

function ExpressionList({
  ctx,
  onChange,
}: {
  ctx: Expression_orContext | Expression_andContext
  onChange?: () => void
}) {
  const { rewriter } = useFCSQueryUpdater()

  const isAndExpression = ctx instanceof Expression_andContext
  const isOrExpression = ctx instanceof Expression_orContext

  const allowedIds = (Object.keys(NEW_EXPRESSIONS_MAP) as NewExpressionType[])
    .filter(isAndExpression ? (id) => id !== 'and' : () => true)
    .filter(isOrExpression ? (id) => id !== 'or' : () => true)
  const newExpressionOp = isAndExpression ? '&' : '|'

  // ------------------------------------------------------------------------
  // event handlers

  function handleAddFirst(type: NewExpressionType) {
    const tokenIndex =
      ctx.children.length > 0 ? (ctx.children as ExpressionChild[])[0].start!.tokenIndex : 0
    const text = NEW_EXPRESSIONS_MAP[type].new

    const textMaybeWrapped = type === 'basic' ? text : `( ${text} )`
    rewriter.insertBefore(tokenIndex, `${textMaybeWrapped} ${newExpressionOp} `)
    onChange?.()
  }

  function handleAddAfterExpression(type: NewExpressionType, ctx: ExpressionChild) {
    const tokenIndex = ctx.stop!.tokenIndex
    const text = NEW_EXPRESSIONS_MAP[type].new

    const textMaybeWrapped = type === 'basic' ? text : `( ${text} )`
    rewriter.insertAfter(tokenIndex, ` ${newExpressionOp} ${textMaybeWrapped}`)
    onChange?.()
  }

  // ------------------------------------------------------------------------
  // UI

  function renderChild(childCtx: ExpressionChild) {
    if (childCtx instanceof Expression_basicContext) {
      return (
        <BasicExpressionInput
          ctx={childCtx}
          showChangeToExpressionListButton={false}
          onChange={onChange}
        />
      )
    }

    if (childCtx instanceof Expression_notContext || childCtx instanceof Expression_groupContext) {
      return <ExpressionWrap ctx={childCtx} onChange={onChange} />
    }

    return <ExpressionList ctx={childCtx} onChange={onChange} />
  }

  return (
    <div
      className={['block expression-list p-1 m-1 border rounded position-relative']
        .concat(isOrExpression ? ['or-expression'] : [])
        .concat(isAndExpression ? ['and-expression'] : [])
        .join(' ')}
    >
      {isOrExpression && <code className="delims position-absolute ps-1">OR</code>}
      {isAndExpression && <code className="delims position-absolute ps-1">AND</code>}
      <div className="d-flex flex-column align-items-center mt-1">
        <AddExpressionButton allowedIds={allowedIds} onClick={handleAddFirst} />
        {(ctx.children.filter((_, i) => i % 2 === 0) as ExpressionChild[]).map((childCtx) => (
          <Fragment key={`expression-${childCtx.getSourceInterval().toString()}`}>
            {renderChild(childCtx)}
            <AddExpressionButton
              allowedIds={allowedIds}
              onClick={(type) => handleAddAfterExpression(type, childCtx)}
            />
          </Fragment>
        ))}
      </div>
    </div>
  )
}

// --------------------------------------------------------------------------
