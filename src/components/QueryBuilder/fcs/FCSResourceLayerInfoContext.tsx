import { createContext, type ReactNode, useContext } from 'react'

import { type Resource } from '@/utils/api'
import { type LayerInfo } from './constants'

// --------------------------------------------------------------------------

interface FCSResourceLayerInfo {
  resources: Resource[]
  layerInfo: Map<string, LayerInfo>
}

type FCSResourceLayerInfoProviderProps = FCSResourceLayerInfo & {
  children: ReactNode
}

// --------------------------------------------------------------------------

const FCSResourceLayerInfoContext = createContext<FCSResourceLayerInfo | undefined>(undefined)
FCSResourceLayerInfoContext.displayName = 'FCSResourceLayerInfoContext'

// --------------------------------------------------------------------------

function FCSResourceLayerInfoProvider({
  resources,
  layerInfo,
  children,
}: FCSResourceLayerInfoProviderProps) {
  const data = { resources, layerInfo }
  return (
    <FCSResourceLayerInfoContext.Provider value={data}>
      {children}
    </FCSResourceLayerInfoContext.Provider>
  )
}

// --------------------------------------------------------------------------

function useFCSResourceLayerInfo() {
  const data = useContext(FCSResourceLayerInfoContext)

  if (!data)
    throw new Error(
      'No resources and layer info "data" set, use FCSResourceLayerInfoProvider to set'
    )

  return data
}

// --------------------------------------------------------------------------

// eslint-disable-next-line react-refresh/only-export-components
export { FCSResourceLayerInfoContext, FCSResourceLayerInfoProvider, useFCSResourceLayerInfo }
