import type { AxiosInstance } from 'axios'
import type {
  Resource as ResourceRaw,
  StatisticsSection,
} from 'fcs-sru-aggregator-api-adapter-typescript'

// --------------------------------------------------------------------------

export interface Resource extends ResourceRaw {
  // converted sub resources
  subResources: Resource[]

  // field will be set in resources.ts#fromApi
  rootResourceId: string | null
}

// --------------------------------------------------------------------------

export interface Statistics {
  'Last Scan': StatisticsSection
  'Recent Searches': StatisticsSection
}

// --------------------------------------------------------------------------

export function getSearchResultsURL(
  axios: AxiosInstance,
  searchID: string,
  resourceID: string | undefined = undefined,
  metaOnly: boolean = false
) {
  if (!searchID) throw new Error('Invalid "searchID" parameter!')

  let url = `search/${searchID}`
  if (metaOnly) url = `${url}/metaonly`

  if (resourceID !== undefined) url = `${url}?resourceId=${encodeURIComponent(resourceID)}`

  return axios.getUri({ url })
}
