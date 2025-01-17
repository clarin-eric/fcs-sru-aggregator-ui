import type { GrammarToken, LanguageProto, Grammar } from '../types'

// --------------------------------------------------------------------------

const boolExp = /\b(?:AND|NOT|OR|PROX)\b/i
const stringExp = /(?:"(?:\\[\s\S]|(?!")[^\\])*")/
const wordExp = /[^\s()=<>"/]+/
const identifierExp = RegExp('(?:' + stringExp.source + '|' + wordExp.source + ')')

const comparitorNamedExp = identifierExp
const comparitorSymbolExp = /(?:<>|[=><]=?)/
const comparitorExp = RegExp(
  '(?:' + comparitorSymbolExp.source + '|' + comparitorNamedExp.source + ')'
)

const modifierExp = RegExp(
  '/\\s*' +
    identifierExp.source +
    '(?:\\s*' +
    comparitorSymbolExp.source +
    '\\s*' +
    identifierExp.source +
    ')?'
)
const modifierListExp = RegExp('(?:\\s*' + modifierExp.source + ')*')

const relationExp = RegExp(comparitorExp.source + modifierListExp.source)

// --------------------------------------------------------------------------

const modifier = {
  pattern: modifierExp,
  inside: {
    modifier: {
      pattern: RegExp('(/\\s*)' + identifierExp.source),
      lookbehind: true,
      alias: 'property',
    } as GrammarToken,
    value: {
      pattern: RegExp(identifierExp.source + '$'),
      alias: 'string',
    } as GrammarToken,
    comparitor: {
      pattern: comparitorSymbolExp,
      alias: 'operator',
    } as GrammarToken,
    punctuation: /\//,
  } as Grammar,
} as GrammarToken

const searchClause = {
  pattern: RegExp(
    '(?:' + identifierExp.source + '\\s*' + relationExp.source + '\\s*)?' + identifierExp.source
  ),
  inside: {
    // required last part, search term
    term: {
      pattern: RegExp(identifierExp.source + '(?!.)'),
      alias: 'string',
    } as GrammarToken,
    // optional index with relation
    index: {
      pattern: RegExp('^' + identifierExp.source),
      alias: 'property',
    } as GrammarToken,
    'relation-modifier': modifier,
    relation: {
      pattern: comparitorExp,
      alias: 'operator',
    } as GrammarToken,
  } as Grammar,
} as GrammarToken

const boolClause = {
  pattern: RegExp(boolExp.source + modifierListExp.source, 'i'),
  inside: {
    boolean: {
      pattern: boolExp,
      alias: 'operator',
    } as GrammarToken,
    'boolean-modifier': modifier,
  } as Grammar,
} as GrammarToken

const prefix = {
  pattern: RegExp('(^\\s*)>\\s*(?:' + identifierExp.source + '\\s*=\\s*)?' + identifierExp.source),
  lookbehind: true,
  inside: {
    uri: {
      pattern: RegExp(identifierExp.source + '$'),
      alias: 'string',
    } as GrammarToken,
    prefix: {
      pattern: identifierExp,
      alias: 'property',
    } as GrammarToken,
    punctuation: /[>=]/,
  } as Grammar,
} as GrammarToken

const sortby = {
  // XXX: too complex exponential/polynomial backtracking possible ...
  //pattern: RegExp('sortby(?:\\s*' + identifierExp.source + modifierListExp.source + ')+\\s*$', 'i'),
  pattern: RegExp('(^|\\s)sortby\\b(?:' + identifierExp.source + '\\b|[\\s=></])+$', 'i'),
  inside: {
    keyword: /sortby/i,
    'sortby-index-modifier': modifier,
    index: {
      pattern: identifierExp,
      alias: 'property',
    } as GrammarToken,
  } as Grammar,
} as GrammarToken

// --------------------------------------------------------------------------

export default {
  id: 'cql',
  grammar: () =>
    ({
      // prefix / suffix
      prefix: prefix,
      sortby: sortby,

      // conjuctions
      'bool-group': boolClause,
      // search clause triples
      'search-clause': searchClause,

      // grouping
      punctuation: /[()]/,
    } as Grammar),
} as LanguageProto<'cql'>
