# FCS SRU Aggregator UI

## Technologies

The frontend uses the following technologies:

- ReactJS 18.3.1
  - React Router 7.0.2 for SPA routing
  - React Query 5.62.7 with Axios 1.7.9 for web requests
- Bootstrap 5.3.3 with Bootstrap Icons 1.11.3, integration with `react-bootstrap` 2.10.6
- microfuzz 1.0.0 for fuzzy searching
- PrismJS 1.29.0 for syntax highlighting
- Zustand 5.0.2

For development and building a few additional dependencies are required:

- vite 6.0.1 with plugins
- typescript 5.6.2 with `@types/*` definitions
- eslint 9.15.0 with plugins

## Development

Based on _React + TypeScript + Vite_ template (`npm create vite@latest`), a minimal setup to get React working in Vite with HMR and some ESLint rules. Uses the [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) plugin for Fast Refresh.

### Update dependencies

- Check possible upgrades with `npx npm-check-updates`

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
