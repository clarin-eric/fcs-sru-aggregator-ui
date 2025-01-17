import type { GrammarToken, LanguageProto } from '../types'
import cql from './prism-cql'

// --------------------------------------------------------------------------

type BoolGroupInside = Record<'boolean', GrammarToken>
type SearchClauseInside = Record<'relation' | 'index' | 'relation-modifier', GrammarToken>
type RelationModifierInside = Record<'modifier' | 'comparitor', GrammarToken>

// --------------------------------------------------------------------------

const BOOLEAN_OPERATORS = ['AND', 'NOT', 'OR'] as const

const INDEXES = [
  'antonym',
  'baseform',
  'case',
  'citation',
  'definition',
  'entryId',
  'etymology',
  'frequency',
  'gender',
  'holonym',
  'hypernym',
  'hyponym',
  'lang',
  'lemma',
  'meronym',
  'number',
  'phonetic',
  'pos',
  'ref',
  'related',
  'segmentation',
  'senseRef',
  'sentiment',
  'subordinate',
  'superordinate',
  'synonym',
  'transcription',
  'translation',
] as const

const RELATION_MODIFIERS = [
  'fullMatch',
  'honorWhitespace',
  'ignoreAccents',
  'ignoreCase',
  'lang',
  'masked',
  'partialMatch',
  'regexp',
  'respectAccents',
  'respectCase',
  'unmasked',
] as const

// --------------------------------------------------------------------------

export default {
  id: 'fcs-lexcql',
  require: cql,
  grammar({ extend }) {
    // base on CQL language
    const lexcql = extend('cql', {})

    // constructs not used in LexCQL
    delete lexcql['prefix']
    delete lexcql['sortby']

    // TODO: or do we want to add patterns for valid tokens first and invalid variants second (to support custom highlighting?)

    const boolGroupInside = (lexcql['bool-group'] as GrammarToken).inside as BoolGroupInside
    const searchClauseInside = (lexcql['search-clause'] as GrammarToken)
      .inside as SearchClauseInside
    const relationModifierInside = searchClauseInside['relation-modifier']
      .inside as RelationModifierInside

    // only some subset of bool expressions used
    const boolExp = RegExp('\\b(?:' + BOOLEAN_OPERATORS.toSorted().join('|') + ')\\b', 'i')
    boolGroupInside['boolean'].pattern = boolExp

    // restrict relations in search clauses (XXX: support of negative look behind?)
    const comparitorExp = /(?:(?:<>|(?<!<|>)==?)(?![=><])|\b(?:exact|is|scr)\b)/
    searchClauseInside['relation'].pattern = comparitorExp

    // restrict to known fields (index) in search clause
    const fieldExp = RegExp('^\\b(?:' + INDEXES.toSorted().join('|') + ')\\b')
    searchClauseInside['index'].pattern = fieldExp

    // restrict relation modifiers in search clause
    const modifierExp = RegExp('(/\\s*)(?:' + RELATION_MODIFIERS.toSorted().join('|') + ')')
    relationModifierInside['modifier'].pattern = modifierExp
    relationModifierInside['comparitor'].pattern = /=/

    return lexcql
  },
} as LanguageProto<'fcs-lexcql'>
