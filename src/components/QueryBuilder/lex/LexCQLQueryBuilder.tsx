import { TerminalNode } from 'antlr4ng'
import { Fragment, useEffect, useMemo, useState } from 'react'
import Button from 'react-bootstrap/Button'
import Dropdown from 'react-bootstrap/Dropdown'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'

import {
  Boolean_modifiedContext,
  Boolean_queryContext,
  QueryContext,
  Relation_modifiedContext,
  Search_clauseContext,
  SubqueryContext,
} from '@/parsers/LexParser'
import type { Resource } from '@/utils/api'
import { isCursorOnContext } from '../utils'
import type {
  FieldsType,
  NewSearchClauseChoicesType,
  RelationModifiersType,
  RelationsType,
} from './constants'
import {
  BOOLEANS,
  DEFAULT_NEW_RELATION,
  FIELD_GROUPS,
  FIELDS_MAP,
  NEW_SEARCH_CLAUSE_CHOICES,
  NEW_SEARCH_CLAUSE_CHOICES_MAP,
  RELATION_MODIFIERS,
  RELATION_MODIFIERS_MUTUALLY_EXCLUSIVE,
  RELATIONS,
} from './constants'
import { LexCQLParserLexerProvider, useLexCQLParserLexer } from './LexCQLParserLexerContext'
import {
  LexCQLQueryBuilderConfig,
  LexCQLQueryBuilderConfigProvider,
  useLexCQLQueryBuilderConfig,
} from './LexCQLQueryBuilderConfigContext'
import { LexCQLQueryUpdaterProvider, useLexCQLQueryUpdater } from './LexCQLQueryUpdaterContext'
import {
  LexCQLResourceFieldInfoProvider,
  useLexCQLResourceFieldInfo,
} from './LexCQLResourceFieldInfoContext'
import { maybeQuoteSearchTerm, maybeUnquoteSearchTerm, parseQuery } from './utils'

// import bracesIcon from 'bootstrap-icons/icons/braces.svg?raw'
import plusCircleIcon from 'bootstrap-icons/icons/plus-circle.svg?raw'
import xCircleIcon from 'bootstrap-icons/icons/x-circle.svg?raw'

import './styles.css'

// --------------------------------------------------------------------------

interface LexQueryBuilderProps {
  query?: string
  /** cursor position in query */
  cursorPos?: [number, number] | number
  resources?: Resource[]
  onChange?: (query: string) => void
}

