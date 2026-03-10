import type { QueryTypeID } from '@/utils/constants'
import type { MultilingualStrings } from '@clarin-eric/fcs-sru-aggregator-api-adapter-typescript'

interface Example {
  id: string
  queryType: QueryTypeID
  query: string
  description: MultilingualStrings
  resourceIDs?: string[] | undefined
}

export default [
  {
    id: 'cql-single-term',
    queryType: 'cql',
    query: 'Elephant',
    description: { en: 'Query with single term' },
  },
  {
    id: 'cql-with-boolean',
    queryType: 'cql',
    query: 'cat AND dog',
    description: { en: 'Query with boolean' },
  },
  {
    id: 'cql-with-phrase',
    queryType: 'cql',
    query: '"exciting news"',
    description: { en: 'Query with phrase (quoting because of whitespaces)' },
  },

  {
    id: 'fcs-three-tokens-artznei',
    queryType: 'fcs',
    query: '[ word = "her.*" ] [ lemma = "Artznei" ] [ pos = "VERB" ]',
    description: {
      en: 'Phrase with three tokens: a word starting with "her", a lemmatized word, and a verb',
    },
    resourceIDs: [
      // Deutsches Textarchiv (DTA) - Berlin-Brandenburg Academy of Sciences and Humanities
      'https://clarin.bbaw.de/fcs/dta#http://hdl.handle.net/11858/00-203C-0000-0023-8324-0',
    ],
  },

  {
    id: 'lex-plain-string',
    queryType: 'lex',
    query: 'apple',
    description: { en: 'Search for plain string' },
  },
  {
    id: 'lex-lemma-with-language',
    queryType: 'lex',
    query: 'lemma =/lang=deu "Apfel"',
    description: { en: 'Search for German lemma "Apfel"' },
  },
] as Example[]
