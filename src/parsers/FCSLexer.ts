// Generated from src/vendor/fcs-ql/FCSLexer.g4 by ANTLR 4.13.1

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

export class FCSLexer extends Lexer {
  public static readonly L_PAREN = 1
  public static readonly R_PAREN = 2
  public static readonly L_SQUARE_BRACKET = 3
  public static readonly R_SQUARE_BRACKET = 4
  public static readonly OR = 5
  public static readonly AND = 6
  public static readonly NOT = 7
  public static readonly FWD_SLASH = 8
  public static readonly L_CURLY_BRACKET = 9
  public static readonly R_CURLY_BRACKET = 10
  public static readonly Q_ONE_OR_MORE = 11
  public static readonly Q_ZERO_OR_MORE = 12
  public static readonly Q_ZERO_OR_ONE = 13
  public static readonly Q_COMMA = 14
  public static readonly OPERATOR_EQ = 15
  public static readonly OPERATOR_NE = 16
  public static readonly COLON = 17
  public static readonly WITHIN = 18
  public static readonly SIMPLE_WITHIN_SCOPE = 19
  public static readonly REGEXP_FLAGS = 20
  public static readonly IDENTIFIER = 21
  public static readonly INTEGER = 22
  public static readonly REGEXP = 23
  public static readonly QUOTED_STRING = 24
  public static readonly Space = 25

  public static readonly channelNames = ['DEFAULT_TOKEN_CHANNEL', 'HIDDEN']

  public static readonly literalNames = [
    null,
    "'('",
    "')'",
    "'['",
    "']'",
    "'|'",
    "'&'",
    "'!'",
    "'/'",
    "'{'",
    "'}'",
    "'+'",
    "'*'",
    "'?'",
    "','",
    "'='",
    "'!='",
    "':'",
    "'within'",
  ]

  public static readonly symbolicNames = [
    null,
    'L_PAREN',
    'R_PAREN',
    'L_SQUARE_BRACKET',
    'R_SQUARE_BRACKET',
    'OR',
    'AND',
    'NOT',
    'FWD_SLASH',
    'L_CURLY_BRACKET',
    'R_CURLY_BRACKET',
    'Q_ONE_OR_MORE',
    'Q_ZERO_OR_MORE',
    'Q_ZERO_OR_ONE',
    'Q_COMMA',
    'OPERATOR_EQ',
    'OPERATOR_NE',
    'COLON',
    'WITHIN',
    'SIMPLE_WITHIN_SCOPE',
    'REGEXP_FLAGS',
    'IDENTIFIER',
    'INTEGER',
    'REGEXP',
    'QUOTED_STRING',
    'Space',
  ]

  public static readonly modeNames = ['DEFAULT_MODE']

  public static readonly ruleNames = [
    'L_PAREN',
    'R_PAREN',
    'L_SQUARE_BRACKET',
    'R_SQUARE_BRACKET',
    'OR',
    'AND',
    'NOT',
    'FWD_SLASH',
    'L_CURLY_BRACKET',
    'R_CURLY_BRACKET',
    'Q_ONE_OR_MORE',
    'Q_ZERO_OR_MORE',
    'Q_ZERO_OR_ONE',
    'Q_COMMA',
    'OPERATOR_EQ',
    'OPERATOR_NE',
    'COLON',
    'WITHIN',
    'SIMPLE_WITHIN_SCOPE',
    'REGEXP_FLAGS',
    'IDENTIFIER_FIRST_CHAR',
    'IDENTIFIER_LAST_CHAR',
    'IDENTIFIER_CHAR',
    'IDENTIFIER',
    'INTEGER',
    'REGEXP',
    'QUOTED_STRING',
    'CHAR',
    'WS',
    'ESCAPED_CHAR',
    'HEX',
    'Space',
  ]

  public constructor(input: CharStream) {
    super(input)
    this.interpreter = new LexerATNSimulator(
      this,
      FCSLexer._ATN,
      FCSLexer.decisionsToDFA,
      new PredictionContextCache()
    )
  }

  public get grammarFileName(): string {
    return 'FCSLexer.g4'
  }

  public get literalNames(): (string | null)[] {
    return FCSLexer.literalNames
  }
  public get symbolicNames(): (string | null)[] {
    return FCSLexer.symbolicNames
  }
  public get ruleNames(): string[] {
    return FCSLexer.ruleNames
  }

  public get serializedATN(): number[] {
    return FCSLexer._serializedATN
  }

