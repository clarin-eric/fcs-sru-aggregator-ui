import Prism from 'prismjs/components/prism-core'

const boolExp = /\b(?:AND|NOT|OR|PROX)\b/i
const stringExp = /(?:"(?:\\[\s\S]|(?!")[^\\])*")/
const wordExp = /[^\s()=<>"\/]+/
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

const modifier = {
  pattern: modifierExp,
  inside: {
    modifier: {
      pattern: RegExp('(/\\s*)' + identifierExp.source),
      lookbehind: true,
      alias: 'property',
    },
    value: {
      pattern: RegExp(identifierExp.source + '$'),
      alias: 'string',
    },
    comparitor: {
      pattern: comparitorSymbolExp,
      alias: 'operator',
    },
    punctuation: /\//,
  },
}

const searchClause = {
  pattern: RegExp(
    '(?:' + identifierExp.source + '\\s*' + relationExp.source + '\\s*)?' + identifierExp.source
  ),
  inside: {
    // required last part, search term
    term: {
      pattern: RegExp(identifierExp.source + '(?!.)'),
      alias: 'string',
    },
    // optional index with relation
    index: {
      pattern: RegExp('^' + identifierExp.source),
      alias: 'property',
    },
    'relation-modifier': modifier,
    relation: {
      pattern: comparitorExp,
      alias: 'operator',
    },
  },
}

const boolClause = {
  pattern: RegExp(boolExp.source + modifierListExp.source, 'i'),
  inside: {
    boolean: {
      pattern: boolExp,
      alias: 'operator',
    },
    'boolean-modifier': modifier,
  },
}

const prefix = {
  pattern: RegExp('(^\\s*)>\\s*(?:' + identifierExp.source + '\\s*=\\s*)?' + identifierExp.source),
  lookbehind: true,
  inside: {
    uri: {
      pattern: RegExp(identifierExp.source + '$'),
      alias: 'string',
    },
    prefix: {
      pattern: identifierExp,
      alias: 'property',
    },
    punctuation: /[>=]/,
  },
}

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
    },
  },
}

Prism.languages['cql'] = {
  // prefix / suffix
  prefix: prefix,
  sortby: sortby,

  // conjuctions
  'bool-group': boolClause,
  // search clause triples
  'search-clause': searchClause,

  // grouping
  punctuation: /[()]/,
}
