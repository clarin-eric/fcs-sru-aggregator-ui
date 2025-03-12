import { CharStream, CommonTokenStream, TokenStreamRewriter } from 'antlr4ng'

import { LexLexer } from '@/parsers/LexLexer'
import { LexParser } from '@/parsers/LexParser'
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
