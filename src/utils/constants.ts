export const queryTypes = [
  {
    id: 'cql',
    name: 'Text layer Contextual Query Language (CQL)',
    searchPlaceholder: 'Elephant',
    searchLabel: 'Full-text search',
    searchLabelBkColor: '#fed',
    className: '',
  },
  {
    id: 'fcs',
    name: 'Multi-layer Federated Content Search Query Language (FCS-QL)',
    searchPlaceholder: "[word = 'annotation'][word = 'focused']",
    searchLabel: 'Multi-layer annotation search',
    searchLabelBkColor: '#efd',
    disabled: false,
  },
]

export const queryTypeMap = Object.fromEntries(
  ['cql', 'fcs'].map((id) => [id, queryTypes.find((qt) => qt.id === id)])
)

export type QueryTypeID = 'cql' | 'fcs'

export const numberOfResultsOptions = [10, 20, 50, 100, 200, 250]

export const NO_MORE_RECORDS_DIAGNOSTIC_URI = "info:srw/diagnostic/1/61"
