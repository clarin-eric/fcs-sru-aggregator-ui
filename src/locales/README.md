# Translations

The FCS SRU Aggregator UI uses [`i18next`](https://www.i18next.com/) to manage translations with the [`react-i18next` bindings](https://react.i18next.com/). Please look at their documentation for details about formatting, interpolation, plurals, contexts and nesting.

i18next uses JSON files to store translations, with separate folder for each available locale. E.g., [`en/`](en/) for `en` (English).

The default and fallback locale is `en`. Every translation key MUST exist in a file there. Other languages may use the fallback mechanism if translation texts can be kept as is or to incrementally translate the application into other languages.

Each JSON file in a locale folder is a [namespace](https://www.i18next.com/principles/namespaces). Most translations will live in the [`app.json`](en/app.json) file (`app` namespace) but some shared, commonly used strings are in [`common.json`](en/common.json) (`common` namespace). The [`querybuilder`](en/querybuilder.json) namespace is only loaded when the query builder is enabled and loaded by the user. The [`querysuggestions`](en/querysuggestions.json) namespace is intended for future use, i.e., to store examples with explanations about example queries for users.

In addition, i18next has be configured to allow for overrides using a _prefix_. This allows some more fine-grained configurations for branding etc. Currently `clarin` and `textplus` are the only _known_ options but this is extensible. Each translation key in a prefixed namespace JSON file MUST also appear in the base namespace JSON files. E.g., `urls.contact` is _defined_ but empty (`null`) in the file [`common.json`](en/common.json) but specified in the file [`clarin.common.json`](en/clarin.common.json). This allows the application code to check for prefixed variants first before falling back to the standard namespaces and to also conditionally disable parts of the UI when no prefixed translation is available.

Translation lookup is performed somewhat like the following algorithm. The first found translation will be used (non-`null`).

1. Check the current locale (e.g., `de`) for an existing translation
   1. (Optional) If a namespace was provided use it first before falling back to the defaults: → `app` → `common`.
   2. For each namespace, first check the prefixed variant if it exists before checking the unprefixed one. So, `clarin.app` before `app`.
2. Fallback to the default locale (`en`) and perform all checks again (see step 1)

The prefix checking logic is performed with `postProcessTryPrefixedNamespacesFirst` in [`src/i18n/i18next.ts`](../i18n/i18next.ts). You can also find other configurations in this file.

## Contributing

Contributions are welcome. Please fork this project on GitHub, create your own branch (e.g., `translation-xy`) and when you are finished, open a pull request here. This will allow the maintainers to look over you changes, allow room for suggestions and discussions if further modifications are required, before everything will be merged. If you want to be credited for your translations, please provide the necessary details (e.g., name and optionally webpage/email) and you will then also be listed on the "About" page.

The general contribution workflow is as follows:

1. Fork the project: https://github.com/clarin-eric/fcs-sru-aggregator-ui/fork
2. (Optional) To allow for more changes in the future (other languages or features), create a new branch (e.g., `translation-xy`) to separate your changes.
   - In Github you can switch to the branches view `https://github.com/<your-name>/fcs-sru-aggregator-ui/branches` and then use the "New branch" button.
   - Or locally, after cloning with `git checkout -b translation-xy`
3. Do your changes ...
   - In Github, type `.` to open the web editor.
   - You can test out your changes by running the web frontend in development mode on your local machine. For more details see [section "Development" in the main README](../../README.md#development).
     - This requires you to first install the dependencies before being able to run it!
     - You also need to create a [`.env.local`](../../.env.local) file to use the API URL of an existing FCS SRU Aggregator, e.g., `VITE_API_URL=https://alpha-contentsearch.clarin.eu/rest/`.
       - For new languages you may also want to set `VITE_LOCALES=["en", "de", "xy"]` to allow the `xy` language.
     - When the development server runs, you can open the application on your local machine and use the language switcher to change to your new locale.
4. Create a pull request
   - In Github with e.g., `https://github.com/clarin-eric/fcs-sru-aggregator-ui/compare/main...<your-name>:fcs-sru-aggregator-ui:translation-xy?expand=1`
   - Describe your changes, provide contribution details for crediting
   - Then wait ... until the maintainer can review your changes and get back to you.

### New Translations for other Languages

1. Create a new locale folder [`src/locales/<xy>`](./), e.g., the two-letter language code `xy` based on your [language code (ISO 639 Set 1)](https://en.wikipedia.org/wiki/List_of_ISO_639_language_codes).
2. Copy all the relevant namespace JSON files from the default language [`en/`](en/) into your new language folder. Alternatively, start with new empty files with the same names but manually add each translation key as you progress through them.
3. Update the translation strings for each key.
4. For testing, you may want to add `VITE_LOCALES=["en", "de", "xy"]` (with `xy` being your new language) to the [`.env.local`](../../.env.local) file to enable this language in the frontend language switcher.
5. When you are finished, commit your changes. And open a new pull request.

---

NOTE: _If anything is unclear, please reach out to us. Via issue or by email. Feedback is always welcome._