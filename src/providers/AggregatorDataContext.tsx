import type { ReactNode } from 'react'
import { createContext, useContext } from 'react'

import type { Resource } from '@/utils/api'
import type { LanguageCode2NameMap } from '@/utils/search'

// --------------------------------------------------------------------------

interface AggregatorData {
  resources: Resource[]
  languages: LanguageCode2NameMap
  weblichtLanguages: string[]
}

type AggregatorDataProviderProps = AggregatorData & {
  children: ReactNode
}

// --------------------------------------------------------------------------

const AggregatorDataContext = createContext<AggregatorData>({
  resources: [],
  languages: {},
  weblichtLanguages: [],
})
AggregatorDataContext.displayName = 'AggregatorDataContext'

// --------------------------------------------------------------------------

function AggregatorDataProvider({
  resources,
  languages,
  weblichtLanguages,
  children,
}: AggregatorDataProviderProps) {
  const data = { resources, languages, weblichtLanguages }
  return <AggregatorDataContext.Provider value={data}>{children}</AggregatorDataContext.Provider>
}

// --------------------------------------------------------------------------

function useAggregatorData() {
  return useContext(AggregatorDataContext)
}

// --------------------------------------------------------------------------

// eslint-disable-next-line react-refresh/only-export-components
export { AggregatorDataContext, AggregatorDataProvider, useAggregatorData }
