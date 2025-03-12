import { TokenStreamRewriter } from 'antlr4ng'
import { createContext, type ReactNode, useContext } from 'react'

// --------------------------------------------------------------------------

interface LexCQLQueryUpdater {
  rewriter: TokenStreamRewriter
}

type LexCQLQueryUpdaterProviderProps = LexCQLQueryUpdater & {
  children: ReactNode
}

// --------------------------------------------------------------------------

const LexCQLQueryUpdaterContext = createContext<LexCQLQueryUpdater | undefined>(undefined)
LexCQLQueryUpdaterContext.displayName = 'LexCQLQueryUpdaterContext'

// --------------------------------------------------------------------------

function LexCQLQueryUpdaterProvider({ rewriter, children }: LexCQLQueryUpdaterProviderProps) {
  const data = { rewriter }
  return <LexCQLQueryUpdaterContext.Provider value={data}>{children}</LexCQLQueryUpdaterContext.Provider>
}

// --------------------------------------------------------------------------

function useLexCQLQueryUpdater() {
  const data = useContext(LexCQLQueryUpdaterContext)

  if (!data) throw new Error('No rewriter "data" set, use LexCQLQueryUpdaterProvider to set')

  return data
}

// --------------------------------------------------------------------------

// eslint-disable-next-line react-refresh/only-export-components
export { LexCQLQueryUpdaterContext, LexCQLQueryUpdaterProvider, useLexCQLQueryUpdater }
