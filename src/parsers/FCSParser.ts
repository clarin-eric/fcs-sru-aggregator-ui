import {
  ATN,
  ATNDeserializer,
  DecisionState,
  DFA,
  FailedPredicateException,
  NoViableAltException,
  Parser,
  ParserATNSimulator,
  ParserRuleContext,
  PredictionContextCache,
  RecognitionException,
  TerminalNode,
  TokenStream,
  Vocabulary,
} from 'antlr4ng'

import { FCSParserListener } from './FCSParserListener.js'
import { FCSParserVisitor } from './FCSParserVisitor.js'

export class FCSParser extends Parser {
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
  public static readonly RULE_query = 0
  public static readonly RULE_main_query = 1
  public static readonly RULE_query_disjunction = 2
  public static readonly RULE_query_sequence = 3
  public static readonly RULE_query_group = 4
  public static readonly RULE_query_simple = 5
  public static readonly RULE_quantifier = 6
  public static readonly RULE_query_implicit = 7
  public static readonly RULE_query_segment = 8
  public static readonly RULE_within_part = 9
  public static readonly RULE_within_part_simple = 10
  public static readonly RULE_expression = 11
  public static readonly RULE_expression_or = 12
  public static readonly RULE_expression_and = 13
  public static readonly RULE_expression_group = 14
  public static readonly RULE_expression_not = 15
  public static readonly RULE_expression_basic = 16
  public static readonly RULE_attribute = 17
  public static readonly RULE_qualifier = 18
  public static readonly RULE_identifier = 19
  public static readonly RULE_regexp = 20
  public static readonly RULE_regexp_pattern = 21
  public static readonly RULE_regexp_flag = 22

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
  public static readonly ruleNames = [
    'query',
    'main_query',
    'query_disjunction',
    'query_sequence',
    'query_group',
    'query_simple',
    'quantifier',
    'query_implicit',
    'query_segment',
    'within_part',
    'within_part_simple',
    'expression',
    'expression_or',
    'expression_and',
    'expression_group',
    'expression_not',
    'expression_basic',
    'attribute',
    'qualifier',
    'identifier',
    'regexp',
    'regexp_pattern',
    'regexp_flag',
  ]

  public get grammarFileName(): string {
    return 'FCSParser.g4'
  }
  public get literalNames(): (string | null)[] {
    return FCSParser.literalNames
  }
  public get symbolicNames(): (string | null)[] {
    return FCSParser.symbolicNames
  }
  public get ruleNames(): string[] {
    return FCSParser.ruleNames
  }
  public get serializedATN(): number[] {
    return FCSParser._serializedATN
  }

  protected createFailedPredicateException(
    predicate?: string,
    message?: string
  ): FailedPredicateException {
    return new FailedPredicateException(this, predicate, message)
  }

