import Prism from '@vendor/prismjs'

export function queryTypeToPrismLanguage(queryType?: string) {
  if (queryType === 'cql') return 'fcs-cql'
  if (queryType === 'fcs') return 'fcs-fcsql'
  if (queryType === 'lex') return 'fcs-lexcql'
  return 'plain'
}

export function highlightSyntax(value: string, queryType?: string) {
  // console.debug('do syntax highlighting ...', { value, queryType })

  // value = JSON.stringify(Object.keys(Prism.languages))
  const language = queryTypeToPrismLanguage(queryType)
  const pluginClasses = 'match-braces rainbow-braces'

  let prismValue = value
  try {
    prismValue = Prism.highlight(value, language)
  } catch (error) {
    console.warn('Error trying to highlight value', { value, error, language })
  }
  const html = `<pre><code class="language-${language} ${pluginClasses}">${prismValue}</code></pre>`

  return html
}