export function LexCQLQueryBuilder({
  query: queryProp,
  cursorPos,
  resources: resourcesProp,
  onChange,
  ...props
}: LexQueryBuilderProps & Partial<LexCQLQueryBuilderConfig>) {
  const [query, setQuery] = useState(queryProp ?? '')
  useEffect(() => setQuery(queryProp ?? ''), [queryProp])

  // let's again filter for resources that have the Lex Data View or LEX_SEARCH search capability (and at least one field?)
  const resources = useMemo(() => {
    const filtered =
      resourcesProp?.filter(
        (resource) =>
          (resource.availableDataViews?.find(
            (dataview) => dataview.mimeType === 'application/x-clarin-fcs-lex+xml'
          ) !== undefined ||
            resource.searchCapabilitiesResolved.includes('LEX_SEARCH')) &&
          resource.availableLexFields !== null &&
          resource.availableLexFields.length > 0
      ) ?? []

    if (resourcesProp && resourcesProp.length !== filtered.length) {
      const resourcesDiff = resourcesProp.filter((resource) => !filtered.includes(resource))
      console.warn(
        'Filter out resource(s) that do(es) not correctly declare LexCQL query support',
        resourcesDiff
      )
    }

    return filtered
  }, [resourcesProp])

  // compute list of fields we know and want to make available
  const fieldInfo = useMemo(() => {
    return resources
      .map((resource) => {
        const fieldTypes = new Set<string>()
        resource.availableLexFields!.forEach((field) => {
          if (!fieldTypes.has(field.type)) {
            fieldTypes.add(field.type)
          }
        })
        return [...fieldTypes.values()].map((fieldType) => ({
          fieldType,
          resource,
        }))
      })
      .reduce((map, item) => {
        item.forEach(({ fieldType, resource }) => {
          if (!map.has(fieldType)) {
            map.set(fieldType, [] as Resource[])
          }
          const data = map.get(fieldType)!
          data.push(resource)
        })
        return map
      }, new Map<string, Resource[]>())
  }, [resources])
  // console.debug('fieldInfo', { resources, fieldInfo })

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

  function handleAddSearchClauseClick(type: NewSearchClauseChoicesType) {
    const newQuery = NEW_SEARCH_CLAUSE_CHOICES_MAP[type].new
    setQuery(newQuery)
    onChange?.(newQuery)
  }

  // ------------------------------------------------------------------------
  // UI

  return (
    <div id="query-builder" className="lex-query d-flex justify-content-center">
      <LexCQLQueryBuilderConfigProvider
        enableRelationModifiers={props.enableRelationModifiers ?? true}
        forceSearchTermQuoting={props.forceSearchTermQuoting ?? false}
        showAllFields={props.showAllFields ?? false}
        showResourceCountForField={props.showResourceCountForField ?? true}
      >
        <LexCQLResourceFieldInfoProvider resources={resources} fieldInfo={fieldInfo}>
          {parsed ? (
            <LexCQLParserLexerProvider
              parser={parsed.parser}
              lexer={parsed.lexer}
              cursorPos={cursorPos}
            >
              <LexCQLQueryUpdaterProvider rewriter={parsed.rewriter}>
                <Query tree={parsed.tree} onChange={handleQueryChange} />
              </LexCQLQueryUpdaterProvider>
            </LexCQLParserLexerProvider>
          ) : (
            <AddSearchClauseButton onClick={handleAddSearchClauseClick} />
          )}
        </LexCQLResourceFieldInfoProvider>
      </LexCQLQueryBuilderConfigProvider>
    </div>
  )
}

// --------------------------------------------------------------------------
// modify query buttons

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

