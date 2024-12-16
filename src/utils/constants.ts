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