  public constructor(input: TokenStream) {
    super(input)
    this.interpreter = new ParserATNSimulator(
      this,
      FCSParser._ATN,
      FCSParser.decisionsToDFA,
      new PredictionContextCache()
    )
  }
  public query(): QueryContext {
    const localContext = new QueryContext(this.context, this.state)
    this.enterRule(localContext, 0, FCSParser.RULE_query)
    let _la: number
    try {
      this.enterOuterAlt(localContext, 1)
      {
        this.state = 46
        this.main_query()
        this.state = 49
        this.errorHandler.sync(this)
        _la = this.tokenStream.LA(1)
        if (_la === 18) {
          {
            this.state = 47
            this.match(FCSParser.WITHIN)
            this.state = 48
            this.within_part()
          }
        }

        this.state = 51
        this.match(FCSParser.EOF)
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        this.errorHandler.reportError(this, re)
        this.errorHandler.recover(this, re)
      } else {
        throw re
      }
    } finally {
      this.exitRule()
    }
    return localContext
  }
  public main_query(): Main_queryContext {
    const localContext = new Main_queryContext(this.context, this.state)
    this.enterRule(localContext, 2, FCSParser.RULE_main_query)
    try {
      this.state = 57
      this.errorHandler.sync(this)
      switch (this.interpreter.adaptivePredict(this.tokenStream, 1, this.context)) {
        case 1:
          this.enterOuterAlt(localContext, 1)
          {
            this.state = 53
            this.query_simple()
          }
          break
        case 2:
          this.enterOuterAlt(localContext, 2)
          {
            this.state = 54
            this.query_group()
          }
          break
        case 3:
          this.enterOuterAlt(localContext, 3)
          {
            this.state = 55
            this.query_sequence()
          }
          break
        case 4:
          this.enterOuterAlt(localContext, 4)
          {
            this.state = 56
            this.query_disjunction()
          }
          break
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        this.errorHandler.reportError(this, re)
        this.errorHandler.recover(this, re)
      } else {
        throw re
      }
    } finally {
      this.exitRule()
    }
    return localContext
  }
  public query_disjunction(): Query_disjunctionContext {
    const localContext = new Query_disjunctionContext(this.context, this.state)
    this.enterRule(localContext, 4, FCSParser.RULE_query_disjunction)
    let _la: number
    try {
      this.enterOuterAlt(localContext, 1)
      {
        this.state = 62
        this.errorHandler.sync(this)
        switch (this.interpreter.adaptivePredict(this.tokenStream, 2, this.context)) {
          case 1:
            {
              this.state = 59
              this.query_simple()
            }
            break
          case 2:
            {
              this.state = 60
              this.query_sequence()
            }
            break
          case 3:
            {
              this.state = 61
              this.query_group()
            }
            break
        }
        this.state = 70
        this.errorHandler.sync(this)
        _la = this.tokenStream.LA(1)
        do {
          {
            {
              this.state = 64
              this.match(FCSParser.OR)
              this.state = 68
              this.errorHandler.sync(this)
              switch (this.interpreter.adaptivePredict(this.tokenStream, 3, this.context)) {
                case 1:
                  {
                    this.state = 65
                    this.query_simple()
                  }
                  break
                case 2:
                  {
                    this.state = 66
                    this.query_sequence()
                  }
                  break
                case 3:
                  {
                    this.state = 67
                    this.query_group()
                  }
                  break
              }
            }
          }
          this.state = 72
          this.errorHandler.sync(this)
          _la = this.tokenStream.LA(1)
        } while (_la === 5)
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        this.errorHandler.reportError(this, re)
        this.errorHandler.recover(this, re)
      } else {
        throw re
      }
    } finally {
      this.exitRule()
    }
    return localContext
  }
  public query_sequence(): Query_sequenceContext {
    const localContext = new Query_sequenceContext(this.context, this.state)
    this.enterRule(localContext, 6, FCSParser.RULE_query_sequence)
    let _la: number
    try {
      this.enterOuterAlt(localContext, 1)
      {
        this.state = 76
        this.errorHandler.sync(this)
        _la = this.tokenStream.LA(1)
        do {
          {
            this.state = 76
            this.errorHandler.sync(this)
            switch (this.tokenStream.LA(1)) {
              case FCSParser.L_SQUARE_BRACKET:
              case FCSParser.REGEXP:
                {
                  this.state = 74
                  this.query_simple()
                }
                break
              case FCSParser.L_PAREN:
                {
                  this.state = 75
                  this.query_group()
                }
                break
              default:
                throw new NoViableAltException(this)
            }
          }
          this.state = 78
          this.errorHandler.sync(this)
          _la = this.tokenStream.LA(1)
        } while ((_la & ~0x1f) === 0 && ((1 << _la) & 8388618) !== 0)
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        this.errorHandler.reportError(this, re)
        this.errorHandler.recover(this, re)
      } else {
        throw re
      }
    } finally {
      this.exitRule()
    }
    return localContext
  }
  public query_group(): Query_groupContext {
    const localContext = new Query_groupContext(this.context, this.state)
    this.enterRule(localContext, 8, FCSParser.RULE_query_group)
    let _la: number
    try {
      this.enterOuterAlt(localContext, 1)
      {
        this.state = 80
        this.match(FCSParser.L_PAREN)
        this.state = 83
        this.errorHandler.sync(this)
        switch (this.interpreter.adaptivePredict(this.tokenStream, 7, this.context)) {
          case 1:
            {
              this.state = 81
              this.query_disjunction()
            }
            break
          case 2:
            {
              this.state = 82
              this.query_sequence()
            }
            break
        }
        this.state = 85
        this.match(FCSParser.R_PAREN)
        this.state = 87
        this.errorHandler.sync(this)
        _la = this.tokenStream.LA(1)
        if ((_la & ~0x1f) === 0 && ((1 << _la) & 14848) !== 0) {
          {
            this.state = 86
            this.quantifier()
          }
        }
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        this.errorHandler.reportError(this, re)
        this.errorHandler.recover(this, re)
      } else {
        throw re
      }
    } finally {
      this.exitRule()
    }
    return localContext
  }
  public query_simple(): Query_simpleContext {
    const localContext = new Query_simpleContext(this.context, this.state)
    this.enterRule(localContext, 10, FCSParser.RULE_query_simple)
    let _la: number
    try {
      this.enterOuterAlt(localContext, 1)
      {
        this.state = 91
        this.errorHandler.sync(this)
        switch (this.tokenStream.LA(1)) {
          case FCSParser.REGEXP:
            {
              this.state = 89
              this.query_implicit()
            }
            break
          case FCSParser.L_SQUARE_BRACKET:
            {
              this.state = 90
              this.query_segment()
            }
            break
          default:
            throw new NoViableAltException(this)
        }
        this.state = 94
        this.errorHandler.sync(this)
        _la = this.tokenStream.LA(1)
        if ((_la & ~0x1f) === 0 && ((1 << _la) & 14848) !== 0) {
          {
            this.state = 93
            this.quantifier()
          }
        }
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        this.errorHandler.reportError(this, re)
        this.errorHandler.recover(this, re)
      } else {
        throw re
      }
    } finally {
      this.exitRule()
    }
    return localContext
  }
  public quantifier(): QuantifierContext {
    const localContext = new QuantifierContext(this.context, this.state)
    this.enterRule(localContext, 12, FCSParser.RULE_quantifier)
    let _la: number
    try {
      this.enterOuterAlt(localContext, 1)
      {
        this.state = 114
        this.errorHandler.sync(this)
        switch (this.tokenStream.LA(1)) {
          case FCSParser.Q_ONE_OR_MORE:
            {
              this.state = 96
              this.match(FCSParser.Q_ONE_OR_MORE)
            }
            break
          case FCSParser.Q_ZERO_OR_MORE:
            {
              this.state = 97
              this.match(FCSParser.Q_ZERO_OR_MORE)
            }
            break
          case FCSParser.Q_ZERO_OR_ONE:
            {
              this.state = 98
              this.match(FCSParser.Q_ZERO_OR_ONE)
            }
            break
          case FCSParser.L_CURLY_BRACKET:
            {
              {
                this.state = 99
                this.match(FCSParser.L_CURLY_BRACKET)
                this.state = 111
                this.errorHandler.sync(this)
                switch (this.interpreter.adaptivePredict(this.tokenStream, 13, this.context)) {
                  case 1:
                    {
                      this.state = 100
                      this.match(FCSParser.INTEGER)
                    }
                    break
                  case 2:
                    {
                      this.state = 102
                      this.errorHandler.sync(this)
                      _la = this.tokenStream.LA(1)
                      if (_la === 22) {
                        {
                          this.state = 101
                          this.match(FCSParser.INTEGER)
                        }
                      }

                      this.state = 104
                      this.match(FCSParser.Q_COMMA)
                      this.state = 105
                      this.match(FCSParser.INTEGER)
                    }
                    break
                  case 3:
                    {
                      this.state = 106
                      this.match(FCSParser.INTEGER)
                      this.state = 107
                      this.match(FCSParser.Q_COMMA)
                      this.state = 109
                      this.errorHandler.sync(this)
                      _la = this.tokenStream.LA(1)
                      if (_la === 22) {
                        {
                          this.state = 108
                          this.match(FCSParser.INTEGER)
                        }
                      }
                    }
                    break
                }
                this.state = 113
                this.match(FCSParser.R_CURLY_BRACKET)
              }
            }
            break
          default:
            throw new NoViableAltException(this)
        }
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        this.errorHandler.reportError(this, re)
        this.errorHandler.recover(this, re)
      } else {
        throw re
      }
    } finally {
      this.exitRule()
    }
    return localContext
  }
  public query_implicit(): Query_implicitContext {
    const localContext = new Query_implicitContext(this.context, this.state)
    this.enterRule(localContext, 14, FCSParser.RULE_query_implicit)
    try {
      this.enterOuterAlt(localContext, 1)
      {
        this.state = 116
        this.regexp()
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        this.errorHandler.reportError(this, re)
        this.errorHandler.recover(this, re)
      } else {
        throw re
      }
    } finally {
      this.exitRule()
    }
    return localContext
  }
  public query_segment(): Query_segmentContext {
    const localContext = new Query_segmentContext(this.context, this.state)
    this.enterRule(localContext, 16, FCSParser.RULE_query_segment)
    let _la: number
    try {
      this.enterOuterAlt(localContext, 1)
      {
        this.state = 118
        this.match(FCSParser.L_SQUARE_BRACKET)
        this.state = 120
        this.errorHandler.sync(this)
        _la = this.tokenStream.LA(1)
        if ((_la & ~0x1f) === 0 && ((1 << _la) & 3932290) !== 0) {
          {
            this.state = 119
            this.expression()
          }
        }

        this.state = 122
        this.match(FCSParser.R_SQUARE_BRACKET)
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        this.errorHandler.reportError(this, re)
        this.errorHandler.recover(this, re)
      } else {
        throw re
      }
    } finally {
      this.exitRule()
    }
    return localContext
  }
  public within_part(): Within_partContext {
    const localContext = new Within_partContext(this.context, this.state)
    this.enterRule(localContext, 18, FCSParser.RULE_within_part)
    try {
      this.enterOuterAlt(localContext, 1)
      {
        this.state = 124
        this.within_part_simple()
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        this.errorHandler.reportError(this, re)
        this.errorHandler.recover(this, re)
      } else {
        throw re
      }
    } finally {
      this.exitRule()
    }
    return localContext
  }
  public within_part_simple(): Within_part_simpleContext {
    const localContext = new Within_part_simpleContext(this.context, this.state)
    this.enterRule(localContext, 20, FCSParser.RULE_within_part_simple)
    try {
      this.enterOuterAlt(localContext, 1)
      {
        this.state = 126
        this.match(FCSParser.SIMPLE_WITHIN_SCOPE)
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        this.errorHandler.reportError(this, re)
        this.errorHandler.recover(this, re)
      } else {
        throw re
      }
    } finally {
      this.exitRule()
    }
    return localContext
  }
  public expression(): ExpressionContext {
    const localContext = new ExpressionContext(this.context, this.state)
    this.enterRule(localContext, 22, FCSParser.RULE_expression)
    try {
      this.state = 133
      this.errorHandler.sync(this)
      switch (this.interpreter.adaptivePredict(this.tokenStream, 16, this.context)) {
        case 1:
          this.enterOuterAlt(localContext, 1)
          {
            this.state = 128
            this.expression_basic()
          }
          break
        case 2:
          this.enterOuterAlt(localContext, 2)
          {
            this.state = 129
            this.expression_group()
          }
          break
        case 3:
          this.enterOuterAlt(localContext, 3)
          {
            this.state = 130
            this.expression_or()
          }
          break
        case 4:
          this.enterOuterAlt(localContext, 4)
          {
            this.state = 131
            this.expression_and()
          }
          break
        case 5:
          this.enterOuterAlt(localContext, 5)
          {
            this.state = 132
            this.expression_not()
          }
          break
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        this.errorHandler.reportError(this, re)
        this.errorHandler.recover(this, re)
      } else {
        throw re
      }
    } finally {
      this.exitRule()
    }
    return localContext
  }
  public expression_or(): Expression_orContext {
    const localContext = new Expression_orContext(this.context, this.state)
    this.enterRule(localContext, 24, FCSParser.RULE_expression_or)
    try {
      let alternative: number
      this.enterOuterAlt(localContext, 1)
      {
        this.state = 139
        this.errorHandler.sync(this)
        switch (this.interpreter.adaptivePredict(this.tokenStream, 17, this.context)) {
          case 1:
            {
              this.state = 135
              this.expression_basic()
            }
            break
          case 2:
            {
              this.state = 136
              this.expression_group()
            }
            break
          case 3:
            {
              this.state = 137
              this.expression_and()
            }
            break
          case 4:
            {
              this.state = 138
              this.expression_not()
            }
            break
        }
        this.state = 148
        this.errorHandler.sync(this)
        alternative = 1
        do {
          switch (alternative) {
            case 1:
              {
                {
                  this.state = 141
                  this.match(FCSParser.OR)
                  this.state = 146
                  this.errorHandler.sync(this)
                  switch (this.interpreter.adaptivePredict(this.tokenStream, 18, this.context)) {
                    case 1:
                      {
                        this.state = 142
                        this.expression_basic()
                      }
                      break
                    case 2:
                      {
                        this.state = 143
                        this.expression_group()
                      }
                      break
                    case 3:
                      {
                        this.state = 144
                        this.expression_and()
                      }
                      break
                    case 4:
                      {
                        this.state = 145
                        this.expression_not()
                      }
                      break
                  }
                }
              }
              break
            default:
              throw new NoViableAltException(this)
          }
          this.state = 150
          this.errorHandler.sync(this)
          alternative = this.interpreter.adaptivePredict(this.tokenStream, 19, this.context)
        } while (alternative !== 2 && alternative !== ATN.INVALID_ALT_NUMBER)
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        this.errorHandler.reportError(this, re)
        this.errorHandler.recover(this, re)
      } else {
        throw re
      }
    } finally {
      this.exitRule()
    }
    return localContext
  }
  public expression_and(): Expression_andContext {
    const localContext = new Expression_andContext(this.context, this.state)
    this.enterRule(localContext, 26, FCSParser.RULE_expression_and)
    try {
      let alternative: number
      this.enterOuterAlt(localContext, 1)
      {
        this.state = 155
        this.errorHandler.sync(this)
        switch (this.tokenStream.LA(1)) {
          case FCSParser.WITHIN:
          case FCSParser.SIMPLE_WITHIN_SCOPE:
          case FCSParser.REGEXP_FLAGS:
          case FCSParser.IDENTIFIER:
            {
              this.state = 152
              this.expression_basic()
            }
            break
          case FCSParser.L_PAREN:
            {
              this.state = 153
              this.expression_group()
            }
            break
          case FCSParser.NOT:
            {
              this.state = 154
              this.expression_not()
            }
            break
          default:
            throw new NoViableAltException(this)
        }
        this.state = 164
        this.errorHandler.sync(this)
        alternative = 1
        do {
          switch (alternative) {
            case 1:
              {
                {
                  this.state = 157
                  this.match(FCSParser.AND)
                  this.state = 162
                  this.errorHandler.sync(this)
                  switch (this.interpreter.adaptivePredict(this.tokenStream, 21, this.context)) {
                    case 1:
                      {
                        this.state = 158
                        this.expression_basic()
                      }
                      break
                    case 2:
                      {
                        this.state = 159
                        this.expression_group()
                      }
                      break
                    case 3:
                      {
                        this.state = 160
                        this.expression_or()
                      }
                      break
                    case 4:
                      {
                        this.state = 161
                        this.expression_not()
                      }
                      break
                  }
                }
              }
              break
            default:
              throw new NoViableAltException(this)
          }
          this.state = 166
          this.errorHandler.sync(this)
          alternative = this.interpreter.adaptivePredict(this.tokenStream, 22, this.context)
        } while (alternative !== 2 && alternative !== ATN.INVALID_ALT_NUMBER)
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        this.errorHandler.reportError(this, re)
        this.errorHandler.recover(this, re)
      } else {
        throw re
      }
    } finally {
      this.exitRule()
    }
    return localContext
  }
  public expression_group(): Expression_groupContext {
    const localContext = new Expression_groupContext(this.context, this.state)
    this.enterRule(localContext, 28, FCSParser.RULE_expression_group)
    try {
      this.enterOuterAlt(localContext, 1)
      {
        this.state = 168
        this.match(FCSParser.L_PAREN)
        this.state = 174
        this.errorHandler.sync(this)
        switch (this.interpreter.adaptivePredict(this.tokenStream, 23, this.context)) {
          case 1:
            {
              this.state = 169
              this.expression_basic()
            }
            break
          case 2:
            {
              this.state = 170
              this.expression_group()
            }
            break
          case 3:
            {
              this.state = 171
              this.expression_or()
            }
            break
          case 4:
            {
              this.state = 172
              this.expression_and()
            }
            break
          case 5:
            {
              this.state = 173
              this.expression_not()
            }
            break
        }
        this.state = 176
        this.match(FCSParser.R_PAREN)
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        this.errorHandler.reportError(this, re)
        this.errorHandler.recover(this, re)
      } else {
        throw re
      }
    } finally {
      this.exitRule()
    }
    return localContext
  }
  public expression_not(): Expression_notContext {
    const localContext = new Expression_notContext(this.context, this.state)
    this.enterRule(localContext, 30, FCSParser.RULE_expression_not)
    try {
      this.enterOuterAlt(localContext, 1)
      {
        this.state = 178
        this.match(FCSParser.NOT)
        this.state = 184
        this.errorHandler.sync(this)
        switch (this.interpreter.adaptivePredict(this.tokenStream, 24, this.context)) {
          case 1:
            {
              this.state = 179
              this.expression_basic()
            }
            break
          case 2:
            {
              this.state = 180
              this.expression_group()
            }
            break
          case 3:
            {
              this.state = 181
              this.expression_not()
            }
            break
          case 4:
            {
              this.state = 182
              this.expression_or()
            }
            break
          case 5:
            {
              this.state = 183
              this.expression_and()
            }
            break
        }
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        this.errorHandler.reportError(this, re)
        this.errorHandler.recover(this, re)
      } else {
        throw re
      }
    } finally {
      this.exitRule()
    }
    return localContext
  }
  public expression_basic(): Expression_basicContext {
    const localContext = new Expression_basicContext(this.context, this.state)
    this.enterRule(localContext, 32, FCSParser.RULE_expression_basic)
    let _la: number
    try {
      this.enterOuterAlt(localContext, 1)
      {
        this.state = 186
        this.attribute()
        this.state = 187
        _la = this.tokenStream.LA(1)
        if (!(_la === 15 || _la === 16)) {
          this.errorHandler.recoverInline(this)
        } else {
          this.errorHandler.reportMatch(this)
          this.consume()
        }
        this.state = 188
        this.regexp()
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        this.errorHandler.reportError(this, re)
        this.errorHandler.recover(this, re)
      } else {
        throw re
      }
    } finally {
      this.exitRule()
    }
    return localContext
  }
  public attribute(): AttributeContext {
    const localContext = new AttributeContext(this.context, this.state)
    this.enterRule(localContext, 34, FCSParser.RULE_attribute)
    try {
      this.enterOuterAlt(localContext, 1)
      {
        this.state = 193
        this.errorHandler.sync(this)
        switch (this.interpreter.adaptivePredict(this.tokenStream, 25, this.context)) {
          case 1:
            {
              this.state = 190
              this.qualifier()
              this.state = 191
              this.match(FCSParser.COLON)
            }
            break
        }
        this.state = 195
        this.identifier()
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        this.errorHandler.reportError(this, re)
        this.errorHandler.recover(this, re)
      } else {
        throw re
      }
    } finally {
      this.exitRule()
    }
    return localContext
  }
  public qualifier(): QualifierContext {
    const localContext = new QualifierContext(this.context, this.state)
    this.enterRule(localContext, 36, FCSParser.RULE_qualifier)
    let _la: number
    try {
      this.enterOuterAlt(localContext, 1)
      {
        this.state = 197
        _la = this.tokenStream.LA(1)
        if (!((_la & ~0x1f) === 0 && ((1 << _la) & 3932160) !== 0)) {
          this.errorHandler.recoverInline(this)
        } else {
          this.errorHandler.reportMatch(this)
          this.consume()
        }
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        this.errorHandler.reportError(this, re)
        this.errorHandler.recover(this, re)
      } else {
        throw re
      }
    } finally {
      this.exitRule()
    }
    return localContext
  }
  public identifier(): IdentifierContext {
    const localContext = new IdentifierContext(this.context, this.state)
    this.enterRule(localContext, 38, FCSParser.RULE_identifier)
    let _la: number
    try {
      this.enterOuterAlt(localContext, 1)
      {
        this.state = 199
        _la = this.tokenStream.LA(1)
        if (!((_la & ~0x1f) === 0 && ((1 << _la) & 3932160) !== 0)) {
          this.errorHandler.recoverInline(this)
        } else {
          this.errorHandler.reportMatch(this)
          this.consume()
        }
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        this.errorHandler.reportError(this, re)
        this.errorHandler.recover(this, re)
      } else {
        throw re
      }
    } finally {
      this.exitRule()
    }
    return localContext
  }
  public regexp(): RegexpContext {
    const localContext = new RegexpContext(this.context, this.state)
    this.enterRule(localContext, 40, FCSParser.RULE_regexp)
    let _la: number
    try {
      this.enterOuterAlt(localContext, 1)
      {
        this.state = 201
        this.regexp_pattern()
        this.state = 204
        this.errorHandler.sync(this)
        _la = this.tokenStream.LA(1)
        if (_la === 8) {
          {
            this.state = 202
            this.match(FCSParser.FWD_SLASH)
            this.state = 203
            this.regexp_flag()
          }
        }
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        this.errorHandler.reportError(this, re)
        this.errorHandler.recover(this, re)
      } else {
        throw re
      }
    } finally {
      this.exitRule()
    }
    return localContext
  }
  public regexp_pattern(): Regexp_patternContext {
    const localContext = new Regexp_patternContext(this.context, this.state)
    this.enterRule(localContext, 42, FCSParser.RULE_regexp_pattern)
    try {
      this.enterOuterAlt(localContext, 1)
      {
        this.state = 206
        this.match(FCSParser.REGEXP)
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        this.errorHandler.reportError(this, re)
        this.errorHandler.recover(this, re)
      } else {
        throw re
      }
    } finally {
      this.exitRule()
    }
    return localContext
  }
  public regexp_flag(): Regexp_flagContext {
    const localContext = new Regexp_flagContext(this.context, this.state)
    this.enterRule(localContext, 44, FCSParser.RULE_regexp_flag)
    try {
      this.enterOuterAlt(localContext, 1)
      {
        this.state = 208
        this.match(FCSParser.REGEXP_FLAGS)
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        this.errorHandler.reportError(this, re)
        this.errorHandler.recover(this, re)
      } else {
        throw re
      }
    } finally {
      this.exitRule()
    }
    return localContext
  }

