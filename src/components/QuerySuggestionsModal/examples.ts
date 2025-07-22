import { QueryTypeID } from '@/utils/constants'

interface Example {
  id: string
  queryType: QueryTypeID
  query: string
  description: string
}

export default [
  {
    id: 'cql-single-term',
    queryType: 'cql',
    query: 'Elephant',
    description: 'Query with single term',
  },
  {
    id: 'cql-with-boolean',
    queryType: 'cql',
    query: 'cat AND dog',
    description: 'Query with boolean',
  },
  {
    id: 'cql-with-phrase',
    queryType: 'cql',
    query: '"exciting news"',
    description: 'Query with phrase (quoting because of whitespaces)',
  },

  {
    id: 'fcs-three-tokens-artznei',
    queryType: 'fcs',
    query: '[ word = "her.*" ] [ lemma = "Artznei" ] [ pos = "VERB" ]',
    description:
      'Phrase with three tokens: a word starting with "her", a lemmatized word, and a verb',
  },

  {
    id: 'lex-plain-string',
    queryType: 'lex',
    query: 'apple',
    description: 'Search for plain string',
  },
  {
    id: 'lex-lemma-with-language',
    queryType: 'lex',
    query: 'lemma =/lang=deu "Apfel"',
    description: 'Search for German lemma "Apfel"',
  },
] as Example[]
