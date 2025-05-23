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

import { LexParserListener } from './LexParserListener.js'
import { LexParserVisitor } from './LexParserVisitor.js'

export class LexParser extends Parser {
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
  public static readonly RULE_query = 0
  public static readonly RULE_boolean_query = 1
  public static readonly RULE_subquery = 2
  public static readonly RULE_search_clause = 3
  public static readonly RULE_search_term = 4
  public static readonly RULE_index = 5
  public static readonly RULE_relation_modified = 6
  public static readonly RULE_relation = 7
  public static readonly RULE_relation_name = 8
  public static readonly RULE_relation_symbol = 9
  public static readonly RULE_boolean_modified = 10
  public static readonly RULE_r_boolean = 11
  public static readonly RULE_modifier_list = 12
  public static readonly RULE_modifier = 13
  public static readonly RULE_modifier_name = 14
  public static readonly RULE_modifier_relation = 15
  public static readonly RULE_modifier_value = 16
  public static readonly RULE_prefix_name = 17
  public static readonly RULE_prefix = 18
  public static readonly RULE_simple_name = 19

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
  public static readonly ruleNames = [
    'query',
    'boolean_query',
    'subquery',
    'search_clause',
    'search_term',
    'index',
    'relation_modified',
    'relation',
    'relation_name',
    'relation_symbol',
    'boolean_modified',
    'r_boolean',
    'modifier_list',
    'modifier',
    'modifier_name',
    'modifier_relation',
    'modifier_value',
    'prefix_name',
    'prefix',
    'simple_name',
  ]