  public get channelNames(): string[] {
    return FCSLexer.channelNames
  }

  public get modeNames(): string[] {
    return FCSLexer.modeNames
  }

  public static readonly _serializedATN: number[] = [
    4, 0, 25, 238, 6, -1, 2, 0, 7, 0, 2, 1, 7, 1, 2, 2, 7, 2, 2, 3, 7, 3, 2, 4, 7, 4, 2, 5, 7, 5, 2,
    6, 7, 6, 2, 7, 7, 7, 2, 8, 7, 8, 2, 9, 7, 9, 2, 10, 7, 10, 2, 11, 7, 11, 2, 12, 7, 12, 2, 13, 7,
    13, 2, 14, 7, 14, 2, 15, 7, 15, 2, 16, 7, 16, 2, 17, 7, 17, 2, 18, 7, 18, 2, 19, 7, 19, 2, 20,
    7, 20, 2, 21, 7, 21, 2, 22, 7, 22, 2, 23, 7, 23, 2, 24, 7, 24, 2, 25, 7, 25, 2, 26, 7, 26, 2,
    27, 7, 27, 2, 28, 7, 28, 2, 29, 7, 29, 2, 30, 7, 30, 2, 31, 7, 31, 1, 0, 1, 0, 1, 1, 1, 1, 1, 2,
    1, 2, 1, 3, 1, 3, 1, 4, 1, 4, 1, 5, 1, 5, 1, 6, 1, 6, 1, 7, 1, 7, 1, 8, 1, 8, 1, 9, 1, 9, 1, 10,
    1, 10, 1, 11, 1, 11, 1, 12, 1, 12, 1, 13, 1, 13, 1, 14, 1, 14, 1, 15, 1, 15, 1, 15, 1, 16, 1,
    16, 1, 17, 1, 17, 1, 17, 1, 17, 1, 17, 1, 17, 1, 17, 1, 18, 1, 18, 1, 18, 1, 18, 1, 18, 1, 18,
    1, 18, 1, 18, 1, 18, 1, 18, 1, 18, 1, 18, 1, 18, 1, 18, 1, 18, 1, 18, 1, 18, 1, 18, 1, 18, 1,
    18, 1, 18, 1, 18, 1, 18, 1, 18, 1, 18, 1, 18, 1, 18, 1, 18, 1, 18, 1, 18, 1, 18, 1, 18, 1, 18,
    1, 18, 1, 18, 1, 18, 1, 18, 1, 18, 1, 18, 1, 18, 1, 18, 1, 18, 1, 18, 1, 18, 1, 18, 3, 18, 153,
    8, 18, 1, 19, 4, 19, 156, 8, 19, 11, 19, 12, 19, 157, 1, 20, 1, 20, 1, 21, 1, 21, 1, 22, 1, 22,
    1, 23, 1, 23, 5, 23, 168, 8, 23, 10, 23, 12, 23, 171, 9, 23, 1, 23, 3, 23, 174, 8, 23, 1, 24, 4,
    24, 177, 8, 24, 11, 24, 12, 24, 178, 1, 25, 1, 25, 1, 26, 1, 26, 1, 26, 5, 26, 186, 8, 26, 10,
    26, 12, 26, 189, 9, 26, 1, 26, 1, 26, 1, 26, 1, 26, 5, 26, 195, 8, 26, 10, 26, 12, 26, 198, 9,
    26, 1, 26, 3, 26, 201, 8, 26, 1, 27, 1, 27, 3, 27, 205, 8, 27, 1, 28, 1, 28, 1, 29, 1, 29, 1,
    29, 1, 29, 1, 29, 1, 29, 1, 29, 1, 29, 1, 29, 1, 29, 1, 29, 1, 29, 1, 29, 1, 29, 1, 29, 1, 29,
    1, 29, 1, 29, 1, 29, 1, 29, 1, 29, 1, 29, 3, 29, 231, 8, 29, 1, 30, 1, 30, 1, 31, 1, 31, 1, 31,
    1, 31, 0, 0, 32, 1, 1, 3, 2, 5, 3, 7, 4, 9, 5, 11, 6, 13, 7, 15, 8, 17, 9, 19, 10, 21, 11, 23,
    12, 25, 13, 27, 14, 29, 15, 31, 16, 33, 17, 35, 18, 37, 19, 39, 20, 41, 0, 43, 0, 45, 0, 47, 21,
    49, 22, 51, 23, 53, 24, 55, 0, 57, 0, 59, 0, 61, 0, 63, 25, 1, 0, 10, 5, 0, 67, 67, 73, 73, 99,
    100, 105, 105, 108, 108, 2, 0, 65, 90, 97, 122, 3, 0, 48, 57, 65, 90, 97, 122, 4, 0, 45, 45, 48,
    57, 65, 90, 97, 122, 1, 0, 48, 57, 2, 0, 39, 39, 92, 92, 2, 0, 34, 34, 92, 92, 10, 0, 9, 13, 32,
    32, 133, 133, 160, 160, 5760, 5760, 8192, 8202, 8232, 8233, 8239, 8239, 8287, 8287, 12288,
    12288, 10, 0, 34, 34, 36, 36, 39, 43, 46, 46, 63, 63, 91, 92, 94, 94, 110, 110, 116, 116, 123,
    124, 3, 0, 48, 57, 65, 70, 97, 102, 252, 0, 1, 1, 0, 0, 0, 0, 3, 1, 0, 0, 0, 0, 5, 1, 0, 0, 0,
    0, 7, 1, 0, 0, 0, 0, 9, 1, 0, 0, 0, 0, 11, 1, 0, 0, 0, 0, 13, 1, 0, 0, 0, 0, 15, 1, 0, 0, 0, 0,
    17, 1, 0, 0, 0, 0, 19, 1, 0, 0, 0, 0, 21, 1, 0, 0, 0, 0, 23, 1, 0, 0, 0, 0, 25, 1, 0, 0, 0, 0,
    27, 1, 0, 0, 0, 0, 29, 1, 0, 0, 0, 0, 31, 1, 0, 0, 0, 0, 33, 1, 0, 0, 0, 0, 35, 1, 0, 0, 0, 0,
    37, 1, 0, 0, 0, 0, 39, 1, 0, 0, 0, 0, 47, 1, 0, 0, 0, 0, 49, 1, 0, 0, 0, 0, 51, 1, 0, 0, 0, 0,
    53, 1, 0, 0, 0, 0, 63, 1, 0, 0, 0, 1, 65, 1, 0, 0, 0, 3, 67, 1, 0, 0, 0, 5, 69, 1, 0, 0, 0, 7,
    71, 1, 0, 0, 0, 9, 73, 1, 0, 0, 0, 11, 75, 1, 0, 0, 0, 13, 77, 1, 0, 0, 0, 15, 79, 1, 0, 0, 0,
    17, 81, 1, 0, 0, 0, 19, 83, 1, 0, 0, 0, 21, 85, 1, 0, 0, 0, 23, 87, 1, 0, 0, 0, 25, 89, 1, 0, 0,
    0, 27, 91, 1, 0, 0, 0, 29, 93, 1, 0, 0, 0, 31, 95, 1, 0, 0, 0, 33, 98, 1, 0, 0, 0, 35, 100, 1,
    0, 0, 0, 37, 152, 1, 0, 0, 0, 39, 155, 1, 0, 0, 0, 41, 159, 1, 0, 0, 0, 43, 161, 1, 0, 0, 0, 45,
    163, 1, 0, 0, 0, 47, 165, 1, 0, 0, 0, 49, 176, 1, 0, 0, 0, 51, 180, 1, 0, 0, 0, 53, 200, 1, 0,
    0, 0, 55, 204, 1, 0, 0, 0, 57, 206, 1, 0, 0, 0, 59, 208, 1, 0, 0, 0, 61, 232, 1, 0, 0, 0, 63,
    234, 1, 0, 0, 0, 65, 66, 5, 40, 0, 0, 66, 2, 1, 0, 0, 0, 67, 68, 5, 41, 0, 0, 68, 4, 1, 0, 0, 0,
    69, 70, 5, 91, 0, 0, 70, 6, 1, 0, 0, 0, 71, 72, 5, 93, 0, 0, 72, 8, 1, 0, 0, 0, 73, 74, 5, 124,
    0, 0, 74, 10, 1, 0, 0, 0, 75, 76, 5, 38, 0, 0, 76, 12, 1, 0, 0, 0, 77, 78, 5, 33, 0, 0, 78, 14,
    1, 0, 0, 0, 79, 80, 5, 47, 0, 0, 80, 16, 1, 0, 0, 0, 81, 82, 5, 123, 0, 0, 82, 18, 1, 0, 0, 0,
    83, 84, 5, 125, 0, 0, 84, 20, 1, 0, 0, 0, 85, 86, 5, 43, 0, 0, 86, 22, 1, 0, 0, 0, 87, 88, 5,
    42, 0, 0, 88, 24, 1, 0, 0, 0, 89, 90, 5, 63, 0, 0, 90, 26, 1, 0, 0, 0, 91, 92, 5, 44, 0, 0, 92,
    28, 1, 0, 0, 0, 93, 94, 5, 61, 0, 0, 94, 30, 1, 0, 0, 0, 95, 96, 5, 33, 0, 0, 96, 97, 5, 61, 0,
    0, 97, 32, 1, 0, 0, 0, 98, 99, 5, 58, 0, 0, 99, 34, 1, 0, 0, 0, 100, 101, 5, 119, 0, 0, 101,
    102, 5, 105, 0, 0, 102, 103, 5, 116, 0, 0, 103, 104, 5, 104, 0, 0, 104, 105, 5, 105, 0, 0, 105,
    106, 5, 110, 0, 0, 106, 36, 1, 0, 0, 0, 107, 108, 5, 115, 0, 0, 108, 109, 5, 101, 0, 0, 109,
    110, 5, 110, 0, 0, 110, 111, 5, 116, 0, 0, 111, 112, 5, 101, 0, 0, 112, 113, 5, 110, 0, 0, 113,
    114, 5, 99, 0, 0, 114, 153, 5, 101, 0, 0, 115, 153, 5, 115, 0, 0, 116, 117, 5, 117, 0, 0, 117,
    118, 5, 116, 0, 0, 118, 119, 5, 116, 0, 0, 119, 120, 5, 101, 0, 0, 120, 121, 5, 114, 0, 0, 121,
    122, 5, 97, 0, 0, 122, 123, 5, 110, 0, 0, 123, 124, 5, 99, 0, 0, 124, 153, 5, 101, 0, 0, 125,
    153, 5, 117, 0, 0, 126, 127, 5, 112, 0, 0, 127, 128, 5, 97, 0, 0, 128, 129, 5, 114, 0, 0, 129,
    130, 5, 97, 0, 0, 130, 131, 5, 103, 0, 0, 131, 132, 5, 114, 0, 0, 132, 133, 5, 97, 0, 0, 133,
    134, 5, 112, 0, 0, 134, 153, 5, 104, 0, 0, 135, 153, 5, 112, 0, 0, 136, 137, 5, 116, 0, 0, 137,
    138, 5, 117, 0, 0, 138, 139, 5, 114, 0, 0, 139, 153, 5, 110, 0, 0, 140, 153, 5, 116, 0, 0, 141,
    142, 5, 116, 0, 0, 142, 143, 5, 101, 0, 0, 143, 144, 5, 120, 0, 0, 144, 153, 5, 116, 0, 0, 145,
    146, 5, 115, 0, 0, 146, 147, 5, 101, 0, 0, 147, 148, 5, 115, 0, 0, 148, 149, 5, 115, 0, 0, 149,
    150, 5, 105, 0, 0, 150, 151, 5, 111, 0, 0, 151, 153, 5, 110, 0, 0, 152, 107, 1, 0, 0, 0, 152,
    115, 1, 0, 0, 0, 152, 116, 1, 0, 0, 0, 152, 125, 1, 0, 0, 0, 152, 126, 1, 0, 0, 0, 152, 135, 1,
    0, 0, 0, 152, 136, 1, 0, 0, 0, 152, 140, 1, 0, 0, 0, 152, 141, 1, 0, 0, 0, 152, 145, 1, 0, 0, 0,
    153, 38, 1, 0, 0, 0, 154, 156, 7, 0, 0, 0, 155, 154, 1, 0, 0, 0, 156, 157, 1, 0, 0, 0, 157, 155,
    1, 0, 0, 0, 157, 158, 1, 0, 0, 0, 158, 40, 1, 0, 0, 0, 159, 160, 7, 1, 0, 0, 160, 42, 1, 0, 0,
    0, 161, 162, 7, 2, 0, 0, 162, 44, 1, 0, 0, 0, 163, 164, 7, 3, 0, 0, 164, 46, 1, 0, 0, 0, 165,
    173, 3, 41, 20, 0, 166, 168, 3, 45, 22, 0, 167, 166, 1, 0, 0, 0, 168, 171, 1, 0, 0, 0, 169, 167,
    1, 0, 0, 0, 169, 170, 1, 0, 0, 0, 170, 172, 1, 0, 0, 0, 171, 169, 1, 0, 0, 0, 172, 174, 3, 43,
    21, 0, 173, 169, 1, 0, 0, 0, 173, 174, 1, 0, 0, 0, 174, 48, 1, 0, 0, 0, 175, 177, 7, 4, 0, 0,
    176, 175, 1, 0, 0, 0, 177, 178, 1, 0, 0, 0, 178, 176, 1, 0, 0, 0, 178, 179, 1, 0, 0, 0, 179, 50,
    1, 0, 0, 0, 180, 181, 3, 53, 26, 0, 181, 52, 1, 0, 0, 0, 182, 187, 5, 39, 0, 0, 183, 186, 3, 59,
    29, 0, 184, 186, 8, 5, 0, 0, 185, 183, 1, 0, 0, 0, 185, 184, 1, 0, 0, 0, 186, 189, 1, 0, 0, 0,
    187, 185, 1, 0, 0, 0, 187, 188, 1, 0, 0, 0, 188, 190, 1, 0, 0, 0, 189, 187, 1, 0, 0, 0, 190,
    201, 5, 39, 0, 0, 191, 196, 5, 34, 0, 0, 192, 195, 3, 59, 29, 0, 193, 195, 8, 6, 0, 0, 194, 192,
    1, 0, 0, 0, 194, 193, 1, 0, 0, 0, 195, 198, 1, 0, 0, 0, 196, 194, 1, 0, 0, 0, 196, 197, 1, 0, 0,
    0, 197, 199, 1, 0, 0, 0, 198, 196, 1, 0, 0, 0, 199, 201, 5, 34, 0, 0, 200, 182, 1, 0, 0, 0, 200,
    191, 1, 0, 0, 0, 201, 54, 1, 0, 0, 0, 202, 205, 3, 59, 29, 0, 203, 205, 8, 7, 0, 0, 204, 202, 1,
    0, 0, 0, 204, 203, 1, 0, 0, 0, 205, 56, 1, 0, 0, 0, 206, 207, 7, 7, 0, 0, 207, 58, 1, 0, 0, 0,
    208, 230, 5, 92, 0, 0, 209, 231, 7, 8, 0, 0, 210, 211, 5, 120, 0, 0, 211, 212, 3, 61, 30, 0,
    212, 213, 3, 61, 30, 0, 213, 231, 1, 0, 0, 0, 214, 215, 5, 117, 0, 0, 215, 216, 3, 61, 30, 0,
    216, 217, 3, 61, 30, 0, 217, 218, 3, 61, 30, 0, 218, 219, 3, 61, 30, 0, 219, 231, 1, 0, 0, 0,
    220, 221, 5, 85, 0, 0, 221, 222, 3, 61, 30, 0, 222, 223, 3, 61, 30, 0, 223, 224, 3, 61, 30, 0,
    224, 225, 3, 61, 30, 0, 225, 226, 3, 61, 30, 0, 226, 227, 3, 61, 30, 0, 227, 228, 3, 61, 30, 0,
    228, 229, 3, 61, 30, 0, 229, 231, 1, 0, 0, 0, 230, 209, 1, 0, 0, 0, 230, 210, 1, 0, 0, 0, 230,
    214, 1, 0, 0, 0, 230, 220, 1, 0, 0, 0, 231, 60, 1, 0, 0, 0, 232, 233, 7, 9, 0, 0, 233, 62, 1, 0,
    0, 0, 234, 235, 3, 57, 28, 0, 235, 236, 1, 0, 0, 0, 236, 237, 6, 31, 0, 0, 237, 64, 1, 0, 0, 0,
    13, 0, 152, 157, 169, 173, 178, 185, 187, 194, 196, 200, 204, 230, 1, 0, 1, 0,
  ]

  private static __ATN: ATN
  public static get _ATN(): ATN {
    if (!FCSLexer.__ATN) {
      FCSLexer.__ATN = new ATNDeserializer().deserialize(FCSLexer._serializedATN)
    }

    return FCSLexer.__ATN
  }

  private static readonly vocabulary = new Vocabulary(
    FCSLexer.literalNames,
    FCSLexer.symbolicNames,
    []
  )

  public override get vocabulary(): Vocabulary {
    return FCSLexer.vocabulary
  }

  private static readonly decisionsToDFA = FCSLexer._ATN.decisionToState.map(
    (ds: DecisionState, index: number) => new DFA(ds, index)
  )
}
