import { createContext, type ReactNode, useContext } from 'react'

// --------------------------------------------------------------------------

interface FCSQueryBuilderConfig {
  enableWithin: boolean
  enableWrapGroup: boolean
  enableWrapNegation: boolean
  enableImplicitQuery: boolean
  enableMultipleQuerySegments: boolean
  enableQuantifiers: boolean
  enableRegexpFlags: boolean
}

type FCSQueryBuilderConfigProviderProps = Partial<FCSQueryBuilderConfig> & {
  children: ReactNode
}

// --------------------------------------------------------------------------

const FCSQueryBuilderConfigContext = createContext<FCSQueryBuilderConfig | undefined>(undefined)
FCSQueryBuilderConfigContext.displayName = 'FCSQueryBuilderConfigContext'

// --------------------------------------------------------------------------

function FCSQueryBuilderConfigProvider({
  enableWithin = true,
  enableWrapGroup = true,
  enableWrapNegation = true,
  enableImplicitQuery = true,
  enableMultipleQuerySegments = true,
  enableQuantifiers = true,
  enableRegexpFlags = true,
  children,
}: FCSQueryBuilderConfigProviderProps) {
  const data = {
    enableWithin,
    enableWrapGroup,
    enableWrapNegation,
    enableImplicitQuery,
    enableMultipleQuerySegments,
    enableQuantifiers,
    enableRegexpFlags,
  }

  return (
    <FCSQueryBuilderConfigContext.Provider value={data}>
      {children}
    </FCSQueryBuilderConfigContext.Provider>
  )
}

// --------------------------------------------------------------------------

function useFCSQueryBuilderConfig() {
  const data = useContext(FCSQueryBuilderConfigContext)

  // or create defaults?
  if (!data) throw new Error('No flags "data" set, use FCSQueryBuilderConfigProvider to set')

  return data
}

// --------------------------------------------------------------------------

// eslint-disable-next-line react-refresh/only-export-components
export { FCSQueryBuilderConfigContext, FCSQueryBuilderConfigProvider, useFCSQueryBuilderConfig }
