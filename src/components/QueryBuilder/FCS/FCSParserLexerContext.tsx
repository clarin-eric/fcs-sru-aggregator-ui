import { createContext, type ReactNode, useContext } from 'react'

import { FCSParser } from '@/parsers/FCSParser'
import { FCSLexer } from '@/parsers/FCSLexer'

// --------------------------------------------------------------------------

interface FCSParserLexer {
  parser: FCSParser
  lexer: FCSLexer
}

type FCSParserLexerProviderProps = FCSParserLexer & {
  children: ReactNode
}

// --------------------------------------------------------------------------

const FCSParserLexerContext = createContext<FCSParserLexer | undefined>(undefined)
FCSParserLexerContext.displayName = 'FCSParserLexerContext'

// --------------------------------------------------------------------------

function FCSParserLexerProvider({ parser, lexer, children }: FCSParserLexerProviderProps) {
  const data = { parser, lexer }
  return <FCSParserLexerContext.Provider value={data}>{children}</FCSParserLexerContext.Provider>
}

// --------------------------------------------------------------------------

function useFCSParserLexer() {
  const data = useContext(FCSParserLexerContext)

  if (!data) throw new Error('No parser and lexer "data" set, use FCSParserLexerProvider to set')

  return data
}

// --------------------------------------------------------------------------

// eslint-disable-next-line react-refresh/only-export-components
export { FCSParserLexerContext, FCSParserLexerProvider, useFCSParserLexer }
