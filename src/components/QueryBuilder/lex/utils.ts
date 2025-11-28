import { CharStream, CommonTokenStream, ParseTree, TokenStreamRewriter } from 'antlr4ng'

import { LexLexer } from '@/parsers/LexLexer'
import { IndexContext, LexParser, QueryContext } from '@/parsers/LexParser'
import { LexParserVisitor } from '@/parsers/LexParserVisitor'
import type { Resource } from '@/utils/api'
import { _formatTreeItems, _getTreeItems, QuerySyntaxErrorListener } from '../utils'

// --------------------------------------------------------------------------

export function parseQuery(input?: string) {
  if (!input) return null
  if (!input.trim()) return null

  // console.time('parse-query')
  const inputStream = CharStream.fromString(input)
  const lexer = new LexLexer(inputStream)
  const tokenStream = new CommonTokenStream(lexer)
  const rewriter = new TokenStreamRewriter(tokenStream)
  const parser = new LexParser(tokenStream)

  const errorListener = new QuerySyntaxErrorListener()
  lexer.removeErrorListeners()
  lexer.addErrorListener(errorListener)
  parser.removeErrorListeners()
  parser.addErrorListener(errorListener)

  const tree = parser.query()
  // console.timeEnd('parse-query')

  // DEBUG
  // Object.assign(window, { input, inputStream, lexer, tokenStream, parser, rewriter, tree })

  // console.debug('tree', tree.toStringTree(parser))
  const treeItems = /*#__PURE__*/ _getTreeItems(tree, parser, lexer)
  console.log(/*#__PURE__*/ _formatTreeItems(treeItems))

  return { tree, lexer, parser, rewriter, errors: errorListener.errors }
}

// --------------------------------------------------------------------------

class CollectFieldsVisitor extends LexParserVisitor<void> {
  public fields: string[] = []

  public visitIndex = (ctx: IndexContext) => {
    this.fields.push(ctx.getText())
  }
}

export function getFieldsUsedInQuery(ctx?: QueryContext | ParseTree) {
  // collect mentioned fields in query
  const fieldCollector = new CollectFieldsVisitor()
  if (ctx) {
    fieldCollector.visit(ctx)
  }

  const usedFields = fieldCollector.fields
  const uniqFields = new Set(usedFields)

  return [...uniqFields]
}

export interface SupportedResourcesInfo {
  supported: Resource[]
  unsupported: (readonly [Resource, string[]])[]
  unsupportedByField: Map<string, Resource[]>
}

export function getResourcesFieldSupportInfo(
  resources: Resource[],
  fields: string[]
): SupportedResourcesInfo {
  if (fields.length === 0 || resources.length === 0) {
    return {
      supported: resources,
      unsupported: [],
      unsupportedByField: new Map<string, Resource[]>(),
    }
  }

  // find resources that do have these fields
  // TODO: use `layerInfo` where it is precomputed?
  const resourcesWithField = resources.map((resource) => {
    const notAvailableFields: string[] = []

    fields.forEach((field) => {
      if (!resource.availableLexFields?.find((lexField) => lexField.type === field)) {
        notAvailableFields.push(field)
      }
    })

    return [resource, notAvailableFields] as const
  })

  const validResources = resourcesWithField
    .filter(([, fields]) => fields.length === 0)
    .map(([resource]) => resource)
  const invalidResources = resourcesWithField.filter(([, fields]) => fields.length !== 0)
  const invalidResourcesByField = invalidResources
    .map(([resource, fields]) => fields.map((field) => [field, resource] as const))
    .flat(1)
    .reduce((map, [field, resource]) => {
      if (!map.has(field)) {
        map.set(field, [])
      }
      map.get(field)!.push(resource)
      return map
    }, new Map<string, Resource[]>())

  return {
    supported: validResources,
    unsupported: invalidResources,
    unsupportedByField: invalidResourcesByField,
  }
}

// --------------------------------------------------------------------------

export const CHARS_REQUIRING_QUOTING = '<>()=\\" '
const REGEXP_REQUIRE_QUOTING = /([<>()=\\" ])/g
const REGEXP_ESCAPE_QUOTING = /([\\"])/g
const REGEXP_UNESCAPED_QUOTING = /(?:\\)([\\"])/g

export function maybeUnquoteSearchTerm(value: string | null | undefined) {
  if (!value) return ''

  if (value.startsWith('"') && value.endsWith('"')) {
    let unquoted = value.slice(1, -1)
    unquoted = unquoted.replace(REGEXP_UNESCAPED_QUOTING, '$1')
    return unquoted
  }
  return value
}

export function maybeQuoteSearchTerm(value: string | undefined, forceQuotes: boolean = false) {
  if (!value) return '""'

  // check if quoting is required
  if (!value.match(REGEXP_REQUIRE_QUOTING)) {
    if (forceQuotes) {
      // NOTE: should not require escaping of any characters
      return `"${value}"`
    }
    return value
  }

  const escaped = value.replace(REGEXP_ESCAPE_QUOTING, '\\$1')
  return `"${escaped}"`
}