  public static readonly _serializedATN: number[] = [
    4, 1, 25, 211, 2, 0, 7, 0, 2, 1, 7, 1, 2, 2, 7, 2, 2, 3, 7, 3, 2, 4, 7, 4, 2, 5, 7, 5, 2, 6, 7,
    6, 2, 7, 7, 7, 2, 8, 7, 8, 2, 9, 7, 9, 2, 10, 7, 10, 2, 11, 7, 11, 2, 12, 7, 12, 2, 13, 7, 13,
    2, 14, 7, 14, 2, 15, 7, 15, 2, 16, 7, 16, 2, 17, 7, 17, 2, 18, 7, 18, 2, 19, 7, 19, 2, 20, 7,
    20, 2, 21, 7, 21, 2, 22, 7, 22, 1, 0, 1, 0, 1, 0, 3, 0, 50, 8, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1,
    1, 1, 3, 1, 58, 8, 1, 1, 2, 1, 2, 1, 2, 3, 2, 63, 8, 2, 1, 2, 1, 2, 1, 2, 1, 2, 3, 2, 69, 8, 2,
    4, 2, 71, 8, 2, 11, 2, 12, 2, 72, 1, 3, 1, 3, 4, 3, 77, 8, 3, 11, 3, 12, 3, 78, 1, 4, 1, 4, 1,
    4, 3, 4, 84, 8, 4, 1, 4, 1, 4, 3, 4, 88, 8, 4, 1, 5, 1, 5, 3, 5, 92, 8, 5, 1, 5, 3, 5, 95, 8, 5,
    1, 6, 1, 6, 1, 6, 1, 6, 1, 6, 1, 6, 3, 6, 103, 8, 6, 1, 6, 1, 6, 1, 6, 1, 6, 1, 6, 3, 6, 110, 8,
    6, 3, 6, 112, 8, 6, 1, 6, 3, 6, 115, 8, 6, 1, 7, 1, 7, 1, 8, 1, 8, 3, 8, 121, 8, 8, 1, 8, 1, 8,
    1, 9, 1, 9, 1, 10, 1, 10, 1, 11, 1, 11, 1, 11, 1, 11, 1, 11, 3, 11, 134, 8, 11, 1, 12, 1, 12, 1,
    12, 1, 12, 3, 12, 140, 8, 12, 1, 12, 1, 12, 1, 12, 1, 12, 1, 12, 3, 12, 147, 8, 12, 4, 12, 149,
    8, 12, 11, 12, 12, 12, 150, 1, 13, 1, 13, 1, 13, 3, 13, 156, 8, 13, 1, 13, 1, 13, 1, 13, 1, 13,
    1, 13, 3, 13, 163, 8, 13, 4, 13, 165, 8, 13, 11, 13, 12, 13, 166, 1, 14, 1, 14, 1, 14, 1, 14, 1,
    14, 1, 14, 3, 14, 175, 8, 14, 1, 14, 1, 14, 1, 15, 1, 15, 1, 15, 1, 15, 1, 15, 1, 15, 3, 15,
    185, 8, 15, 1, 16, 1, 16, 1, 16, 1, 16, 1, 17, 1, 17, 1, 17, 3, 17, 194, 8, 17, 1, 17, 1, 17, 1,
    18, 1, 18, 1, 19, 1, 19, 1, 20, 1, 20, 1, 20, 3, 20, 205, 8, 20, 1, 21, 1, 21, 1, 22, 1, 22, 1,
    22, 0, 0, 23, 0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42,
    44, 0, 2, 1, 0, 15, 16, 1, 0, 18, 21, 237, 0, 46, 1, 0, 0, 0, 2, 57, 1, 0, 0, 0, 4, 62, 1, 0, 0,
    0, 6, 76, 1, 0, 0, 0, 8, 80, 1, 0, 0, 0, 10, 91, 1, 0, 0, 0, 12, 114, 1, 0, 0, 0, 14, 116, 1, 0,
    0, 0, 16, 118, 1, 0, 0, 0, 18, 124, 1, 0, 0, 0, 20, 126, 1, 0, 0, 0, 22, 133, 1, 0, 0, 0, 24,
    139, 1, 0, 0, 0, 26, 155, 1, 0, 0, 0, 28, 168, 1, 0, 0, 0, 30, 178, 1, 0, 0, 0, 32, 186, 1, 0,
    0, 0, 34, 193, 1, 0, 0, 0, 36, 197, 1, 0, 0, 0, 38, 199, 1, 0, 0, 0, 40, 201, 1, 0, 0, 0, 42,
    206, 1, 0, 0, 0, 44, 208, 1, 0, 0, 0, 46, 49, 3, 2, 1, 0, 47, 48, 5, 18, 0, 0, 48, 50, 3, 18, 9,
    0, 49, 47, 1, 0, 0, 0, 49, 50, 1, 0, 0, 0, 50, 51, 1, 0, 0, 0, 51, 52, 5, 0, 0, 1, 52, 1, 1, 0,
    0, 0, 53, 58, 3, 10, 5, 0, 54, 58, 3, 8, 4, 0, 55, 58, 3, 6, 3, 0, 56, 58, 3, 4, 2, 0, 57, 53,
    1, 0, 0, 0, 57, 54, 1, 0, 0, 0, 57, 55, 1, 0, 0, 0, 57, 56, 1, 0, 0, 0, 58, 3, 1, 0, 0, 0, 59,
    63, 3, 10, 5, 0, 60, 63, 3, 6, 3, 0, 61, 63, 3, 8, 4, 0, 62, 59, 1, 0, 0, 0, 62, 60, 1, 0, 0, 0,
    62, 61, 1, 0, 0, 0, 63, 70, 1, 0, 0, 0, 64, 68, 5, 5, 0, 0, 65, 69, 3, 10, 5, 0, 66, 69, 3, 6,
    3, 0, 67, 69, 3, 8, 4, 0, 68, 65, 1, 0, 0, 0, 68, 66, 1, 0, 0, 0, 68, 67, 1, 0, 0, 0, 69, 71, 1,
    0, 0, 0, 70, 64, 1, 0, 0, 0, 71, 72, 1, 0, 0, 0, 72, 70, 1, 0, 0, 0, 72, 73, 1, 0, 0, 0, 73, 5,
    1, 0, 0, 0, 74, 77, 3, 10, 5, 0, 75, 77, 3, 8, 4, 0, 76, 74, 1, 0, 0, 0, 76, 75, 1, 0, 0, 0, 77,
    78, 1, 0, 0, 0, 78, 76, 1, 0, 0, 0, 78, 79, 1, 0, 0, 0, 79, 7, 1, 0, 0, 0, 80, 83, 5, 1, 0, 0,
    81, 84, 3, 4, 2, 0, 82, 84, 3, 6, 3, 0, 83, 81, 1, 0, 0, 0, 83, 82, 1, 0, 0, 0, 84, 85, 1, 0, 0,
    0, 85, 87, 5, 2, 0, 0, 86, 88, 3, 12, 6, 0, 87, 86, 1, 0, 0, 0, 87, 88, 1, 0, 0, 0, 88, 9, 1, 0,
    0, 0, 89, 92, 3, 14, 7, 0, 90, 92, 3, 16, 8, 0, 91, 89, 1, 0, 0, 0, 91, 90, 1, 0, 0, 0, 92, 94,
    1, 0, 0, 0, 93, 95, 3, 12, 6, 0, 94, 93, 1, 0, 0, 0, 94, 95, 1, 0, 0, 0, 95, 11, 1, 0, 0, 0, 96,
    115, 5, 11, 0, 0, 97, 115, 5, 12, 0, 0, 98, 115, 5, 13, 0, 0, 99, 111, 5, 9, 0, 0, 100, 112, 5,
    22, 0, 0, 101, 103, 5, 22, 0, 0, 102, 101, 1, 0, 0, 0, 102, 103, 1, 0, 0, 0, 103, 104, 1, 0, 0,
    0, 104, 105, 5, 14, 0, 0, 105, 112, 5, 22, 0, 0, 106, 107, 5, 22, 0, 0, 107, 109, 5, 14, 0, 0,
    108, 110, 5, 22, 0, 0, 109, 108, 1, 0, 0, 0, 109, 110, 1, 0, 0, 0, 110, 112, 1, 0, 0, 0, 111,
    100, 1, 0, 0, 0, 111, 102, 1, 0, 0, 0, 111, 106, 1, 0, 0, 0, 112, 113, 1, 0, 0, 0, 113, 115, 5,
    10, 0, 0, 114, 96, 1, 0, 0, 0, 114, 97, 1, 0, 0, 0, 114, 98, 1, 0, 0, 0, 114, 99, 1, 0, 0, 0,
    115, 13, 1, 0, 0, 0, 116, 117, 3, 40, 20, 0, 117, 15, 1, 0, 0, 0, 118, 120, 5, 3, 0, 0, 119,
    121, 3, 22, 11, 0, 120, 119, 1, 0, 0, 0, 120, 121, 1, 0, 0, 0, 121, 122, 1, 0, 0, 0, 122, 123,
    5, 4, 0, 0, 123, 17, 1, 0, 0, 0, 124, 125, 3, 20, 10, 0, 125, 19, 1, 0, 0, 0, 126, 127, 5, 19,
    0, 0, 127, 21, 1, 0, 0, 0, 128, 134, 3, 32, 16, 0, 129, 134, 3, 28, 14, 0, 130, 134, 3, 24, 12,
    0, 131, 134, 3, 26, 13, 0, 132, 134, 3, 30, 15, 0, 133, 128, 1, 0, 0, 0, 133, 129, 1, 0, 0, 0,
    133, 130, 1, 0, 0, 0, 133, 131, 1, 0, 0, 0, 133, 132, 1, 0, 0, 0, 134, 23, 1, 0, 0, 0, 135, 140,
    3, 32, 16, 0, 136, 140, 3, 28, 14, 0, 137, 140, 3, 26, 13, 0, 138, 140, 3, 30, 15, 0, 139, 135,
    1, 0, 0, 0, 139, 136, 1, 0, 0, 0, 139, 137, 1, 0, 0, 0, 139, 138, 1, 0, 0, 0, 140, 148, 1, 0, 0,
    0, 141, 146, 5, 5, 0, 0, 142, 147, 3, 32, 16, 0, 143, 147, 3, 28, 14, 0, 144, 147, 3, 26, 13, 0,
    145, 147, 3, 30, 15, 0, 146, 142, 1, 0, 0, 0, 146, 143, 1, 0, 0, 0, 146, 144, 1, 0, 0, 0, 146,
    145, 1, 0, 0, 0, 147, 149, 1, 0, 0, 0, 148, 141, 1, 0, 0, 0, 149, 150, 1, 0, 0, 0, 150, 148, 1,
    0, 0, 0, 150, 151, 1, 0, 0, 0, 151, 25, 1, 0, 0, 0, 152, 156, 3, 32, 16, 0, 153, 156, 3, 28, 14,
    0, 154, 156, 3, 30, 15, 0, 155, 152, 1, 0, 0, 0, 155, 153, 1, 0, 0, 0, 155, 154, 1, 0, 0, 0,
    156, 164, 1, 0, 0, 0, 157, 162, 5, 6, 0, 0, 158, 163, 3, 32, 16, 0, 159, 163, 3, 28, 14, 0, 160,
    163, 3, 24, 12, 0, 161, 163, 3, 30, 15, 0, 162, 158, 1, 0, 0, 0, 162, 159, 1, 0, 0, 0, 162, 160,
    1, 0, 0, 0, 162, 161, 1, 0, 0, 0, 163, 165, 1, 0, 0, 0, 164, 157, 1, 0, 0, 0, 165, 166, 1, 0, 0,
    0, 166, 164, 1, 0, 0, 0, 166, 167, 1, 0, 0, 0, 167, 27, 1, 0, 0, 0, 168, 174, 5, 1, 0, 0, 169,
    175, 3, 32, 16, 0, 170, 175, 3, 28, 14, 0, 171, 175, 3, 24, 12, 0, 172, 175, 3, 26, 13, 0, 173,
    175, 3, 30, 15, 0, 174, 169, 1, 0, 0, 0, 174, 170, 1, 0, 0, 0, 174, 171, 1, 0, 0, 0, 174, 172,
    1, 0, 0, 0, 174, 173, 1, 0, 0, 0, 175, 176, 1, 0, 0, 0, 176, 177, 5, 2, 0, 0, 177, 29, 1, 0, 0,
    0, 178, 184, 5, 7, 0, 0, 179, 185, 3, 32, 16, 0, 180, 185, 3, 28, 14, 0, 181, 185, 3, 30, 15, 0,
    182, 185, 3, 24, 12, 0, 183, 185, 3, 26, 13, 0, 184, 179, 1, 0, 0, 0, 184, 180, 1, 0, 0, 0, 184,
    181, 1, 0, 0, 0, 184, 182, 1, 0, 0, 0, 184, 183, 1, 0, 0, 0, 185, 31, 1, 0, 0, 0, 186, 187, 3,
    34, 17, 0, 187, 188, 7, 0, 0, 0, 188, 189, 3, 40, 20, 0, 189, 33, 1, 0, 0, 0, 190, 191, 3, 36,
    18, 0, 191, 192, 5, 17, 0, 0, 192, 194, 1, 0, 0, 0, 193, 190, 1, 0, 0, 0, 193, 194, 1, 0, 0, 0,
    194, 195, 1, 0, 0, 0, 195, 196, 3, 38, 19, 0, 196, 35, 1, 0, 0, 0, 197, 198, 7, 1, 0, 0, 198,
    37, 1, 0, 0, 0, 199, 200, 7, 1, 0, 0, 200, 39, 1, 0, 0, 0, 201, 204, 3, 42, 21, 0, 202, 203, 5,
    8, 0, 0, 203, 205, 3, 44, 22, 0, 204, 202, 1, 0, 0, 0, 204, 205, 1, 0, 0, 0, 205, 41, 1, 0, 0,
    0, 206, 207, 5, 23, 0, 0, 207, 43, 1, 0, 0, 0, 208, 209, 5, 20, 0, 0, 209, 45, 1, 0, 0, 0, 27,
    49, 57, 62, 68, 72, 76, 78, 83, 87, 91, 94, 102, 109, 111, 114, 120, 133, 139, 146, 150, 155,
    162, 166, 174, 184, 193, 204,
  ]

