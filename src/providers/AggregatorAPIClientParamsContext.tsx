import type { ClientParams } from '@clarin-eric/fcs-sru-aggregator-api-adapter-typescript'
import type { ReactNode } from 'react'
import { createContext, useContext } from 'react'

// --------------------------------------------------------------------------

const AggregatorAPIClientParamsContext = createContext<ClientParams | undefined>(undefined)
AggregatorAPIClientParamsContext.displayName = 'AggregatorAPIClientParamsContext'

// --------------------------------------------------------------------------

function useAggregatorAPIClientParams() {
  const clientParams = useContext(AggregatorAPIClientParamsContext)

  if (!clientParams)
    throw new Error(
      'No "clientParams" instance set, use AggregatorAPIClientParamsProvider to set one'
    )

  return clientParams
}

// --------------------------------------------------------------------------

interface AggregatorAPIClientParamsProviderProps {
  clientParams: ClientParams
  children?: ReactNode
}

function AggregatorAPIClientParamsProvider({
  clientParams,
  children,
}: AggregatorAPIClientParamsProviderProps) {
  return (
    <AggregatorAPIClientParamsContext.Provider value={clientParams}>
      {children}
    </AggregatorAPIClientParamsContext.Provider>
  )
}

// --------------------------------------------------------------------------

export {
  AggregatorAPIClientParamsContext,
  AggregatorAPIClientParamsProvider,
  // eslint-disable-next-line react-refresh/only-export-components
  useAggregatorAPIClientParams,
}
