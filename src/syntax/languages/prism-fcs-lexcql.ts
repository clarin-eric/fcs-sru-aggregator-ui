// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import Prism from 'prismjs/components/prism-core'
import './prism-cql'

// base on CQL language
const grammar = Prism.languages.extend('cql', {}) as Partial<Record<string, Prism.Grammar>>

// constructs not used in LexCQL
delete grammar['prefix']
delete grammar['sortby']

// TODO: or do we want to add patterns for valid tokens first and invalid variants second (to support custom highlighting?)

// only some subset of bool expressions used
const boolExp = /\b(?:AND|NOT|OR)\b/i
grammar['bool-group'].inside['boolean'].pattern = boolExp

// restrict relations in search clauses (XXX: support of negative look behind?)
const comparitorExp = /(?:(?:<>|(?<!<|>)==?)(?![=><])|\b(?:exact|is|scr)\b)/
grammar['search-clause'].inside['relation'].pattern = comparitorExp

// restrict to known fields (index) in search clause
const fieldExp =
  /^\b(?:antonym|baseform|case|citation|definition|entryId|etymology|gender|frequency|holonym|hypernym|hyponym|lang|lemma|meronym|number|phonetic|pos|ref|related|segmentation|senseRef|sentiment|subordinate|superordinate|synonym|transcription|translation)\b/
grammar['search-clause'].inside['index'].pattern = fieldExp

// restrict relation modifiers in search clause (only known "/lang=value")
grammar['search-clause'].inside['relation-modifier'].inside['modifier'].pattern =
  /(\/\s*)(?:fullMatch|honorWhitespace|ignoreAccents|ignoreCase|lang|masked|partialMatch|regexp|respectAccents|respectCase|unmasked)/
grammar['search-clause'].inside['relation-modifier'].inside['comparitor'].pattern = /=/

Prism.languages['fcs-lexcql'] = grammar