  private static __ATN: ATN
  public static get _ATN(): ATN {
    if (!FCSParser.__ATN) {
      FCSParser.__ATN = new ATNDeserializer().deserialize(FCSParser._serializedATN)
    }

    return FCSParser.__ATN
  }

  private static readonly vocabulary = new Vocabulary(
    FCSParser.literalNames,
    FCSParser.symbolicNames,
    []
  )

  public override get vocabulary(): Vocabulary {
    return FCSParser.vocabulary
  }

  private static readonly decisionsToDFA = FCSParser._ATN.decisionToState.map(
    (ds: DecisionState, index: number) => new DFA(ds, index)
  )
}

export class QueryContext extends ParserRuleContext {
  public constructor(parent: ParserRuleContext | null, invokingState: number) {
    super(parent, invokingState)
  }
  public main_query(): Main_queryContext {
    return this.getRuleContext(0, Main_queryContext)!
  }
  public EOF(): TerminalNode {
    return this.getToken(FCSParser.EOF, 0)!
  }
  public WITHIN(): TerminalNode | null {
    return this.getToken(FCSParser.WITHIN, 0)
  }
  public within_part(): Within_partContext | null {
    return this.getRuleContext(0, Within_partContext)
  }
  public override get ruleIndex(): number {
    return FCSParser.RULE_query
  }
  public override enterRule(listener: FCSParserListener): void {
    if (listener.enterQuery) {
      listener.enterQuery(this)
    }
  }
  public override exitRule(listener: FCSParserListener): void {
    if (listener.exitQuery) {
      listener.exitQuery(this)
    }
  }
  public override accept<Result>(visitor: FCSParserVisitor<Result>): Result | null {
    if (visitor.visitQuery) {
      return visitor.visitQuery(this)
    } else {
      return visitor.visitChildren(this)
    }
  }
}

