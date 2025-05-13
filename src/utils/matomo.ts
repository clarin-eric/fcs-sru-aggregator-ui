import cyrb53 from '@/utils/cyrb53'

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

export interface SetupParams {
  siteId: number
  trackerUrl: string
  enableLinkTracking?: boolean
  domains?: string[]
  userId?: string
}

interface InstallScriptParams {
  srcUrl: string
}

export type SetupAndInstallScriptParams = SetupParams & InstallScriptParams

// --------------------------------------------------------------------------

window._paq = window['_paq'] || []

// --------------------------------------------------------------------------

export function setup({
  siteId,
  trackerUrl,
  enableLinkTracking = true,
  domains = [],
  userId = undefined,
}: SetupParams) {
  window._paq.push(['setTrackerUrl', trackerUrl])
  window._paq.push(['setSiteId', siteId])

  if (userId) {
    // should optimally a hashed ID
    window._paq.push(['setUserId', userId])
  }

  if (Array.isArray(domains) && domains.length > 0) {
    window._paq.push(['setDomains', domains])
  }

  if (enableLinkTracking) {
    window._paq.push(['enableLinkTracking'])
    // https://developer.matomo.org/guides/tracking-javascript-guide#changing-the-pause-timer
    window._paq.push(['setLinkTrackingTimer', 250]) // 250 milliseconds
  }
}

export function installScript({ srcUrl }: InstallScriptParams) {
  // https://developer.matomo.org/guides/tracking-javascript-guide
  const script = document.createElement('script')
  const scripts = document.getElementsByTagName('script')[0]

  script.type = 'text/javascript'
  script.async = true
  script.defer = true
  script.src = srcUrl

  if (scripts && scripts.parentNode) {
    scripts.parentNode.insertBefore(script, scripts)
  }
}

export function setupAndInstallFromConfigString(
  configString?: string | SetupAndInstallScriptParams | null
) {
  if (!configString) return false

  let params = null
  if (typeof configString === 'string') {
    try {
      params = JSON.parse(configString)
      console.debug('tracking params', params)
    } catch (error) {
      console.error('Error trying to parse tracking params!', error)
      return false
    }
  } else if (typeof configString === 'object') {
    params = configString
    console.debug('tracking params (object)', params)
  }

  const siteId = params['siteId']
  const trackerUrl = params['trackerUrl']
  const srcUrl = params['srcUrl']
  const domains = params['domains'] // can be undefined or empty array
  const userId = params['userId']?.toString()

  if (srcUrl === undefined) {
    console.warn('No "srcUrl" configuration set for tracking!')
    return false
  }
  if (trackerUrl === undefined) {
    console.warn('No "trackerUrl" configuration set for tracking!')
    return false
  }
  if (siteId === undefined || !Number.isInteger(siteId)) {
    console.warn('No "siteId" configuration set for tracking!')
    return false
  }

  const setupParams = { siteId, trackerUrl, domains } as SetupParams
  if (userId) setupParams['userId'] = cyrb53(userId).toString()
  const installParams = { srcUrl }

  setup(setupParams)
  trackPageView(document.location.href || window.location.href, document.title)
  installScript(installParams)

  return true // should be successful
}

// --------------------------------------------------------------------------

export function trackPageView(url: string, title?: string, referrerUrl?: string) {
  window._paq.push(['setDocumentTitle', title ?? document.title])
  window._paq.push(['setCustomUrl', url])
  if (referrerUrl !== undefined) window._paq.push(['setReferrerUrl', referrerUrl])
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

// --------------------------------------------------------------------------