  public get grammarFileName(): string {
    return 'LexParser.g4'
  }
  public get literalNames(): (string | null)[] {
    return LexParser.literalNames
  }
  public get symbolicNames(): (string | null)[] {
    return LexParser.symbolicNames
  }
  public get ruleNames(): string[] {
    return LexParser.ruleNames
  }
  public get serializedATN(): number[] {
    return LexParser._serializedATN
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
      LexParser._ATN,
      LexParser.decisionsToDFA,
      new PredictionContextCache()
    )
  }
  public query(): QueryContext {
    const localContext = new QueryContext(this.context, this.state)
    this.enterRule(localContext, 0, LexParser.RULE_query)
    try {
      this.enterOuterAlt(localContext, 1)
      {
        this.state = 40
        this.boolean_query()
        this.state = 41
        this.match(LexParser.EOF)
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
  public boolean_query(): Boolean_queryContext {
    const localContext = new Boolean_queryContext(this.context, this.state)
    this.enterRule(localContext, 2, LexParser.RULE_boolean_query)
    let _la: number
    try {
      this.enterOuterAlt(localContext, 1)
      {
        this.state = 43
        this.subquery()
        this.state = 49
        this.errorHandler.sync(this)
        _la = this.tokenStream.LA(1)
        while ((_la & ~0x1f) === 0 && ((1 << _la) & 14336) !== 0) {
          {
            {
              this.state = 44
              this.boolean_modified()
              this.state = 45
              this.subquery()
            }
          }
          this.state = 51
          this.errorHandler.sync(this)
          _la = this.tokenStream.LA(1)
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
  public subquery(): SubqueryContext {
    const localContext = new SubqueryContext(this.context, this.state)
    this.enterRule(localContext, 4, LexParser.RULE_subquery)
    try {
      this.state = 57
      this.errorHandler.sync(this)
      switch (this.tokenStream.LA(1)) {
        case LexParser.L_PAREN:
          this.enterOuterAlt(localContext, 1)
          {
            this.state = 52
            this.match(LexParser.L_PAREN)
            this.state = 53
            this.boolean_query()
            this.state = 54
            this.match(LexParser.R_PAREN)
          }
          break
        case LexParser.QUOTED_STRING:
        case LexParser.SIMPLE_STRING:
          this.enterOuterAlt(localContext, 2)
          {
            this.state = 56
            this.search_clause()
          }
          break
        default:
          throw new NoViableAltException(this)
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
  public search_clause(): Search_clauseContext {
    const localContext = new Search_clauseContext(this.context, this.state)
    this.enterRule(localContext, 6, LexParser.RULE_search_clause)
    try {
      this.enterOuterAlt(localContext, 1)
      {
        this.state = 62
        this.errorHandler.sync(this)
        switch (this.interpreter.adaptivePredict(this.tokenStream, 2, this.context)) {
          case 1:
            {
              this.state = 59
              this.index()
              this.state = 60
              this.relation_modified()
            }
            break
        }
        this.state = 64
        this.search_term()
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
  public search_term(): Search_termContext {
    const localContext = new Search_termContext(this.context, this.state)
    this.enterRule(localContext, 8, LexParser.RULE_search_term)
    let _la: number
    try {
      this.enterOuterAlt(localContext, 1)
      {
        this.state = 66
        _la = this.tokenStream.LA(1)
        if (!(_la === 15 || _la === 16)) {
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
  public index(): IndexContext {
    const localContext = new IndexContext(this.context, this.state)
    this.enterRule(localContext, 10, LexParser.RULE_index)
    try {
      this.state = 70
      this.errorHandler.sync(this)
      switch (this.interpreter.adaptivePredict(this.tokenStream, 3, this.context)) {
        case 1:
          this.enterOuterAlt(localContext, 1)
          {
            this.state = 68
            this.simple_name()
          }
          break
        case 2:
          this.enterOuterAlt(localContext, 2)
          {
            this.state = 69
            this.prefix_name()
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
  public relation_modified(): Relation_modifiedContext {
    const localContext = new Relation_modifiedContext(this.context, this.state)
    this.enterRule(localContext, 12, LexParser.RULE_relation_modified)
    let _la: number
    try {
      this.enterOuterAlt(localContext, 1)
      {
        this.state = 72
        this.relation()
        this.state = 74
        this.errorHandler.sync(this)
        _la = this.tokenStream.LA(1)
        if (_la === 10) {
          {
            this.state = 73
            this.modifier_list()
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
  public relation(): RelationContext {
    const localContext = new RelationContext(this.context, this.state)
    this.enterRule(localContext, 14, LexParser.RULE_relation)
    try {
      this.state = 78
      this.errorHandler.sync(this)
      switch (this.tokenStream.LA(1)) {
        case LexParser.SIMPLE_STRING:
          this.enterOuterAlt(localContext, 1)
          {
            this.state = 76
            this.relation_name()
          }
          break
        case LexParser.EQUAL:
        case LexParser.GREATER:
        case LexParser.LESSER:
        case LexParser.GREATER_EQUAL:
        case LexParser.LESSER_EQUAL:
        case LexParser.NOT_EQUAL:
        case LexParser.EQUAL_EQUAL:
          this.enterOuterAlt(localContext, 2)
          {
            this.state = 77
            this.relation_symbol()
          }
          break
        default:
          throw new NoViableAltException(this)
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
  public relation_name(): Relation_nameContext {
    const localContext = new Relation_nameContext(this.context, this.state)
    this.enterRule(localContext, 16, LexParser.RULE_relation_name)
    try {
      this.state = 82
      this.errorHandler.sync(this)
      switch (this.interpreter.adaptivePredict(this.tokenStream, 6, this.context)) {
        case 1:
          this.enterOuterAlt(localContext, 1)
          {
            this.state = 80
            this.simple_name()
          }
          break
        case 2:
          this.enterOuterAlt(localContext, 2)
          {
            this.state = 81
            this.prefix_name()
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
  public relation_symbol(): Relation_symbolContext {
    const localContext = new Relation_symbolContext(this.context, this.state)
    this.enterRule(localContext, 18, LexParser.RULE_relation_symbol)
    let _la: number
    try {
      this.enterOuterAlt(localContext, 1)
      {
        this.state = 84
        _la = this.tokenStream.LA(1)
        if (!((_la & ~0x1f) === 0 && ((1 << _la) & 1016) !== 0)) {
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
  public boolean_modified(): Boolean_modifiedContext {
    const localContext = new Boolean_modifiedContext(this.context, this.state)
    this.enterRule(localContext, 20, LexParser.RULE_boolean_modified)
    let _la: number
    try {
      this.enterOuterAlt(localContext, 1)
      {
        this.state = 86
        this.r_boolean()
        this.state = 88
        this.errorHandler.sync(this)
        _la = this.tokenStream.LA(1)
        if (_la === 10) {
          {
            this.state = 87
            this.modifier_list()
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
  public r_boolean(): R_booleanContext {
    const localContext = new R_booleanContext(this.context, this.state)
    this.enterRule(localContext, 22, LexParser.RULE_r_boolean)
    let _la: number
    try {
      this.enterOuterAlt(localContext, 1)
      {
        this.state = 90
        _la = this.tokenStream.LA(1)
        if (!((_la & ~0x1f) === 0 && ((1 << _la) & 14336) !== 0)) {
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
  public modifier_list(): Modifier_listContext {
    const localContext = new Modifier_listContext(this.context, this.state)
    this.enterRule(localContext, 24, LexParser.RULE_modifier_list)
    let _la: number
    try {
      this.enterOuterAlt(localContext, 1)
      {
        this.state = 93
        this.errorHandler.sync(this)
        _la = this.tokenStream.LA(1)
        do {
          {
            {
              this.state = 92
              this.modifier()
            }
          }
          this.state = 95
          this.errorHandler.sync(this)
          _la = this.tokenStream.LA(1)
        } while (_la === 10)
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
  public modifier(): ModifierContext {
    const localContext = new ModifierContext(this.context, this.state)
    this.enterRule(localContext, 26, LexParser.RULE_modifier)
    let _la: number
    try {
      this.enterOuterAlt(localContext, 1)
      {
        this.state = 97
        this.match(LexParser.SLASH)
        this.state = 98
        this.modifier_name()
        this.state = 100
        this.errorHandler.sync(this)
        _la = this.tokenStream.LA(1)
        if ((_la & ~0x1f) === 0 && ((1 << _la) & 1016) !== 0) {
          {
            this.state = 99
            this.modifier_relation()
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
  public modifier_name(): Modifier_nameContext {
    const localContext = new Modifier_nameContext(this.context, this.state)
    this.enterRule(localContext, 28, LexParser.RULE_modifier_name)
    try {
      this.enterOuterAlt(localContext, 1)
      {
        this.state = 102
        this.simple_name()
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
  public modifier_relation(): Modifier_relationContext {
    const localContext = new Modifier_relationContext(this.context, this.state)
    this.enterRule(localContext, 30, LexParser.RULE_modifier_relation)
    try {
      this.enterOuterAlt(localContext, 1)
      {
        this.state = 104
        this.relation_symbol()
        this.state = 105
        this.modifier_value()
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
  public modifier_value(): Modifier_valueContext {
    const localContext = new Modifier_valueContext(this.context, this.state)
    this.enterRule(localContext, 32, LexParser.RULE_modifier_value)
    let _la: number
    try {
      this.enterOuterAlt(localContext, 1)
      {
        this.state = 107
        _la = this.tokenStream.LA(1)
        if (!(_la === 15 || _la === 16)) {
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
  public prefix_name(): Prefix_nameContext {
    const localContext = new Prefix_nameContext(this.context, this.state)
    this.enterRule(localContext, 34, LexParser.RULE_prefix_name)
    try {
      this.enterOuterAlt(localContext, 1)
      {
        this.state = 109
        this.prefix()
        this.state = 110
        this.match(LexParser.DOT)
        this.state = 111
        this.simple_name()
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
  public prefix(): PrefixContext {
    const localContext = new PrefixContext(this.context, this.state)
    this.enterRule(localContext, 36, LexParser.RULE_prefix)
    try {
      this.enterOuterAlt(localContext, 1)
      {
        this.state = 113
        this.simple_name()
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
  public simple_name(): Simple_nameContext {
    const localContext = new Simple_nameContext(this.context, this.state)
    this.enterRule(localContext, 38, LexParser.RULE_simple_name)
    try {
      this.enterOuterAlt(localContext, 1)
      {
        this.state = 115
        this.match(LexParser.SIMPLE_STRING)
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
    4, 1, 17, 118, 2, 0, 7, 0, 2, 1, 7, 1, 2, 2, 7, 2, 2, 3, 7, 3, 2, 4, 7, 4, 2, 5, 7, 5, 2, 6, 7,
    6, 2, 7, 7, 7, 2, 8, 7, 8, 2, 9, 7, 9, 2, 10, 7, 10, 2, 11, 7, 11, 2, 12, 7, 12, 2, 13, 7, 13,
    2, 14, 7, 14, 2, 15, 7, 15, 2, 16, 7, 16, 2, 17, 7, 17, 2, 18, 7, 18, 2, 19, 7, 19, 1, 0, 1, 0,
    1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 5, 1, 48, 8, 1, 10, 1, 12, 1, 51, 9, 1, 1, 2, 1, 2, 1, 2, 1, 2, 1,
    2, 3, 2, 58, 8, 2, 1, 3, 1, 3, 1, 3, 3, 3, 63, 8, 3, 1, 3, 1, 3, 1, 4, 1, 4, 1, 5, 1, 5, 3, 5,
    71, 8, 5, 1, 6, 1, 6, 3, 6, 75, 8, 6, 1, 7, 1, 7, 3, 7, 79, 8, 7, 1, 8, 1, 8, 3, 8, 83, 8, 8, 1,
    9, 1, 9, 1, 10, 1, 10, 3, 10, 89, 8, 10, 1, 11, 1, 11, 1, 12, 4, 12, 94, 8, 12, 11, 12, 12, 12,
    95, 1, 13, 1, 13, 1, 13, 3, 13, 101, 8, 13, 1, 14, 1, 14, 1, 15, 1, 15, 1, 15, 1, 16, 1, 16, 1,
    17, 1, 17, 1, 17, 1, 17, 1, 18, 1, 18, 1, 19, 1, 19, 1, 19, 0, 0, 20, 0, 2, 4, 6, 8, 10, 12, 14,
    16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 0, 3, 1, 0, 15, 16, 1, 0, 3, 9, 1, 0, 11, 13,
    107, 0, 40, 1, 0, 0, 0, 2, 43, 1, 0, 0, 0, 4, 57, 1, 0, 0, 0, 6, 62, 1, 0, 0, 0, 8, 66, 1, 0, 0,
    0, 10, 70, 1, 0, 0, 0, 12, 72, 1, 0, 0, 0, 14, 78, 1, 0, 0, 0, 16, 82, 1, 0, 0, 0, 18, 84, 1, 0,
    0, 0, 20, 86, 1, 0, 0, 0, 22, 90, 1, 0, 0, 0, 24, 93, 1, 0, 0, 0, 26, 97, 1, 0, 0, 0, 28, 102,
    1, 0, 0, 0, 30, 104, 1, 0, 0, 0, 32, 107, 1, 0, 0, 0, 34, 109, 1, 0, 0, 0, 36, 113, 1, 0, 0, 0,
    38, 115, 1, 0, 0, 0, 40, 41, 3, 2, 1, 0, 41, 42, 5, 0, 0, 1, 42, 1, 1, 0, 0, 0, 43, 49, 3, 4, 2,
    0, 44, 45, 3, 20, 10, 0, 45, 46, 3, 4, 2, 0, 46, 48, 1, 0, 0, 0, 47, 44, 1, 0, 0, 0, 48, 51, 1,
    0, 0, 0, 49, 47, 1, 0, 0, 0, 49, 50, 1, 0, 0, 0, 50, 3, 1, 0, 0, 0, 51, 49, 1, 0, 0, 0, 52, 53,
    5, 1, 0, 0, 53, 54, 3, 2, 1, 0, 54, 55, 5, 2, 0, 0, 55, 58, 1, 0, 0, 0, 56, 58, 3, 6, 3, 0, 57,
    52, 1, 0, 0, 0, 57, 56, 1, 0, 0, 0, 58, 5, 1, 0, 0, 0, 59, 60, 3, 10, 5, 0, 60, 61, 3, 12, 6, 0,
    61, 63, 1, 0, 0, 0, 62, 59, 1, 0, 0, 0, 62, 63, 1, 0, 0, 0, 63, 64, 1, 0, 0, 0, 64, 65, 3, 8, 4,
    0, 65, 7, 1, 0, 0, 0, 66, 67, 7, 0, 0, 0, 67, 9, 1, 0, 0, 0, 68, 71, 3, 38, 19, 0, 69, 71, 3,
    34, 17, 0, 70, 68, 1, 0, 0, 0, 70, 69, 1, 0, 0, 0, 71, 11, 1, 0, 0, 0, 72, 74, 3, 14, 7, 0, 73,
    75, 3, 24, 12, 0, 74, 73, 1, 0, 0, 0, 74, 75, 1, 0, 0, 0, 75, 13, 1, 0, 0, 0, 76, 79, 3, 16, 8,
    0, 77, 79, 3, 18, 9, 0, 78, 76, 1, 0, 0, 0, 78, 77, 1, 0, 0, 0, 79, 15, 1, 0, 0, 0, 80, 83, 3,
    38, 19, 0, 81, 83, 3, 34, 17, 0, 82, 80, 1, 0, 0, 0, 82, 81, 1, 0, 0, 0, 83, 17, 1, 0, 0, 0, 84,
    85, 7, 1, 0, 0, 85, 19, 1, 0, 0, 0, 86, 88, 3, 22, 11, 0, 87, 89, 3, 24, 12, 0, 88, 87, 1, 0, 0,
    0, 88, 89, 1, 0, 0, 0, 89, 21, 1, 0, 0, 0, 90, 91, 7, 2, 0, 0, 91, 23, 1, 0, 0, 0, 92, 94, 3,
    26, 13, 0, 93, 92, 1, 0, 0, 0, 94, 95, 1, 0, 0, 0, 95, 93, 1, 0, 0, 0, 95, 96, 1, 0, 0, 0, 96,
    25, 1, 0, 0, 0, 97, 98, 5, 10, 0, 0, 98, 100, 3, 28, 14, 0, 99, 101, 3, 30, 15, 0, 100, 99, 1,
    0, 0, 0, 100, 101, 1, 0, 0, 0, 101, 27, 1, 0, 0, 0, 102, 103, 3, 38, 19, 0, 103, 29, 1, 0, 0, 0,
    104, 105, 3, 18, 9, 0, 105, 106, 3, 32, 16, 0, 106, 31, 1, 0, 0, 0, 107, 108, 7, 0, 0, 0, 108,
    33, 1, 0, 0, 0, 109, 110, 3, 36, 18, 0, 110, 111, 5, 14, 0, 0, 111, 112, 3, 38, 19, 0, 112, 35,
    1, 0, 0, 0, 113, 114, 3, 38, 19, 0, 114, 37, 1, 0, 0, 0, 115, 116, 5, 16, 0, 0, 116, 39, 1, 0,
    0, 0, 10, 49, 57, 62, 70, 74, 78, 82, 88, 95, 100,
  ]

  private static __ATN: ATN
  public static get _ATN(): ATN {
    if (!LexParser.__ATN) {
      LexParser.__ATN = new ATNDeserializer().deserialize(LexParser._serializedATN)
    }

    return LexParser.__ATN
  }

  private static readonly vocabulary = new Vocabulary(
    LexParser.literalNames,
    LexParser.symbolicNames,
    []
  )

  public override get vocabulary(): Vocabulary {
    return LexParser.vocabulary
  }

  private static readonly decisionsToDFA = LexParser._ATN.decisionToState.map(
    (ds: DecisionState, index: number) => new DFA(ds, index)
  )
}

export class QueryContext extends ParserRuleContext {
  public constructor(parent: ParserRuleContext | null, invokingState: number) {
    super(parent, invokingState)
  }
  public boolean_query(): Boolean_queryContext {
    return this.getRuleContext(0, Boolean_queryContext)!
  }
  public EOF(): TerminalNode {
    return this.getToken(LexParser.EOF, 0)!
  }
  public override get ruleIndex(): number {
    return LexParser.RULE_query
  }
  public override enterRule(listener: LexParserListener): void {
    if (listener.enterQuery) {
      listener.enterQuery(this)
    }
  }
  public override exitRule(listener: LexParserListener): void {
    if (listener.exitQuery) {
      listener.exitQuery(this)
    }
  }
  public override accept<Result>(visitor: LexParserVisitor<Result>): Result | null {
    if (visitor.visitQuery) {
      return visitor.visitQuery(this)
    } else {
      return visitor.visitChildren(this)
    }
  }
}

export class Boolean_queryContext extends ParserRuleContext {
  public constructor(parent: ParserRuleContext | null, invokingState: number) {
    super(parent, invokingState)
  }
  public subquery(): SubqueryContext[]
  public subquery(i: number): SubqueryContext | null
  public subquery(i?: number): SubqueryContext[] | SubqueryContext | null {
    if (i === undefined) {
      return this.getRuleContexts(SubqueryContext)
    }

    return this.getRuleContext(i, SubqueryContext)
  }
  public boolean_modified(): Boolean_modifiedContext[]
  public boolean_modified(i: number): Boolean_modifiedContext | null
  public boolean_modified(i?: number): Boolean_modifiedContext[] | Boolean_modifiedContext | null {
    if (i === undefined) {
      return this.getRuleContexts(Boolean_modifiedContext)
    }

    return this.getRuleContext(i, Boolean_modifiedContext)
  }
  public override get ruleIndex(): number {
    return LexParser.RULE_boolean_query
  }
  public override enterRule(listener: LexParserListener): void {
    if (listener.enterBoolean_query) {
      listener.enterBoolean_query(this)
    }
  }
  public override exitRule(listener: LexParserListener): void {
    if (listener.exitBoolean_query) {
      listener.exitBoolean_query(this)
    }
  }
  public override accept<Result>(visitor: LexParserVisitor<Result>): Result | null {
    if (visitor.visitBoolean_query) {
      return visitor.visitBoolean_query(this)
    } else {
      return visitor.visitChildren(this)
    }
  }
}

export class SubqueryContext extends ParserRuleContext {
  public constructor(parent: ParserRuleContext | null, invokingState: number) {
    super(parent, invokingState)
  }
  public L_PAREN(): TerminalNode | null {
    return this.getToken(LexParser.L_PAREN, 0)
  }
  public boolean_query(): Boolean_queryContext | null {
    return this.getRuleContext(0, Boolean_queryContext)
  }
  public R_PAREN(): TerminalNode | null {
    return this.getToken(LexParser.R_PAREN, 0)
  }
  public search_clause(): Search_clauseContext | null {
    return this.getRuleContext(0, Search_clauseContext)
  }
  public override get ruleIndex(): number {
    return LexParser.RULE_subquery
  }
  public override enterRule(listener: LexParserListener): void {
    if (listener.enterSubquery) {
      listener.enterSubquery(this)
    }
  }
  public override exitRule(listener: LexParserListener): void {
    if (listener.exitSubquery) {
      listener.exitSubquery(this)
    }
  }
  public override accept<Result>(visitor: LexParserVisitor<Result>): Result | null {
    if (visitor.visitSubquery) {
      return visitor.visitSubquery(this)
    } else {
      return visitor.visitChildren(this)
    }
  }
}

export class Search_clauseContext extends ParserRuleContext {
  public constructor(parent: ParserRuleContext | null, invokingState: number) {
    super(parent, invokingState)
  }
  public search_term(): Search_termContext {
    return this.getRuleContext(0, Search_termContext)!
  }
  public index(): IndexContext | null {
    return this.getRuleContext(0, IndexContext)
  }
  public relation_modified(): Relation_modifiedContext | null {
    return this.getRuleContext(0, Relation_modifiedContext)
  }
  public override get ruleIndex(): number {
    return LexParser.RULE_search_clause
  }
  public override enterRule(listener: LexParserListener): void {
    if (listener.enterSearch_clause) {
      listener.enterSearch_clause(this)
    }
  }
  public override exitRule(listener: LexParserListener): void {
    if (listener.exitSearch_clause) {
      listener.exitSearch_clause(this)
    }
  }
  public override accept<Result>(visitor: LexParserVisitor<Result>): Result | null {
    if (visitor.visitSearch_clause) {
      return visitor.visitSearch_clause(this)
    } else {
      return visitor.visitChildren(this)
    }
  }
}

export class Search_termContext extends ParserRuleContext {
  public constructor(parent: ParserRuleContext | null, invokingState: number) {
    super(parent, invokingState)
  }
  public SIMPLE_STRING(): TerminalNode | null {
    return this.getToken(LexParser.SIMPLE_STRING, 0)
  }
  public QUOTED_STRING(): TerminalNode | null {
    return this.getToken(LexParser.QUOTED_STRING, 0)
  }
  public override get ruleIndex(): number {
    return LexParser.RULE_search_term
  }
  public override enterRule(listener: LexParserListener): void {
    if (listener.enterSearch_term) {
      listener.enterSearch_term(this)
    }
  }
  public override exitRule(listener: LexParserListener): void {
    if (listener.exitSearch_term) {
      listener.exitSearch_term(this)
    }
  }
  public override accept<Result>(visitor: LexParserVisitor<Result>): Result | null {
    if (visitor.visitSearch_term) {
      return visitor.visitSearch_term(this)
    } else {
      return visitor.visitChildren(this)
    }
  }
}

export class IndexContext extends ParserRuleContext {
  public constructor(parent: ParserRuleContext | null, invokingState: number) {
    super(parent, invokingState)
  }
  public simple_name(): Simple_nameContext | null {
    return this.getRuleContext(0, Simple_nameContext)
  }
  public prefix_name(): Prefix_nameContext | null {
    return this.getRuleContext(0, Prefix_nameContext)
  }
  public override get ruleIndex(): number {
    return LexParser.RULE_index
  }
  public override enterRule(listener: LexParserListener): void {
    if (listener.enterIndex) {
      listener.enterIndex(this)
    }
  }
  public override exitRule(listener: LexParserListener): void {
    if (listener.exitIndex) {
      listener.exitIndex(this)
    }
  }
  public override accept<Result>(visitor: LexParserVisitor<Result>): Result | null {
    if (visitor.visitIndex) {
      return visitor.visitIndex(this)
    } else {
      return visitor.visitChildren(this)
    }
  }
}

export class Relation_modifiedContext extends ParserRuleContext {
  public constructor(parent: ParserRuleContext | null, invokingState: number) {
    super(parent, invokingState)
  }
  public relation(): RelationContext {
    return this.getRuleContext(0, RelationContext)!
  }
  public modifier_list(): Modifier_listContext | null {
    return this.getRuleContext(0, Modifier_listContext)
  }
  public override get ruleIndex(): number {
    return LexParser.RULE_relation_modified
  }
  public override enterRule(listener: LexParserListener): void {
    if (listener.enterRelation_modified) {
      listener.enterRelation_modified(this)
    }
  }
  public override exitRule(listener: LexParserListener): void {
    if (listener.exitRelation_modified) {
      listener.exitRelation_modified(this)
    }
  }
  public override accept<Result>(visitor: LexParserVisitor<Result>): Result | null {
    if (visitor.visitRelation_modified) {
      return visitor.visitRelation_modified(this)
    } else {
      return visitor.visitChildren(this)
    }
  }
}

export class RelationContext extends ParserRuleContext {
  public constructor(parent: ParserRuleContext | null, invokingState: number) {
    super(parent, invokingState)
  }
  public relation_name(): Relation_nameContext | null {
    return this.getRuleContext(0, Relation_nameContext)
  }
  public relation_symbol(): Relation_symbolContext | null {
    return this.getRuleContext(0, Relation_symbolContext)
  }
  public override get ruleIndex(): number {
    return LexParser.RULE_relation
  }
  public override enterRule(listener: LexParserListener): void {
    if (listener.enterRelation) {
      listener.enterRelation(this)
    }
  }
  public override exitRule(listener: LexParserListener): void {
    if (listener.exitRelation) {
      listener.exitRelation(this)
    }
  }
  public override accept<Result>(visitor: LexParserVisitor<Result>): Result | null {
    if (visitor.visitRelation) {
      return visitor.visitRelation(this)
    } else {
      return visitor.visitChildren(this)
    }
  }
}

export class Relation_nameContext extends ParserRuleContext {
  public constructor(parent: ParserRuleContext | null, invokingState: number) {
    super(parent, invokingState)
  }
  public simple_name(): Simple_nameContext | null {
    return this.getRuleContext(0, Simple_nameContext)
  }
  public prefix_name(): Prefix_nameContext | null {
    return this.getRuleContext(0, Prefix_nameContext)
  }
  public override get ruleIndex(): number {
    return LexParser.RULE_relation_name
  }
  public override enterRule(listener: LexParserListener): void {
    if (listener.enterRelation_name) {
      listener.enterRelation_name(this)
    }
  }
  public override exitRule(listener: LexParserListener): void {
    if (listener.exitRelation_name) {
      listener.exitRelation_name(this)
    }
  }
  public override accept<Result>(visitor: LexParserVisitor<Result>): Result | null {
    if (visitor.visitRelation_name) {
      return visitor.visitRelation_name(this)
    } else {
      return visitor.visitChildren(this)
    }
  }
}

export class Relation_symbolContext extends ParserRuleContext {
  public constructor(parent: ParserRuleContext | null, invokingState: number) {
    super(parent, invokingState)
  }
  public EQUAL(): TerminalNode | null {
    return this.getToken(LexParser.EQUAL, 0)
  }
  public GREATER(): TerminalNode | null {
    return this.getToken(LexParser.GREATER, 0)
  }
  public LESSER(): TerminalNode | null {
    return this.getToken(LexParser.LESSER, 0)
  }
  public GREATER_EQUAL(): TerminalNode | null {
    return this.getToken(LexParser.GREATER_EQUAL, 0)
  }
  public LESSER_EQUAL(): TerminalNode | null {
    return this.getToken(LexParser.LESSER_EQUAL, 0)
  }
  public NOT_EQUAL(): TerminalNode | null {
    return this.getToken(LexParser.NOT_EQUAL, 0)
  }
  public EQUAL_EQUAL(): TerminalNode | null {
    return this.getToken(LexParser.EQUAL_EQUAL, 0)
  }
  public override get ruleIndex(): number {
    return LexParser.RULE_relation_symbol
  }
  public override enterRule(listener: LexParserListener): void {
    if (listener.enterRelation_symbol) {
      listener.enterRelation_symbol(this)
    }
  }
  public override exitRule(listener: LexParserListener): void {
    if (listener.exitRelation_symbol) {
      listener.exitRelation_symbol(this)
    }
  }
  public override accept<Result>(visitor: LexParserVisitor<Result>): Result | null {
    if (visitor.visitRelation_symbol) {
      return visitor.visitRelation_symbol(this)
    } else {
      return visitor.visitChildren(this)
    }
  }
}

export class Boolean_modifiedContext extends ParserRuleContext {
  public constructor(parent: ParserRuleContext | null, invokingState: number) {
    super(parent, invokingState)
  }
  public r_boolean(): R_booleanContext {
    return this.getRuleContext(0, R_booleanContext)!
  }
  public modifier_list(): Modifier_listContext | null {
    return this.getRuleContext(0, Modifier_listContext)
  }
  public override get ruleIndex(): number {
    return LexParser.RULE_boolean_modified
  }
  public override enterRule(listener: LexParserListener): void {
    if (listener.enterBoolean_modified) {
      listener.enterBoolean_modified(this)
    }
  }
  public override exitRule(listener: LexParserListener): void {
    if (listener.exitBoolean_modified) {
      listener.exitBoolean_modified(this)
    }
  }
  public override accept<Result>(visitor: LexParserVisitor<Result>): Result | null {
    if (visitor.visitBoolean_modified) {
      return visitor.visitBoolean_modified(this)
    } else {
      return visitor.visitChildren(this)
    }
  }
}

export class R_booleanContext extends ParserRuleContext {
  public constructor(parent: ParserRuleContext | null, invokingState: number) {
    super(parent, invokingState)
  }
  public AND(): TerminalNode | null {
    return this.getToken(LexParser.AND, 0)
  }
  public OR(): TerminalNode | null {
    return this.getToken(LexParser.OR, 0)
  }
  public NOT(): TerminalNode | null {
    return this.getToken(LexParser.NOT, 0)
  }
  public override get ruleIndex(): number {
    return LexParser.RULE_r_boolean
  }
  public override enterRule(listener: LexParserListener): void {
    if (listener.enterR_boolean) {
      listener.enterR_boolean(this)
    }
  }
  public override exitRule(listener: LexParserListener): void {
    if (listener.exitR_boolean) {
      listener.exitR_boolean(this)
    }
  }
  public override accept<Result>(visitor: LexParserVisitor<Result>): Result | null {
    if (visitor.visitR_boolean) {
      return visitor.visitR_boolean(this)
    } else {
      return visitor.visitChildren(this)
    }
  }
}

export class Modifier_listContext extends ParserRuleContext {
  public constructor(parent: ParserRuleContext | null, invokingState: number) {
    super(parent, invokingState)
  }
  public modifier(): ModifierContext[]
  public modifier(i: number): ModifierContext | null
  public modifier(i?: number): ModifierContext[] | ModifierContext | null {
    if (i === undefined) {
      return this.getRuleContexts(ModifierContext)
    }

    return this.getRuleContext(i, ModifierContext)
  }
  public override get ruleIndex(): number {
    return LexParser.RULE_modifier_list
  }
  public override enterRule(listener: LexParserListener): void {
    if (listener.enterModifier_list) {
      listener.enterModifier_list(this)
    }
  }
  public override exitRule(listener: LexParserListener): void {
    if (listener.exitModifier_list) {
      listener.exitModifier_list(this)
    }
  }
  public override accept<Result>(visitor: LexParserVisitor<Result>): Result | null {
    if (visitor.visitModifier_list) {
      return visitor.visitModifier_list(this)
    } else {
      return visitor.visitChildren(this)
    }
  }
}

export class ModifierContext extends ParserRuleContext {
  public constructor(parent: ParserRuleContext | null, invokingState: number) {
    super(parent, invokingState)
  }
  public SLASH(): TerminalNode {
    return this.getToken(LexParser.SLASH, 0)!
  }
  public modifier_name(): Modifier_nameContext {
    return this.getRuleContext(0, Modifier_nameContext)!
  }
  public modifier_relation(): Modifier_relationContext | null {
    return this.getRuleContext(0, Modifier_relationContext)
  }
  public override get ruleIndex(): number {
    return LexParser.RULE_modifier
  }
  public override enterRule(listener: LexParserListener): void {
    if (listener.enterModifier) {
      listener.enterModifier(this)
    }
  }
  public override exitRule(listener: LexParserListener): void {
    if (listener.exitModifier) {
      listener.exitModifier(this)
    }
  }
  public override accept<Result>(visitor: LexParserVisitor<Result>): Result | null {
    if (visitor.visitModifier) {
      return visitor.visitModifier(this)
    } else {
      return visitor.visitChildren(this)
    }
  }
}

export class Modifier_nameContext extends ParserRuleContext {
  public constructor(parent: ParserRuleContext | null, invokingState: number) {
    super(parent, invokingState)
  }
  public simple_name(): Simple_nameContext {
    return this.getRuleContext(0, Simple_nameContext)!
  }
  public override get ruleIndex(): number {
    return LexParser.RULE_modifier_name
  }
  public override enterRule(listener: LexParserListener): void {
    if (listener.enterModifier_name) {
      listener.enterModifier_name(this)
    }
  }
  public override exitRule(listener: LexParserListener): void {
    if (listener.exitModifier_name) {
      listener.exitModifier_name(this)
    }
  }
  public override accept<Result>(visitor: LexParserVisitor<Result>): Result | null {
    if (visitor.visitModifier_name) {
      return visitor.visitModifier_name(this)
    } else {
      return visitor.visitChildren(this)
    }
  }
}

export class Modifier_relationContext extends ParserRuleContext {
  public constructor(parent: ParserRuleContext | null, invokingState: number) {
    super(parent, invokingState)
  }
  public relation_symbol(): Relation_symbolContext {
    return this.getRuleContext(0, Relation_symbolContext)!
  }
  public modifier_value(): Modifier_valueContext {
    return this.getRuleContext(0, Modifier_valueContext)!
  }
  public override get ruleIndex(): number {
    return LexParser.RULE_modifier_relation
  }
  public override enterRule(listener: LexParserListener): void {
    if (listener.enterModifier_relation) {
      listener.enterModifier_relation(this)
    }
  }
  public override exitRule(listener: LexParserListener): void {
    if (listener.exitModifier_relation) {
      listener.exitModifier_relation(this)
    }
  }
  public override accept<Result>(visitor: LexParserVisitor<Result>): Result | null {
    if (visitor.visitModifier_relation) {
      return visitor.visitModifier_relation(this)
    } else {
      return visitor.visitChildren(this)
    }
  }
}

export class Modifier_valueContext extends ParserRuleContext {
  public constructor(parent: ParserRuleContext | null, invokingState: number) {
    super(parent, invokingState)
  }
  public SIMPLE_STRING(): TerminalNode | null {
    return this.getToken(LexParser.SIMPLE_STRING, 0)
  }
  public QUOTED_STRING(): TerminalNode | null {
    return this.getToken(LexParser.QUOTED_STRING, 0)
  }
  public override get ruleIndex(): number {
    return LexParser.RULE_modifier_value
  }
  public override enterRule(listener: LexParserListener): void {
    if (listener.enterModifier_value) {
      listener.enterModifier_value(this)
    }
  }
  public override exitRule(listener: LexParserListener): void {
    if (listener.exitModifier_value) {
      listener.exitModifier_value(this)
    }
  }
  public override accept<Result>(visitor: LexParserVisitor<Result>): Result | null {
    if (visitor.visitModifier_value) {
      return visitor.visitModifier_value(this)
    } else {
      return visitor.visitChildren(this)
    }
  }
}

export class Prefix_nameContext extends ParserRuleContext {
  public constructor(parent: ParserRuleContext | null, invokingState: number) {
    super(parent, invokingState)
  }
  public prefix(): PrefixContext {
    return this.getRuleContext(0, PrefixContext)!
  }
  public DOT(): TerminalNode {
    return this.getToken(LexParser.DOT, 0)!
  }
  public simple_name(): Simple_nameContext {
    return this.getRuleContext(0, Simple_nameContext)!
  }
  public override get ruleIndex(): number {
    return LexParser.RULE_prefix_name
  }
  public override enterRule(listener: LexParserListener): void {
    if (listener.enterPrefix_name) {
      listener.enterPrefix_name(this)
    }
  }
  public override exitRule(listener: LexParserListener): void {
    if (listener.exitPrefix_name) {
      listener.exitPrefix_name(this)
    }
  }
  public override accept<Result>(visitor: LexParserVisitor<Result>): Result | null {
    if (visitor.visitPrefix_name) {
      return visitor.visitPrefix_name(this)
    } else {
      return visitor.visitChildren(this)
    }
  }
}

export class PrefixContext extends ParserRuleContext {
  public constructor(parent: ParserRuleContext | null, invokingState: number) {
    super(parent, invokingState)
  }
  public simple_name(): Simple_nameContext {
    return this.getRuleContext(0, Simple_nameContext)!
  }
  public override get ruleIndex(): number {
    return LexParser.RULE_prefix
  }
  public override enterRule(listener: LexParserListener): void {
    if (listener.enterPrefix) {
      listener.enterPrefix(this)
    }
  }
  public override exitRule(listener: LexParserListener): void {
    if (listener.exitPrefix) {
      listener.exitPrefix(this)
    }
  }
  public override accept<Result>(visitor: LexParserVisitor<Result>): Result | null {
    if (visitor.visitPrefix) {
      return visitor.visitPrefix(this)
    } else {
      return visitor.visitChildren(this)
    }
  }
}

export class Simple_nameContext extends ParserRuleContext {
  public constructor(parent: ParserRuleContext | null, invokingState: number) {
    super(parent, invokingState)
  }
  public SIMPLE_STRING(): TerminalNode {
    return this.getToken(LexParser.SIMPLE_STRING, 0)!
  }
  public override get ruleIndex(): number {
    return LexParser.RULE_simple_name
  }
  public override enterRule(listener: LexParserListener): void {
    if (listener.enterSimple_name) {
      listener.enterSimple_name(this)
    }
  }
  public override exitRule(listener: LexParserListener): void {
    if (listener.exitSimple_name) {
      listener.exitSimple_name(this)
    }
  }
  public override accept<Result>(visitor: LexParserVisitor<Result>): Result | null {
    if (visitor.visitSimple_name) {
      return visitor.visitSimple_name(this)
    } else {
      return visitor.visitChildren(this)
    }
  }
}
