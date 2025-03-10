export type QueryTypeID = (typeof QUERY_TYPES)[number]['id']
export type DownloadFormats = (typeof DOWNLOAD_FORMATS)[number]['id']
export type NumberOfResults = (typeof NUMBER_OF_RESULTS)[number]

// --------------------------------------------------------------------------

export const QUERY_TYPES = [
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
    searchLabel: 'Lexical resource search',
    color: '#e77e00',
    searchPlaceholder: 'banana',
  },
] as const

export const QUERY_TYPE_MAP = Object.fromEntries(
  ['cql', 'fcs', 'lex'].map((id) => [id, QUERY_TYPES.find((qt) => qt.id === id)])
)

export const DOWNLOAD_FORMATS = [
  { id: 'text', label: 'Plain Text' },
  { id: 'csv', label: 'CSV' },
  { id: 'tcf', label: 'TCF' },
  { id: 'ods', label: 'ODS' },
  { id: 'excel', label: 'Excel' },
] as const

export const DEFAULT_QUERY_TYPE: QueryTypeID = 'cql'

export const NUMBER_OF_RESULTS = [10, 20, 50, 100, 200, 250] as const

export const NO_MORE_RECORDS_DIAGNOSTIC_URI = 'info:srw/diagnostic/1/61'
