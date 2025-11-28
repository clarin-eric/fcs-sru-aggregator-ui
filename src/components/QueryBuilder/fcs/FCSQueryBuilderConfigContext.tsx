import type { ReactNode } from 'react'
import { createContext, useContext } from 'react'

// --------------------------------------------------------------------------

export interface FCSQueryBuilderConfig {
  enableWithin: boolean
  enableWrapGroup: boolean
  enableWrapNegation: boolean
  enableImplicitQuery: boolean
  enableMultipleQuerySegments: boolean
  enableQuantifiers: boolean
  enableRegexpFlags: boolean
  showBasicLayer: boolean
  showAllAdvancedLayers: boolean
  showCustomLayers: boolean
  showLayerQualifiers: boolean
  showResourceCountForLayer: boolean
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
  showBasicLayer = true,
  showAllAdvancedLayers = true,
  showCustomLayers = true,
  showLayerQualifiers = true,
  showResourceCountForLayer = true,
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
    showBasicLayer,
    showAllAdvancedLayers,
    showCustomLayers,
    showLayerQualifiers,
    showResourceCountForLayer,
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
