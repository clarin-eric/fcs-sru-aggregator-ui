export type BooleansType = (typeof BOOLEANS)[number]['id']
export type FieldsType = (typeof FIELDS)[number]['id']
export type RelationsType = (typeof RELATIONS)[number]['id']
export type RelationModifiersType = (typeof RELATION_MODIFIERS)[number]['id']

export type NewSearchClauseChoicesType = (typeof NEW_SEARCH_CLAUSE_CHOICES)[number]['id']

export type RelationChoicesFieldTypes = keyof (typeof CHOICES_IS_RELATION_BY_FIELD_TYPE)

// --------------------------------------------------------------------------

export const FIELDS = [
  // Virtual Fields (e.g., on Entry)
  { id: 'any', label: 'All lexical fields', virtual: true },
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
  { id: 'degree', label: 'Degree of comparison' },
  { id: 'gender', label: 'Morphological Gender' },
  { id: 'grammar', label: 'General grammatical information' },
  { id: 'mood', label: 'Modality (for verbs)' },
  { id: 'number', label: 'Morphological Number' },
  { id: 'pos', label: 'Part-of-Speech' },
  { id: 'tense', label: 'Chronology (for verbs)' },
  { id: 'baseform', label: 'Baseform (or stem …)' },
  { id: 'segmentation', label: 'Composita segmentation, hyphenation' },
  { id: 'sentiment', label: 'Sentiment information', unstructured: true },
  { id: 'frequency', label: 'Frequency information', unstructured: true },
  // Relation to other Lexical Entries
  { id: 'antonym', label: 'Antonym' },
  { id: 'holonym', label: 'Holonym' },
  { id: 'hypernym', label: 'Hypernym' },
  { id: 'hyponym', label: 'Hyponym' },
  { id: 'meronym', label: 'Meronym' },
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
    fields: ['any', 'lang'] satisfies FieldsType[],
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
    fields: [
      'case',
      'degree',
      'gender',
      'mood',
      'number',
      'pos',
      'tense',
      'grammar',
      'baseform',
      'segmentation',
    ] satisfies FieldsType[],
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
      'holonym',
      'hypernym',
      'hyponym',
      'meronym',
      'related',
      'synonym',
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
  { id: '<>', label: 'not equal' },
  // default CQL relations, we probably do not require these for LexCQL?
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
  // { id: 'unmasked', label: 'Unmasked' },
  { id: 'ignoreCase', label: 'Ignore Case' },
  { id: 'respectCase', label: 'Respect Case' },
  { id: 'ignoreAccents', label: 'Ignore Accents' },
  { id: 'respectAccents', label: 'Respect Accents' },
  // { id: 'honorWhitespace', label: 'Honor Whitespace' },
  { id: 'regexp', label: 'Regular Expression' },
  // { id: 'partialMatch', label: 'Partial Match' },
  // { id: 'fullMatch', label: 'Full Match' },
] as const
export const RELATION_MODIFIERS_MUTUALLY_EXCLUSIVE = [
  ['ignoreCase', 'respectCase'],
  ['ignoreAccents', 'respectAccents'],
] as const

