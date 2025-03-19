import {
  Expression_andContext,
  Expression_basicContext,
  Expression_groupContext,
  Expression_notContext,
  Expression_orContext,
} from '@/parsers/FCSParser'
import { type Resource } from '@/utils/api'

// --------------------------------------------------------------------------

export type ExpressionListChild =
  | Expression_notContext
  | Expression_groupContext
  | Expression_orContext
  | Expression_andContext
export type ExpressionChild = ExpressionListChild | Expression_basicContext

export type QuantifierChoicesType = (typeof QUANTIFIER_CHOICES)[number]['id']
export type LayerValueOptionsType = (typeof LAYER_VALUE_OPTIONS)[number]['id']
export type ExpressionOperatorsType = (typeof EXPRESSION_OPERATORS)[number]['id']

export type AdvancedLayerType = (typeof ADVANCED_LAYERS)[number]['id']
export type NewQuerySegmentType = (typeof NEW_QUERY_SEGMENTS)[number]['id']
export type NewExpressionType = (typeof NEW_EXPRESSIONS)[number]['id']
export type ChangeToExpressionListType = (typeof CHANGE_TO_EXPRESSION_LIST)[number]['id']
export type WrapExpressionType = (typeof WRAP_EXPRESSION)[number]['id']

export interface ResourceLayerIDInfo {
  resultIDs: string[]
  qualifiers: string[]
}
export interface ResourcesWithLayerIDInfo {
  resource: Resource
  layerIDs: ResourceLayerIDInfo
}
export interface LayerInfo {
  resources: ResourcesWithLayerIDInfo[]
  qualifiers: Map<string, Resource[]>
}

// --------------------------------------------------------------------------

export const ADVANCED_LAYERS = [
  { id: 'text', label: 'textual representation' },
  { id: 'lemma', label: 'lemmatization of tokens' },
  { id: 'pos', label: 'part-of-speech UD v2.0 tagset' },
  { id: 'orth', label: 'orthographic transcription' },
  { id: 'norm', label: 'orthographic normalization' },
  { id: 'phonetic', label: 'phonetic transcription SAMPA' },
] as const
export const ADVANCED_LAYERS_MAP = Object.fromEntries(
  ADVANCED_LAYERS.map((item) => [item.id, item])
)

export const LAYER_VALUE_OPTIONS = [
  {
    id: 'pos',
    operators: ['is', 'is-not'],
    options: [
      { value: 'ADJ', label: 'Adjective' },
      { value: 'ADV', label: 'Adverb' },
      { value: 'INTJ', label: 'Interjection' },
      { value: 'NOUN', label: 'Noun' },
      { value: 'PROPN', label: 'Proper noun' },
      { value: 'VERB', label: 'Verb' },
      { value: 'ADP', label: 'Adposition' },
      { value: 'AUX', label: 'Auxiliary' },
      { value: 'CCONJ', label: 'Coordinating conjunction' },
      { value: 'DET', label: 'Determiner' },
      { value: 'NUM', label: 'Numeral' },
      { value: 'PART', label: 'Particle' },
      { value: 'PRON', label: 'Pronoun' },
      { value: 'SCONJ', label: 'Subordinating conjunction' },
      { value: 'PUNCT', label: 'Punctuation' },
      { value: 'SYM', label: 'Symbol' },
      { value: 'X', label: 'Other' },
    ],
  },
] as const
export const LAYER_VALUE_OPTIONS_MAP = Object.fromEntries(
  LAYER_VALUE_OPTIONS.map((item) => [item.id, item])
)

export const EXPRESSION_OPERATORS = [
  {
    id: 'is',
    label: 'is',
    operator: '=',
    valueAfter: null,
    valueBefore: null,
    escape: true,
  },
  {
    id: 'is-not',
    label: 'is not',
    operator: '!=',
    valueAfter: null,
    valueBefore: null,
    escape: true,
  },
  {
    id: 'contains',
    label: 'contains',
    operator: '=',
    valueAfter: '.*',
    valueBefore: '.*',
    escape: true,
  },
  {
    id: 'starts-with',
    label: 'starts with',
    operator: '=',
    valueAfter: '.*',
    valueBefore: null,
    escape: true,
  },
  {
    id: 'ends-with',
    label: 'ends with',
    operator: '=',
    valueAfter: null,
    valueBefore: '.*',
    escape: true,
  },
  {
    id: 'regex',
    label: 'regex',
    operator: '=',
    valueAfter: null,
    valueBefore: null,
    escape: false,
  },
  {
    id: 'not-regex',
    label: 'not regex',
    operator: '!=',
    valueAfter: null,
    valueBefore: null,
    escape: false,
  },
] as const
export const EXPRESSION_OPERATORS_MAP = Object.fromEntries(
  EXPRESSION_OPERATORS.map((item) => [item.id, item])
)