export class Main_queryContext extends ParserRuleContext {
  public constructor(parent: ParserRuleContext | null, invokingState: number) {
    super(parent, invokingState)
  }
  public query_simple(): Query_simpleContext | null {
    return this.getRuleContext(0, Query_simpleContext)
  }
  public query_group(): Query_groupContext | null {
    return this.getRuleContext(0, Query_groupContext)
  }
  public query_sequence(): Query_sequenceContext | null {
    return this.getRuleContext(0, Query_sequenceContext)
  }
  public query_disjunction(): Query_disjunctionContext | null {
    return this.getRuleContext(0, Query_disjunctionContext)
  }
  public override get ruleIndex(): number {
    return FCSParser.RULE_main_query
  }
  public override enterRule(listener: FCSParserListener): void {
    if (listener.enterMain_query) {
      listener.enterMain_query(this)
    }
  }
  public override exitRule(listener: FCSParserListener): void {
    if (listener.exitMain_query) {
      listener.exitMain_query(this)
    }
  }
  public override accept<Result>(visitor: FCSParserVisitor<Result>): Result | null {
    if (visitor.visitMain_query) {
      return visitor.visitMain_query(this)
    } else {
      return visitor.visitChildren(this)
    }
  }
}

export class Query_disjunctionContext extends ParserRuleContext {
  public constructor(parent: ParserRuleContext | null, invokingState: number) {
    super(parent, invokingState)
  }
  public query_simple(): Query_simpleContext[]
  public query_simple(i: number): Query_simpleContext | null
  public query_simple(i?: number): Query_simpleContext[] | Query_simpleContext | null {
    if (i === undefined) {
      return this.getRuleContexts(Query_simpleContext)
    }

    return this.getRuleContext(i, Query_simpleContext)
  }
  public query_sequence(): Query_sequenceContext[]
  public query_sequence(i: number): Query_sequenceContext | null
  public query_sequence(i?: number): Query_sequenceContext[] | Query_sequenceContext | null {
    if (i === undefined) {
      return this.getRuleContexts(Query_sequenceContext)
    }

    return this.getRuleContext(i, Query_sequenceContext)
  }
  public query_group(): Query_groupContext[]
  public query_group(i: number): Query_groupContext | null
  public query_group(i?: number): Query_groupContext[] | Query_groupContext | null {
    if (i === undefined) {
      return this.getRuleContexts(Query_groupContext)
    }

    return this.getRuleContext(i, Query_groupContext)
  }
  public OR(): TerminalNode[]
  public OR(i: number): TerminalNode | null
  public OR(i?: number): TerminalNode | null | TerminalNode[] {
    if (i === undefined) {
      return this.getTokens(FCSParser.OR)
    } else {
      return this.getToken(FCSParser.OR, i)
    }
  }
  public override get ruleIndex(): number {
    return FCSParser.RULE_query_disjunction
  }
  public override enterRule(listener: FCSParserListener): void {
    if (listener.enterQuery_disjunction) {
      listener.enterQuery_disjunction(this)
    }
  }
  public override exitRule(listener: FCSParserListener): void {
    if (listener.exitQuery_disjunction) {
      listener.exitQuery_disjunction(this)
    }
  }
  public override accept<Result>(visitor: FCSParserVisitor<Result>): Result | null {
    if (visitor.visitQuery_disjunction) {
      return visitor.visitQuery_disjunction(this)
    } else {
      return visitor.visitChildren(this)
    }
  }
}

