import Prism from 'prismjs/components/prism-core'

const identifierExp = /[a-zA-Z](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?/

const attributeExp = RegExp(
  '\\b(?:' + identifierExp.source + ':)?(?:' + identifierExp.source + ')\\b(?=\\s*[!=])'
)
// /\b(?:[a-zA-Z][a-zA-Z0-9-]*:)?(?:[a-zA-Z][a-zA-Z0-9-]*)\b(?=\s*[!=])/

const stringExp = /("|')(?:\\[\s\S]|(?!\1)[^\\])*\1/
const regexpFlagExp = /\/(?:[iIcCld]+)/
const expressionTripleOperatorExp = /=|!=/

const string = {
  pattern: stringExp,
  alias: 'regex',
  // optional deep analysis
  inside: {
    escape: /\\(?:[\\'"nt.^$*+?(){[|]|U[0-9a-fA-F]{8}|u[0-9a-fA-F]{4}|x[0-9a-fA-F]{2})/,
    'invalid-escape': /\\[\s\S]/,
    whitespace:
      // eslint-disable-next-line no-control-regex
      /\u0009|\u000A|\u000B|\u000C|\u000D|\u0020|\u0085|\u00A0|\u1680|\u2000|\u2001|\u2002|\u2003|\u2004|\u2005|\u2006|\u2007|\u2008|\u2009|\u200A|\u2028|\u2029|\u202F|\u205F|\u3000/,
  },
}

const regexpFlag = {
  pattern: regexpFlagExp,
  inside: {
    punctuation: /\//,
    keyword: /\w/,
  },
}

const expressionTriple = {
  pattern: RegExp(
    attributeExp.source +
      '\\s*(?:' +
      expressionTripleOperatorExp.source +
      ')\\s*' +
      stringExp.source +
      '(?:\\s*' +
      regexpFlagExp.source +
      ')?'
  ),
  inside: {
    attribute: {
      pattern: attributeExp,
      alias: 'property',
      inside: {
        qualifier: {
          pattern: RegExp(identifierExp.source + '(?=:)'),
          alias: 'class-name',
        },
        punctuation: /:/,
        identifier: {
          pattern: identifierExp,
          alias: 'class-name',
        },
      },
    },
    regexp: string,
    operator: expressionTripleOperatorExp,
    'regexp-flag': regexpFlag,
  },
}

Prism.languages['fcs-fcsql'] = {
  // segment query
  segment: {
    pattern: /\[.*?(?:[|&()=]\s*(?:("|')(\\[\s\S]|(?!\1)[^\\])*\1)[^\]=]*?)*\]/,
    // pattern: /(?:\[.*?)(?:[=|&()]\s*("|')(\\[\s\S]|(?!\1)[^\\])*\1[^\]=]*?)*\]/,
    //pattern: /\[(.*?)\]/,
    inside: {
      'basic-expression': expressionTriple,
      'invalid-expression': stringExp,
      operator: /[!&|]/,
      punctuation: /[()[\]]/,
    },
  },
  // implicit query (string outside explicit token "[...]")
  string: string,
  // quantifier for segment, string or group
  quantifier: {
    pattern: /(?:[*+?])|\{(?:\d+|\d+,|,\d+|\d+,\d+)\}/,
    alias: 'operator',
    inside: {
      number: /\d+/,
      punctuation: /[{},]/,
    },
  },
  'regexp-flag': regexpFlag,
  // global "within" qualifier
  within: {
    pattern: /within\s+\b(?:p|paragraph|s|sentence|session|t|text|turn|u|utterance)\b/,
    inside: {
      keyword: /\w+/,
    },
  },
  operator: /\|/,
  punctuation: /[{}[\](),]/,
}
