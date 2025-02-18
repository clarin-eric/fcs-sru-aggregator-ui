import { QueryTypeID } from '@/utils/constants'

interface Example {
  queryType: QueryTypeID
  query: string
  description: string
}

export default [
  {
    queryType: 'cql',
    query: 'Elephant',
    description: 'Query with single term',
  },
  {
    queryType: 'cql',
    query: 'cat AND dog',
    description: 'Query with boolean',
  },
  {
    queryType: 'cql',
    query: '"exciting news"',
    description: 'Query with phrase (quoting because of whitespaces)',
  },

  {
    queryType: 'fcs',
    query: '[ word = "her.*" ] [ lemma = "Artznei" ] [ pos = "VERB" ]',
    description:
      'Phrase with three tokens: a word starting with "her", a lemmatized word, and a verb',
  },
] as Example[]