export class Query_sequenceContext extends ParserRuleContext {
  public constructor(parent: ParserRuleContext | null, invokingState: number) {
    super(parent, invokingState)
  }
  public query_simple(): Query_simpleContext[]
  public query_simple(i: number): Query_simpleContext | null
  public query_simple(i?: number): Query_simpleContext[] | Query_simpleContext | null {
    if (i === undefined) {
      return this.getRuleContexts(Query_simpleContext)
    }

    return this.getRuleContext(i, Query_simpleContext)
  }
  public query_group(): Query_groupContext[]
  public query_group(i: number): Query_groupContext | null
  public query_group(i?: number): Query_groupContext[] | Query_groupContext | null {
    if (i === undefined) {
      return this.getRuleContexts(Query_groupContext)
    }

    return this.getRuleContext(i, Query_groupContext)
  }
  public override get ruleIndex(): number {
    return FCSParser.RULE_query_sequence
  }
  public override enterRule(listener: FCSParserListener): void {
    if (listener.enterQuery_sequence) {
      listener.enterQuery_sequence(this)
    }
  }
  public override exitRule(listener: FCSParserListener): void {
    if (listener.exitQuery_sequence) {
      listener.exitQuery_sequence(this)
    }
  }
  public override accept<Result>(visitor: FCSParserVisitor<Result>): Result | null {
    if (visitor.visitQuery_sequence) {
      return visitor.visitQuery_sequence(this)
    } else {
      return visitor.visitChildren(this)
    }
  }
}

export class Query_groupContext extends ParserRuleContext {
  public constructor(parent: ParserRuleContext | null, invokingState: number) {
    super(parent, invokingState)
  }
  public L_PAREN(): TerminalNode {
    return this.getToken(FCSParser.L_PAREN, 0)!
  }
  public R_PAREN(): TerminalNode {
    return this.getToken(FCSParser.R_PAREN, 0)!
  }
  public query_disjunction(): Query_disjunctionContext | null {
    return this.getRuleContext(0, Query_disjunctionContext)
  }
  public query_sequence(): Query_sequenceContext | null {
    return this.getRuleContext(0, Query_sequenceContext)
  }
  public quantifier(): QuantifierContext | null {
    return this.getRuleContext(0, QuantifierContext)
  }
  public override get ruleIndex(): number {
    return FCSParser.RULE_query_group
  }
  public override enterRule(listener: FCSParserListener): void {
    if (listener.enterQuery_group) {
      listener.enterQuery_group(this)
    }
  }
  public override exitRule(listener: FCSParserListener): void {
    if (listener.exitQuery_group) {
      listener.exitQuery_group(this)
    }
  }
  public override accept<Result>(visitor: FCSParserVisitor<Result>): Result | null {
    if (visitor.visitQuery_group) {
      return visitor.visitQuery_group(this)
    } else {
      return visitor.visitChildren(this)
    }
  }
}

export class Query_simpleContext extends ParserRuleContext {
  public constructor(parent: ParserRuleContext | null, invokingState: number) {
    super(parent, invokingState)
  }
  public query_implicit(): Query_implicitContext | null {
    return this.getRuleContext(0, Query_implicitContext)
  }
  public query_segment(): Query_segmentContext | null {
    return this.getRuleContext(0, Query_segmentContext)
  }
  public quantifier(): QuantifierContext | null {
    return this.getRuleContext(0, QuantifierContext)
  }
  public override get ruleIndex(): number {
    return FCSParser.RULE_query_simple
  }
  public override enterRule(listener: FCSParserListener): void {
    if (listener.enterQuery_simple) {
      listener.enterQuery_simple(this)
    }
  }
  public override exitRule(listener: FCSParserListener): void {
    if (listener.exitQuery_simple) {
      listener.exitQuery_simple(this)
    }
  }
  public override accept<Result>(visitor: FCSParserVisitor<Result>): Result | null {
    if (visitor.visitQuery_simple) {
      return visitor.visitQuery_simple(this)
    } else {
      return visitor.visitChildren(this)
    }
  }
}

export class QuantifierContext extends ParserRuleContext {
  public constructor(parent: ParserRuleContext | null, invokingState: number) {
    super(parent, invokingState)
  }
  public Q_ONE_OR_MORE(): TerminalNode | null {
    return this.getToken(FCSParser.Q_ONE_OR_MORE, 0)
  }
  public Q_ZERO_OR_MORE(): TerminalNode | null {
    return this.getToken(FCSParser.Q_ZERO_OR_MORE, 0)
  }
  public Q_ZERO_OR_ONE(): TerminalNode | null {
    return this.getToken(FCSParser.Q_ZERO_OR_ONE, 0)
  }
  public L_CURLY_BRACKET(): TerminalNode | null {
    return this.getToken(FCSParser.L_CURLY_BRACKET, 0)
  }
  public R_CURLY_BRACKET(): TerminalNode | null {
    return this.getToken(FCSParser.R_CURLY_BRACKET, 0)
  }
  public INTEGER(): TerminalNode[]
  public INTEGER(i: number): TerminalNode | null
  public INTEGER(i?: number): TerminalNode | null | TerminalNode[] {
    if (i === undefined) {
      return this.getTokens(FCSParser.INTEGER)
    } else {
      return this.getToken(FCSParser.INTEGER, i)
    }
  }
  public Q_COMMA(): TerminalNode | null {
    return this.getToken(FCSParser.Q_COMMA, 0)
  }
  public override get ruleIndex(): number {
    return FCSParser.RULE_quantifier
  }
  public override enterRule(listener: FCSParserListener): void {
    if (listener.enterQuantifier) {
      listener.enterQuantifier(this)
    }
  }
  public override exitRule(listener: FCSParserListener): void {
    if (listener.exitQuantifier) {
      listener.exitQuantifier(this)
    }
  }
  public override accept<Result>(visitor: FCSParserVisitor<Result>): Result | null {
    if (visitor.visitQuantifier) {
      return visitor.visitQuantifier(this)
    } else {
      return visitor.visitChildren(this)
    }
  }
}

export class Query_implicitContext extends ParserRuleContext {
  public constructor(parent: ParserRuleContext | null, invokingState: number) {
    super(parent, invokingState)
  }
  public regexp(): RegexpContext {
    return this.getRuleContext(0, RegexpContext)!
  }
  public override get ruleIndex(): number {
    return FCSParser.RULE_query_implicit
  }
  public override enterRule(listener: FCSParserListener): void {
    if (listener.enterQuery_implicit) {
      listener.enterQuery_implicit(this)
    }
  }
  public override exitRule(listener: FCSParserListener): void {
    if (listener.exitQuery_implicit) {
      listener.exitQuery_implicit(this)
    }
  }
  public override accept<Result>(visitor: FCSParserVisitor<Result>): Result | null {
    if (visitor.visitQuery_implicit) {
      return visitor.visitQuery_implicit(this)
    } else {
      return visitor.visitChildren(this)
    }
  }
}

export class Query_segmentContext extends ParserRuleContext {
  public constructor(parent: ParserRuleContext | null, invokingState: number) {
    super(parent, invokingState)
  }
  public L_SQUARE_BRACKET(): TerminalNode {
    return this.getToken(FCSParser.L_SQUARE_BRACKET, 0)!
  }
  public R_SQUARE_BRACKET(): TerminalNode {
    return this.getToken(FCSParser.R_SQUARE_BRACKET, 0)!
  }
  public expression(): ExpressionContext | null {
    return this.getRuleContext(0, ExpressionContext)
  }
  public override get ruleIndex(): number {
    return FCSParser.RULE_query_segment
  }
  public override enterRule(listener: FCSParserListener): void {
    if (listener.enterQuery_segment) {
      listener.enterQuery_segment(this)
    }
  }
  public override exitRule(listener: FCSParserListener): void {
    if (listener.exitQuery_segment) {
      listener.exitQuery_segment(this)
    }
  }
  public override accept<Result>(visitor: FCSParserVisitor<Result>): Result | null {
    if (visitor.visitQuery_segment) {
      return visitor.visitQuery_segment(this)
    } else {
      return visitor.visitChildren(this)
    }
  }
}

export class Within_partContext extends ParserRuleContext {
  public constructor(parent: ParserRuleContext | null, invokingState: number) {
    super(parent, invokingState)
  }
  public within_part_simple(): Within_part_simpleContext {
    return this.getRuleContext(0, Within_part_simpleContext)!
  }
  public override get ruleIndex(): number {
    return FCSParser.RULE_within_part
  }
  public override enterRule(listener: FCSParserListener): void {
    if (listener.enterWithin_part) {
      listener.enterWithin_part(this)
    }
  }
  public override exitRule(listener: FCSParserListener): void {
    if (listener.exitWithin_part) {
      listener.exitWithin_part(this)
    }
  }
  public override accept<Result>(visitor: FCSParserVisitor<Result>): Result | null {
    if (visitor.visitWithin_part) {
      return visitor.visitWithin_part(this)
    } else {
      return visitor.visitChildren(this)
    }
  }
}

