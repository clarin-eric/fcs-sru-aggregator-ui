import { CharStream, CommonTokenStream, ParseTree, TokenStreamRewriter } from 'antlr4ng'

import { FCSLexer } from '@/parsers/FCSLexer'
import { AttributeContext, FCSParser, QueryContext } from '@/parsers/FCSParser'
import { FCSParserVisitor } from '@/parsers/FCSParserVisitor'
import type { Resource } from '@/utils/api'
import { _formatTreeItems, _getTreeItems, QuerySyntaxErrorListener } from '../utils'

// --------------------------------------------------------------------------

export function parseQuery(input?: string) {
  if (!input) return null
  if (!input.trim()) return null

  // console.time('parse-query')
  const inputStream = CharStream.fromString(input)
  const lexer = new FCSLexer(inputStream)
  const tokenStream = new CommonTokenStream(lexer)
  const rewriter = new TokenStreamRewriter(tokenStream)
  const parser = new FCSParser(tokenStream)

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

class CollectLayersVisitor extends FCSParserVisitor<void> {
  public layers: string[] = []

  public visitAttribute = (ctx: AttributeContext) => {
    this.layers.push(ctx.getText())
  }

  // public visitQuery_implicit = (ctx: Query_implicitContext) => {
  //   // "text"?
  // }
}

export function getLayersUsedInQuery(ctx?: QueryContext | ParseTree) {
  // collect layers in query
  const layerCollector = new CollectLayersVisitor()
  if (ctx) {
    layerCollector.visit(ctx)
  }

  const usedLayers = layerCollector.layers
  const uniqLayers = new Set(usedLayers)

  return [...uniqLayers]
}

export interface SupportedResourcesInfo {
  supported: Resource[]
  unsupported: (readonly [Resource, string[]])[]
  unsupportedByLayer: Map<string, Resource[]>
}

export function getResourcesLayerSupportInfo(
  resources: Resource[],
  layers: string[]
): SupportedResourcesInfo {
  // NOTE: skip non-standard, legacy-support "word" layer
  // TODO: hmm, maybe skip missing "text" layer?
  const layersRequired = layers
    .filter((layer) => layer !== 'word')
    .filter((layer) => layer !== 'text')

  if (layersRequired.length === 0 || resources.length === 0) {
    return {
      supported: resources,
      unsupported: [],
      unsupportedByLayer: new Map<string, Resource[]>(),
    }
  }

  const layersInQuery = layersRequired.map((layer) => layer.split(':').toReversed())

  // find resources that do have these layers
  // TODO: use `layerInfo` where it is precomputed?
  const resourcesWithLayer = resources.map((resource) => {
    const notAvailableLayers: string[] = []

    layersInQuery.forEach(([layerId, qualifierId]) => {
      if (!qualifierId) {
        if (!resource.availableLayers?.find((layer) => layer.layerType === layerId)) {
          notAvailableLayers.push(layerId)
        }
      } else {
        if (
          !resource.availableLayers?.find(
            (layer) => layer.layerType === layerId && layer.qualifier === qualifierId
          )
        ) {
          notAvailableLayers.push(`${qualifierId}:${layerId}`)
        }
      }
    })

    return [resource, notAvailableLayers] as const
  })

  const validResources = resourcesWithLayer
    .filter(([, layers]) => layers.length === 0)
    .map(([resource]) => resource)
  const invalidResources = resourcesWithLayer.filter(([, layers]) => layers.length !== 0)
  const invalidResourcesByLayer = invalidResources
    .map(([resource, layers]) => layers.map((layer) => [layer, resource] as const))
    .flat(1)
    .reduce((map, [layer, resource]) => {
      if (!map.has(layer)) {
        map.set(layer, [])
      }
      map.get(layer)!.push(resource)
      return map
    }, new Map<string, Resource[]>())

  return {
    supported: validResources,
    unsupported: invalidResources,
    unsupportedByLayer: invalidResourcesByLayer,
  }
}

// --------------------------------------------------------------------------
// debugging stuff

// const input = '[ pos = "NOUN"] [ def = "1" & ( x = "a" | y = "b" )]*'
// const input = '[] [ ( x = "a" | y = "b" )]*'
// const input = '[ pos = "NOUN"] [ a:def = "1" & ( x = "a" | y = "b" /i )]*'
// const input = '"a" | "b" "c"'
// const input = '[( text ="a" | text = "b") & text = "c" & text = "d" | text = "e"]'
// const input = '[ text ="a" | text = "b" & text = "c" & text = "d" | text = "e"]'
// const input = '[ text ="a" & text = "b" | text = "c" & text = "d" | text = "e"]'
// const input = '[ text ="a" & ! text = "b" | text = "c" & text = "d" | text = "e"]'
// const input = '[ text ="a" | ! text = "b" & text = "c" & text = "d" | text = "e"]'
// const input = '([ text ="a" ] [ text = "c" & text = "d" | text = "e"]) within s'
// const input = '([ text ="a" ] [ text = "c" & text = "d" | text = "e"]) within s | "a"' // error

// --------------------------------------------------------------------------

/* escape regex syntax characters with `\` prefix */
const REGEXP_ESCAPES = /([\^$\\.*+?()[\]{}|/])/g
const REGEXP_ESCAPES_ESCAPED = /\\([\^$\\.*+?()[\]{}|/])/g
/* regex to check regex characters when replacing, without backslashes */
const REGEXP_CONTAINS_REGEXP = /(^|[^\\])([\^$.*+?()[\]{}|/])/g
// /* other punctuation characters */
// const REGEXP_OTHER_PUNCT = /([,-=<>#&!%:;@~'`"])/g
// /* find \xFF escaped characters, group 1 is backslashes before, group 2 is string FF */
// const REGEXP_ESCAPED_X = /((?:^|[^\\])(?:\\{2})*)\\x([A-Fa-f0-9]{2})/g
/* unescaped quotes */
const REGEXP_UNESCAPED_QUOTE = /(^|[^\\])((?:\\{2})*['"])/g
/* escaped quotes */
const REGEXP_ESCAPED_QUOTE = /(^|[^\\])\\((?:\\{2})*['"])/g

/**
 * Escape a string to be used in regular expressions.
 *
 * @param value value to escape for use in regex
 * @returns escaped string, can be used in regex to match exactly the input value
 * @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/escape
 */
export function escapeRegexValue(value: string | undefined) {
  // import 'core-js-pure/actual/escape'
  if (!value) return value

  // NOTE: maybe not too escaped strings, reduce usability, less userfriendly
  // if (Object.hasOwn(RegExp, 'escape')) {
  //   // @ts-expect-error: this is now valid
  //   return RegExp.escape(value)
  // }

  let escaped = value
  escaped = escaped.replace(REGEXP_ESCAPES, '\\$1')
  // escaped = escaped.replace(REGEXP_OTHER_PUNCT, (match) => `\\x${match.charCodeAt(0).toString(16)}`)
  escaped = escaped.replace(REGEXP_UNESCAPED_QUOTE, '$1\\$2')
  return escaped
}

export function unescapeRegexValue(value: string | undefined) {
  if (!value) return value

  let unescaped = value
  // // revert `\xFF` escape sequences? (seems to happen automatically in browser)
  // unescaped = unescaped.replace(
  //   REGEXP_ESCAPED_X,
  //   (_, p1, p2) => `${p1}${String.fromCharCode(parseInt(p2, 16))}`
  // )
  // unescaped = decodeURIComponent(unescaped)
  // // remove double backslashes
  // // unescaped = unescaped.replaceAll('\\\\', '\\')
  unescaped = unescaped.replace(REGEXP_ESCAPED_QUOTE, '$1$2')
  unescaped = unescaped.replace(REGEXP_ESCAPES_ESCAPED, '$1')
  return unescaped
}

export function checkIfContainsRegex(value: string | undefined) {
  if (!value) return false

  const escapedValue = value.replace(REGEXP_CONTAINS_REGEXP, '\\$1$2')
  // console.debug('is regex escaped', { value, escapedValue, contains: escapedValue !== value })
  return escapedValue !== value
}

export function escapeQuotes(value: string | undefined) {
  if (!value) return value
  return value.replaceAll('\\', '\\\\').replace(REGEXP_UNESCAPED_QUOTE, '$1\\$2')
}

export function unescapeQuotes(value: string | undefined) {
  if (!value) return value
  return value.replace(REGEXP_ESCAPED_QUOTE, '$1$2').replaceAll('\\\\', '\\')
}

// --------------------------------------------------------------------------
