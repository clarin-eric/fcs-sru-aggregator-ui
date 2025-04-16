// Generated from src/vendor/fcs-ql/LexLexer.g4 by ANTLR 4.13.1

import {
  ATN,
  ATNDeserializer,
  CharStream,
  DecisionState,
  DFA,
  Lexer,
  LexerATNSimulator,
  PredictionContextCache,
  Vocabulary,
} from 'antlr4ng'

export class LexLexer extends Lexer {
  public static readonly L_PAREN = 1
  public static readonly R_PAREN = 2
  public static readonly EQUAL = 3
  public static readonly GREATER = 4
  public static readonly LESSER = 5
  public static readonly GREATER_EQUAL = 6
  public static readonly LESSER_EQUAL = 7
  public static readonly NOT_EQUAL = 8
  public static readonly EQUAL_EQUAL = 9
  public static readonly SLASH = 10
  public static readonly AND = 11
  public static readonly OR = 12
  public static readonly NOT = 13
  public static readonly DOT = 14
  public static readonly QUOTED_STRING = 15
  public static readonly SIMPLE_STRING = 16
  public static readonly WS = 17

  public static readonly channelNames = ['DEFAULT_TOKEN_CHANNEL', 'HIDDEN']

  public static readonly literalNames = [
    null,
    "'('",
    "')'",
    "'='",
    "'>'",
    "'<'",
    "'>='",
    "'<='",
    "'<>'",
    "'=='",
    "'/'",
    null,
    null,
    null,
    "'.'",
  ]

  public static readonly symbolicNames = [
    null,
    'L_PAREN',
    'R_PAREN',
    'EQUAL',
    'GREATER',
    'LESSER',
    'GREATER_EQUAL',
    'LESSER_EQUAL',
    'NOT_EQUAL',
    'EQUAL_EQUAL',
    'SLASH',
    'AND',
    'OR',
    'NOT',
    'DOT',
    'QUOTED_STRING',
    'SIMPLE_STRING',
    'WS',
  ]

  public static readonly modeNames = ['DEFAULT_MODE']

  public static readonly ruleNames = [
    'L_PAREN',
    'R_PAREN',
    'EQUAL',
    'GREATER',
    'LESSER',
    'GREATER_EQUAL',
    'LESSER_EQUAL',
    'NOT_EQUAL',
    'EQUAL_EQUAL',
    'SLASH',
    'AND',
    'OR',
    'NOT',
    'DOT',
    'QUOTED_STRING',
    'SIMPLE_STRING',
    'WS',
  ]

  public constructor(input: CharStream) {
    super(input)
    this.interpreter = new LexerATNSimulator(
      this,
      LexLexer._ATN,
      LexLexer.decisionsToDFA,
      new PredictionContextCache()
    )
  }

  public get grammarFileName(): string {
    return 'LexLexer.g4'
  }

  public get literalNames(): (string | null)[] {
    return LexLexer.literalNames
  }
  public get symbolicNames(): (string | null)[] {
    return LexLexer.symbolicNames
  }
  public get ruleNames(): string[] {
    return LexLexer.ruleNames
  }

  public get serializedATN(): number[] {
    return LexLexer._serializedATN
  }

  public get channelNames(): string[] {
    return LexLexer.channelNames
  }

  public get modeNames(): string[] {
    return LexLexer.modeNames
  }