export class Within_part_simpleContext extends ParserRuleContext {
  public constructor(parent: ParserRuleContext | null, invokingState: number) {
    super(parent, invokingState)
  }
  public SIMPLE_WITHIN_SCOPE(): TerminalNode {
    return this.getToken(FCSParser.SIMPLE_WITHIN_SCOPE, 0)!
  }
  public override get ruleIndex(): number {
    return FCSParser.RULE_within_part_simple
  }
  public override enterRule(listener: FCSParserListener): void {
    if (listener.enterWithin_part_simple) {
      listener.enterWithin_part_simple(this)
    }
  }
  public override exitRule(listener: FCSParserListener): void {
    if (listener.exitWithin_part_simple) {
      listener.exitWithin_part_simple(this)
    }
  }
  public override accept<Result>(visitor: FCSParserVisitor<Result>): Result | null {
    if (visitor.visitWithin_part_simple) {
      return visitor.visitWithin_part_simple(this)
    } else {
      return visitor.visitChildren(this)
    }
  }
}

export class ExpressionContext extends ParserRuleContext {
  public constructor(parent: ParserRuleContext | null, invokingState: number) {
    super(parent, invokingState)
  }
  public expression_basic(): Expression_basicContext | null {
    return this.getRuleContext(0, Expression_basicContext)
  }
  public expression_group(): Expression_groupContext | null {
    return this.getRuleContext(0, Expression_groupContext)
  }
  public expression_or(): Expression_orContext | null {
    return this.getRuleContext(0, Expression_orContext)
  }
  public expression_and(): Expression_andContext | null {
    return this.getRuleContext(0, Expression_andContext)
  }
  public expression_not(): Expression_notContext | null {
    return this.getRuleContext(0, Expression_notContext)
  }
  public override get ruleIndex(): number {
    return FCSParser.RULE_expression
  }
  public override enterRule(listener: FCSParserListener): void {
    if (listener.enterExpression) {
      listener.enterExpression(this)
    }
  }
  public override exitRule(listener: FCSParserListener): void {
    if (listener.exitExpression) {
      listener.exitExpression(this)
    }
  }
  public override accept<Result>(visitor: FCSParserVisitor<Result>): Result | null {
    if (visitor.visitExpression) {
      return visitor.visitExpression(this)
    } else {
      return visitor.visitChildren(this)
    }
  }
}

export class Expression_orContext extends ParserRuleContext {
  public constructor(parent: ParserRuleContext | null, invokingState: number) {
    super(parent, invokingState)
  }
  public expression_basic(): Expression_basicContext[]
  public expression_basic(i: number): Expression_basicContext | null
  public expression_basic(i?: number): Expression_basicContext[] | Expression_basicContext | null {
    if (i === undefined) {
      return this.getRuleContexts(Expression_basicContext)
    }

    return this.getRuleContext(i, Expression_basicContext)
  }
  public expression_group(): Expression_groupContext[]
  public expression_group(i: number): Expression_groupContext | null
  public expression_group(i?: number): Expression_groupContext[] | Expression_groupContext | null {
    if (i === undefined) {
      return this.getRuleContexts(Expression_groupContext)
    }

    return this.getRuleContext(i, Expression_groupContext)
  }
  public expression_and(): Expression_andContext[]
  public expression_and(i: number): Expression_andContext | null
  public expression_and(i?: number): Expression_andContext[] | Expression_andContext | null {
    if (i === undefined) {
      return this.getRuleContexts(Expression_andContext)
    }

    return this.getRuleContext(i, Expression_andContext)
  }
  public expression_not(): Expression_notContext[]
  public expression_not(i: number): Expression_notContext | null
  public expression_not(i?: number): Expression_notContext[] | Expression_notContext | null {
    if (i === undefined) {
      return this.getRuleContexts(Expression_notContext)
    }

    return this.getRuleContext(i, Expression_notContext)
  }
  public OR(): TerminalNode[]
  public OR(i: number): TerminalNode | null
  public OR(i?: number): TerminalNode | null | TerminalNode[] {
    if (i === undefined) {
      return this.getTokens(FCSParser.OR)
    } else {
      return this.getToken(FCSParser.OR, i)
    }
  }
  public override get ruleIndex(): number {
    return FCSParser.RULE_expression_or
  }
  public override enterRule(listener: FCSParserListener): void {
    if (listener.enterExpression_or) {
      listener.enterExpression_or(this)
    }
  }
  public override exitRule(listener: FCSParserListener): void {
    if (listener.exitExpression_or) {
      listener.exitExpression_or(this)
    }
  }
  public override accept<Result>(visitor: FCSParserVisitor<Result>): Result | null {
    if (visitor.visitExpression_or) {
      return visitor.visitExpression_or(this)
    } else {
      return visitor.visitChildren(this)
    }
  }
}

export class Expression_andContext extends ParserRuleContext {
  public constructor(parent: ParserRuleContext | null, invokingState: number) {
    super(parent, invokingState)
  }
  public expression_basic(): Expression_basicContext[]
  public expression_basic(i: number): Expression_basicContext | null
  public expression_basic(i?: number): Expression_basicContext[] | Expression_basicContext | null {
    if (i === undefined) {
      return this.getRuleContexts(Expression_basicContext)
    }

    return this.getRuleContext(i, Expression_basicContext)
  }
  public expression_group(): Expression_groupContext[]
  public expression_group(i: number): Expression_groupContext | null
  public expression_group(i?: number): Expression_groupContext[] | Expression_groupContext | null {
    if (i === undefined) {
      return this.getRuleContexts(Expression_groupContext)
    }

    return this.getRuleContext(i, Expression_groupContext)
  }
  public expression_not(): Expression_notContext[]
  public expression_not(i: number): Expression_notContext | null
  public expression_not(i?: number): Expression_notContext[] | Expression_notContext | null {
    if (i === undefined) {
      return this.getRuleContexts(Expression_notContext)
    }

    return this.getRuleContext(i, Expression_notContext)
  }
  public AND(): TerminalNode[]
  public AND(i: number): TerminalNode | null
  public AND(i?: number): TerminalNode | null | TerminalNode[] {
    if (i === undefined) {
      return this.getTokens(FCSParser.AND)
    } else {
      return this.getToken(FCSParser.AND, i)
    }
  }
  public expression_or(): Expression_orContext[]
  public expression_or(i: number): Expression_orContext | null
  public expression_or(i?: number): Expression_orContext[] | Expression_orContext | null {
    if (i === undefined) {
      return this.getRuleContexts(Expression_orContext)
    }

    return this.getRuleContext(i, Expression_orContext)
  }
  public override get ruleIndex(): number {
    return FCSParser.RULE_expression_and
  }
  public override enterRule(listener: FCSParserListener): void {
    if (listener.enterExpression_and) {
      listener.enterExpression_and(this)
    }
  }
  public override exitRule(listener: FCSParserListener): void {
    if (listener.exitExpression_and) {
      listener.exitExpression_and(this)
    }
  }
  public override accept<Result>(visitor: FCSParserVisitor<Result>): Result | null {
    if (visitor.visitExpression_and) {
      return visitor.visitExpression_and(this)
    } else {
      return visitor.visitChildren(this)
    }
  }
}

export class Expression_groupContext extends ParserRuleContext {
  public constructor(parent: ParserRuleContext | null, invokingState: number) {
    super(parent, invokingState)
  }
  public L_PAREN(): TerminalNode {
    return this.getToken(FCSParser.L_PAREN, 0)!
  }
  public R_PAREN(): TerminalNode {
    return this.getToken(FCSParser.R_PAREN, 0)!
  }
  public expression_basic(): Expression_basicContext | null {
    return this.getRuleContext(0, Expression_basicContext)
  }
  public expression_group(): Expression_groupContext | null {
    return this.getRuleContext(0, Expression_groupContext)
  }
  public expression_or(): Expression_orContext | null {
    return this.getRuleContext(0, Expression_orContext)
  }
  public expression_and(): Expression_andContext | null {
    return this.getRuleContext(0, Expression_andContext)
  }
  public expression_not(): Expression_notContext | null {
    return this.getRuleContext(0, Expression_notContext)
  }
  public override get ruleIndex(): number {
    return FCSParser.RULE_expression_group
  }
  public override enterRule(listener: FCSParserListener): void {
    if (listener.enterExpression_group) {
      listener.enterExpression_group(this)
    }
  }
  public override exitRule(listener: FCSParserListener): void {
    if (listener.exitExpression_group) {
      listener.exitExpression_group(this)
    }
  }
  public override accept<Result>(visitor: FCSParserVisitor<Result>): Result | null {
    if (visitor.visitExpression_group) {
      return visitor.visitExpression_group(this)
    } else {
      return visitor.visitChildren(this)
    }
  }
}

