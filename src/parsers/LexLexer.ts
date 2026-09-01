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
  public static readonly DOT = 13
  public static readonly QUOTED_STRING = 14
  public static readonly SIMPLE_STRING = 15
  public static readonly WS = 16

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
    4, 0, 16, 86, 6, -1, 2, 0, 7, 0, 2, 1, 7, 1, 2, 2, 7, 2, 2, 3, 7, 3, 2, 4, 7, 4, 2, 5, 7, 5, 2,
    6, 7, 6, 2, 7, 7, 7, 2, 8, 7, 8, 2, 9, 7, 9, 2, 10, 7, 10, 2, 11, 7, 11, 2, 12, 7, 12, 2, 13, 7,
    13, 2, 14, 7, 14, 2, 15, 7, 15, 1, 0, 1, 0, 1, 1, 1, 1, 1, 2, 1, 2, 1, 3, 1, 3, 1, 4, 1, 4, 1,
    5, 1, 5, 1, 5, 1, 6, 1, 6, 1, 6, 1, 7, 1, 7, 1, 7, 1, 8, 1, 8, 1, 8, 1, 9, 1, 9, 1, 10, 1, 10,
    1, 10, 1, 10, 1, 11, 1, 11, 1, 11, 1, 12, 1, 12, 1, 13, 1, 13, 1, 13, 1, 13, 5, 13, 71, 8, 13,
    10, 13, 12, 13, 74, 9, 13, 1, 13, 1, 13, 1, 14, 4, 14, 79, 8, 14, 11, 14, 12, 14, 80, 1, 15, 1,
    15, 1, 15, 1, 15, 0, 0, 16, 1, 1, 3, 2, 5, 3, 7, 4, 9, 5, 11, 6, 13, 7, 15, 8, 17, 9, 19, 10,
    21, 11, 23, 12, 25, 13, 27, 14, 29, 15, 31, 16, 1, 0, 8, 2, 0, 65, 65, 97, 97, 2, 0, 78, 78,
    110, 110, 2, 0, 68, 68, 100, 100, 2, 0, 79, 79, 111, 111, 2, 0, 82, 82, 114, 114, 2, 0, 34, 34,
    92, 92, 8, 0, 9, 10, 13, 13, 32, 32, 34, 34, 40, 41, 47, 47, 60, 62, 92, 92, 3, 0, 9, 10, 13,
    13, 32, 32, 88, 0, 1, 1, 0, 0, 0, 0, 3, 1, 0, 0, 0, 0, 5, 1, 0, 0, 0, 0, 7, 1, 0, 0, 0, 0, 9, 1,
    0, 0, 0, 0, 11, 1, 0, 0, 0, 0, 13, 1, 0, 0, 0, 0, 15, 1, 0, 0, 0, 0, 17, 1, 0, 0, 0, 0, 19, 1,
    0, 0, 0, 0, 21, 1, 0, 0, 0, 0, 23, 1, 0, 0, 0, 0, 25, 1, 0, 0, 0, 0, 27, 1, 0, 0, 0, 0, 29, 1,
    0, 0, 0, 0, 31, 1, 0, 0, 0, 1, 33, 1, 0, 0, 0, 3, 35, 1, 0, 0, 0, 5, 37, 1, 0, 0, 0, 7, 39, 1,
    0, 0, 0, 9, 41, 1, 0, 0, 0, 11, 43, 1, 0, 0, 0, 13, 46, 1, 0, 0, 0, 15, 49, 1, 0, 0, 0, 17, 52,
    1, 0, 0, 0, 19, 55, 1, 0, 0, 0, 21, 57, 1, 0, 0, 0, 23, 61, 1, 0, 0, 0, 25, 64, 1, 0, 0, 0, 27,
    66, 1, 0, 0, 0, 29, 78, 1, 0, 0, 0, 31, 82, 1, 0, 0, 0, 33, 34, 5, 40, 0, 0, 34, 2, 1, 0, 0, 0,
    35, 36, 5, 41, 0, 0, 36, 4, 1, 0, 0, 0, 37, 38, 5, 61, 0, 0, 38, 6, 1, 0, 0, 0, 39, 40, 5, 62,
    0, 0, 40, 8, 1, 0, 0, 0, 41, 42, 5, 60, 0, 0, 42, 10, 1, 0, 0, 0, 43, 44, 5, 62, 0, 0, 44, 45,
    5, 61, 0, 0, 45, 12, 1, 0, 0, 0, 46, 47, 5, 60, 0, 0, 47, 48, 5, 61, 0, 0, 48, 14, 1, 0, 0, 0,
    49, 50, 5, 60, 0, 0, 50, 51, 5, 62, 0, 0, 51, 16, 1, 0, 0, 0, 52, 53, 5, 61, 0, 0, 53, 54, 5,
    61, 0, 0, 54, 18, 1, 0, 0, 0, 55, 56, 5, 47, 0, 0, 56, 20, 1, 0, 0, 0, 57, 58, 7, 0, 0, 0, 58,
    59, 7, 1, 0, 0, 59, 60, 7, 2, 0, 0, 60, 22, 1, 0, 0, 0, 61, 62, 7, 3, 0, 0, 62, 63, 7, 4, 0, 0,
    63, 24, 1, 0, 0, 0, 64, 65, 5, 46, 0, 0, 65, 26, 1, 0, 0, 0, 66, 72, 5, 34, 0, 0, 67, 68, 5, 92,
    0, 0, 68, 71, 7, 5, 0, 0, 69, 71, 8, 5, 0, 0, 70, 67, 1, 0, 0, 0, 70, 69, 1, 0, 0, 0, 71, 74, 1,
    0, 0, 0, 72, 70, 1, 0, 0, 0, 72, 73, 1, 0, 0, 0, 73, 75, 1, 0, 0, 0, 74, 72, 1, 0, 0, 0, 75, 76,
    5, 34, 0, 0, 76, 28, 1, 0, 0, 0, 77, 79, 8, 6, 0, 0, 78, 77, 1, 0, 0, 0, 79, 80, 1, 0, 0, 0, 80,
    78, 1, 0, 0, 0, 80, 81, 1, 0, 0, 0, 81, 30, 1, 0, 0, 0, 82, 83, 7, 7, 0, 0, 83, 84, 1, 0, 0, 0,
    84, 85, 6, 15, 0, 0, 85, 32, 1, 0, 0, 0, 4, 0, 70, 72, 80, 1, 0, 1, 0,
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
