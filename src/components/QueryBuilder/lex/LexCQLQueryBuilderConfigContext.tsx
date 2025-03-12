import { createContext, type ReactNode, useContext } from 'react'

// --------------------------------------------------------------------------

export interface LexCQLQueryBuilderConfig {
  enableRelationModifiers: boolean
  forceSearchTermQuoting: boolean
}

type LexCQLQueryBuilderConfigProviderProps = Partial<LexCQLQueryBuilderConfig> & {
  children: ReactNode
}

// --------------------------------------------------------------------------

const LexCQLQueryBuilderConfigContext = createContext<LexCQLQueryBuilderConfig | undefined>(
  undefined
)
LexCQLQueryBuilderConfigContext.displayName = 'LexCQLQueryBuilderConfigContext'

// --------------------------------------------------------------------------

function LexCQLQueryBuilderConfigProvider({
  enableRelationModifiers = true,
  forceSearchTermQuoting = false,
  children,
}: LexCQLQueryBuilderConfigProviderProps) {
  const data = {
    enableRelationModifiers,
    forceSearchTermQuoting,
  }

  return (
    <LexCQLQueryBuilderConfigContext.Provider value={data}>
      {children}
    </LexCQLQueryBuilderConfigContext.Provider>
  )
}

// --------------------------------------------------------------------------

function useLexCQLQueryBuilderConfig() {
  const data = useContext(LexCQLQueryBuilderConfigContext)

  // or create defaults?
  if (!data) throw new Error('No flags "data" set, use LexCQLQueryBuilderConfigProvider to set')

  return data
}

// --------------------------------------------------------------------------

export {
  LexCQLQueryBuilderConfigContext,
  LexCQLQueryBuilderConfigProvider,
  // eslint-disable-next-line react-refresh/only-export-components
  useLexCQLQueryBuilderConfig,
}
