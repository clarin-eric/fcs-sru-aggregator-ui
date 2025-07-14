import type { Plugin } from 'vite'

import picomatch from 'picomatch'

import path from 'node:path'

interface PluginOptions {
  pattern: StringFilter
  debug?: boolean
}

type StringFilter = string | RegExp | (string | RegExp)[]

// vite/src/shared/utils.ts
const windowsSlashRE = /\\/g
function slash(p: string): string {
  return p.replace(windowsSlashRE, '/')
}

// vite/src/node/plugins/pluginFilter.ts
function getMatcherString(glob: string, cwd: string) {
  if (glob.startsWith('**') || path.isAbsolute(glob)) {
    return slash(glob)
  }
  const resolved = path.join(cwd, glob)
  return slash(resolved)
}

// vite/src/node/plugins/pluginFilter.ts
function patternToIdFilter(pattern: string | RegExp, cwd: string) {
  if (pattern instanceof RegExp) {
    return (id: string) => {
      const normalizedId = slash(id)
      const result = pattern.test(normalizedId)
      pattern.lastIndex = 0
      return result
    }
  }
  const glob = getMatcherString(pattern, cwd)
  const matcher = picomatch(glob, { dot: true })
  return (id: string) => {
    const normalizedId = slash(id)
    return matcher(normalizedId)
  }
}

function createIdFilter(filter: StringFilter, cwd = process.cwd()) {
  const filterList = typeof filter === 'string' || filter instanceof RegExp ? [filter] : filter
  const filterFn = filterList.map((pattern) => patternToIdFilter(pattern, cwd))
  return (input: string) => {
    const inputPath = getMatcherString(input, cwd)
    return filterFn.some((filter) => filter(inputPath))
  }
}

export default function deleteGeneratedFilesPlugin(config: PluginOptions) {
  // console.debug('config', config)

  const filter = createIdFilter(config.pattern)

  return {
    name: 'clarin:delete-generated-files',

    generateBundle: {
      order: 'post',
      handler(_options, bundle) {
        // console.log('[generateBundle]', { options, bundle, isWrite })
        const assetsToDelete = Object.getOwnPropertyNames(bundle).filter(filter)
        if (config.debug) {
          assetsToDelete.forEach((asset) => this.warn(`Removing asset '${asset}' from bundle.`))
        }
        assetsToDelete.forEach((asset) => delete bundle[asset])
      },
    },
  } satisfies Plugin
}
