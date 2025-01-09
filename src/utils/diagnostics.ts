interface SruDiagnostic {
  source: string
  category: 'general' | 'query' | 'result set' | 'records' | 'sort' | 'stylesheet'
  description: string
  detailsFormat: null | string
  note: null | string
}

interface FcsDiagnostic {
  source: string
  category: 'request' | 'query' | 'general'
  description: string
  detailsFormat: null | string
  fatal: boolean
  note: null | string
}

export const SRU_12_DIAGNOSTICS: { [diagnostic: string]: SruDiagnostic | null } = {
  // http://docs.oasis-open.org/search-ws/searchRetrieve/v1.0/os/part2-sru1.2/searchRetrieve-v1.0-os-part2-sru1.2.html#diagnosticList

  'info:srw/diagnostic/1/1': {
    source: 'sru-1.2',
    category: 'general',
    description: 'General system error',
    detailsFormat: 'Debugging information (traceback)',
    note: 'The server returns this error when it is unable to supply a more specific diagnostic. The sever may also optionally supply debugging information.',
  },
  'info:srw/diagnostic/1/2': {
    source: 'sru-1.2',
    category: 'general',
    description: 'System temporarily unavailable',
    detailsFormat: null,
    note: "The server cannot respond right now, perhaps because it's in a maintenance cycle, but will be able to in the future.",
  },
  'info:srw/diagnostic/1/3': {
    source: 'sru-1.2',
    category: 'general',
    description: 'Authentication error',
    detailsFormat: null,
    note: 'The request could not be processed due to lack of authentication.',
  },
  'info:srw/diagnostic/1/4': {
    source: 'sru-1.2',
    category: 'general',
    description: 'Unsupported operation',
    detailsFormat: null,
    note: 'Currently three operations are defined -- searchRetrieve, explain, and scan. searchRetrieve and explain are mandatory, so this diagnostic would apply only to scan, or in SRU where an undefined operation is sent.',
  },
  'info:srw/diagnostic/1/5': {
    source: 'sru-1.2',
    category: 'general',
    description: 'Unsupported version',
    detailsFormat: 'Highest version supported',
    note: "Currently only version 1.1 is defined and so this diagnostic has no meaning. In the future, when another version is defined, for example version 1.2, this diagnostic may be returned when the server receives a request where the version parameter indicates 1.2, and the server doesn't support version 1.2.",
  },
  'info:srw/diagnostic/1/6': {
    source: 'sru-1.2',
    category: 'general',
    description: 'Unsupported parameter value',
    detailsFormat: 'Name of parameter',
    note: "This diagnostic might be returned for a searchRetrieve request which includes the recordPacking parameter with a value of 'xml', when the server does not support that value. The diagnostic might supply the name of parameter, in this case 'recordPacking'.",
  },
  'info:srw/diagnostic/1/7': {
    source: 'sru-1.2',
    category: 'general',
    description: 'Mandatory parameter not supplied',
    detailsFormat: 'Name of missing parameter',
    note: "This diagnostic might be returned for a searchRetrieve request which omits the query parameter. The diagnostic might supply the name of missing parameter, in this case 'query'.",
  },
  'info:srw/diagnostic/1/8': {
    source: 'sru-1.2',
    category: 'general',
    description: 'Unsupported Parameter',
    detailsFormat: 'Name of the unsupported parameter',
    note: "This diagnostic might be returned for a searchRetrieve request which includes the recordXPath parameter when the server does not support that parameter. The diagnostic might supply the name of unsupported parameter, in this case 'recordXPath'.",
  },

  'info:srw/diagnostic/1/50': {
    source: 'sru-1.2',
    category: 'result set',
    description: 'Result sets not supported',
    detailsFormat: null,
    note: 'The server cannot create a persistent result set.',
  },
  'info:srw/diagnostic/1/51': {
    source: 'sru-1.2',
    category: 'result set',
    description: 'Result set does not exist',
    detailsFormat: 'Result set identifier',
    note: 'The client asked for a result set in the query which does not exist, either because it never did or because it had expired.',
  },
  'info:srw/diagnostic/1/52': {
    source: 'sru-1.2',
    category: 'result set',
    description: 'Result set temporarily unavailable',
    detailsFormat: 'Result set identifier',
    note: 'The result set exists, it cannot be accessed, but will be able to be accessed again in the future.',
  },
  'info:srw/diagnostic/1/53': {
    source: 'sru-1.2',
    category: 'result set',
    description: 'Result sets only supported for retrieval',
    detailsFormat: null,
    note: 'Other operations on results apart from retrieval, such as sorting them or combining them, are not supported.',
  },
  'info:srw/diagnostic/1/54': null, // not used
  'info:srw/diagnostic/1/55': {
    source: 'sru-1.2',
    category: 'result set',
    description: 'Combination of result sets with search terms not supported',
    detailsFormat: null,
    note: 'Existing result sets cannot be combined with new terms to create new result sets. eg cql.resultsetid = foo not dc.title any fish',
  },
  'info:srw/diagnostic/1/56': null, // not used
  'info:srw/diagnostic/1/57': null, // not used
  'info:srw/diagnostic/1/58': {
    source: 'sru-1.2',
    category: 'result set',
    description: 'Result set created with unpredictable partial results available',
    detailsFormat: null,
    note: 'The result set is not complete, possibly due to the processing being interupted mid way through. Some of the results may not even be matches.',
  },
  'info:srw/diagnostic/1/59': {
    source: 'sru-1.2',
    category: 'result set',
    description: 'Result set created with valid partial results available',
    detailsFormat: null,
    note: 'All of the records in the result set are matches, but not all records that should be there are.',
  },
  'info:srw/diagnostic/1/60': {
    source: 'sru-1.2',
    category: 'result set',
    description: 'Result set not created: too many matching records',
    detailsFormat: 'Maximum number',
    note: 'There were too many records to create a persistent result set.',
  },

  'info:srw/diagnostic/1/61': {
    source: 'sru-1.2',
    category: 'records',
    description: 'First record position out of range',
    detailsFormat: null,
    note: 'For example, if the request matches 10 records, but the start position is greater than 10.',
  },
  'info:srw/diagnostic/1/62': null, // not used
  'info:srw/diagnostic/1/63': null, // not used
  'info:srw/diagnostic/1/64': {
    source: 'sru-1.2',
    category: 'records',
    description: 'Record temporarily unavailable',
    detailsFormat: null,
    note: 'The record requested cannot be accessed currently, but will be able to be in the future.',
  },
  'info:srw/diagnostic/1/65': {
    source: 'sru-1.2',
    category: 'records',
    description: 'Record does not exist',
    detailsFormat: null,
    note: 'The record does not exist, either because it never did, or because it has subsequently been deleted.',
  },
  'info:srw/diagnostic/1/66': {
    source: 'sru-1.2',
    category: 'records',
    description: 'Unknown schema for retrieval',
    detailsFormat: 'Schema URI or short name',
    note: 'The record schema requested is unknown. Eg. the client asked for MODS when the server can only return simple Dublin Core',
  },
  'info:srw/diagnostic/1/67': {
    source: 'sru-1.2',
    category: 'records',
    description: 'Record not available in this schema',
    detailsFormat: 'Schema URI or short name',
    note: 'The record schema is known, but this particular record cannot be transformed into it.',
  },
  'info:srw/diagnostic/1/68': {
    source: 'sru-1.2',
    category: 'records',
    description: 'Not authorized to send record',
    detailsFormat: null,
    note: 'This particular record requires additional authorisation in order to receive it.',
  },
  'info:srw/diagnostic/1/69': {
    source: 'sru-1.2',
    category: 'records',
    description: 'Not authorized to send record in this schema',
    detailsFormat: null,
    note: 'The record can be retrieved in other schemas, but the one requested requires futher authorization.',
  },
  'info:srw/diagnostic/1/70': {
    source: 'sru-1.2',
    category: 'records',
    description: 'Record too large to send',
    detailsFormat: 'Maximum record size',
    note: 'The record is too large to send.',
  },
  'info:srw/diagnostic/1/71': {
    source: 'sru-1.2',
    category: 'records',
    description: 'Unsupported record packing',
    detailsFormat: null,
    note: 'The server supports only one of string or xml, or the client requested a recordPacking which is unknown.',
  },
  'info:srw/diagnostic/1/72': {
    source: 'sru-1.2',
    category: 'records',
    description: 'XPath retrieval unsupported',
    detailsFormat: null,
    note: 'The server does not support the retrieval of nodes from within the record.',
  },
  'info:srw/diagnostic/1/73': {
    source: 'sru-1.2',
    category: 'records',
    description: 'XPath expression contains unsupported feature',
    detailsFormat: 'Feature',
    note: 'Some aspect of the XPath expression is unsupported. For example, the server might be able to process element nodes, but not functions.',
  },
  'info:srw/diagnostic/1/74': {
    source: 'sru-1.2',
    category: 'records',
    description: 'Unable to evaluate XPath expression',
    detailsFormat: null,
    note: 'The server could not evaluate the expression, either because it was invalid or it lacks some capability.',
  },

  'info:srw/diagnostic/1/100': null, // not used
  'info:srw/diagnostic/1/101': null, // not used
  'info:srw/diagnostic/1/102': null, // not used

  'info:srw/diagnostic/1/110': {
    source: 'sru-1.2',
    category: 'stylesheet',
    description: 'Stylesheets not supported',
    detailsFormat: null,
    note: 'The SRU server does not support stylesheets, or a stylesheet was requested from an SRW server.',
  },
  'info:srw/diagnostic/1/111': {
    source: 'sru-1.2',
    category: 'stylesheet',
    description: 'Unsupported stylesheet',
    detailsFormat: 'URL of stylesheet',
    note: 'This particular stylesheet is not supported, but others may be.',
  },

  'info:srw/diagnostic/1/120': null, // scan
  'info:srw/diagnostic/1/121': null, // scan
}

