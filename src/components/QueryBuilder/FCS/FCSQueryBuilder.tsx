import { Fragment, useCallback, useEffect, useState } from 'react'

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
import { type ParseTree, TerminalNode, TokenStreamRewriter } from 'antlr4ng'
import {
  CHANGE_TO_EXPRESSION_LIST,
  CHANGE_TO_EXPRESSION_LIST_MAP,
  type ChangeToExpressionListType,
  DEFAULT_NEW_QUANTIFIER,
  type ExpressionChild,
  NEW_EXPRESSIONS,
  NEW_EXPRESSIONS_MAP,
  NEW_QUERY_SEGMENTS,
  NEW_QUERY_SEGMENTS_MAP,
  type NewExpressionType,
  type NewQuerySegmentType,
  QUANTIFIER_CHOICES,
  QUANTIFIER_CHOICES_MAP,
  type QuantifierChoicesType,
  WITHIN_CHOICES,
  WRAP_EXPRESSION,
  WRAP_EXPRESSION_MAP,
  type WrapExpressionType,
} from './constants'
import { FCSParserLexerProvider } from './FCSParserLexerContext'
import {
  type FCSQueryBuilderConfig,
  FCSQueryBuilderConfigProvider,
  useFCSQueryBuilderConfig,
} from './FCSQueryBuilderConfigContext'
import { FCSQueryUpdaterProvider, useFCSQueryUpdater } from './FCSQueryUpdaterContext'
import {
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

import './styles.css'

// --------------------------------------------------------------------------

interface FCSQueryBuilderProps {
  query?: string
  onChange?: (query: string) => void
}

export function FCSQueryBuilder({
  query: queryProp,
  onChange,
  ...props
}: FCSQueryBuilderProps & Partial<FCSQueryBuilderConfig>) {
  const [query, setQuery] = useState(queryProp ?? '')
  useEffect(() => setQuery(queryProp ?? ''), [queryProp])

  console.debug('Parse query', { query, queryProp })
  const parsed = parseQuery(query)

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
    // add dummy to trigger adding of gui element
    const text = NEW_QUERY_SEGMENTS_MAP[type].new
    setQuery(text)
    handleQueryChange()
  }

  // ------------------------------------------------------------------------
  // UI

  return (
    <div id="query-builder" className="fcs-query border rounded p-1">
      <FCSQueryBuilderConfigProvider
        enableWithin={props.enableWithin || false}
        enableWrapGroup={props.enableWrapGroup || false}
        enableWrapNegation={props.enableWrapNegation || false}
        enableImplicitQuery={props.enableImplicitQuery || false}
        enableMultipleQuerySegments={props.enableMultipleQuerySegments || true}
        enableQuantifiers={props.enableQuantifiers || true}
        enableRegexpFlags={props.enableRegexpFlags || false}
      >
        {parsed ? (
          <FCSParserLexerProvider parser={parsed.parser} lexer={parsed.lexer}>
            <FCSQueryUpdaterProvider rewriter={parsed.rewriter}>
              <Query tree={parsed.tree} onChange={handleQueryChange} />
            </FCSQueryUpdaterProvider>
          </FCSParserLexerProvider>
        ) : (
          <AddQuerySegmentButton onClick={handleAddQuery} />
        )}
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
    <div className="block query d-flex flex-wrap row-gap-2 column-gap-1 border rounded p-1">
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
          <Button size="sm" onClick={handleAddWithinClause}>
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

  const attributeCtx = ctx.attribute()
  const operatorNode = ctx.getChild(1) as TerminalNode
  const regexpNode = ctx.regexp().regexp_pattern().REGEXP()

  const [layer, setLayer] = useState('text')
  const [operator, setOperator] = useState('is')
  const [value, setValue] = useState('')

  // update from outside (query input change)
  useEffect(() => {
    const isOpEq = operatorNode.symbol.type === FCSParser.OPERATOR_EQ

    const valueQuoted = regexpNode.symbol.text
    const quoteChar = valueQuoted?.charAt(0)
    // TODO: quote escapes? if both single and double?
    const newValue = unescapeQuotes(
      unescapeRegexValue(valueQuoted?.slice(1, -1)),
      quoteChar === "'"
    )

    setOperator(isOpEq ? 'is' : 'is-not')
    setValue(newValue ?? '')
  }, [attributeCtx, operatorNode, regexpNode])

  const parentCtx = ctx.parent
  const allowedWrapIds = (Object.keys(WRAP_EXPRESSION_MAP) as WrapExpressionType[])
    .filter(parentCtx instanceof Expression_groupContext ? (id) => id !== 'group' : () => true)
    .filter(parentCtx instanceof Expression_notContext ? (id) => id !== 'group' : () => true)

  // ------------------------------------------------------------------------
  // event handlers

  function handleLayerChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const newLayer = event.target.value
    setLayer(newLayer) // unnecessary if we completely rebuild UI

    rewriter.replace(attributeCtx.start!, attributeCtx.stop!, newLayer)
    onChange?.()
  }

  function handleOperatorChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const newOperator = event.target.value
    setOperator(newOperator) // unnecessary if we completely rebuild UI

    rewriter.replaceSingle(operatorNode.symbol, newOperator === 'is' ? '=' : '!=')
    onChange?.()
  }

  function handleRegexpChange() {
    // TODO: escape if quotes!
    const escapedValue = escapeRegexValue(value)
    // TODO: handle regexp escapes
    rewriter.replaceSingle(regexpNode.symbol, `"${escapedValue}"`)
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

  return (
    <div className="block input-block basic-expression position-relative border rounded py-3 ps-2 pe-3 my-2 ms-1 me-2">
      {showChangeToExpressionListButton && (
        <ChangeToExpressionListButton
          className="position-absolute top-0 start-50 translate-middle rounded-circle p-1"
          onClick={(type) => handleChangeToExpressionList(type, true)}
        />
      )}

      <div className="d-flex justify-content-center column-gap-2">
        {/* TODO: adjust sizes a bit if longer selections? */}
        {/* field */}
        <Form.Select style={{ width: '10ch' }} value={layer} onChange={handleLayerChange}>
          <option value="text">text</option>
          <option value="pos">pos</option>
        </Form.Select>
        {/* op */}
        <Form.Select style={{ width: '10ch' }} value={operator} onChange={handleOperatorChange}>
          <option value="is">is</option>
          <option value="is-not">is not</option>
        </Form.Select>
        {/* regexp */}
        <Form.Control
          className="d-inline"
          style={{ width: '10ch' }}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onBlur={handleRegexpChange}
        />
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
    setQuantifierN(value)

    if (nodeN !== null) {
      rewriter.replaceSingle(nodeN, value.toString())
      onChange?.()
    }
  }

  function handleQuantifierMChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = Number.parseInt(event.target.value)
    setQuantifierM(value)

    if (nodeM !== null) {
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

  const queryImplicitCtx = ctx.query_implicit()
  const querySegmentCtx = ctx.query_segment()
  const quantifierCtx = ctx.quantifier()

  const isImplicit = queryImplicitCtx !== null

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
      const quoteChar = valueQuoted?.charAt(0)
      const value = unescapeQuotes(valueQuoted?.slice(1, -1), quoteChar === "'")

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
    <div className="block query-simple border rounded p-1 pe-2 my-2 position-relative d-flex align-items-center">
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
