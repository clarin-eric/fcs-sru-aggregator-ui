import Prism from 'prismjs/components/prism-core'

Prism.languages['fcs-cql'] = {
  punctuation: /[()]/,
  operator: {
    // we want at least something before the operator to have it considered a operator
    pattern: /(\S\s)\b(?:AND|OR)\b/i,
    greedy: true,
    lookbehind: true,
  },
  string: {
    pattern: /("|')(?:\\[\s\S]|(?!\1)[^\\])*\1/,
    greedy: true,
  },
  // any non-quoted word (without whitespaces) is also a string technically
  'string-unquoted': {
    pattern: /\S+/,
    alias: 'string',
  },
}