export const SRU_20_DIAGNOSTICS: { [diagnostic: string]: SruDiagnostic | null } = {
  // http://docs.oasis-open.org/search-ws/searchRetrieve/v1.0/os/part3-sru2.0/searchRetrieve-v1.0-os-part3-sru2.0.html#diagnosticsList

  'info:srw/diagnostic/1/1': {
    source: 'sru-2.0',
    category: 'general',
    description: 'General system error',
    detailsFormat: 'Debugging information (traceback)',
    note: 'The server returns this error when it is unable to supply a more specific diagnostic. The sever may also optionally supply debugging information.',
  },
  'info:srw/diagnostic/1/2': {
    source: 'sru-2.0',
    category: 'general',
    description: 'System temporarily unavailable',
    detailsFormat: null,
    note: "The server cannot respond right now, perhaps because it's in a maintenance cycle, but will be able to in the future.",
  },
  'info:srw/diagnostic/1/3': {
    source: 'sru-2.0',
    category: 'general',
    description: 'Authentication error',
    detailsFormat: null,
    note: 'The request could not be processed due to lack of authentication.',
  },
  'info:srw/diagnostic/1/4': {
    source: 'sru-2.0',
    category: 'general',
    description: 'Unsupported operation',
    detailsFormat: null,
    note: 'Currently three operations are defined -- searchRetrieve, explain, and scan. searchRetrieve and explain are mandatory, so this diagnostic would apply only to scan, or in SRU where an undefined operation is sent.',
  },
  'info:srw/diagnostic/1/5': {
    source: 'sru-2.0',
    category: 'general',
    description: 'Unsupported version',
    detailsFormat: 'Highest version supported',
    note: "Currently only version 1.1 is defined and so this diagnostic has no meaning. In the future, when another version is defined, for example version 1.2, this diagnostic may be returned when the server receives a request where the version parameter indicates 1.2, and the server doesn't support version 1.2.",
  },
  'info:srw/diagnostic/1/6': {
    source: 'sru-2.0',
    category: 'general',
    description: 'Unsupported parameter value',
    detailsFormat: 'Name of parameter',
    note: "This diagnostic might be returned for a searchRetrieve request which includes the recordXMLEscaping parameter with a value of 'xml', when the server does not support that value. The diagnostic might supply the name of parameter, in this case 'recordXMLEscaping'.",
  },
  'info:srw/diagnostic/1/7': {
    source: 'sru-2.0',
    category: 'general',
    description: 'Mandatory parameter not supplied',
    detailsFormat: 'Name of missing parameter',
    note: "This diagnostic might be returned for a searchRetrieve request which omits the query parameter. The diagnostic might supply the name of missing parameter, in this case 'query'.",
  },
  'info:srw/diagnostic/1/8': {
    source: 'sru-2.0',
    category: 'general',
    description: 'Unsupported Parameter',
    detailsFormat: 'Name of the unsupported parameter',
    note: "This diagnostic might be returned for a searchRetrieve request which includes the recordXPath parameter when the server does not support that parameter. The diagnostic might supply the name of unsupported parameter, in this case 'recordXPath'.",
  },
  'info:srw/diagnostic/1/9': {
    source: 'sru-2.0',
    category: 'general',
    description: 'Unsupported combination of parameter',
    detailsFormat: null,
    note: 'One of the two parameters,  query and queryType, must be included in a request. This diagnostic might  be supplied when neither is included.',
  },

  'info:srw/diagnostic/1/10': {
    source: 'sru-2.0',
    category: 'query',
    description: 'Query syntax error',
    detailsFormat: null,
    note: "The query was invalid, but no information is given for exactly what was wrong with it. Eg. dc.title fox fish (The reason is that fox isn't a valid relation in the default context set, but the server isn't telling you this for some reason)",
  },
  'info:srw/diagnostic/1/11': null, // not used
  'info:srw/diagnostic/1/12': {
    source: 'sru-2.0',
    category: 'query',
    description: 'Too many characters in query',
    detailsFormat: 'Maximum supported',
    note: 'The length (number of characters) of the query exceeds the maximum length supported by the server.',
  },
  'info:srw/diagnostic/1/13': {
    source: 'sru-2.0',
    category: 'query',
    description: 'Invalid or unsupported use of parentheses',
    detailsFormat: 'Character offset to error',
    note: "The query couldn't be processed due to the use of parentheses. Typically either that they are mismatched, or in the wrong place. Eg. (((fish) or (sword and (b or ) c)",
  },
  'info:srw/diagnostic/1/14': {
    source: 'sru-2.0',
    category: 'query',
    description: 'Invalid or unsupported use of quotes',
    detailsFormat: 'Character offset to error',
    note: "The query couldn't be processed due to the use of quotes. Typically that they are mismatched Eg. \"fish'",
  },
  'info:srw/diagnostic/1/15': {
    source: 'sru-2.0',
    category: 'query',
    description: 'Unsupported context set',
    detailsFormat: 'URI or short name of context set',
    note: "A context set given in the query isn't known to the server. Eg. dc.title any dog",
  },
  'info:srw/diagnostic/1/16': {
    source: 'sru-2.0',
    category: 'query',
    description: 'Unsupported index',
    detailsFormat: 'Name of index',
    note: "The index isn't known, possibly within a context set. Eg. dc.author any leVan (dc has a creator index, not author)",
  },
  'info:srw/diagnostic/1/17': null, // not used
  'info:srw/diagnostic/1/18': {
    source: 'sru-2.0',
    category: 'query',
    description: 'Unsupported combination of indexes',
    detailsFormat: 'Space delimited index names',
    note: "The particular use of indexes in a boolean query can't be processed. Eg. The server may not be able to do title queries merged with description queries.",
  },
  'info:srw/diagnostic/1/19': {
    source: 'sru-2.0',
    category: 'query',
    description: 'Unsupported relation',
    detailsFormat: 'Relation',
    note: "A relation in the query is unknown or unsupported. Eg. The server can't handle 'within' searches for dates, but can handle equality searches.",
  },
  'info:srw/diagnostic/1/20': {
    source: 'sru-2.0',
    category: 'query',
    description: 'Unsupported relation modifier',
    detailsFormat: 'Value',
    note: "A relation modifier in the query is unknown or unsupported by the server. Eg. 'dc.title any/fuzzy starfish' when fuzzy isn't supported.",
  },
  'info:srw/diagnostic/1/21': {
    source: 'sru-2.0',
    category: 'query',
    description: 'Unsupported combination of relation modifers',
    detailsFormat: 'Slash separated relation modifier',
    note: 'Two (or more) relation modifiers can\'t be used together. Eg. dc.title any/cql.word/cql.string "star fish"',
  },
  'info:srw/diagnostic/1/22': {
    source: 'sru-2.0',
    category: 'query',
    description: 'Unsupported combination of relation and index',
    detailsFormat: 'Space separated index and relation',
    note: 'While the index and relation are supported, they can\'t be used together. Eg. dc.author within "1 5"',
  },
  'info:srw/diagnostic/1/23': {
    source: 'sru-2.0',
    category: 'query',
    description: 'Too many characters in term',
    detailsFormat: 'Length of longest term',
    note: 'The term is too long. Eg. The server may simply refuse to process a term longer than a given length.',
  },
  'info:srw/diagnostic/1/24': {
    source: 'sru-2.0',
    category: 'query',
    description: 'Unsupported combination of relation and term',
    detailsFormat: null,
    note: 'The relation cannot be used to process the term. Eg dc.title within "dixson"',
  },
  'info:srw/diagnostic/1/25': null, // not used
  'info:srw/diagnostic/1/26': {
    source: 'sru-2.0',
    category: 'query',
    description: 'Non special character escaped in term',
    detailsFormat: 'Character incorrectly escaped',
    note: 'Characters may be escaped incorrectly Eg "\\a\\r\\n\\s"',
  },
  'info:srw/diagnostic/1/27': {
    source: 'sru-2.0',
    category: 'query',
    description: 'Empty term unsupported',
    detailsFormat: null,
    note: 'Some servers do not support the use of an empty term for search or for scan. Eg: dc.title > ""',
  },
  'info:srw/diagnostic/1/28': {
    source: 'sru-2.0',
    category: 'query',
    description: 'Masking character not supported',
    detailsFormat: null,
    note: 'A masking character given in the query is not supported. Eg. The server may not support * or ? or both',
  },
  'info:srw/diagnostic/1/29': {
    source: 'sru-2.0',
    category: 'query',
    description: 'Masked words too short',
    detailsFormat: 'Minimum word length',
    note: "The masked words are too short, so the server won't process them as they would likely match too many terms. Eg. dc.title any *",
  },
  'info:srw/diagnostic/1/30': {
    source: 'sru-2.0',
    category: 'query',
    description: 'Too many masking characters in term',
    detailsFormat: 'Maximum number supported',
    note: 'The query has too many masking characters, so the server won\'t process them. Eg. dc.title any "???a*f??b* *a?"',
  },
  'info:srw/diagnostic/1/31': {
    source: 'sru-2.0',
    category: 'query',
    description: 'Anchoring character not supported',
    detailsFormat: null,
    note: 'The server doesn\'t support the anchoring character (^) Eg dc.title = "^jaws"',
  },
  'info:srw/diagnostic/1/32': {
    source: 'sru-2.0',
    category: 'query',
    description: 'Anchoring character in unsupported position',
    detailsFormat: 'Character offset',
    note: 'The anchoring character appears in an invalid part of the term, typically the middle of a word. Eg dc.title any "fi^sh"',
  },
  'info:srw/diagnostic/1/33': {
    source: 'sru-2.0',
    category: 'query',
    description: 'Combination of proximity/adjacency and masking characters not supported',
    detailsFormat: null,
    note: 'The server cannot handle both adjacency (= relation for words) or proximity (the boolean) in combination with masking characters. Eg. dc.title = "this is a titl* fo? a b*k"',
  },
  'info:srw/diagnostic/1/34': {
    source: 'sru-2.0',
    category: 'query',
    description: 'Combination of proximity/adjacency and anchoring characters not supported',
    detailsFormat: null,
    note: 'Similarly, the server cannot handle anchoring characters.',
  },
  'info:srw/diagnostic/1/35': {
    source: 'sru-2.0',
    category: 'query',
    description: 'Term contains only stopwords',
    detailsFormat: 'Value',
    note: "If the server does not index words such as 'the' or 'a', and the term consists only of these words, then while there may be records that match, the server cannot find any. Eg. dc.title any \"the\"",
  },
  'info:srw/diagnostic/1/36': {
    source: 'sru-2.0',
    category: 'query',
    description: 'Term in invalid format for index or relation',
    detailsFormat: null,
    note: 'This might happen when the index is of dates or numbers, but the term given is a word. Eg dc.date > "fish"',
  },
  'info:srw/diagnostic/1/37': {
    source: 'sru-2.0',
    category: 'query',
    description: 'Unsupported boolean operator',
    detailsFormat: 'Value',
    note: 'For cases when the server does not support all of the boolean operators defined by CQL. The most commonly unsupported is Proximity, but could be used for NOT, OR or AND.',
  },
  'info:srw/diagnostic/1/38': {
    source: 'sru-2.0',
    category: 'query',
    description: 'Too many boolean operators in query',
    detailsFormat: 'Maximum number supported',
    note: 'There were too many search clauses given for the server to process.',
  },
  'info:srw/diagnostic/1/39': {
    source: 'sru-2.0',
    category: 'query',
    description: 'Proximity not supported',
    detailsFormat: null,
    note: 'Proximity is not supported at all.',
  },
  'info:srw/diagnostic/1/40': {
    source: 'sru-2.0',
    category: 'query',
    description: 'Unsupported proximity relation',
    detailsFormat: 'Value',
    note: 'The relation given for the proximity is unsupported. Eg the server can only process = and > was given.',
  },
  'info:srw/diagnostic/1/41': {
    source: 'sru-2.0',
    category: 'query',
    description: 'Unsupported proximity distance',
    detailsFormat: 'Value',
    note: "The distance was too big or too small for the server to handle, or didn't make sense. Eg 0 characters or less than 100000 words",
  },
  'info:srw/diagnostic/1/42': {
    source: 'sru-2.0',
    category: 'query',
    description: 'Unsupported proximity unit',
    detailsFormat: 'Value',
    note: 'The unit of proximity is unsupported, possibly because it is not defined.',
  },
  'info:srw/diagnostic/1/43': {
    source: 'sru-2.0',
    category: 'query',
    description: 'Unsupported proximity ordering',
    detailsFormat: 'Value',
    note: 'The server cannot process the requested order or lack thereof for the proximity boolean',
  },
  'info:srw/diagnostic/1/44': {
    source: 'sru-2.0',
    category: 'query',
    description: 'Unsupported combination of proximity modifiers',
    detailsFormat: 'Slash separated values',
    note: 'While all of the modifiers are supported individually, this particular combination is not.',
  },
  'info:srw/diagnostic/1/45': null, // not used
  'info:srw/diagnostic/1/46': {
    source: 'sru-2.0',
    category: 'query',
    description: 'Unsupported boolean modifier',
    detailsFormat: 'Value',
    note: "A boolean modifier on the request isn't supported.",
  },
  'info:srw/diagnostic/1/47': {
    source: 'sru-2.0',
    category: 'query',
    description: 'Cannot process query; reason unknown',
    detailsFormat: null,
    note: "The server can't tell (or isn't telling) you why it can't execute the query, maybe it's a bad query or maybe it requests an unsupported capability.",
  },
  'info:srw/diagnostic/1/48': {
    source: 'sru-2.0',
    category: 'query',
    description: 'Query feature unsupported',
    detailsFormat: 'Feature',
    note: 'the server is able (contrast with 47) to tell you that something you asked for is not supported.',
  },
  'info:srw/diagnostic/1/49': {
    source: 'sru-2.0',
    category: 'query',
    description: 'Masking character in unsupported position',
    detailsFormat: 'the rejected term',
    note: 'Eg, a server that can handle xyz* but not *xyz or x*yz',
  },

  'info:srw/diagnostic/1/50': {
    source: 'sru-2.0',
    category: 'result set',
    description: 'Result sets not supported',
    detailsFormat: null,
    note: 'The server cannot create a persistent result set.',
  },
  'info:srw/diagnostic/1/51': {
    source: 'sru-2.0',
    category: 'result set',
    description: 'Result set does not exist',
    detailsFormat: 'Result set identifier',
    note: 'The client asked for a result set in the query which does not exist, either because it never did or because it had expired.',
  },
  'info:srw/diagnostic/1/52': {
    source: 'sru-2.0',
    category: 'result set',
    description: 'Result set temporarily unavailable',
    detailsFormat: 'Result set identifier',
    note: 'The result set exists, it cannot be accessed, but will be able to be accessed again in the future.',
  },
  'info:srw/diagnostic/1/53': {
    source: 'sru-2.0',
    category: 'result set',
    description: 'Result sets only supported for retrieval',
    detailsFormat: null,
    note: 'Other operations on results apart from retrieval, such as sorting them or combining them, are not supported.',
  },
  'info:srw/diagnostic/1/54': null, // not used
  'info:srw/diagnostic/1/55': {
    source: 'sru-2.0',
    category: 'result set',
    description: 'Combination of result sets with search terms not supported',
    detailsFormat: null,
    note: 'Existing result sets cannot be combined with new terms to create new result sets. eg cql.resultsetid = foo not dc.title any fish',
  },
  'info:srw/diagnostic/1/56': null, // not used
  'info:srw/diagnostic/1/57': null, // not used
  'info:srw/diagnostic/1/58': {
    source: 'sru-2.0',
    category: 'result set',
    description: 'Result set created with unpredictable partial results available',
    detailsFormat: null,
    note: 'The result set is not complete, possibly due to the processing being interupted mid way through. Some of the results may not even be matches.',
  },
  'info:srw/diagnostic/1/59': {
    source: 'sru-2.0',
    category: 'result set',
    description: 'Result set created with valid partial results available',
    detailsFormat: null,
    note: 'All of the records in the result set are matches, but not all records that should be there are.',
  },
  'info:srw/diagnostic/1/60': {
    source: 'sru-2.0',
    category: 'result set',
    description: 'Result set not created: too many matching records',
    detailsFormat: 'Maximum number',
    note: 'There were too many records to create a persistent result set.',
  },

  'info:srw/diagnostic/1/61': {
    source: 'sru-2.0',
    category: 'records',
    description: 'First record position out of range',
    detailsFormat: null,
    note: 'For example, if the request matches 10 records, but the start position is greater than 10.',
  },
  'info:srw/diagnostic/1/62': null, // not used
  'info:srw/diagnostic/1/63': null, // not used
  'info:srw/diagnostic/1/64': {
    source: 'sru-2.0',
    category: 'records',
    description: 'Record temporarily unavailable',
    detailsFormat: null,
    note: 'The record requested cannot be accessed currently, but will be able to be in the future.',
  },
  'info:srw/diagnostic/1/65': {
    source: 'sru-2.0',
    category: 'records',
    description: 'Record does not exist',
    detailsFormat: null,
    note: 'The record does not exist, either because it never did, or because it has subsequently been deleted.',
  },
  'info:srw/diagnostic/1/66': {
    source: 'sru-2.0',
    category: 'records',
    description: 'Unknown schema for retrieval',
    detailsFormat: 'Schema URI or short name',
    note: 'The record schema requested is unknown. Eg. the client asked for MODS when the server can only return simple Dublin Core',
  },
  'info:srw/diagnostic/1/67': {
    source: 'sru-2.0',
    category: 'records',
    description: 'Record not available in this schema',
    detailsFormat: 'Schema URI or short name',
    note: 'The record schema is known, but this particular record cannot be transformed into it.',
  },
  'info:srw/diagnostic/1/68': {
    source: 'sru-2.0',
    category: 'records',
    description: 'Not authorized to send record',
    detailsFormat: null,
    note: 'This particular record requires additional authorisation in order to receive it.',
  },
  'info:srw/diagnostic/1/69': {
    source: 'sru-2.0',
    category: 'records',
    description: 'Not authorized to send record in this schema',
    detailsFormat: null,
    note: 'The record can be retrieved in other schemas, but the one requested requires futher authorisation.',
  },
  'info:srw/diagnostic/1/70': {
    source: 'sru-2.0',
    category: 'records',
    description: 'Record too large to send',
    detailsFormat: 'Maximum record size',
    note: 'The record is too large to send.',
  },
  'info:srw/diagnostic/1/71': {
    source: 'sru-2.0',
    category: 'records',
    description: 'Unsupported recordXMLEscaping value',
    detailsFormat: null,
    note: 'The server supports only one of string or xml, or the client requested a recordXMLEscaping which is unknown.',
  },
  'info:srw/diagnostic/1/72': {
    source: 'sru-2.0',
    category: 'records',
    description: 'XPath retrieval unsupported',
    detailsFormat: null,
    note: 'The server does not support the retrieval of nodes from within the record.',
  },
  'info:srw/diagnostic/1/73': {
    source: 'sru-2.0',
    category: 'records',
    description: 'XPath expression contains unsupported feature',
    detailsFormat: 'Feature',
    note: 'Some aspect of the XPath expression is unsupported. For example, the server might be able to process element nodes, but not functions.',
  },
  'info:srw/diagnostic/1/74': {
    source: 'sru-2.0',
    category: 'records',
    description: 'Unable to evaluate XPath expression',
    detailsFormat: null,
    note: 'The server could not evaluate the expression, either because it was invalid or it lacks some capability.',
  },

  'info:srw/diagnostic/1/80': {
    source: 'sru-2.0',
    category: 'sort',
    description: 'Sort not supported',
    detailsFormat: null,
    note: 'the server cannot perform any sort; that is the server only returns data in the default sequence.',
  },
  'info:srw/diagnostic/1/81': null, // not used
  'info:srw/diagnostic/1/82': {
    source: 'sru-2.0',
    category: 'sort',
    description: 'Unsupported sort sequence',
    detailsFormat: 'Sequence',
    note: 'The particular sequence of sort keys is not supported, but the keys may be supported individually.',
  },
  'info:srw/diagnostic/1/83': {
    source: 'sru-2.0',
    category: 'sort',
    description: 'Too many records to sort',
    detailsFormat: 'Maximum number supported',
    note: 'used when the server will only sort result sets under a certain size and the request returned a set larger than that limit.',
  },
  'info:srw/diagnostic/1/84': {
    source: 'sru-2.0',
    category: 'sort',
    description: 'Too many sort keys to sort',
    detailsFormat: 'Maximum number supported',
    note: 'the server can accept a sort statement within a request but cannot deliver as requested, e.g. the server can sort by a maximum of 2 keys only such as "title" and "date" but was requested to sort by "title", "author" and "date".',
  },
  'info:srw/diagnostic/1/85': null, // not used
  'info:srw/diagnostic/1/86': {
    source: 'sru-2.0',
    category: 'sort',
    description: 'Cannot sort: incompatible record formats',
    detailsFormat: null,
    note: 'The result set includes records in different schemas and there is insufficient commonality among the schemas to enable a sort.',
  },
  'info:srw/diagnostic/1/87': {
    source: 'sru-2.0',
    category: 'sort',
    description: 'Unsupported schema for sort',
    detailsFormat: 'URI or short name of schema given',
    note: 'the server does not support sort for records in a particular schema, e.g. it supports sort for records in the DC schema but not in the ONIX schema.',
  },
  'info:srw/diagnostic/1/88': {
    source: 'sru-2.0',
    category: 'sort',
    description: 'Unsupported path for sort',
    detailsFormat: 'XPath',
    note: 'the server can accept a sort statement within a request but cannot deliver as requested, e.g. the server can deliver in title or date sequence but subject was requested.',
  },
  'info:srw/diagnostic/1/89': {
    source: 'sru-2.0',
    category: 'sort',
    description: 'Path unsupported for schema',
    detailsFormat: 'XPath',
    note: 'The path given cannot be generated for the schema requested. For example asking for /record/fulltext within the simple Dublin Core schema',
  },
  'info:srw/diagnostic/1/90': {
    source: 'sru-2.0',
    category: 'sort',
    description: 'Unsupported direction',
    detailsFormat: 'Value',
    note: 'the server can accept a sort statement within a request but cannot deliver as requested, e.g. the server can deliver in ascending only but descending was requested.',
  },
  'info:srw/diagnostic/1/91': {
    source: 'sru-2.0',
    category: 'sort',
    description: 'Unsupported case',
    detailsFormat: 'Value',
    note: "the server can accept a sort statement within a request but cannot deliver as requested, e.g. the server's index is single case so sorting case sensitive is unsupported",
  },
  'info:srw/diagnostic/1/92': {
    source: 'sru-2.0',
    category: 'sort',
    description: 'Unsupported missing value action',
    detailsFormat: 'Value',
    note: 'the server can accept a sort statement within a request but cannot deliver as requested. For example, the request includes a constant that the server should use where a record being sorted lacks the data field but the server cannot use the constant to override its normal behavior, e.g. sorting as a high value.',
  },
  'info:srw/diagnostic/1/93': {
    source: 'sru-2.0',
    category: 'sort',
    description: 'Sort ended due to missing value',
    detailsFormat: null,
    note: 'missingValue of ‘abort’',
  },
  'info:srw/diagnostic/1/94': {
    source: 'sru-2.0',
    category: 'sort',
    description: 'Sort spec included both in query and protocol: query prevails',
    detailsFormat: null,
    note: null,
  },
  'info:srw/diagnostic/1/95': {
    source: 'sru-2.0',
    category: 'sort',
    description: 'Sort spec included both in query and protocol: protocol prevails',
    detailsFormat: null,
    note: null,
  },
  'info:srw/diagnostic/1/96': {
    source: 'sru-2.0',
    category: 'sort',
    description: 'Sort spec included both in query and protocol: error',
    detailsFormat: null,
    note: null,
  },

  'info:srw/diagnostic/1/100': null, // not used
  'info:srw/diagnostic/1/101': null, // not used
  'info:srw/diagnostic/1/102': null, // not used

  'info:srw/diagnostic/1/110': {
    source: 'sru-2.0',
    category: 'stylesheet',
    description: 'Stylesheets not supported',
    detailsFormat: null,
    note: 'The SRU server does not support stylesheets, or a stylesheet was requested from an SRW server.',
  },
  'info:srw/diagnostic/1/111': {
    source: 'sru-2.0',
    category: 'stylesheet',
    description: 'Unsupported stylesheet',
    detailsFormat: null,
    note: 'This particular stylesheet is not supported, but others may be.',
  },

  'info:srw/diagnostic/1/120': null, // scan
  'info:srw/diagnostic/1/121': null, // scan
}

