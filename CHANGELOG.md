# Changelog

## Unreleased

- Added:
  - Add `CHANGELOG.md` file with summary of changes

- Changed:
  - Update LexCQL grammar/parser for LexFCS 1.0 compatibility + update LexQueryBuilder:
    - Remove `NOT` operator
    - Add `<>` (not equal) relation
    - Remove unused relation modifiers
    - Add searchterm choices (dropdown) for `is` relation and indexes with default entity namespaces (UD features and POS tags)
  - **Breaking** (potentially): removed `axios`, use native `fetch`

- Fixed:
  - Update `vite.config.ts` imports due to new vite8 warnings

- Removed:
  - Removed `build/transform-dynamic-to-static-imports.ts` as vite8 + rolldown support transformation of dynamic imports into static imports for single chunk builds

- Dependencies:
  - Fix npm audit issues
  - Migrate to `vite` v8
  - Add `rollup` for custom build transformation scripts (to avoid unclear migration to vite8/rolldown/oxc/...?)
  - Bumped `@clarin-eric/fcs-sru-aggregator-api-adapter-typescript` to `2.2.1`, removed `axios`

## [1.0.0] Initial Release of new UI – 2026-05-11

See Commit log for details.

[1.0.0]: https://github.com/clarin-eric/fcs-sru-aggregator-ui/releases/tag/1.0.0
