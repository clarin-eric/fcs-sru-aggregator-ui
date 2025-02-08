// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

// Generated from src/vendor/lexcql/LexParser.g4 by ANTLR 4.13.1

import { ErrorNode, ParseTreeListener, ParserRuleContext, TerminalNode } from 'antlr4ng'

import {
  BooleanContext,
  Boolean_modifiedContext,
  Boolean_queryContext,
  IndexContext,
  Index_modifiedContext,
  ModifierContext,
  Modifier_listContext,
  Modifier_nameContext,
  Modifier_relationContext,
  Modifier_valueContext,
  PrefixContext,
  Prefix_nameContext,
  QueryContext,
  RelationContext,
  Relation_modifiedContext,
  Relation_nameContext,
  Relation_symbolContext,
  Search_clauseContext,
  Search_termContext,
  Simple_nameContext,
  SubqueryContext,
} from './LexParser.js'

/**
 * This interface defines a complete listener for a parse tree produced by
 * `LexParser`.
 */
export class LexParserListener implements ParseTreeListener {
  /**
   * Enter a parse tree produced by `LexParser.query`.
   * @param ctx the parse tree
   */
  enterQuery?: (ctx: QueryContext) => void
  /**
   * Exit a parse tree produced by `LexParser.query`.
   * @param ctx the parse tree
   */
  exitQuery?: (ctx: QueryContext) => void
  /**
   * Enter a parse tree produced by `LexParser.boolean_query`.
   * @param ctx the parse tree
   */
  enterBoolean_query?: (ctx: Boolean_queryContext) => void
  /**
   * Exit a parse tree produced by `LexParser.boolean_query`.
   * @param ctx the parse tree
   */
  exitBoolean_query?: (ctx: Boolean_queryContext) => void
  /**
   * Enter a parse tree produced by `LexParser.subquery`.
   * @param ctx the parse tree
   */
  enterSubquery?: (ctx: SubqueryContext) => void
  /**
   * Exit a parse tree produced by `LexParser.subquery`.
   * @param ctx the parse tree
   */
  exitSubquery?: (ctx: SubqueryContext) => void
  /**
   * Enter a parse tree produced by `LexParser.search_clause`.
   * @param ctx the parse tree
   */
  enterSearch_clause?: (ctx: Search_clauseContext) => void
  /**
   * Exit a parse tree produced by `LexParser.search_clause`.
   * @param ctx the parse tree
   */
  exitSearch_clause?: (ctx: Search_clauseContext) => void
  /**
   * Enter a parse tree produced by `LexParser.search_term`.
   * @param ctx the parse tree
   */
  enterSearch_term?: (ctx: Search_termContext) => void
  /**
   * Exit a parse tree produced by `LexParser.search_term`.
   * @param ctx the parse tree
   */
  exitSearch_term?: (ctx: Search_termContext) => void
  /**
   * Enter a parse tree produced by `LexParser.index_modified`.
   * @param ctx the parse tree
   */
  enterIndex_modified?: (ctx: Index_modifiedContext) => void
  /**
   * Exit a parse tree produced by `LexParser.index_modified`.
   * @param ctx the parse tree
   */
  exitIndex_modified?: (ctx: Index_modifiedContext) => void
  /**
   * Enter a parse tree produced by `LexParser.index`.
   * @param ctx the parse tree
   */
  enterIndex?: (ctx: IndexContext) => void
  /**
   * Exit a parse tree produced by `LexParser.index`.
   * @param ctx the parse tree
   */
  exitIndex?: (ctx: IndexContext) => void
  /**
   * Enter a parse tree produced by `LexParser.relation_modified`.
   * @param ctx the parse tree
   */
  enterRelation_modified?: (ctx: Relation_modifiedContext) => void
  /**
   * Exit a parse tree produced by `LexParser.relation_modified`.
   * @param ctx the parse tree
   */
  exitRelation_modified?: (ctx: Relation_modifiedContext) => void
  /**
   * Enter a parse tree produced by `LexParser.relation`.
   * @param ctx the parse tree
   */
  enterRelation?: (ctx: RelationContext) => void
  /**
   * Exit a parse tree produced by `LexParser.relation`.
   * @param ctx the parse tree
   */
  exitRelation?: (ctx: RelationContext) => void
  /**
   * Enter a parse tree produced by `LexParser.relation_name`.
   * @param ctx the parse tree
   */
  enterRelation_name?: (ctx: Relation_nameContext) => void
  /**
   * Exit a parse tree produced by `LexParser.relation_name`.
   * @param ctx the parse tree
   */
  exitRelation_name?: (ctx: Relation_nameContext) => void
  /**
   * Enter a parse tree produced by `LexParser.relation_symbol`.
   * @param ctx the parse tree
   */
  enterRelation_symbol?: (ctx: Relation_symbolContext) => void
  /**
   * Exit a parse tree produced by `LexParser.relation_symbol`.
   * @param ctx the parse tree
   */
  exitRelation_symbol?: (ctx: Relation_symbolContext) => void
  /**
   * Enter a parse tree produced by `LexParser.boolean_modified`.
   * @param ctx the parse tree
   */
  enterBoolean_modified?: (ctx: Boolean_modifiedContext) => void
  /**
   * Exit a parse tree produced by `LexParser.boolean_modified`.
   * @param ctx the parse tree
   */
  exitBoolean_modified?: (ctx: Boolean_modifiedContext) => void
  /**
   * Enter a parse tree produced by `LexParser.boolean`.
   * @param ctx the parse tree
   */
  enterBoolean?: (ctx: BooleanContext) => void
  /**
   * Exit a parse tree produced by `LexParser.boolean`.
   * @param ctx the parse tree
   */
  exitBoolean?: (ctx: BooleanContext) => void
  /**
   * Enter a parse tree produced by `LexParser.modifier_list`.
   * @param ctx the parse tree
   */
  enterModifier_list?: (ctx: Modifier_listContext) => void
  /**
   * Exit a parse tree produced by `LexParser.modifier_list`.
   * @param ctx the parse tree
   */
  exitModifier_list?: (ctx: Modifier_listContext) => void
  /**
   * Enter a parse tree produced by `LexParser.modifier`.
   * @param ctx the parse tree
   */
  enterModifier?: (ctx: ModifierContext) => void
  /**
   * Exit a parse tree produced by `LexParser.modifier`.
   * @param ctx the parse tree
   */
  exitModifier?: (ctx: ModifierContext) => void
  /**
   * Enter a parse tree produced by `LexParser.modifier_name`.
   * @param ctx the parse tree
   */
  enterModifier_name?: (ctx: Modifier_nameContext) => void
  /**
   * Exit a parse tree produced by `LexParser.modifier_name`.
   * @param ctx the parse tree
   */
  exitModifier_name?: (ctx: Modifier_nameContext) => void
  /**
   * Enter a parse tree produced by `LexParser.modifier_relation`.
   * @param ctx the parse tree
   */
  enterModifier_relation?: (ctx: Modifier_relationContext) => void
  /**
   * Exit a parse tree produced by `LexParser.modifier_relation`.
   * @param ctx the parse tree
   */
  exitModifier_relation?: (ctx: Modifier_relationContext) => void
  /**
   * Enter a parse tree produced by `LexParser.modifier_value`.
   * @param ctx the parse tree
   */
  enterModifier_value?: (ctx: Modifier_valueContext) => void
  /**
   * Exit a parse tree produced by `LexParser.modifier_value`.
   * @param ctx the parse tree
   */
  exitModifier_value?: (ctx: Modifier_valueContext) => void
  /**
   * Enter a parse tree produced by `LexParser.prefix_name`.
   * @param ctx the parse tree
   */
  enterPrefix_name?: (ctx: Prefix_nameContext) => void
  /**
   * Exit a parse tree produced by `LexParser.prefix_name`.
   * @param ctx the parse tree
   */
  exitPrefix_name?: (ctx: Prefix_nameContext) => void
  /**
   * Enter a parse tree produced by `LexParser.prefix`.
   * @param ctx the parse tree
   */
  enterPrefix?: (ctx: PrefixContext) => void
  /**
   * Exit a parse tree produced by `LexParser.prefix`.
   * @param ctx the parse tree
   */
  exitPrefix?: (ctx: PrefixContext) => void
  /**
   * Enter a parse tree produced by `LexParser.simple_name`.
   * @param ctx the parse tree
   */
  enterSimple_name?: (ctx: Simple_nameContext) => void
  /**
   * Exit a parse tree produced by `LexParser.simple_name`.
   * @param ctx the parse tree
   */
  exitSimple_name?: (ctx: Simple_nameContext) => void

  visitTerminal(node: TerminalNode): void {}
  visitErrorNode(node: ErrorNode): void {}
  enterEveryRule(node: ParserRuleContext): void {}
  exitEveryRule(node: ParserRuleContext): void {}
}
