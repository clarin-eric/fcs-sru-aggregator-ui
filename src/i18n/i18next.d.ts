// https://www.i18next.com/overview/typescript

// import the original type declarations
import 'i18next'

// import all namespaces (for the default language, only)
import nsEnApp from '@locales/en/app.json'
import nsEnCommon from '@locales/en/common.json'
import nsEnClarinApp from '@locales/en/clarin.app.json'
import nsEnClarinCommon from '@locales/en/clarin.common.json'
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
      'clarin.app': typeof nsEnClarinApp
      'clarin.common': typeof nsEnClarinCommon
      querybuilder: typeof nsEnQuerybuilder
    }
    // other
  }
}
