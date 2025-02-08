import { TokenStreamRewriter } from 'antlr4ng'
import { createContext, type ReactNode, useContext } from 'react'

// --------------------------------------------------------------------------

interface FCSQueryUpdater {
  rewriter: TokenStreamRewriter
}

type FCSQueryUpdaterProviderProps = FCSQueryUpdater & {
  children: ReactNode
}

// --------------------------------------------------------------------------

const FCSQueryUpdaterContext = createContext<FCSQueryUpdater | undefined>(undefined)
FCSQueryUpdaterContext.displayName = 'FCSQueryUpdaterContext'

// --------------------------------------------------------------------------

function FCSQueryUpdaterProvider({ rewriter, children }: FCSQueryUpdaterProviderProps) {
  const data = { rewriter }
  return <FCSQueryUpdaterContext.Provider value={data}>{children}</FCSQueryUpdaterContext.Provider>
}

// --------------------------------------------------------------------------

function useFCSQueryUpdater() {
  const data = useContext(FCSQueryUpdaterContext)

  if (!data) throw new Error('No rewriter "data" set, use FCSQueryUpdaterProvider to set')

  return data
}

// --------------------------------------------------------------------------

// eslint-disable-next-line react-refresh/only-export-components
export { FCSQueryUpdaterContext, FCSQueryUpdaterProvider, useFCSQueryUpdater }
