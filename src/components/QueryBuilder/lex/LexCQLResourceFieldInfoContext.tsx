import type { ReactNode } from 'react'
import { createContext, useContext } from 'react'

import type { Resource } from '@/utils/api'

// --------------------------------------------------------------------------

interface LexCQLResourceFieldInfo {
  resources: Resource[]
  fieldInfo: Map<string, Resource[]>
}

type LexCQLResourceFieldInfoProviderProps = LexCQLResourceFieldInfo & {
  children: ReactNode
}

// --------------------------------------------------------------------------

const LexCQLResourceFieldInfoContext = createContext<LexCQLResourceFieldInfo | undefined>(undefined)
LexCQLResourceFieldInfoContext.displayName = 'LexCQLResourceFieldInfoContext'

// --------------------------------------------------------------------------

function LexCQLResourceFieldInfoProvider({
  resources,
  fieldInfo,
  children,
}: LexCQLResourceFieldInfoProviderProps) {
  const data = { resources, fieldInfo }
  return (
    <LexCQLResourceFieldInfoContext.Provider value={data}>
      {children}
    </LexCQLResourceFieldInfoContext.Provider>
  )
}

// --------------------------------------------------------------------------

function useLexCQLResourceFieldInfo() {
  const data = useContext(LexCQLResourceFieldInfoContext)

  if (!data)
    throw new Error(
      'No resources and field info "data" set, use LexCQLResourceFieldInfoProvider to set'
    )

  return data
}

// --------------------------------------------------------------------------

export {
  LexCQLResourceFieldInfoContext,
  LexCQLResourceFieldInfoProvider,
  // eslint-disable-next-line react-refresh/only-export-components
  useLexCQLResourceFieldInfo
}

