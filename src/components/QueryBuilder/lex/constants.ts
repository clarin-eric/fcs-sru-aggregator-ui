export type BooleansType = (typeof BOOLEANS)[number]['id']
export type FieldsType = (typeof FIELDS)[number]['id']
export type RelationsType = (typeof RELATIONS)[number]['id']
export type RelationModifiersType = (typeof RELATION_MODIFIERS)[number]['id']

export type NewSearchClauseChoicesType = (typeof NEW_SEARCH_CLAUSE_CHOICES)[number]['id']

// --------------------------------------------------------------------------

export const FIELDS = [
  // Virtual Fields (e.g., on Entry)
  { id: 'lang', label: 'Entry language', virtual: true },
  // Core Fields
  { id: 'lemma', label: 'Lemma form' },
  { id: 'entryId', label: 'Identifier of the current entry' },
  { id: 'phonetic', label: 'Phonetic form' },
  { id: 'translation', label: 'Translation' },
  { id: 'transcription', label: 'Transcription or transliteration' },
  // Prosaic Descriptions
  { id: 'definition', label: 'Definition or description' },
  { id: 'etymology', label: 'Etymology information' },
  // Grammar and Morphology
  { id: 'case', label: 'Morphological Case' },
  { id: 'number', label: 'Morphological Number' },
  { id: 'gender', label: 'Morphological Gender' },
  { id: 'pos', label: 'Part-of-Speech' },
  { id: 'baseform', label: 'Baseform (or stem …)' },
  { id: 'segmentation', label: 'Composita segmentation, hyphenation' },
  { id: 'sentiment', label: 'Sentiment information', unstructured: true },
  { id: 'frequency', label: 'Frequency information', unstructured: true },
  // Relation to other Lexical Entries
  { id: 'antonym', label: 'Antonym' },
  { id: 'hyponym', label: 'Hyponym' },
  { id: 'hypernym', label: 'Hypernym' },
  { id: 'meronym', label: 'Meronym' },
  { id: 'holonym', label: 'Holonym' },
  { id: 'synonym', label: 'Synonym' },
  { id: 'related', label: 'Unspecified relation' },
  // External References
  { id: 'ref', label: 'A URI referencing a related resource' },
  { id: 'senseRef', label: 'ID of a sense definition' },
  // Citations / Quotations
  { id: 'citation', label: 'Citation, quotation or example' },
] as const
export const FIELDS_MAP = Object.fromEntries(FIELDS.map((item) => [item.id, item]))
export const FIELD_GROUPS = [
  {
    id: 'virtual',
    label: 'Virtual fields',
    fields: ['lang'] satisfies FieldsType[],
  },
  {
    id: 'core',
    label: 'Basic fields',
    fields: ['lemma', 'entryId', 'phonetic', 'translation', 'transcription'] satisfies FieldsType[],
  },
  {
    id: 'description',
    label: 'Description fields',
    fields: ['definition', 'etymology'] satisfies FieldsType[],
  },
  {
    id: 'grammar',
    label: 'Grammar and morphology fields',
    fields: ['case', 'number', 'gender', 'pos', 'baseform', 'segmentation'] satisfies FieldsType[],
  },
  {
    id: 'numeric',
    label: 'Unstructured numeric fields',
    fields: ['sentiment', 'frequency'] satisfies FieldsType[],
  },
  {
    id: 'relation',
    label: 'Semantic relation fields',
    fields: [
      'antonym',
      'hyponym',
      'hypernym',
      'meronym',
      'holonym',
      'synonym',
      'related',
    ] satisfies FieldsType[],
  },
  {
    id: 'reference',
    label: 'Reference fields',
    fields: ['ref', 'senseRef'] satisfies FieldsType[],
  },
  {
    id: 'citation',
    label: 'Citation and quotation fields',
    fields: ['citation'] satisfies FieldsType[],
  },
] as const

export const RELATIONS = [
  { id: '=', label: 'equal' },
  { id: '==', label: 'exact equal' },
  // default CQL relations, we probably do not require these for LexCQL?
  // { id: '<>', label: 'not equal' },
  // { id: '>', label: 'greater' },
  // { id: '<', label: 'lesser' },
  // { id: '>=', label: 'greater equal' },
  // { id: '<=', label: 'lesser equal' },
  // custom entity relation
  { id: 'is', label: 'is a' },
] as const

export const RELATION_MODIFIERS = [
  { id: 'lang', label: 'Language' },
  // {id: "masked", label: "Masked"}, // default, implicit
  { id: 'unmasked', label: 'Unmasked' },
  { id: 'ignoreCase', label: 'Ignore Case' },
  { id: 'respectCase', label: 'Respect Case' },
  { id: 'ignoreAccents', label: 'Ignore Accents' },
  { id: 'respectAccents', label: 'Respect Accents' },
  { id: 'honorWhitespace', label: 'Honor Whitespace' },
  { id: 'regexp', label: 'Regular Expression' },
  { id: 'partialMatch', label: 'Partial Match' },
  { id: 'fullMatch', label: 'Full Match' },
] as const
export const RELATION_MODIFIERS_MUTUALLY_EXCLUSIVE = [
  ['masked', 'unmasked', 'regexp'],
  ['ignoreCase', 'respectCase'],
  ['ignoreAccents', 'respectAccents'],
  ['partialMatch', 'fullMatch'],
] as const

export const BOOLEANS = [
  { id: 'and', label: 'AND' },
  { id: 'or', label: 'OR' },
  { id: 'not', label: 'NOT' },
] as const

// --------------------------------------------------------------------------

export const DEFAULT_NEW_INDEX = 'lemma'
export const DEFAULT_NEW_RELATION = '='
export const DEFAULT_NEW_SEARCHCLAUSE = '""'
export const DEFAULT_NEW_BOOLEAN = 'or'

// --------------------------------------------------------------------------

export const NEW_SEARCH_CLAUSE_CHOICES = [
  {
    id: 'search-clause',
    label: 'Search Clause',
    new: `${DEFAULT_NEW_SEARCHCLAUSE}`,
    newBefore: `${DEFAULT_NEW_SEARCHCLAUSE} ${DEFAULT_NEW_BOOLEAN}`,
    newAfter: `${DEFAULT_NEW_BOOLEAN} ${DEFAULT_NEW_SEARCHCLAUSE}`,
  },
  {
    id: 'sub-query',
    label: 'Subquery',
    new: `( ${DEFAULT_NEW_SEARCHCLAUSE} )`,
    newBefore: `( ${DEFAULT_NEW_SEARCHCLAUSE} ) ${DEFAULT_NEW_BOOLEAN}`,
    newAfter: `${DEFAULT_NEW_BOOLEAN} ( ${DEFAULT_NEW_SEARCHCLAUSE} )`,
  },
] as const
export const NEW_SEARCH_CLAUSE_CHOICES_MAP = Object.fromEntries(
  NEW_SEARCH_CLAUSE_CHOICES.map((item) => [item.id, item])
)
