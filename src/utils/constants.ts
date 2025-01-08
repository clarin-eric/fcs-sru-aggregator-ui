export type QueryTypeID = 'cql' | 'fcs' | 'lex'

// --------------------------------------------------------------------------

export const queryTypes = [
  {
    id: 'cql',
    name: 'Text layer Contextual Query Language (CQL)',
    searchLabel: 'Full-text search',
    color: '#29a900',
    searchPlaceholder: 'Elephant',
  },
  {
    id: 'fcs',
    name: 'Multi-layer Federated Content Search Query Language (FCS-QL)',
    searchLabel: 'Multi-layer annotation search',
    color: '#00a8cc',
    searchPlaceholder: "[word = 'annotation'][word = 'focused']",
  },
  {
    id: 'lex',
    name: 'Lexical Resources Contextual Query Language (LexCQL)',
    searchLabel: 'Lexcial resource search',
    color: '#e77e00',
    searchPlaceholder: 'banana',
  },
]

export const queryTypeMap = Object.fromEntries(
  ['cql', 'fcs', 'lex'].map((id) => [id, queryTypes.find((qt) => qt.id === id)])
)

export const DEFAULT_QUERY_TYPE = 'cql'

export const numberOfResultsOptions = [10, 20, 50, 100, 200, 250]

export const NO_MORE_RECORDS_DIAGNOSTIC_URI = 'info:srw/diagnostic/1/61'
