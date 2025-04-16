// Generated from src/vendor/fcs-ql/LexParser.g4 by ANTLR 4.13.1

import { AbstractParseTreeVisitor } from 'antlr4ng'

import {
  Boolean_modifiedContext,
  Boolean_queryContext,
  IndexContext,
  Modifier_listContext,
  Modifier_nameContext,
  Modifier_relationContext,
  Modifier_valueContext,
  ModifierContext,
  Prefix_nameContext,
  PrefixContext,
  QueryContext,
  R_booleanContext,
  Relation_modifiedContext,
  Relation_nameContext,
  Relation_symbolContext,
  RelationContext,
  Search_clauseContext,
  Search_termContext,
  Simple_nameContext,
  SubqueryContext,
} from './LexParser.js'

/**
 * This interface defines a complete generic visitor for a parse tree produced
 * by `LexParser`.
 *
 * @param <Result> The return type of the visit operation. Use `void` for
 * operations with no return type.
 */
export class LexParserVisitor<Result> extends AbstractParseTreeVisitor<Result> {
  /**
   * Visit a parse tree produced by `LexParser.query`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitQuery?: (ctx: QueryContext) => Result
  /**
   * Visit a parse tree produced by `LexParser.boolean_query`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitBoolean_query?: (ctx: Boolean_queryContext) => Result
  /**
   * Visit a parse tree produced by `LexParser.subquery`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitSubquery?: (ctx: SubqueryContext) => Result
  /**
   * Visit a parse tree produced by `LexParser.search_clause`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitSearch_clause?: (ctx: Search_clauseContext) => Result
  /**
   * Visit a parse tree produced by `LexParser.search_term`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitSearch_term?: (ctx: Search_termContext) => Result
  /**
   * Visit a parse tree produced by `LexParser.index`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitIndex?: (ctx: IndexContext) => Result
  /**
   * Visit a parse tree produced by `LexParser.relation_modified`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitRelation_modified?: (ctx: Relation_modifiedContext) => Result
  /**
   * Visit a parse tree produced by `LexParser.relation`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitRelation?: (ctx: RelationContext) => Result
  /**
   * Visit a parse tree produced by `LexParser.relation_name`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitRelation_name?: (ctx: Relation_nameContext) => Result
  /**
   * Visit a parse tree produced by `LexParser.relation_symbol`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitRelation_symbol?: (ctx: Relation_symbolContext) => Result
  /**
   * Visit a parse tree produced by `LexParser.boolean_modified`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitBoolean_modified?: (ctx: Boolean_modifiedContext) => Result
  /**
   * Visit a parse tree produced by `LexParser.r_boolean`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitR_boolean?: (ctx: R_booleanContext) => Result
  /**
   * Visit a parse tree produced by `LexParser.modifier_list`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitModifier_list?: (ctx: Modifier_listContext) => Result
  /**
   * Visit a parse tree produced by `LexParser.modifier`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitModifier?: (ctx: ModifierContext) => Result
  /**
   * Visit a parse tree produced by `LexParser.modifier_name`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitModifier_name?: (ctx: Modifier_nameContext) => Result
  /**
   * Visit a parse tree produced by `LexParser.modifier_relation`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitModifier_relation?: (ctx: Modifier_relationContext) => Result
  /**
   * Visit a parse tree produced by `LexParser.modifier_value`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitModifier_value?: (ctx: Modifier_valueContext) => Result
  /**
   * Visit a parse tree produced by `LexParser.prefix_name`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitPrefix_name?: (ctx: Prefix_nameContext) => Result
  /**
   * Visit a parse tree produced by `LexParser.prefix`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitPrefix?: (ctx: PrefixContext) => Result
  /**
   * Visit a parse tree produced by `LexParser.simple_name`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitSimple_name?: (ctx: Simple_nameContext) => Result
}
