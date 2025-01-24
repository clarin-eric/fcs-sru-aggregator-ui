# FCS SRU Aggregator UI

## Technologies

The frontend uses the following technologies:

- [ReactJS](https://18.react.dev/) 18.3.1
  - [React Router](https://reactrouter.com/start/library/installation) ("library") 7.0.2 for <abbr title="Single Page Application">SPA</abbr> routing
  - [React Query](https://tanstack.com/query/latest) 5.62.7 with [Axios](https://github.com/axios/axios) 1.7.9 for web requests
- [Bootstrap](https://getbootstrap.com/) 5.3.3 with [Bootstrap Icons](https://icons.getbootstrap.com/) 1.11.3, integration with [React Bootstrap](https://react-bootstrap.netlify.app/) 2.10.6
- [microfuzz](https://github.com/Nozbe/microfuzz) 1.0.0 for fuzzy searching
- [PrismJS](https://github.com/PrismJS/prism) 1.29.0 for syntax highlighting
- [Zustand](https://github.com/pmndrs/zustand) 5.0.2 for state management of external bundle configuration
- [React Helmet (Async Fork)](https://github.com/staylor/react-helmet-async) 2.0.5 for webpage meta information

For development and building a few additional dependencies are required:

- [Vite](https://vite.dev/) 6.0.1 with plugins
- [TypeScript](https://www.typescriptlang.org/) 5.6.2 with `@types/*` definitions
- [ESLint](https://eslint.org/) 9.15.0 with plugins

## Features

- Modern, mobile-friendly, dark-mode, accessibility (ARIA) support
- Single[¹](#footnote-1) <abbr title="Single Page Application">SPA</abbr> bundle for easy integration
- Various usability features like fuzzy filtering, ...

<a id="footnote-1">¹</a> The build process will generate multiple JS and CSS files to split application code from vendor code but those files only need to be included as scripts/styles in a static `index.html` page without requiring any complicated server setup.

## Requirements

- Node 18+ (?)

## How to deploy

### Building

Running the following command will create a fully static bundle that is ready to be deployed. The build artifacts will be placed into the [`dist/`](dist/) folder. The `index.html` file is the entry point with all dependencies (scripts, styles, images and other assets) in the `lib/` subfolder.

```bash
npm run build
```

An overview over all the dependency modules and code files will be generated by [rollup-plugin-visualizer](https://github.com/btd/rollup-plugin-visualizer) and can be found in either [`bundle-visualization.html`](bundle-visualization.html) or [`dist/bundle-visualization.html`](dist/bundle-visualization.html) depending on the plugin configuration.

### Configuration

The bundle can be pre-configured by adjusting the `import.meta.env.` constants found in the [`vite.config.ts`](vite.config.ts) configuration file.

- "branding" related configs:
  - `HEAD_TITLE`: the base application title for the browser
  - `CONTACT_ADDRESS`: the contact email address for users to get in contact with
  - `TERMS_AND_DISCLAIMER_ADDRESS`: the webpage with information about the website like disclaimer, imprint, GDPR, ...
- deployment base configuration
  - `DEPLOY_PATH`: the (sub-)path the application is served from, by default `/` for the root
  - `API_URL`: the backend FCS SRU Aggregator REST API endpoint, **required!**
  - `VALIDATOR_URL`: the URL to the FCS Endpoint Validator
- optional features
  - `SHOW_SEARCH_RESULT_LINK`: boolean, whether to display a semi-permanent search results link, _use only for development to avoid confusion_
  - `FEATURE_TRACKING_MATOMO`: boolean, whether to include Matomo/Piwik tracking/statistics calls
    - `FEATURE_TRACKING_MATOMO_PARAMS`: parameters for tracking setup, set with `JSON.stringify({})` where the parameter object `{}` should contain the following entries:
      - `siteId`: number, required, for `setSiteId`
      - `trackerUrl`: URL for tracking server, required, for `setTrackerUrl`, likely something like `<baseUrl>/matomo.php`
      - `enableLinkTracking`: boolean, optional, by default `true`, can be disabled
      - `domains`: string[], optional, can be a list of to be considered "local" domain names, for `setDomains`
      - `userId`: string, optional, will be hashed with [cyrb53](https://stackoverflow.com/a/52171480/9360161), for `setUserId`
      - `srcUrl`: URL for JS script source to load Matomo/Piwik script, required, likely something like `<baseUrl>/matomo.js`
      - NOTE: if not set or any required value is likely invalid, then tracking will not be configured!

Runtime configuration can be set using the `window.MyAggregator` object and needs to be included before the application script [`fcs-sru-aggregator-ui-X.Y.Z.js`](dist/lib/) is being loaded. They are completely optional but can be used to override bundle configuration.

- `DEPLOY_PATH`: the basename of the application, e.g. if deployed on some subpath like `example.org/aggregator/` use `/aggregator`, by default `/`
- `API_URL`: the base URL to the FCS SRU Aggregator REST API, e.g. `https://contentsearch.clarin.eu/rest/`
- `VALIDATOR_URL`: the base URL to the FCS Endpoint Validator, e.g. `https://www.clarin.eu/fcsvalidator/`
- `SHOW_SEARCH_RESULT_LINK`: boolean (`true`/`false`) for whether to display a semi-permanent link to search results using the internal searchID

## Development

Based on _React + TypeScript + Vite_ template (`npm create vite@latest`), a minimal setup to get React working in Vite with HMR and some ESLint rules. Uses the [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) plugin for Fast Refresh.

For local testing run:

```bash
npm run dev
```

### Update dependencies

- Check possible upgrades with `npx npm-check-updates`
- Check system information (for bug reports etc.) `npx envinfo --system --npmPackages --binaries --browsers`

### Expanding the ESLint configuration (TODO)

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```
