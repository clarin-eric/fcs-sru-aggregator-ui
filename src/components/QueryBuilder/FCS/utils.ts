import {
  ATNSimulator,
  BaseErrorListener,
  CharStream,
  CommonTokenStream,
  ErrorNode,
  Lexer,
  Parser,
  ParserRuleContext,
  ParseTree,
  RecognitionException,
  Recognizer,
  TerminalNode,
  Token,
  TokenStreamRewriter,
} from 'antlr4ng'

import { FCSLexer } from '@/parsers/FCSLexer'
import { FCSParser } from '@/parsers/FCSParser'

// --------------------------------------------------------------------------

class FCSQueryErrorListener extends BaseErrorListener {
  public errors: string[] = []

  public override syntaxError<S extends Token, T extends ATNSimulator>(
    _recognizer: Recognizer<T>,
    _offendingSymbol: S | null,
    _line: number,
    charPositionInLine: number,
    msg: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _e: RecognitionException | null
  ): void {
    // console.debug('syntaxError', offendingSymbol, msg)
    this.errors.push(`Syntax error: ${msg} at position ${charPositionInLine}`)
  }
}

export function parseQuery(input?: string) {
  if (!input) return null
  if (!input.trim()) return null

  // console.time('parse-query')
  const inputStream = CharStream.fromString(input)
  const lexer = new FCSLexer(inputStream)
  const tokenStream = new CommonTokenStream(lexer)
  const rewriter = new TokenStreamRewriter(tokenStream)
  const parser = new FCSParser(tokenStream)

  const errorListener = new FCSQueryErrorListener()
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
// debugging stuff

interface _TreeItem {
  depth: number
  index: number
  type: 'ParserRuleContext' | 'ErrorNode' | 'TerminalNode'
  name: string
  content: string
  start: Token | null
  end: Token | null
}

function _getTreeItems(
  tree: ParseTree,
  parser: Parser,
  lexer: Lexer,
  depth: number = 0,
  childNr: number = 0
) {
  const items: _TreeItem[] = []

  if (tree instanceof ParserRuleContext) {
    const ruleName = parser.ruleNames[tree.ruleIndex]
    items.push({
      depth: depth, // tree.depth()?
      index: childNr,
      type: 'ParserRuleContext',
      name: ruleName,
      content: parser.inputStream.getTextFromContext(tree), //,lexer.inputStream.getTextFromInterval(tree.getSourceInterval()),
      start: tree.start,
      end: tree.stop,
    })

    for (let i = 0; i < tree.getChildCount(); i++) {
      const child = tree.getChild(i)
      if (!child) continue
      const childItems = _getTreeItems(child, parser, lexer, depth + 1, i)
      items.push(...childItems)
    }
  } else if (tree instanceof ErrorNode) {
    items.push({
      depth: depth,
      index: childNr,
      type: 'ErrorNode',
      name: 'error',
      content: tree.toString(),
      start: tree.symbol,
      end: tree.symbol,
    })
  } else if (tree instanceof TerminalNode && tree.symbol.type !== -1) {
    items.push({
      depth: depth,
      index: childNr,
      type: 'TerminalNode',
      name: lexer.vocabulary.getSymbolicName(tree.symbol.type) ?? '',
      content: tree.symbol.text ?? '',
      start: tree.symbol,
      end: tree.symbol,
    })
  }

  return items
}

function _formatTreeItems(items: _TreeItem[]) {
  const maxDepth = Math.max(...items.map((item) => item.depth))
  const maxLenName = Math.max(...items.map((item) => item.name.length))
  const maxIndex = Math.max(...items.map((item) => item.end?.stop ?? 0))

  // NOTE: sort for easier structure, but harder to read dependency
  // items.sort((a, b) => a.depth - b.depth)

  const tree: string[] = []
  for (const item of items) {
    // skip terminals and errors
    // if (item.type === 'TerminalNode') continue
    // if (item.type === 'ErrorNode') continue
    // filter out fine grained rules
    // if (['identifier', 'qualifier', 'regexp_pattern', 'regexp_flag'].includes(item.name)) continue
    // if (['regexp', 'attribute', 'within_part_simple'].includes(item.name)) continue

    // NOTE: indexes are inclusive
    const ruleTree = `${' '.repeat(item.depth)}(${item.depth
      .toString()
      .padStart(Math.floor(Math.log10(maxDepth)) + 1, ' ')})#${item.index
      .toString()
      .padEnd(2, ' ')} ${item.name.padEnd(maxLenName, ' ')}${' '.repeat(maxDepth - item.depth)}`
    const indexes = `T[${item.start?.tokenIndex
      .toString()
      .padStart(Math.floor(Math.log10(maxIndex)) + 1, ' ')}:${item.end?.tokenIndex
      .toString()
      .padStart(Math.floor(Math.log10(maxIndex)) + 1, ' ')}] C[${item.start?.start
      .toString()
      .padStart(Math.floor(Math.log10(maxIndex)) + 1, ' ')}:${item.end?.stop
      .toString()
      .padStart(Math.floor(Math.log10(maxIndex)) + 1, ' ')}]`
    const content = `${' '.repeat(Math.max(0, item.start?.start ?? 0))}${item.content}`
    tree.push(`${ruleTree} ${indexes} # ${content}`)
  }
  return tree.join('\n')
}

// @ts-expect-error: debugging stuff
function _dumpTokenStream(tokenStream: CommonTokenStream, lexer: FCSLexer) {
  tokenStream
    .getTokens()
    .map((token) =>
      console.debug(
        'Token: [%i:%i]#%s %s %O',
        token.start,
        token.stop,
        token.channel !== 0 ? lexer.channelNames[token.channel] : '',
        lexer.symbolicNames[token.type],
        token.text
      )
    )
}

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
/* other punctuation characters */
const REGEXP_OTHER_PUNCT = /([,-=<>#&!%:;@~'`"])/g
/* find \xFF escaped characters, group 1 is backslashes before, group 2 is string FF */
const REGEXP_ESCAPED_X = /(?<!\\)((?:\\{2})*)\\x([A-Fa-f0-9]{2})/g
/* unescaped quotes */
const REGEXP_UNESCAPED_DBLQUOTE = /(?<!\\)((?:\\{2})*")/g
const REGEXP_UNESCAPED_SGLQUOTE = /(?<!\\)((?:\\{2})*')/g
/* escaped quotes */
const REGEXP_ESCAPED_DBLQUOTE = /(?<!\\)\\((?:\\{2})*")/g
const REGEXP_ESCAPED_SGLQUOTE = /(?<!\\)\\((?:\\{2})*')/g

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
  escaped = value.replace(REGEXP_ESCAPES, '\\$1')
  escaped = value.replace(REGEXP_OTHER_PUNCT, (match) => `\\x${match.charCodeAt(0).toString(16)}`)

  return escaped
}

export function unescapeRegexValue(value: string | undefined) {
  if (!value) return value

  let unescaped = value
  // revert `\xFF` escape sequences? (seems to happen automatically in browser)
  unescaped = unescaped.replace(
    REGEXP_ESCAPED_X,
    (_, p1, p2) => `${p1}${String.fromCharCode(parseInt(p2, 16))}`
  )
  unescaped = decodeURIComponent(unescaped)
  // remove double backslashes
  // unescaped = unescaped.replaceAll('\\\\', '\\')
  unescaped = unescaped.replace(REGEXP_ESCAPES_ESCAPED, '$1')
  console.log('dd', { value, unescaped })
  return unescaped
}

export function escapeQuotes(value: string | undefined, isSingleQuote: boolean = false) {
  if (!value) return value
  return value.replace(
    isSingleQuote ? REGEXP_UNESCAPED_SGLQUOTE : REGEXP_UNESCAPED_DBLQUOTE,
    '\\$1'
  )
}

export function unescapeQuotes(value: string | undefined, isSingleQuote: boolean = false) {
  if (!value) return value
  return value.replace(isSingleQuote ? REGEXP_ESCAPED_SGLQUOTE : REGEXP_ESCAPED_DBLQUOTE, '$1')
}

// --------------------------------------------------------------------------