export const BOOLEANS = [
  { id: 'and', label: 'AND' },
  { id: 'or', label: 'OR' },
  // { id: 'not', label: 'NOT' },
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

// --------------------------------------------------------------------------

// run `Array.from(document.querySelectorAll("h3")).map((ele) => ele.textContent)` in dev console on UD webpage
// JSON.stringify(Array.from(document.querySelectorAll("h3")).map((ele) => ele.textContent).map((txt) => txt.split(": ")).map(([id, long]) => ({id: id, label: id, labelLong: long})))
// JSON.stringify(Array.from(document.querySelectorAll("ul>li")).map((ele) => ele.textContent).map((txt) => txt.split(": ")).map(([id, long]) => ({id: id, label: id, labelLong: long})))

// NOTE: not sorted, in order of appearance on UD webpages
export const CHOICES_IS_RELATION_BY_FIELD_TYPE = {
  case: [
    // Core
    { id: 'Nom', label: 'Nom', labelLong: 'nominative / direct', group: ['core'] },
    { id: 'Acc', label: 'Acc', labelLong: 'accusative / oblique', group: ['core'] },
    { id: 'Abs', label: 'Abs', labelLong: 'absolutive', group: ['core'] },
    { id: 'Erg', label: 'Erg', labelLong: 'ergative', group: ['core'] },
    // None-Core
    { id: 'Dat', label: 'Dat', labelLong: 'dative', group: ['None-core'] },
    { id: 'Gen', label: 'Gen', labelLong: 'genitive', group: ['None-core'] },
    { id: 'Voc', label: 'Voc', labelLong: 'vocative', group: ['None-core'] },
    { id: 'Ins', label: 'Ins', labelLong: 'instrumental / instructive', group: ['None-core'] },
    { id: 'Par', label: 'Par', labelLong: 'partitive', group: ['None-core'] },
    { id: 'Dis', label: 'Dis', labelLong: 'distributive', group: ['None-core'] },
    { id: 'Ess', label: 'Ess', labelLong: 'essive / prolative', group: ['Local'] },
    { id: 'Tra', label: 'Tra', labelLong: 'translative / factive', group: ['None-core'] },
    { id: 'Com', label: 'Com', labelLong: 'comitative / associative', group: ['None-core'] },
    { id: 'Abe', label: 'Abe', labelLong: 'abessive / caritive / privative', group: ['None-core'] },
    {
      id: 'Cau',
      label: 'Cau',
      labelLong: 'causative / motivative / purposive',
      group: ['None-core'],
    },
    { id: 'Ben', label: 'Ben', labelLong: 'benefactive / destinative', group: ['None-core'] },
    { id: 'Cns', label: 'Cns', labelLong: 'considerative', group: ['None-core'] },
    { id: 'Cmp', label: 'Cmp', labelLong: 'comparative', group: ['None-core'] },
    { id: 'Equ', label: 'Equ', labelLong: 'equative', group: ['None-core'] },
    { id: 'Loc', label: 'Loc', labelLong: 'locative', group: ['Local', 'Location and direction'] },
    {
      id: 'Lat',
      label: 'Lat',
      labelLong: 'lative / directional allative',
      group: ['Local', 'Location and direction'],
    },
    {
      id: 'Ter',
      label: 'Ter',
      labelLong: 'terminative / terminal allative',
      group: ['Local', 'Location and direction'],
    },
    { id: 'Ine', label: 'Ine', labelLong: 'inessive', group: ['Local', 'Internal location'] },
    {
      id: 'Ill',
      label: 'Ill',
      labelLong: 'illative / inlative',
      group: ['Local', 'Internal location'],
    },
    {
      id: 'Ela',
      label: 'Ela',
      labelLong: 'elative / inelative',
      group: ['Local', 'Internal location'],
    },
    { id: 'Add', label: 'Add', labelLong: 'additive', group: ['Local', 'Internal location'] },
    { id: 'Ade', label: 'Ade', labelLong: 'adessive', group: ['Local', 'External location'] },
    {
      id: 'All',
      label: 'All',
      labelLong: 'allative / adlative',
      group: ['Local', 'External location'],
    },
    {
      id: 'Abl',
      label: 'Abl',
      labelLong: 'ablative / adelative',
      group: ['Local', 'External location'],
    },
    { id: 'Sup', label: 'Sup', labelLong: 'superessive', group: ['Local', 'Higher location'] },
    { id: 'Spl', label: 'Spl', labelLong: 'superlative', group: ['Local', 'Higher location'] },
    {
      id: 'Del',
      label: 'Del',
      labelLong: 'delative / superelative',
      group: ['Local', 'Higher location'],
    },
    { id: 'Sub', label: 'Sub', labelLong: 'subessive', group: ['Local', 'Lower location'] },
    { id: 'Sbl', label: 'Sbl', labelLong: 'sublative', group: ['Local', 'Lower location'] },
    { id: 'Sbe', label: 'Sbe', labelLong: 'subelative', group: ['Local', 'Lower location'] },
    { id: 'Per', label: 'Per', labelLong: 'perlative', group: ['Local', 'Lower location'] },
    { id: 'Tem', label: 'Tem', labelLong: 'temporal', group: ['None-core', 'Lower location'] },
  ],
  degree: [
    { id: 'Pos', label: 'Pos', labelLong: 'positive, first degree' },
    { id: 'Equ', label: 'Equ', labelLong: 'equative' },
    { id: 'Cmp', label: 'Cmp', labelLong: 'comparative, second degree' },
    { id: 'Sup', label: 'Sup', labelLong: 'superlative, third degree' },
    { id: 'Abs', label: 'Abs', labelLong: 'absolute superlative' },
    { id: 'Dim', label: 'Dim', labelLong: 'diminutive' },
    { id: 'Aug', label: 'Aug', labelLong: 'augmentative' },
  ],
  gender: [
    { id: 'Masc', label: 'Masc', labelLong: 'masculine gender' },
    { id: 'Fem', label: 'Fem', labelLong: 'feminine gender' },
    { id: 'Neut', label: 'Neut', labelLong: 'neuter gender' },
    { id: 'Com', label: 'Com', labelLong: 'common gender' },
  ],
  mood: [
    { id: 'Ind', label: 'Ind', labelLong: 'indicative or realis' },
    { id: 'Imp', label: 'Imp', labelLong: 'imperative' },
    { id: 'Cnd', label: 'Cnd', labelLong: 'conditional' },
    { id: 'Pot', label: 'Pot', labelLong: 'potential' },
    { id: 'Sub', label: 'Sub', labelLong: 'subjunctive / conjunctive' },
    { id: 'Jus', label: 'Jus', labelLong: 'jussive / injunctive' },
    { id: 'Prp', label: 'Prp', labelLong: 'purposive' },
    { id: 'Qot', label: 'Qot', labelLong: 'quotative' },
    { id: 'Opt', label: 'Opt', labelLong: 'optative' },
    { id: 'Des', label: 'Des', labelLong: 'desiderative' },
    { id: 'Nec', label: 'Nec', labelLong: 'necessitative' },
    { id: 'Int', label: 'Int', labelLong: 'interrogative' },
    { id: 'Irr', label: 'Irr', labelLong: 'irrealis' },
    { id: 'Adm', label: 'Adm', labelLong: 'admirative' },
  ],
  number: [
    { id: 'Sing', label: 'Sing', labelLong: 'singular number' },
    { id: 'Plur', label: 'Plur', labelLong: 'plural number' },
    { id: 'Dual', label: 'Dual', labelLong: 'dual number' },
    { id: 'Tri', label: 'Tri', labelLong: 'trial number' },
    { id: 'Pauc', label: 'Pauc', labelLong: 'paucal number' },
    { id: 'Grpa', label: 'Grpa', labelLong: 'greater paucal number' },
    { id: 'Grpl', label: 'Grpl', labelLong: 'greater plural number' },
    { id: 'Inv', label: 'Inv', labelLong: 'inverse number' },
    { id: 'Count', label: 'Count', labelLong: 'count plural' },
    { id: 'Ptan', label: 'Ptan', labelLong: 'plurale tantum' },
    { id: 'Coll', label: 'Coll', labelLong: 'collective / mass / singulare tantum' },
  ],
  pos: [
    // Open class words
    { id: 'ADJ', label: 'ADJ', labelLong: 'adjective', group: 'Open class words' },
    { id: 'ADV', label: 'ADV', labelLong: 'adverb', group: 'Open class words' },
    { id: 'INTJ', label: 'INTJ', labelLong: 'interjection', group: 'Open class words' },
    { id: 'NOUN', label: 'NOUN', labelLong: 'noun', group: 'Open class words' },
    { id: 'PROPN', label: 'PROPN', labelLong: 'proper noun', group: 'Open class words' },
    { id: 'VERB', label: 'VERB', labelLong: 'verb', group: 'Open class words' },
    // Closed class words
    { id: 'ADP', label: 'ADP', labelLong: 'adposition', group: 'Closed class words' },
    { id: 'AUX', label: 'AUX', labelLong: 'auxiliary', group: 'Closed class words' },
    {
      id: 'CCONJ',
      label: 'CCONJ',
      labelLong: 'coordinating conjunction',
      group: 'Closed class words',
    },
    { id: 'DET', label: 'DET', labelLong: 'determiner', group: 'Closed class words' },
    { id: 'NUM', label: 'NUM', labelLong: 'numeral', group: 'Closed class words' },
    { id: 'PART', label: 'PART', labelLong: 'particle', group: 'Closed class words' },
    { id: 'PRON', label: 'PRON', labelLong: 'pronoun', group: 'Closed class words' },
    {
      id: 'SCONJ',
      label: 'SCONJ',
      labelLong: 'subordinating conjunction',
      group: 'Closed class words',
    },
    // Other
    { id: 'PUNCT', label: 'PUNCT', labelLong: 'punctuation', group: 'other' },
    { id: 'SYM', label: 'SYM', labelLong: 'symbol', group: 'other' },
    { id: 'X', label: 'X', labelLong: 'other', group: 'other' },
  ],
  sentiment: [
    { id: 'Pos', label: 'Pos', labelLong: 'positive, affirmative' },
    { id: 'Neg', label: 'Neg', labelLong: 'negative' },
  ],
  tense: [
    { id: 'Past', label: 'Past', labelLong: 'past tense / preterite / aorist' },
    { id: 'Pres', label: 'Pres', labelLong: 'present / non-past tense / aorist' },
    { id: 'Fut', label: 'Fut', labelLong: 'future tense' },
    { id: 'Imp', label: 'Imp', labelLong: 'imperfect' },
    { id: 'Pqp', label: 'Pqp', labelLong: 'pluperfect' },
  ],
}


// --------------------------------------------------------------------------
