// Generated from src/vendor/fcs-ql/FCSParser.g4 by ANTLR 4.13.1

import { AbstractParseTreeVisitor } from 'antlr4ng'

import {
  AttributeContext,
  Expression_andContext,
  Expression_basicContext,
  Expression_groupContext,
  Expression_notContext,
  Expression_orContext,
  ExpressionContext,
  IdentifierContext,
  Main_queryContext,
  QualifierContext,
  QuantifierContext,
  Query_disjunctionContext,
  Query_groupContext,
  Query_implicitContext,
  Query_segmentContext,
  Query_sequenceContext,
  Query_simpleContext,
  QueryContext,
  Regexp_flagContext,
  Regexp_patternContext,
  RegexpContext,
  Within_part_simpleContext,
  Within_partContext,
} from './FCSParser.js'

/**
 * This interface defines a complete generic visitor for a parse tree produced
 * by `FCSParser`.
 *
 * @param <Result> The return type of the visit operation. Use `void` for
 * operations with no return type.
 */
export class FCSParserVisitor<Result> extends AbstractParseTreeVisitor<Result> {
  /**
   * Visit a parse tree produced by `FCSParser.query`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitQuery?: (ctx: QueryContext) => Result
  /**
   * Visit a parse tree produced by `FCSParser.main_query`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitMain_query?: (ctx: Main_queryContext) => Result
  /**
   * Visit a parse tree produced by `FCSParser.query_disjunction`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitQuery_disjunction?: (ctx: Query_disjunctionContext) => Result
  /**
   * Visit a parse tree produced by `FCSParser.query_sequence`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitQuery_sequence?: (ctx: Query_sequenceContext) => Result
  /**
   * Visit a parse tree produced by `FCSParser.query_group`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitQuery_group?: (ctx: Query_groupContext) => Result
  /**
   * Visit a parse tree produced by `FCSParser.query_simple`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitQuery_simple?: (ctx: Query_simpleContext) => Result
  /**
   * Visit a parse tree produced by `FCSParser.quantifier`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitQuantifier?: (ctx: QuantifierContext) => Result
  /**
   * Visit a parse tree produced by `FCSParser.query_implicit`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitQuery_implicit?: (ctx: Query_implicitContext) => Result
  /**
   * Visit a parse tree produced by `FCSParser.query_segment`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitQuery_segment?: (ctx: Query_segmentContext) => Result
  /**
   * Visit a parse tree produced by `FCSParser.within_part`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitWithin_part?: (ctx: Within_partContext) => Result
  /**
   * Visit a parse tree produced by `FCSParser.within_part_simple`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitWithin_part_simple?: (ctx: Within_part_simpleContext) => Result
  /**
   * Visit a parse tree produced by `FCSParser.expression`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitExpression?: (ctx: ExpressionContext) => Result
  /**
   * Visit a parse tree produced by `FCSParser.expression_or`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitExpression_or?: (ctx: Expression_orContext) => Result
  /**
   * Visit a parse tree produced by `FCSParser.expression_and`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitExpression_and?: (ctx: Expression_andContext) => Result
  /**
   * Visit a parse tree produced by `FCSParser.expression_group`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitExpression_group?: (ctx: Expression_groupContext) => Result
  /**
   * Visit a parse tree produced by `FCSParser.expression_not`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitExpression_not?: (ctx: Expression_notContext) => Result
  /**
   * Visit a parse tree produced by `FCSParser.expression_basic`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitExpression_basic?: (ctx: Expression_basicContext) => Result
  /**
   * Visit a parse tree produced by `FCSParser.attribute`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitAttribute?: (ctx: AttributeContext) => Result
  /**
   * Visit a parse tree produced by `FCSParser.qualifier`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitQualifier?: (ctx: QualifierContext) => Result
  /**
   * Visit a parse tree produced by `FCSParser.identifier`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitIdentifier?: (ctx: IdentifierContext) => Result
  /**
   * Visit a parse tree produced by `FCSParser.regexp`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitRegexp?: (ctx: RegexpContext) => Result
  /**
   * Visit a parse tree produced by `FCSParser.regexp_pattern`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitRegexp_pattern?: (ctx: Regexp_patternContext) => Result
  /**
   * Visit a parse tree produced by `FCSParser.regexp_flag`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitRegexp_flag?: (ctx: Regexp_flagContext) => Result
}