function AddSearchClauseButton({
  className,
  onClick,
}: {
  className?: string
  onClick?: (type: NewSearchClauseChoicesType) => void
}) {
  function handleAddSelection(eventKey: string | null) {
    if (!eventKey) return
    onClick?.(eventKey as unknown as NewSearchClauseChoicesType)
  }

  return (
    <Dropdown
      className={[''].concat(className ?? []).join(' ')}
      onSelect={handleAddSelection}
      aria-label="Add search clause"
    >
      <Dropdown.Toggle variant="link" className="add-search-clause-btn action-btn no-arrow">
        <i dangerouslySetInnerHTML={{ __html: plusCircleIcon }} aria-hidden="true" />
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {NEW_SEARCH_CLAUSE_CHOICES.map((item) => (
          <Dropdown.Item key={item.id} eventKey={item.id}>
            {item.label}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  )
}

// --------------------------------------------------------------------------
// query structure

function Query({ tree, onChange }: { tree: QueryContext; onChange?: () => void }) {
  const booleanQueryCtx = tree.boolean_query()

  return (
    <div className="query flex-grow-1 justify-content-center d-flex flex-wrap row-gap-2 column-gap-1 rounded">
      <BooleanQuerySequence ctx={booleanQueryCtx} onChange={onChange} />
    </div>
  )
}

function BooleanQuerySequence({
  ctx,
  onChange,
}: {
  ctx: Boolean_queryContext
  onChange?: () => void
}) {
  const { rewriter } = useLexCQLQueryUpdater()

  const hasMultipleChildren = ctx.getChildCount() > 1

  // ------------------------------------------------------------------------
  // event handlers

  function handleDelete(childIdx: number) {
    if (ctx.getChildCount() === 1) {
      // case: single subquery child
      const subqueryCtx = ctx.subquery(0)
      if (!subqueryCtx || !subqueryCtx.start) {
        console.warn('Invalid parse tree state. A subquery with associated token should exist!', {
          ctx,
          subqueryCtx,
          childIdx,
        })
        return
      }
      rewriter.delete(subqueryCtx.start, subqueryCtx.stop)
      onChange?.()
    } else if (childIdx === 0) {
      // case: first subquery child but more siblings follow
      // note: delete boolean after (since more siblings follow)
      const subqueryCtx = ctx.subquery(0)
      const booleanModifiedCtx = ctx.boolean_modified(0)
      if (!subqueryCtx || !booleanModifiedCtx || !subqueryCtx.start || !booleanModifiedCtx.stop) {
        console.warn(
          'Invalid parse tree state. A subquery and boolean_modified with associated tokens should exist!',
          {
            ctx,
            subqueryCtx,
            booleanModifiedCtx,
            childIdx,
          }
        )
        return
      }
      rewriter.delete(subqueryCtx.start, booleanModifiedCtx.stop)
      onChange?.()
    } else {
      // case: non-first subquery child with siblings before (maybe after)
      // note: delete boolean before
      const subqueryCtx = ctx.getChild(childIdx) as SubqueryContext | null
      const booleanModifiedCtx = ctx.getChild(childIdx - 1) as Boolean_modifiedContext | null
      if (!subqueryCtx || !booleanModifiedCtx || !subqueryCtx.stop || !booleanModifiedCtx.start) {
        console.warn(
          'Invalid parse tree state. A subquery and boolean_modified with associated tokens should exist!',
          {
            ctx,
            subqueryCtx,
            booleanModifiedCtx,
            childIdx,
          }
        )
        return
      }
      rewriter.delete(booleanModifiedCtx.start, subqueryCtx.stop)
      onChange?.()
    }
  }

  function handleAddSearchClauseBefore(type: NewSearchClauseChoicesType) {
    const tokenIndex = ctx.start!.tokenIndex
    const text = NEW_SEARCH_CLAUSE_CHOICES_MAP[type].newBefore

    rewriter.insertBefore(tokenIndex, `${text} `)
    onChange?.()
  }

  function handleAddSearchClauseAfter(type: NewSearchClauseChoicesType) {
    const tokenIndex = ctx.stop!.tokenIndex
    const text = NEW_SEARCH_CLAUSE_CHOICES_MAP[type].newAfter

    rewriter.insertAfter(tokenIndex, ` ${text}`)
    onChange?.()
  }

  // ------------------------------------------------------------------------
  // UI

  return (
    <div
      className={['boolean-query d-flex align-items-center row-gap-2 column-gap-1']
        .concat(
          hasMultipleChildren ? 'block justify-content-center flex-wrap border rounded p-1' : ''
        )
        .join(' ')}
    >
      <AddSearchClauseButton onClick={handleAddSearchClauseBefore} />
      {ctx.children.map((childCtx, index) => {
        if (childCtx instanceof SubqueryContext) {
          return (
            <SubQuery
              ctx={childCtx}
              onChange={onChange}
              onDelete={() => handleDelete(index)}
              key={index}
            />
          )
        }
        if (childCtx instanceof Boolean_modifiedContext) {
          return <Boolean ctx={childCtx} onChange={onChange} key={index} />
        }
      })}
      <AddSearchClauseButton onClick={handleAddSearchClauseAfter} />
    </div>
  )
}

function SubQuery({
  ctx,
  onChange,
  onDelete,
}: {
  ctx: SubqueryContext
  onChange?: () => void
  onDelete?: () => void
}) {
  const booleanQueryCtx = ctx.boolean_query()
  const searchClauseCtx = ctx.search_clause()

  // search_clause is in subquery --> 1. parent: subquery
  // subquery is in boolean_query --> 2. parent: boolean_query
  // boolean_query is in subquery|query --> 3. parent: subquery with parentheses
  // subquery? > boolean_query > subquery > search_clause
  // boolean_query --> childCount if list or single

  // const isSearchClauseSingleChildInBooleanQuery =
  //   searchClauseCtx !== null && searchClauseCtx.parent?.parent?.getChildCount() === 1
  // const isSearchClauseSingleAtTop =
  //   searchClauseCtx !== null && searchClauseCtx.parent?.parent?.parent instanceof QueryContext
  // const shouldShowRemoveButton =
  //   isSearchClauseSingleAtTop ||
  //   !isSearchClauseSingleChildInBooleanQuery ||
  //   (hasBooleanQuery && booleanQueryCtx.getChildCount() > 1)

  const hasBooleanQuery = booleanQueryCtx !== null
  const hasSearchClause = searchClauseCtx !== null

  // only show remove button if the boolean_query has no parent with this as a single child
  // then transfer the deletability to the parent
  const shouldShowRemoveButton =
    hasBooleanQuery &&
    // booleanQueryCtx.getChildCount() === 1 &&
    !(
      booleanQueryCtx.parent?.parent instanceof Boolean_queryContext &&
      booleanQueryCtx.parent?.parent.getChildCount() === 1
    )

  // ------------------------------------------------------------------------
  // event handlers

  // ------------------------------------------------------------------------
  // UI

  return (
    <div
      className={['sub-query position-relative align-items-center justify-content-center d-flex']
        .concat(hasBooleanQuery ? 'block border rounded p-1' : '')
        .join(' ')}
    >
      {hasBooleanQuery ? (
        <>
          <code className="delims">(</code>
          <BooleanQuerySequence ctx={booleanQueryCtx} onChange={onChange} />
          <code className="delims">)</code>
          {shouldShowRemoveButton && (
            <RemoveButton
              className="del-within-clause-btn position-absolute top-0 start-100 translate-middle"
              onClick={onDelete}
            />
          )}
        </>
      ) : hasSearchClause ? (
        <SearchClause ctx={searchClauseCtx!} onChange={onChange} onDelete={onDelete} />
      ) : (
        // this is an error, it seems to parse and creates a tree but what should we show here
        <div
          className="text-danger px-1"
          title="Parse error. Expected search clause or a sub query!"
        >
          ???
        </div>
      )}
    </div>
  )
}

// --------------------------------------------------------------------------
// inputs

function Boolean({ ctx, onChange }: { ctx: Boolean_modifiedContext; onChange?: () => void }) {
  const { rewriter } = useLexCQLQueryUpdater()
  const { cursorPos } = useLexCQLParserLexer()

  const isCursorOnMe = isCursorOnContext(ctx, cursorPos)

  const value = ctx.getChild(0)?.getText().toLowerCase()

  // ------------------------------------------------------------------------
  // event handlers

  function handleSelect(eventKey: string | null) {
    const newBoolean = eventKey
    if (!newBoolean) return
    if (newBoolean === value) return

    const token = (ctx.r_boolean().getChild(0) as TerminalNode).symbol
    if (!token) {
      console.warn('Unexpected parse tree, expected terminal node as first child!', {
        ctx,
        boolean: ctx.r_boolean(),
        firstChild: ctx.r_boolean().getChild(0),
      })
      return
    }
    rewriter.replaceSingle(token, newBoolean)
    onChange?.()
  }

  // ------------------------------------------------------------------------
  // UI

  return (
    <div
      className={['boolean focus-ring rounded mx-1']
        .concat([isCursorOnMe ? 'cursor-focus' : ''])
        .join(' ')}
    >
      <Dropdown onSelect={handleSelect}>
        <Dropdown.Toggle className="form-select">
          <code className="keyword">{value}</code>
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {BOOLEANS.map((boolean) => (
            <Dropdown.Item key={boolean.id} eventKey={boolean.id}>
              {boolean.label}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    </div>
  )
}

function extractRelationModifierIDsFromQuery(relationModifiedCtx: Relation_modifiedContext | null) {
  // extract names from query
  const modifierListCtx = relationModifiedCtx?.modifier_list()?.modifier() ?? []
  const modifierListCtxNames = modifierListCtx.map(
    (modifierCtx) =>
      modifierCtx.modifier_name().simple_name().SIMPLE_STRING().symbol.text?.toLowerCase() ?? ''
  )

  return RELATION_MODIFIERS.map((relMod) => relMod.id).filter((modifier) =>
    modifierListCtxNames.includes(modifier.toLowerCase())
  )
}

function getRelationModifierByName(
  relationModifiedCtx: Relation_modifiedContext | null,
  name: string
) {
  // extract lang relation modifier from query
  const modifierListCtx = relationModifiedCtx?.modifier_list()?.modifier() ?? []
  const modifierLangCtx = modifierListCtx.find(
    (modifierCtx) =>
      modifierCtx.modifier_name().simple_name().SIMPLE_STRING().symbol.text?.toLowerCase() === name
  )
  return modifierLangCtx
}

function extractRelationModifierLangValueFromQuery(
  relationModifiedCtx: Relation_modifiedContext | null
) {
  // extract lang relation modifier from query
  const modifierLangCtx = getRelationModifierByName(relationModifiedCtx, 'lang')

  if (!modifierLangCtx?.modifier_relation()?.relation_symbol().EQUAL()) {
    console.warn('Language relation modifier with unsupported relation!')
    // TODO: print location info?
  }

  const modifierValueCtx = modifierLangCtx?.modifier_relation()?.modifier_value()
  if (!modifierValueCtx) {
    console.warn('No language value for for language relation modifier!')
    return ''
  }

  const quotedValue = modifierValueCtx.QUOTED_STRING()
  const simpleValue = modifierValueCtx.SIMPLE_STRING()
  const newLanguageValue = quotedValue?.symbol.text ?? simpleValue?.symbol.text
  return maybeUnquoteSearchTerm(newLanguageValue)
}

function SearchClause({
  ctx,
  onChange,
  onDelete,
}: {
  ctx: Search_clauseContext
  onChange?: () => void
  onDelete?: () => void
}) {
  const { rewriter } = useLexCQLQueryUpdater()
  const { cursorPos } = useLexCQLParserLexer()
  const { fieldInfo } = useLexCQLResourceFieldInfo()
  const {
    forceSearchTermQuoting,
    enableRelationModifiers,
    showAllFields,
    showResourceCountForField,
  } = useLexCQLQueryBuilderConfig()

  const foundFields = [...fieldInfo.keys()] as FieldsType[]

  const isCursorOnMe = isCursorOnContext(ctx, cursorPos)
  const shouldShowRemoveButton = ctx.parent?.parent?.getChildCount() !== 1

  const indexCtx = ctx.index()
  const relationModifiedCtx = ctx.relation_modified()
  const searchTermCtx = ctx.search_term()

  const [index, setIndex] = useState<FieldsType | string | null>(null)
  const [relation, setRelation] = useState<RelationsType | string | null>(null)
  const [relationModifiers, setRelationModifiers] = useState<RelationModifiersType[]>([])
  const [relationModifierLang, setRelationModifierLang] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState<string>('')

  useEffect(() => {
    const newIndex = indexCtx?.getText()
    const newRelation = relationModifiedCtx?.relation().getText()

    const quotedSearchTerm = searchTermCtx.QUOTED_STRING()
    const simpleSearchTerm = searchTermCtx.SIMPLE_STRING()
    const newSearchTerm = quotedSearchTerm?.symbol.text ?? simpleSearchTerm?.symbol.text

    setIndex(newIndex ?? null)
    setRelation(newRelation ?? null)
    setRelationModifiers(extractRelationModifierIDsFromQuery(relationModifiedCtx))
    setRelationModifierLang(extractRelationModifierLangValueFromQuery(relationModifiedCtx))
    setSearchTerm(maybeUnquoteSearchTerm(newSearchTerm))
  }, [indexCtx, relationModifiedCtx, searchTermCtx])

  const showRelationModifiers = enableRelationModifiers && relation !== 'is'

  // ------------------------------------------------------------------------
  // helpers

  function updateRelationModifiersList(
    modifiers: RelationModifiersType[],
    modifierToToggle: RelationModifiersType
  ) {
    // TODO: a.localCompare(b, undefined, { sensitivity: "base" })
    const modifierToToggleLc = modifierToToggle.toLowerCase()
    if (modifiers.map((v) => v.toLowerCase()).includes(modifierToToggleLc)) {
      return modifiers.filter((oldModifier) => oldModifier.toLowerCase() !== modifierToToggleLc)
    }

    if (
      (RELATION_MODIFIERS_MUTUALLY_EXCLUSIVE.flat(1) as string[])
        .map((v) => v.toLowerCase())
        .includes(modifierToToggleLc)
    ) {
      // filter out mutually exclusive modifier
      RELATION_MODIFIERS_MUTUALLY_EXCLUSIVE.find((modifierExclusions) => {
        const modifierExclusionsLc = modifierExclusions.map((v) => v.toLowerCase())
        // first find the list where the mutually exclusive modifier is included
        if (modifierExclusionsLc.includes(modifierToToggleLc)) {
          const modifiersToRemove = modifierExclusionsLc.filter(
            (modifierExclusion) => modifierExclusion !== modifierToToggleLc
          )
          // filter out every other modifier
          modifiers = modifiers.filter(
            (oldModifier) => !modifiersToRemove.includes(oldModifier.toLowerCase())
          )
          return true // abort find loop
        }
      })
    }
    // use updated list and now add the new modifier
    return [...modifiers, modifierToToggle]
  }

  function updateRelationModifierQuery(
    relationModifiers: RelationModifiersType[],
    relationModifiedCtx: Relation_modifiedContext | null
  ) {
    if (!relationModifiedCtx) {
      console.warn(
        'Unexpected parse state. For updating relation modifiers, the relation context should exist!',
        { relationModifiers, relationModifiedCtx }
      )
      return
    }
    const tokenIndexEnd = relationModifiedCtx.stop!.tokenIndex
    const modifierListCtx = relationModifiedCtx.modifier_list()?.modifier() ?? []

    const relationModifiersLc = relationModifiers.map((v) => v.toLowerCase())
    const relationModifiersCtxNames = []
    let changed = false

    // first remove existing modifiers if needed
    for (const modifierCtx of modifierListCtx) {
      const modifierName =
        modifierCtx.modifier_name().simple_name().SIMPLE_STRING().symbol.text?.toLowerCase() ?? ''
      if (!relationModifiersLc.includes(modifierName)) {
        rewriter.delete(modifierCtx.start!, modifierCtx.stop!)
        changed = true
      } else {
        relationModifiersCtxNames.push(modifierName)
      }
    }

    // add new modifiers if needed
    for (const newModifier of relationModifiers) {
      if (!relationModifiersCtxNames.includes(newModifier.toLowerCase())) {
        if (newModifier.toLowerCase() === 'lang') {
          rewriter.insertAfter(tokenIndexEnd, `/${newModifier}=""`)
        } else {
          rewriter.insertAfter(tokenIndexEnd, `/${newModifier}`)
        }
        changed = true
      }
    }

    if (changed) onChange?.()
  }

  // ------------------------------------------------------------------------
  // event handlers

  function handleIndexChange(eventKey: string | null) {
    const newIndex = eventKey
    if (!newIndex) return
    if (newIndex === index) return

    setIndex(newIndex)

    if (indexCtx === null) {
      setRelation(DEFAULT_NEW_RELATION)

      // TODO: this might happen elsewhere?
      const text = `${newIndex} ${DEFAULT_NEW_RELATION} ${maybeQuoteSearchTerm(
        searchTerm,
        forceSearchTermQuoting || searchTermCtx.QUOTED_STRING() !== null
      )}`
      rewriter.replace(ctx.start!, ctx.stop!, text)
    } else {
      rewriter.replace(indexCtx.start!, indexCtx.stop!, newIndex)
    }

    onChange?.()
  }

  function handleRelationChange(eventKey: string | null) {
    const newRelation = eventKey
    if (!newRelation) return
    if (newRelation === index) return

    setRelation(newRelation)
    if (relationModifiedCtx !== null) {
      const relationCtx = relationModifiedCtx.relation()
      rewriter.replace(relationCtx.start!, relationCtx.stop!, newRelation)

      if (newRelation === 'is') {
        const relationModifiersCtx = relationModifiedCtx.modifier_list()
        if (relationModifiersCtx) {
          rewriter.delete(relationModifiersCtx.start!, relationModifiersCtx.stop!)
        }
      }
    }
    onChange?.()
  }

  function handleSearchTermChange() {
    const newSearchTerm = maybeQuoteSearchTerm(
      searchTerm,
      forceSearchTermQuoting || searchTermCtx.QUOTED_STRING() !== null
    )
    rewriter.replace(searchTermCtx.start!, searchTermCtx.stop!, newSearchTerm)
    onChange?.()
  }

  function handleRelationModifierLanguageChange() {
    if (!relationModifiedCtx) {
      console.warn(
        'Unexpected parse state. For updating relation modifiers, the relation context should exist!',
        { relationModifiers, relationModifiedCtx }
      )
      return
    }

    // TODO: validate "relationModifierLang" otherwise abort

    // extract lang relation modifier from query
    const modifierLangCtx = getRelationModifierByName(relationModifiedCtx, 'lang')
    if (!modifierLangCtx) {
      // no language relation modifier found?!
      const tokenIndexEnd = relationModifiedCtx.stop!.tokenIndex
      rewriter.insertAfter(tokenIndexEnd, `/lang="${relationModifierLang}"`)
      onChange?.()
      return
    }

    // extract relation modifier value
    const modifierValueCtx = modifierLangCtx.modifier_relation()?.modifier_value()
    if (!modifierValueCtx) {
      // modifier found but without value
      const tokenIndexEnd = modifierLangCtx.stop!.tokenIndex
      rewriter.insertAfter(tokenIndexEnd, `="${relationModifierLang}"`)
      onChange?.()
      return
    }

    const newRelationModifierLanguage = maybeQuoteSearchTerm(
      relationModifierLang,
      forceSearchTermQuoting || modifierValueCtx.QUOTED_STRING() !== null
    )
    rewriter.replace(modifierValueCtx.start!, modifierValueCtx.stop!, newRelationModifierLanguage)
    onChange?.()
  }

  function handleToggleRelationModifier(modifier: RelationModifiersType) {
    // update query
    const newRelationModifiers = updateRelationModifiersList(relationModifiers, modifier)
    updateRelationModifierQuery(newRelationModifiers, relationModifiedCtx)

    // update state (not really required due to useEffect state updating on query change)
    setRelationModifiers((modifiers) => updateRelationModifiersList(modifiers, modifier))
  }

  // ------------------------------------------------------------------------
  // UI

  function renderSearchTermInput() {
    return (
      <Form.Control
        className="d-inline"
        style={{ width: '10ch' }}
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
        onBlur={handleSearchTermChange}
      />
    )
  }

  function renderRelationModifierLanguageInput() {
    // TODO: maybe pre-compute resource languages and only "allow" those languages
    const isInvalid = !relationModifierLang.match(/^[a-z]{3}$/i)

    return (
      <InputGroup hasValidation>
        <Form.Control
          className="d-inline"
          style={{
            /* maxWidth: '10ch', */
            /* see .form-check@paddingLeft */
            marginLeft: '1.5em',
          }}
          // maxLength={3}
          placeholder="ISO638-3 Code"
          pattern="[a-zA-Z]{3}"
          required
          value={relationModifierLang}
          onChange={(event) => setRelationModifierLang(event.target.value)}
          onBlur={handleRelationModifierLanguageChange}
          isInvalid={isInvalid}
        />
        <Form.Control.Feedback
          style={{
            /* see .form-check@paddingLeft + .form-control@paddingLeft */
            marginLeft: '1.75em',
            whiteSpace: 'break-spaces',
          }}
          type="invalid"
        >
          Invalid ISO639-3 language code
        </Form.Control.Feedback>
      </InputGroup>
    )
  }

  function renderFieldItem(fieldType: string, description: string | undefined = undefined) {
    return (
      <>
        <strong>{fieldType}</strong>
        {description && `: ${description}`}
        {renderFieldResourceCount(fieldType)}
      </>
    )
  }

  function renderFieldResourceCount(fieldType: string) {
    if (!showResourceCountForField) return null

    const count = fieldInfo.get(fieldType)?.length ?? 0

    return (
      <>
        <br />
        <small className="text-body-secondary">Supported by {count} resources.</small>
      </>
    )
  }

  return (
    <div
      className={[
        'block input-block basic-expression position-relative focus-ring border rounded py-2 px-2',
      ]
        .concat([shouldShowRemoveButton ? 'me-2 mt-1' : ''])
        .concat([isCursorOnMe ? 'cursor-focus' : ''])
        .join(' ')}
    >
      <div className="d-flex justify-content-center column-gap-2">
        {/* index */}
        <Dropdown onSelect={handleIndexChange}>
          <Dropdown.Toggle className="form-select">
            {index ?? <em className="text-muted">(default)</em>}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {FIELD_GROUPS.map((group) =>
              foundFields.find((fieldType) => (group.fields as FieldsType[]).includes(fieldType)) ||
              group.id === 'virtual' ||
              (group.fields as string[]).includes(index!) ? (
                <Fragment key={group.id}>
                  {(showAllFields || fieldInfo.size > 5) && (
                    <Dropdown.Header>{group.label}</Dropdown.Header>
                  )}
                  {group.fields.map(
                    (fieldType) =>
                      (showAllFields ||
                        foundFields.includes(fieldType) ||
                        group.id === 'virtual' ||
                        fieldType === index) && (
                        <Dropdown.Item
                          key={fieldType}
                          eventKey={fieldType}
                          active={fieldType === index}
                        >
                          {renderFieldItem(fieldType, FIELDS_MAP[fieldType]?.label)}
                        </Dropdown.Item>
                      )
                  )}
                </Fragment>
              ) : null
            )}
          </Dropdown.Menu>
        </Dropdown>
        {/* relation */}
        {relation && (
          <Dropdown onSelect={handleRelationChange}>
            <Dropdown.Toggle className="form-select">{relation}</Dropdown.Toggle>
            <Dropdown.Menu>
              <div className="d-flex">
                <div
                  className={['flex-grow-1']
                    .concat(showRelationModifiers ? ['border-end pe-1'] : [])
                    .join(' ')}
                >
                  {showRelationModifiers && <Dropdown.Header>Relations</Dropdown.Header>}
                  {RELATIONS.map((relation) => (
                    <Dropdown.Item
                      key={relation.id}
                      eventKey={relation.id}
                      active={relation.id === index}
                    >
                      {relation.label}
                    </Dropdown.Item>
                  ))}
                </div>
                <div
                  className={['text-nowrap']
                    .concat(showRelationModifiers ? ['ps-1'] : [])
                    .join(' ')}
                >
                  {showRelationModifiers && (
                    <>
                      <Dropdown.Header>Modifiers</Dropdown.Header>
                      <Dropdown.ItemText key="lang">
                        <Form.Check
                          id="lang"
                          name="lang"
                          label="Language"
                          type="checkbox"
                          checked={relationModifiers.includes('lang')}
                          onChange={() => handleToggleRelationModifier('lang')}
                        />
                        {relationModifiers.includes('lang') &&
                          renderRelationModifierLanguageInput()}
                      </Dropdown.ItemText>
                      {RELATION_MODIFIERS.filter((relMod) => relMod.id !== 'lang').map((relMod) => (
                        <Dropdown.ItemText key={relMod.id}>
                          <Form.Check
                            id={relMod.id}
                            name={relMod.id}
                            label={relMod.label}
                            type="checkbox"
                            checked={relationModifiers.includes(relMod.id)}
                            onChange={() =>
                              handleToggleRelationModifier(
                                relMod.id as unknown as RelationModifiersType
                              )
                            }
                          />
                        </Dropdown.ItemText>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </Dropdown.Menu>
          </Dropdown>
        )}
        {/* search term */}
        {renderSearchTermInput()}
      </div>
      {shouldShowRemoveButton && (
        <RemoveButton
          className="del-within-clause-btn position-absolute top-0 start-100 translate-middle"
          onClick={onDelete}
        />
      )}
    </div>
  )
}

// --------------------------------------------------------------------------