export class Expression_notContext extends ParserRuleContext {
  public constructor(parent: ParserRuleContext | null, invokingState: number) {
    super(parent, invokingState)
  }
  public NOT(): TerminalNode {
    return this.getToken(FCSParser.NOT, 0)!
  }
  public expression_basic(): Expression_basicContext | null {
    return this.getRuleContext(0, Expression_basicContext)
  }
  public expression_group(): Expression_groupContext | null {
    return this.getRuleContext(0, Expression_groupContext)
  }
  public expression_not(): Expression_notContext | null {
    return this.getRuleContext(0, Expression_notContext)
  }
  public expression_or(): Expression_orContext | null {
    return this.getRuleContext(0, Expression_orContext)
  }
  public expression_and(): Expression_andContext | null {
    return this.getRuleContext(0, Expression_andContext)
  }
  public override get ruleIndex(): number {
    return FCSParser.RULE_expression_not
  }
  public override enterRule(listener: FCSParserListener): void {
    if (listener.enterExpression_not) {
      listener.enterExpression_not(this)
    }
  }
  public override exitRule(listener: FCSParserListener): void {
    if (listener.exitExpression_not) {
      listener.exitExpression_not(this)
    }
  }
  public override accept<Result>(visitor: FCSParserVisitor<Result>): Result | null {
    if (visitor.visitExpression_not) {
      return visitor.visitExpression_not(this)
    } else {
      return visitor.visitChildren(this)
    }
  }
}

export class Expression_basicContext extends ParserRuleContext {
  public constructor(parent: ParserRuleContext | null, invokingState: number) {
    super(parent, invokingState)
  }
  public attribute(): AttributeContext {
    return this.getRuleContext(0, AttributeContext)!
  }
  public regexp(): RegexpContext {
    return this.getRuleContext(0, RegexpContext)!
  }
  public OPERATOR_EQ(): TerminalNode | null {
    return this.getToken(FCSParser.OPERATOR_EQ, 0)
  }
  public OPERATOR_NE(): TerminalNode | null {
    return this.getToken(FCSParser.OPERATOR_NE, 0)
  }
  public override get ruleIndex(): number {
    return FCSParser.RULE_expression_basic
  }
  public override enterRule(listener: FCSParserListener): void {
    if (listener.enterExpression_basic) {
      listener.enterExpression_basic(this)
    }
  }
  public override exitRule(listener: FCSParserListener): void {
    if (listener.exitExpression_basic) {
      listener.exitExpression_basic(this)
    }
  }
  public override accept<Result>(visitor: FCSParserVisitor<Result>): Result | null {
    if (visitor.visitExpression_basic) {
      return visitor.visitExpression_basic(this)
    } else {
      return visitor.visitChildren(this)
    }
  }
}

export class AttributeContext extends ParserRuleContext {
  public constructor(parent: ParserRuleContext | null, invokingState: number) {
    super(parent, invokingState)
  }
  public identifier(): IdentifierContext {
    return this.getRuleContext(0, IdentifierContext)!
  }
  public qualifier(): QualifierContext | null {
    return this.getRuleContext(0, QualifierContext)
  }
  public COLON(): TerminalNode | null {
    return this.getToken(FCSParser.COLON, 0)
  }
  public override get ruleIndex(): number {
    return FCSParser.RULE_attribute
  }
  public override enterRule(listener: FCSParserListener): void {
    if (listener.enterAttribute) {
      listener.enterAttribute(this)
    }
  }
  public override exitRule(listener: FCSParserListener): void {
    if (listener.exitAttribute) {
      listener.exitAttribute(this)
    }
  }
  public override accept<Result>(visitor: FCSParserVisitor<Result>): Result | null {
    if (visitor.visitAttribute) {
      return visitor.visitAttribute(this)
    } else {
      return visitor.visitChildren(this)
    }
  }
}

export class QualifierContext extends ParserRuleContext {
  public constructor(parent: ParserRuleContext | null, invokingState: number) {
    super(parent, invokingState)
  }
  public IDENTIFIER(): TerminalNode | null {
    return this.getToken(FCSParser.IDENTIFIER, 0)
  }
  public WITHIN(): TerminalNode | null {
    return this.getToken(FCSParser.WITHIN, 0)
  }
  public SIMPLE_WITHIN_SCOPE(): TerminalNode | null {
    return this.getToken(FCSParser.SIMPLE_WITHIN_SCOPE, 0)
  }
  public REGEXP_FLAGS(): TerminalNode | null {
    return this.getToken(FCSParser.REGEXP_FLAGS, 0)
  }
  public override get ruleIndex(): number {
    return FCSParser.RULE_qualifier
  }
  public override enterRule(listener: FCSParserListener): void {
    if (listener.enterQualifier) {
      listener.enterQualifier(this)
    }
  }
  public override exitRule(listener: FCSParserListener): void {
    if (listener.exitQualifier) {
      listener.exitQualifier(this)
    }
  }
  public override accept<Result>(visitor: FCSParserVisitor<Result>): Result | null {
    if (visitor.visitQualifier) {
      return visitor.visitQualifier(this)
    } else {
      return visitor.visitChildren(this)
    }
  }
}

export class IdentifierContext extends ParserRuleContext {
  public constructor(parent: ParserRuleContext | null, invokingState: number) {
    super(parent, invokingState)
  }
  public IDENTIFIER(): TerminalNode | null {
    return this.getToken(FCSParser.IDENTIFIER, 0)
  }
  public WITHIN(): TerminalNode | null {
    return this.getToken(FCSParser.WITHIN, 0)
  }
  public SIMPLE_WITHIN_SCOPE(): TerminalNode | null {
    return this.getToken(FCSParser.SIMPLE_WITHIN_SCOPE, 0)
  }
  public REGEXP_FLAGS(): TerminalNode | null {
    return this.getToken(FCSParser.REGEXP_FLAGS, 0)
  }
  public override get ruleIndex(): number {
    return FCSParser.RULE_identifier
  }
  public override enterRule(listener: FCSParserListener): void {
    if (listener.enterIdentifier) {
      listener.enterIdentifier(this)
    }
  }
  public override exitRule(listener: FCSParserListener): void {
    if (listener.exitIdentifier) {
      listener.exitIdentifier(this)
    }
  }
  public override accept<Result>(visitor: FCSParserVisitor<Result>): Result | null {
    if (visitor.visitIdentifier) {
      return visitor.visitIdentifier(this)
    } else {
      return visitor.visitChildren(this)
    }
  }
}

export class RegexpContext extends ParserRuleContext {
  public constructor(parent: ParserRuleContext | null, invokingState: number) {
    super(parent, invokingState)
  }
  public regexp_pattern(): Regexp_patternContext {
    return this.getRuleContext(0, Regexp_patternContext)!
  }
  public FWD_SLASH(): TerminalNode | null {
    return this.getToken(FCSParser.FWD_SLASH, 0)
  }
  public regexp_flag(): Regexp_flagContext | null {
    return this.getRuleContext(0, Regexp_flagContext)
  }
  public override get ruleIndex(): number {
    return FCSParser.RULE_regexp
  }
  public override enterRule(listener: FCSParserListener): void {
    if (listener.enterRegexp) {
      listener.enterRegexp(this)
    }
  }
  public override exitRule(listener: FCSParserListener): void {
    if (listener.exitRegexp) {
      listener.exitRegexp(this)
    }
  }
  public override accept<Result>(visitor: FCSParserVisitor<Result>): Result | null {
    if (visitor.visitRegexp) {
      return visitor.visitRegexp(this)
    } else {
      return visitor.visitChildren(this)
    }
  }
}

export class Regexp_patternContext extends ParserRuleContext {
  public constructor(parent: ParserRuleContext | null, invokingState: number) {
    super(parent, invokingState)
  }
  public REGEXP(): TerminalNode {
    return this.getToken(FCSParser.REGEXP, 0)!
  }
  public override get ruleIndex(): number {
    return FCSParser.RULE_regexp_pattern
  }
  public override enterRule(listener: FCSParserListener): void {
    if (listener.enterRegexp_pattern) {
      listener.enterRegexp_pattern(this)
    }
  }
  public override exitRule(listener: FCSParserListener): void {
    if (listener.exitRegexp_pattern) {
      listener.exitRegexp_pattern(this)
    }
  }
  public override accept<Result>(visitor: FCSParserVisitor<Result>): Result | null {
    if (visitor.visitRegexp_pattern) {
      return visitor.visitRegexp_pattern(this)
    } else {
      return visitor.visitChildren(this)
    }
  }
}

export class Regexp_flagContext extends ParserRuleContext {
  public constructor(parent: ParserRuleContext | null, invokingState: number) {
    super(parent, invokingState)
  }
  public REGEXP_FLAGS(): TerminalNode {
    return this.getToken(FCSParser.REGEXP_FLAGS, 0)!
  }
  public override get ruleIndex(): number {
    return FCSParser.RULE_regexp_flag
  }
  public override enterRule(listener: FCSParserListener): void {
    if (listener.enterRegexp_flag) {
      listener.enterRegexp_flag(this)
    }
  }
  public override exitRule(listener: FCSParserListener): void {
    if (listener.exitRegexp_flag) {
      listener.exitRegexp_flag(this)
    }
  }
  public override accept<Result>(visitor: FCSParserVisitor<Result>): Result | null {
    if (visitor.visitRegexp_flag) {
      return visitor.visitRegexp_flag(this)
    } else {
      return visitor.visitChildren(this)
    }
  }
}