  public static readonly _serializedATN: number[] = [
    4, 0, 17, 92, 6, -1, 2, 0, 7, 0, 2, 1, 7, 1, 2, 2, 7, 2, 2, 3, 7, 3, 2, 4, 7, 4, 2, 5, 7, 5, 2,
    6, 7, 6, 2, 7, 7, 7, 2, 8, 7, 8, 2, 9, 7, 9, 2, 10, 7, 10, 2, 11, 7, 11, 2, 12, 7, 12, 2, 13, 7,
    13, 2, 14, 7, 14, 2, 15, 7, 15, 2, 16, 7, 16, 1, 0, 1, 0, 1, 1, 1, 1, 1, 2, 1, 2, 1, 3, 1, 3, 1,
    4, 1, 4, 1, 5, 1, 5, 1, 5, 1, 6, 1, 6, 1, 6, 1, 7, 1, 7, 1, 7, 1, 8, 1, 8, 1, 8, 1, 9, 1, 9, 1,
    10, 1, 10, 1, 10, 1, 10, 1, 11, 1, 11, 1, 11, 1, 12, 1, 12, 1, 12, 1, 12, 1, 13, 1, 13, 1, 14,
    1, 14, 1, 14, 1, 14, 5, 14, 77, 8, 14, 10, 14, 12, 14, 80, 9, 14, 1, 14, 1, 14, 1, 15, 4, 15,
    85, 8, 15, 11, 15, 12, 15, 86, 1, 16, 1, 16, 1, 16, 1, 16, 0, 0, 17, 1, 1, 3, 2, 5, 3, 7, 4, 9,
    5, 11, 6, 13, 7, 15, 8, 17, 9, 19, 10, 21, 11, 23, 12, 25, 13, 27, 14, 29, 15, 31, 16, 33, 17,
    1, 0, 9, 2, 0, 65, 65, 97, 97, 2, 0, 78, 78, 110, 110, 2, 0, 68, 68, 100, 100, 2, 0, 79, 79,
    111, 111, 2, 0, 82, 82, 114, 114, 2, 0, 84, 84, 116, 116, 2, 0, 34, 34, 92, 92, 8, 0, 9, 10, 13,
    13, 32, 32, 34, 34, 40, 41, 47, 47, 60, 62, 92, 92, 3, 0, 9, 10, 13, 13, 32, 32, 94, 0, 1, 1, 0,
    0, 0, 0, 3, 1, 0, 0, 0, 0, 5, 1, 0, 0, 0, 0, 7, 1, 0, 0, 0, 0, 9, 1, 0, 0, 0, 0, 11, 1, 0, 0, 0,
    0, 13, 1, 0, 0, 0, 0, 15, 1, 0, 0, 0, 0, 17, 1, 0, 0, 0, 0, 19, 1, 0, 0, 0, 0, 21, 1, 0, 0, 0,
    0, 23, 1, 0, 0, 0, 0, 25, 1, 0, 0, 0, 0, 27, 1, 0, 0, 0, 0, 29, 1, 0, 0, 0, 0, 31, 1, 0, 0, 0,
    0, 33, 1, 0, 0, 0, 1, 35, 1, 0, 0, 0, 3, 37, 1, 0, 0, 0, 5, 39, 1, 0, 0, 0, 7, 41, 1, 0, 0, 0,
    9, 43, 1, 0, 0, 0, 11, 45, 1, 0, 0, 0, 13, 48, 1, 0, 0, 0, 15, 51, 1, 0, 0, 0, 17, 54, 1, 0, 0,
    0, 19, 57, 1, 0, 0, 0, 21, 59, 1, 0, 0, 0, 23, 63, 1, 0, 0, 0, 25, 66, 1, 0, 0, 0, 27, 70, 1, 0,
    0, 0, 29, 72, 1, 0, 0, 0, 31, 84, 1, 0, 0, 0, 33, 88, 1, 0, 0, 0, 35, 36, 5, 40, 0, 0, 36, 2, 1,
    0, 0, 0, 37, 38, 5, 41, 0, 0, 38, 4, 1, 0, 0, 0, 39, 40, 5, 61, 0, 0, 40, 6, 1, 0, 0, 0, 41, 42,
    5, 62, 0, 0, 42, 8, 1, 0, 0, 0, 43, 44, 5, 60, 0, 0, 44, 10, 1, 0, 0, 0, 45, 46, 5, 62, 0, 0,
    46, 47, 5, 61, 0, 0, 47, 12, 1, 0, 0, 0, 48, 49, 5, 60, 0, 0, 49, 50, 5, 61, 0, 0, 50, 14, 1, 0,
    0, 0, 51, 52, 5, 60, 0, 0, 52, 53, 5, 62, 0, 0, 53, 16, 1, 0, 0, 0, 54, 55, 5, 61, 0, 0, 55, 56,
    5, 61, 0, 0, 56, 18, 1, 0, 0, 0, 57, 58, 5, 47, 0, 0, 58, 20, 1, 0, 0, 0, 59, 60, 7, 0, 0, 0,
    60, 61, 7, 1, 0, 0, 61, 62, 7, 2, 0, 0, 62, 22, 1, 0, 0, 0, 63, 64, 7, 3, 0, 0, 64, 65, 7, 4, 0,
    0, 65, 24, 1, 0, 0, 0, 66, 67, 7, 1, 0, 0, 67, 68, 7, 3, 0, 0, 68, 69, 7, 5, 0, 0, 69, 26, 1, 0,
    0, 0, 70, 71, 5, 46, 0, 0, 71, 28, 1, 0, 0, 0, 72, 78, 5, 34, 0, 0, 73, 74, 5, 92, 0, 0, 74, 77,
    7, 6, 0, 0, 75, 77, 8, 6, 0, 0, 76, 73, 1, 0, 0, 0, 76, 75, 1, 0, 0, 0, 77, 80, 1, 0, 0, 0, 78,
    76, 1, 0, 0, 0, 78, 79, 1, 0, 0, 0, 79, 81, 1, 0, 0, 0, 80, 78, 1, 0, 0, 0, 81, 82, 5, 34, 0, 0,
    82, 30, 1, 0, 0, 0, 83, 85, 8, 7, 0, 0, 84, 83, 1, 0, 0, 0, 85, 86, 1, 0, 0, 0, 86, 84, 1, 0, 0,
    0, 86, 87, 1, 0, 0, 0, 87, 32, 1, 0, 0, 0, 88, 89, 7, 8, 0, 0, 89, 90, 1, 0, 0, 0, 90, 91, 6,
    16, 0, 0, 91, 34, 1, 0, 0, 0, 4, 0, 76, 78, 86, 1, 0, 1, 0,
  ]

  private static __ATN: ATN
  public static get _ATN(): ATN {
    if (!LexLexer.__ATN) {
      LexLexer.__ATN = new ATNDeserializer().deserialize(LexLexer._serializedATN)
    }

    return LexLexer.__ATN
  }

  private static readonly vocabulary = new Vocabulary(
    LexLexer.literalNames,
    LexLexer.symbolicNames,
    []
  )

  public override get vocabulary(): Vocabulary {
    return LexLexer.vocabulary
  }

  private static readonly decisionsToDFA = LexLexer._ATN.decisionToState.map(
    (ds: DecisionState, index: number) => new DFA(ds, index)
  )
}
