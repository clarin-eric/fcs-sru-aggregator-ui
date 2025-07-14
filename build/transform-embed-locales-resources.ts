import type { AstNode } from 'rollup'
import type { Plugin } from 'vite'

import { walk } from 'estree-walker'
import MagicString from 'magic-string'

import { existsSync } from 'node:fs'
import { join as pathJoin } from 'node:path'

interface PluginOptions {
  removeResourcesToBackend: boolean
  // mapping of locale to list of namespaces
  localesWithNamespaces: { [locale: string]: string[] }
  localesImportPrefix: string
}

// see: vite: dynamicImportVars.ts
const hasDynamicImportRE = /\bimport\s*[(/]/

function sanitzeString(value: string) {
  return value.replace(
    /([^a-z0-9])/gi,
    (val) => `_${[...val].map((ch) => ch.codePointAt(0)).join('_')}_`
  )
}

export default function transformEmbedLocalesResourcesPlugin(config: PluginOptions) {
  // console.debug('config', config)

  const hasLocalesForEmbed =
    config.localesWithNamespaces &&
    Object.getOwnPropertyNames(config.localesWithNamespaces).length > 0 &&
    Object.entries(config.localesWithNamespaces).filter(([, ns]) => ns && ns.length > 0).length > 0

  return {
    name: 'clarin:transform-embed-locales-resources',

    transform: {
      filter: {
        id: {
          exclude: '**/node_modules/**',
          include: '**/*.ts?(x)',
        },
        code: /\bresourcesToBackend\b/,
      },
      async handler(code, id) {
        if (!hasDynamicImportRE.test(code)) return
        // console.debug('[clarin:transform-embed-locales-resources]', { id })
        // if (!id.endsWith('i18next.ts')) return

        const s = new MagicString(code)
        const ast = this.parse(code)

        if (config.removeResourcesToBackend) {
          walk(ast, {
            enter(node) {
              // console.debug('[walk]', { node, parent, key, index })

              // remove import: import resourcesToBackend from "i18next-resources-to-backend"
              if (node.type === 'ImportDeclaration') {
                const srcNode = node.source
                if (srcNode.type !== 'Literal') return
                if (srcNode.value !== 'i18next-resources-to-backend') return

                if (node.specifiers.length !== 1) return
                const specNode = node.specifiers[0]
                if (specNode.type !== 'ImportDefaultSpecifier') return
                if (specNode.local.name !== 'resourcesToBackend') return

                s.remove((node as unknown as AstNode).start, (node as unknown as AstNode).end)
                this.skip()
              }

              if (node.type === 'CallExpression') {
                // .use()
                const calleeNode = node.callee
                if (calleeNode.type !== 'MemberExpression') return
                const propNode = calleeNode.property
                if (propNode.type !== 'Identifier') return
                if (propNode.name !== 'use') return

                // resourcesToBackend()
                if (node.arguments.length !== 1) return
                const argumentNode = node.arguments[0]
                if (argumentNode.type !== 'CallExpression') return
                const argCalNode = argumentNode.callee
                if (argCalNode.type !== 'Identifier') return
                if (argCalNode.name !== 'resourcesToBackend') return

                // TODO: check inside for dynamic import?

                let i18nUseStart = (propNode as unknown as AstNode).start
                i18nUseStart = code.lastIndexOf('.', i18nUseStart)
                const i18nUseEnd = (node as unknown as AstNode).end

                s.remove(i18nUseStart, i18nUseEnd)
                this.skip()
              }
            },
          })
        }

        // create synthetic imports
        if (hasLocalesForEmbed) {
          // find last of imports
          const idxNodeForInsertImports = ast.body.findIndex(
            (node) => node.type !== 'ImportDeclaration'
          )
          const idxForInsertImports = (ast.body[idxNodeForInsertImports] as unknown as AstNode)
            .start

          let idxForInsertBundleLoad: number | undefined = undefined

          const pluginWarn = this.warn

          walk(ast, {
            enter(node) {
              // console.debug('[walk]', { node, parent, key, index })

              // want to find the i18n.....init() expression
              if (node.type !== 'ExpressionStatement') return
              if (node.expression.type !== 'CallExpression') return
              // .init
              const expNode = node.expression.callee
              if (expNode.type !== 'MemberExpression') return
              if (expNode.property.type !== 'Identifier') return
              if (expNode.property.name !== 'init') return

              // {...} init argument
              if (node.expression.arguments.length !== 1) return
              const objNode = node.expression.arguments[0]
              if (objNode.type !== 'ObjectExpression') return
              // { resources }
              if (objNode.properties.length === 0) return

              // pretty sure we are correct here

              // NOTE: this would fail with spread syntax!
              if (
                !objNode.properties.find(
                  (propNode) =>
                    propNode.type === 'Property' &&
                    propNode.kind === 'init' &&
                    propNode.key.type === 'Identifier' &&
                    propNode.key.name === 'resources'
                )
              )
                pluginWarn("Unable to find '{ resource }' init property!")
              if (
                !objNode.properties.find(
                  (propNode) =>
                    propNode.type === 'Property' &&
                    propNode.kind === 'init' &&
                    propNode.key.type === 'Identifier' &&
                    propNode.key.name === 'partialBundledLanguages' &&
                    propNode.value.type === 'Literal' &&
                    propNode.value.value === true
                )
              )
                pluginWarn("Unable to find '{ partialBundledLanguages: true }' init property!")

              // NOTE: check for i18n start
              const snippet = code.substring(
                (node as unknown as AstNode).start,
                (node as unknown as AstNode).end
              )
              if (!snippet.startsWith('i18n'))
                pluginWarn('Unable to find i18n object. Was it renamed?')

              idxForInsertBundleLoad = (node as unknown as AstNode).end
            },
          })

          if (idxForInsertBundleLoad === undefined) {
            this.warn('Unable to find insertion point for i18n.addResourceBundle() calls!')
          } else {
            // generate imports
            const importNames: {
              importName: string
              importPath: string
              locale: string
              namespace: string
            }[] = []
            for (const [locale, namespaces] of Object.entries(config.localesWithNamespaces)) {
              for (const namespace of namespaces) {
                const importName = `__embedLocale${importNames.length}_${sanitzeString(
                  locale
                )}_${sanitzeString(namespace)}__`
                const importPath = `${pathJoin(config.localesImportPrefix, locale, namespace)}.json`

                // test importPath?
                const resolved = await this.resolve(importPath, id)
                // console.debug('[resolve]', { resolved: resolved, importPath, id })
                if (!resolved || !existsSync(resolved.id)) {
                  this.warn(
                    `Unable to resolve locale resource import '${importPath}'. Will be ignored!`
                  )
                  continue
                }

                importNames.push({ importName, importPath, locale, namespace })
              }
            }
            s.appendRight(idxForInsertBundleLoad!, '\n')
            importNames.forEach(({ importName, importPath, locale, namespace }) => {
              s.appendRight(idxForInsertImports, `import ${importName} from "${importPath}"\n`)
              s.appendRight(
                idxForInsertBundleLoad!,
                `i18n.addResourceBundle("${locale}", "${namespace}", ${importName})\n`
              )
            })
          }
        }

        // vite: transformStableResult()?
        return { code: s.toString(), map: s.generateMap({ hires: 'boundary', source: id }) }
      },
    },
  } satisfies Plugin
}
