import type { Plugin } from 'vite'

interface PluginOptions {
  logoPath: string
  debug?: boolean
}

export const virtualModuleId = 'clarin/configurable-app-logo-image-module'
const resolvedVirtualModuleId = '\0' + virtualModuleId + '.js'

// TODO: maybe extend this to multiple assets?
// would need some distinctive virtual module id or user data to distinguish between resolveId<->load calls

export default function configurableAppLogoImagePlugin(config: PluginOptions) {
  if (config.debug) console.debug('config', config)

  return {
    name: 'clarin:configurable-app-logo-image',

    resolveId: {
      filter: { id: /\/app-logo.png$/ },
      async handler() {
        // try to resolve path
        const resolvedPath = await this.resolve(config.logoPath)
        if (config.debug) console.debug('resolvedPath', { logoPath: config.logoPath, resolvedPath })
        // if not found then null and we do our own magic otherwise return the resolve result
        return resolvedPath ?? resolvedVirtualModuleId
      },
    },

    load: {
      filter: { id: new RegExp(`^${resolvedVirtualModuleId}$`) },
      handler(id: string) {
        if (config.debug) console.debug('[load]', id)
        // return "nothing" to disable logo
        return 'export default ""'
      },
    },
  } satisfies Plugin
}
