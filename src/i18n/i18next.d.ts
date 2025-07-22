// https://www.i18next.com/overview/typescript

// import the original type declarations
import 'i18next'

// import all namespaces (for the default language, only)
import nsEnApp from '@locales/en/app.json'
import nsEnCommon from '@locales/en/common.json'
import nsEnQuerysuggestions from '@locales/en/querysuggestions.json'
import nsEnQuerybuilder from '@locales/en/querybuilder.json'

declare module 'i18next' {
  // Extend CustomTypeOptions
  interface CustomTypeOptions {
    // custom namespace type, if you changed it
    defaultNS: 'app'
    // custom resources type
    resources: {
      app: typeof nsEnApp
      common: typeof nsEnCommon
      querysuggestions: typeof nsEnQuerysuggestions
      querybuilder: typeof nsEnQuerybuilder
    }
    // other
  }
}
