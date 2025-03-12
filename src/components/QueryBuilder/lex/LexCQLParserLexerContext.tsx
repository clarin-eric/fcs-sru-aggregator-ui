import { createContext, type ReactNode, useContext } from 'react'

import { LexParser } from '@/parsers/LexParser'
import { LexLexer } from '@/parsers/LexLexer'

// --------------------------------------------------------------------------

interface LexCQLParserLexer {
  parser: LexParser
  lexer: LexLexer
  cursorPos?: [number, number] | number
}

type LexCQLParserLexerProviderProps = LexCQLParserLexer & {
  children: ReactNode
}

// --------------------------------------------------------------------------

const LexCQLParserLexerContext = createContext<LexCQLParserLexer | undefined>(undefined)
LexCQLParserLexerContext.displayName = 'LexCQLParserLexerContext'

// --------------------------------------------------------------------------

function LexCQLParserLexerProvider({
  parser,
  lexer,
  cursorPos,
  children,
}: LexCQLParserLexerProviderProps) {
  const data = { parser, lexer, cursorPos }
  return <LexCQLParserLexerContext.Provider value={data}>{children}</LexCQLParserLexerContext.Provider>
}

// --------------------------------------------------------------------------

function useLexCQLParserLexer() {
  const data = useContext(LexCQLParserLexerContext)

  if (!data) throw new Error('No parser and lexer "data" set, use LexCQLParserLexerProvider to set')

  return data
}

// --------------------------------------------------------------------------

// eslint-disable-next-line react-refresh/only-export-components
export { LexCQLParserLexerContext, LexCQLParserLexerProvider, useLexCQLParserLexer }
