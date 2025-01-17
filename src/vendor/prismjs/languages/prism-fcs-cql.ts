import type { LanguageProto } from '../types'

// --------------------------------------------------------------------------

export default {
  id: 'fcs-cql',
  grammar: () => ({
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
  }),
} as LanguageProto<'fcs-cql'>
