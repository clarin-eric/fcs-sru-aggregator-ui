// --------------------------------------------------------------------------

// declare global {
//   interface Window {
//     _paq: { push: (params: unknown[]) => void }
//   }
// }

declare const window: Window &
  typeof globalThis & {
    _paq: unknown[] | { push: (params: unknown[]) => void }
  }

// --------------------------------------------------------------------------

export function trackPageView(url: string, title?: string) {
  window._paq.push(['setDocumentTitle', title ?? document.title])
  window._paq.push(['setCustomUrl', url])
  window._paq.push(['trackPageView'])
}

export function trackSiteSearch(
  query: string,
  category: string | boolean = false,
  count: number | boolean = false
) {
  // TODO: category for "search"/"search-more" vs. cql/fcs/lex/...?
  // TODO: custom dimension for search params (queryType, numberOfResults, resourceIDs)
  window._paq.push(['trackSiteSearch', query, category, count])
}

export function trackSiteSearchWithDimensions(
  query: string,
  category: string | boolean = false,
  count: number | boolean = false,
  dimensions: { [key: string]: unknown }
) {
  window._paq.push(['trackSiteSearch', query, category, count, dimensions])
}

// export function trackUserId(userId: string) {
//   window._paq.push(['setUserId', userId])
//   window._paq.push(['trackPageView'])
// }

// --------------------------------------------------------------------------