export const FCS_DIAGNOSTICS: { [diagnostics: string]: FcsDiagnostic } = {
  // https://clarin-eric.github.io/fcs-misc/fcs-core-2.0-specs/fcs-core-2.0.html#_list_of_diagnostics

  'http://clarin.eu/fcs/diagnostic/1': {
    source: 'clarin-fcs',
    category: 'request',
    description:
      'Persistent identifier passed by the Client for restricting the search is invalid.',
    detailsFormat: 'The offending persistent identifier.',
    fatal: false,
    note: 'If more than one invalid persistent identifiers were submitted by the Client, the Endpoint MUST generate a separate diagnostic for each invalid persistent identifier.',
  },
  'http://clarin.eu/fcs/diagnostic/2': {
    source: 'clarin-fcs',
    category: 'request',
    description: 'Resource set too large. Query context automatically adjusted.',
    detailsFormat:
      'The persistent identifier of the resource to which the query context was adjusted.',
    fatal: false,
    note: 'If an Endpoint limited the query context to more than one resource, it MUST generate a separate diagnostic for each resource to which the query context was adjusted.',
  },
  'http://clarin.eu/fcs/diagnostic/3': {
    source: 'clarin-fcs',
    category: 'request',
    description: 'Resource set too large. Cannot perform Query.',
    detailsFormat: null,
    fatal: true,
    note: null,
  },
  'http://clarin.eu/fcs/diagnostic/4': {
    source: 'clarin-fcs',
    category: 'request',
    description: 'Requested Data View not valid for this resource.',
    detailsFormat: 'The Data View MIME type.',
    fatal: false,
    note: 'If more than one invalid Data View was requested, the Endpoint MUST generate a separate diagnostic for each invalid Data View.',
  },

  'http://clarin.eu/fcs/diagnostic/10': {
    source: 'clarin-fcs',
    category: 'query',
    description: 'General query syntax error.',
    detailsFormat: 'Detailed error message why the query could not be parsed.',
    fatal: true,
    note: 'Endpoints MUST use this diagnostic only if the Client performed an Advanced Search request.',
  },
  'http://clarin.eu/fcs/diagnostic/11': {
    source: 'clarin-fcs',
    category: 'query',
    description: 'Query too complex. Cannot perform Query.',
    detailsFormat:
      'Details why could not be performed, e.g. unsupported layer or unsupported combination of operators.',
    fatal: true,
    note: 'Endpoints MUST use this diagnostic only if the Client performed an Advanced Search request.',
  },
  'http://clarin.eu/fcs/diagnostic/12': {
    source: 'clarin-fcs',
    category: 'query',
    description: 'Query was rewritten.',
    detailsFormat: 'Details how the query was rewritten.',
    fatal: false,
    note: 'Endpoints MUST use this diagnostic only if the Client performed an Advanced Search request with the x-fcs-rewrites-allowed request parameter.',
  },

  'http://clarin.eu/fcs/diagnostic/14': {
    source: 'clarin-fcs',
    category: 'general',
    description: 'General processing hint.',
    detailsFormat:
      'E.g. "No matches, because layer \'XY\' is not available in your selection of resources"',
    fatal: false,
    note: 'Endpoints MUST use this diagnostic only if the Client performed an Advanced Search request.',
  },
}
