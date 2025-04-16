// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { ErrorNode, ParseTreeListener, ParserRuleContext, TerminalNode } from 'antlr4ng'

import {
  AttributeContext,
  ExpressionContext,
  Expression_andContext,
  Expression_basicContext,
  Expression_groupContext,
  Expression_notContext,
  Expression_orContext,
  IdentifierContext,
  Main_queryContext,
  QualifierContext,
  QuantifierContext,
  QueryContext,
  Query_disjunctionContext,
  Query_groupContext,
  Query_implicitContext,
  Query_segmentContext,
  Query_sequenceContext,
  Query_simpleContext,
  RegexpContext,
  Regexp_flagContext,
  Regexp_patternContext,
  Within_partContext,
  Within_part_simpleContext,
} from './FCSParser.js'

/**
 * This interface defines a complete listener for a parse tree produced by
 * `FCSParser`.
 */
export class FCSParserListener implements ParseTreeListener {
  /**
   * Enter a parse tree produced by `FCSParser.query`.
   * @param ctx the parse tree
   */
  enterQuery?: (ctx: QueryContext) => void
  /**
   * Exit a parse tree produced by `FCSParser.query`.
   * @param ctx the parse tree
   */
  exitQuery?: (ctx: QueryContext) => void
  /**
   * Enter a parse tree produced by `FCSParser.main_query`.
   * @param ctx the parse tree
   */
  enterMain_query?: (ctx: Main_queryContext) => void
  /**
   * Exit a parse tree produced by `FCSParser.main_query`.
   * @param ctx the parse tree
   */
  exitMain_query?: (ctx: Main_queryContext) => void
  /**
   * Enter a parse tree produced by `FCSParser.query_disjunction`.
   * @param ctx the parse tree
   */
  enterQuery_disjunction?: (ctx: Query_disjunctionContext) => void
  /**
   * Exit a parse tree produced by `FCSParser.query_disjunction`.
   * @param ctx the parse tree
   */
  exitQuery_disjunction?: (ctx: Query_disjunctionContext) => void
  /**
   * Enter a parse tree produced by `FCSParser.query_sequence`.
   * @param ctx the parse tree
   */
  enterQuery_sequence?: (ctx: Query_sequenceContext) => void
  /**
   * Exit a parse tree produced by `FCSParser.query_sequence`.
   * @param ctx the parse tree
   */
  exitQuery_sequence?: (ctx: Query_sequenceContext) => void
  /**
   * Enter a parse tree produced by `FCSParser.query_group`.
   * @param ctx the parse tree
   */
  enterQuery_group?: (ctx: Query_groupContext) => void
  /**
   * Exit a parse tree produced by `FCSParser.query_group`.
   * @param ctx the parse tree
   */
  exitQuery_group?: (ctx: Query_groupContext) => void
  /**
   * Enter a parse tree produced by `FCSParser.query_simple`.
   * @param ctx the parse tree
   */
  enterQuery_simple?: (ctx: Query_simpleContext) => void
  /**
   * Exit a parse tree produced by `FCSParser.query_simple`.
   * @param ctx the parse tree
   */
  exitQuery_simple?: (ctx: Query_simpleContext) => void
  /**
   * Enter a parse tree produced by `FCSParser.quantifier`.
   * @param ctx the parse tree
   */
  enterQuantifier?: (ctx: QuantifierContext) => void
  /**
   * Exit a parse tree produced by `FCSParser.quantifier`.
   * @param ctx the parse tree
   */
  exitQuantifier?: (ctx: QuantifierContext) => void
  /**
   * Enter a parse tree produced by `FCSParser.query_implicit`.
   * @param ctx the parse tree
   */
  enterQuery_implicit?: (ctx: Query_implicitContext) => void
  /**
   * Exit a parse tree produced by `FCSParser.query_implicit`.
   * @param ctx the parse tree
   */
  exitQuery_implicit?: (ctx: Query_implicitContext) => void
  /**
   * Enter a parse tree produced by `FCSParser.query_segment`.
   * @param ctx the parse tree
   */
  enterQuery_segment?: (ctx: Query_segmentContext) => void
  /**
   * Exit a parse tree produced by `FCSParser.query_segment`.
   * @param ctx the parse tree
   */
  exitQuery_segment?: (ctx: Query_segmentContext) => void
  /**
   * Enter a parse tree produced by `FCSParser.within_part`.
   * @param ctx the parse tree
   */
  enterWithin_part?: (ctx: Within_partContext) => void
  /**
   * Exit a parse tree produced by `FCSParser.within_part`.
   * @param ctx the parse tree
   */
  exitWithin_part?: (ctx: Within_partContext) => void
  /**
   * Enter a parse tree produced by `FCSParser.within_part_simple`.
   * @param ctx the parse tree
   */
  enterWithin_part_simple?: (ctx: Within_part_simpleContext) => void
  /**
   * Exit a parse tree produced by `FCSParser.within_part_simple`.
   * @param ctx the parse tree
   */
  exitWithin_part_simple?: (ctx: Within_part_simpleContext) => void
  /**
   * Enter a parse tree produced by `FCSParser.expression`.
   * @param ctx the parse tree
   */
  enterExpression?: (ctx: ExpressionContext) => void
  /**
   * Exit a parse tree produced by `FCSParser.expression`.
   * @param ctx the parse tree
   */
  exitExpression?: (ctx: ExpressionContext) => void
  /**
   * Enter a parse tree produced by `FCSParser.expression_or`.
   * @param ctx the parse tree
   */
  enterExpression_or?: (ctx: Expression_orContext) => void
  /**
   * Exit a parse tree produced by `FCSParser.expression_or`.
   * @param ctx the parse tree
   */
  exitExpression_or?: (ctx: Expression_orContext) => void
  /**
   * Enter a parse tree produced by `FCSParser.expression_and`.
   * @param ctx the parse tree
   */
  enterExpression_and?: (ctx: Expression_andContext) => void
  /**
   * Exit a parse tree produced by `FCSParser.expression_and`.
   * @param ctx the parse tree
   */
  exitExpression_and?: (ctx: Expression_andContext) => void
  /**
   * Enter a parse tree produced by `FCSParser.expression_group`.
   * @param ctx the parse tree
   */
  enterExpression_group?: (ctx: Expression_groupContext) => void
  /**
   * Exit a parse tree produced by `FCSParser.expression_group`.
   * @param ctx the parse tree
   */
  exitExpression_group?: (ctx: Expression_groupContext) => void
  /**
   * Enter a parse tree produced by `FCSParser.expression_not`.
   * @param ctx the parse tree
   */
  enterExpression_not?: (ctx: Expression_notContext) => void
  /**
   * Exit a parse tree produced by `FCSParser.expression_not`.
   * @param ctx the parse tree
   */
  exitExpression_not?: (ctx: Expression_notContext) => void
  /**
   * Enter a parse tree produced by `FCSParser.expression_basic`.
   * @param ctx the parse tree
   */
  enterExpression_basic?: (ctx: Expression_basicContext) => void
  /**
   * Exit a parse tree produced by `FCSParser.expression_basic`.
   * @param ctx the parse tree
   */
  exitExpression_basic?: (ctx: Expression_basicContext) => void
  /**
   * Enter a parse tree produced by `FCSParser.attribute`.
   * @param ctx the parse tree
   */
  enterAttribute?: (ctx: AttributeContext) => void
  /**
   * Exit a parse tree produced by `FCSParser.attribute`.
   * @param ctx the parse tree
   */
  exitAttribute?: (ctx: AttributeContext) => void
  /**
   * Enter a parse tree produced by `FCSParser.qualifier`.
   * @param ctx the parse tree
   */
  enterQualifier?: (ctx: QualifierContext) => void
  /**
   * Exit a parse tree produced by `FCSParser.qualifier`.
   * @param ctx the parse tree
   */
  exitQualifier?: (ctx: QualifierContext) => void
  /**
   * Enter a parse tree produced by `FCSParser.identifier`.
   * @param ctx the parse tree
   */
  enterIdentifier?: (ctx: IdentifierContext) => void
  /**
   * Exit a parse tree produced by `FCSParser.identifier`.
   * @param ctx the parse tree
   */
  exitIdentifier?: (ctx: IdentifierContext) => void
  /**
   * Enter a parse tree produced by `FCSParser.regexp`.
   * @param ctx the parse tree
   */
  enterRegexp?: (ctx: RegexpContext) => void
  /**
   * Exit a parse tree produced by `FCSParser.regexp`.
   * @param ctx the parse tree
   */
  exitRegexp?: (ctx: RegexpContext) => void
  /**
   * Enter a parse tree produced by `FCSParser.regexp_pattern`.
   * @param ctx the parse tree
   */
  enterRegexp_pattern?: (ctx: Regexp_patternContext) => void
  /**
   * Exit a parse tree produced by `FCSParser.regexp_pattern`.
   * @param ctx the parse tree
   */
  exitRegexp_pattern?: (ctx: Regexp_patternContext) => void
  /**
   * Enter a parse tree produced by `FCSParser.regexp_flag`.
   * @param ctx the parse tree
   */
  enterRegexp_flag?: (ctx: Regexp_flagContext) => void
  /**
   * Exit a parse tree produced by `FCSParser.regexp_flag`.
   * @param ctx the parse tree
   */
  exitRegexp_flag?: (ctx: Regexp_flagContext) => void

  visitTerminal(node: TerminalNode): void {}
  visitErrorNode(node: ErrorNode): void {}
  enterEveryRule(node: ParserRuleContext): void {}
  exitEveryRule(node: ParserRuleContext): void {}
}
