import type { ReactNode } from 'react'
import { createContext, useContext } from 'react'

import { FCSLexer } from '@/parsers/FCSLexer'
import { FCSParser } from '@/parsers/FCSParser'

// --------------------------------------------------------------------------

interface FCSParserLexer {
  parser: FCSParser
  lexer: FCSLexer
  cursorPos?: [number, number] | number
}

type FCSParserLexerProviderProps = FCSParserLexer & {
  children: ReactNode
}

// --------------------------------------------------------------------------

const FCSParserLexerContext = createContext<FCSParserLexer | undefined>(undefined)
FCSParserLexerContext.displayName = 'FCSParserLexerContext'

// --------------------------------------------------------------------------

function FCSParserLexerProvider({
  parser,
  lexer,
  cursorPos,
  children,
}: FCSParserLexerProviderProps) {
  const data = { parser, lexer, cursorPos }
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