// --------------------------------------------------------------------------

export const DEFAULT_NEW_QUANTIFIER = '?'
export const DEFAULT_NEW_EXPRESSION = 'text = ""'
export const DEFAULT_EXPRESSION_OPERATOR = '='

// --------------------------------------------------------------------------

// TODO: restructure with labels? (hide short forms?)
export const WITHIN_CHOICES = [
  'sentence',
  's',
  'utterance',
  'u',
  'paragraph',
  'p',
  'turn',
  't',
  'text',
  'session',
] as const

export const QUANTIFIER_CHOICES = [
  { id: '*', label: 'Zero or More', type: 'symbol', new: '*' },
  { id: '+', label: 'One or More', type: 'symbol', new: '+' },
  { id: '?', label: 'Zero or One', type: 'symbol', new: '?' },
  { id: 'n-n', label: 'Exactly N', type: 'range', new: '{1}' },
  { id: 'n-m', label: 'N to M', type: 'range', new: '{0,1}' },
  { id: 'n-', label: 'At least N', type: 'range', new: '{0,}' },
  { id: '-m', label: 'At most M', type: 'range', new: '{,1}' },
] as const
export const QUANTIFIER_CHOICES_MAP = Object.fromEntries(
  QUANTIFIER_CHOICES.map((item) => [item.id, item])
)

export const NEW_QUERY_SEGMENTS = [
  { id: 'token', label: 'Normal Token', new: `[ ${DEFAULT_NEW_EXPRESSION} ]` },
  { id: 'unspecific-token', label: 'Unspecific Token', new: '[]' },
  { id: 'string', label: 'Plain String', new: '""' },
] as const
export const NEW_QUERY_SEGMENTS_MAP = Object.fromEntries(
  NEW_QUERY_SEGMENTS.map((item) => [item.id, item])
)

export const NEW_EXPRESSIONS = [
  { id: 'basic', label: 'Expression', new: `${DEFAULT_NEW_EXPRESSION}` },
  { id: 'or', label: 'OR', new: `${DEFAULT_NEW_EXPRESSION} | ${DEFAULT_NEW_EXPRESSION}` },
  { id: 'and', label: 'AND', new: `${DEFAULT_NEW_EXPRESSION} & ${DEFAULT_NEW_EXPRESSION}` },
] as const
export const NEW_EXPRESSIONS_MAP = Object.fromEntries(
  NEW_EXPRESSIONS.map((item) => [item.id, item])
)

export const CHANGE_TO_EXPRESSION_LIST = [
  {
    id: 'or',
    label: 'OR',
    newBefore: `${DEFAULT_NEW_EXPRESSION} |`,
    newAfter: `| ${DEFAULT_NEW_EXPRESSION}`,
  },
  {
    id: 'and',
    label: 'AND',
    newBefore: `${DEFAULT_NEW_EXPRESSION} &`,
    newAfter: `& ${DEFAULT_NEW_EXPRESSION}`,
  },
] as const
export const CHANGE_TO_EXPRESSION_LIST_MAP = Object.fromEntries(
  CHANGE_TO_EXPRESSION_LIST.map((item) => [item.id, item])
)

export const WRAP_EXPRESSION = [
  { id: 'group', label: 'Group', newBefore: '(', newAfter: ')' },
  { id: 'not', label: 'Negation', newBefore: '!', newAfter: null },
] as const
export const WRAP_EXPRESSION_MAP = Object.fromEntries(
  WRAP_EXPRESSION.map((item) => [item.id, item])
)

// --------------------------------------------------------------------------
