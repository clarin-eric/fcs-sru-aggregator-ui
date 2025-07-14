import type { AstNode, ProgramNode } from 'rollup'
import type { Plugin } from 'vite'

import { walk } from 'estree-walker'
import MagicString from 'magic-string'
// import { generate } from 'astring'
// import { SourceMapGenerator } from 'source-map'

interface Import {
  name: string
  source: string
  start: number
  end: number
}

export default function transformDynamicToStaticImportsPlugin() {
  return {
    name: 'clarin:transform-dynamic-to-static-imports',

    // https://rollupjs.org/plugin-development/#buildstart

    // buildStart(options) {
    //   console.debug('[buildStart]', options)
    // },

    // resolveDynamicImport(specifier, importer, options) {
    //   if (typeof specifier !== 'string') return
    //   console.debug('[resolveDynamicImport]', specifier, importer, options)

    //   // if (specifier.includes('unwanted')) {
    //   //   // mark those external, no further processing
    //   //   return false
    //   // }
    //   // } else if (specifier.includes('/locales/')) {
    //   //   return specifier
    //   // }
    // },
    // resolveId(source, importer, options) {
    //   console.debug('[resolveId]', source, importer, options)
    // },

    transform: {
      filter: {
        id: {
          exclude: '**/node_modules/**',
          include: '**/*.ts?(x)',
        },
        // see: vite: dynamicImportVars.ts
        code: /\bimport\s*[(/]/,
      },
      handler(code, id) {
        // const info = this.getModuleInfo(id)!
        // console.debug('[transform]', { id, options, info })

        const s = new MagicString(code)
        const ast = this.parse(code)
        // console.debug('[transform]', ast)

        const imports: Import[] = []
        walk(ast, {
          enter(node) {
            if (node.type === 'VariableDeclaration') {
              // we can't handle multi declarator variable declarations
              if (node.declarations.length !== 1) return

              // search for: symbol = lazy(() => import(""))
              for (const declNode of node.declarations) {
                // variable name (left side)
                if (declNode.id.type !== 'Identifier') return
                const name = declNode.id.name

                // is this a lazy() assignment (right side)
                const initNode = declNode.init
                if (!initNode) return
                if (initNode.type !== 'CallExpression') return
                if (initNode.callee.type !== 'Identifier') return
                if (initNode.callee.name !== 'lazy') return

                // do we have a arrow function
                if (initNode.arguments.length !== 1) return
                const argNode = initNode.arguments[0]
                if (argNode.type !== 'ArrowFunctionExpression') return
                if (argNode.params.length !== 0) return
                // and with a import() call
                const argBodyNode = argNode.body
                if (argBodyNode.type !== 'ImportExpression') return
                // we only want static strings, nothing dynamic
                const impValNode = argBodyNode.source
                if (impValNode.type !== 'Literal') return
                if (typeof impValNode.value !== 'string') return
                const source = impValNode.value

                imports.push({
                  name,
                  source,
                  start: (node as unknown as AstNode).start,
                  end: (node as unknown as AstNode).end,
                })
                // this.remove()
              }
            }
            // console.debug('[walk]', { node, parent, key, index })
          },
        }) as ProgramNode

        // nothing found, exit early
        if (imports.length === 0) return

        // find end of import statements (start of code) to append all transformed new imports after
        const idxNodeForInsert = ast.body.findIndex((node) => node.type !== 'ImportDeclaration')
        const idxForInsert = (ast.body[idxNodeForInsert] as unknown as AstNode).start
        // console.debug('insert at:', ast.body[idxNodeForInsert], idxForInsert)

        // code transformation
        for (const fragment of imports) {
          s.remove(fragment.start, fragment.end)
          s.appendRight(idxForInsert, `import ${fragment.name} from "${fragment.source}"\n`)
        }

        // vite: transformStableResult()?
        return { code: s.toString(), map: s.generateMap({ hires: 'boundary', source: id }) }

        // const mapGen = new SourceMapGenerator({ file: id })
        // mapGen.setSourceContent(id, code)
        // const resultCode = generate(resultNode, { sourceMap: mapGen })
        // console.debug(resultCode)
        // return { ast: resultNode, code: resultCode, meta: { imports }, map: mapGen.toString() }
      },
    },
  } satisfies Plugin
}
