import { type AxiosInstance } from 'axios'

import { type LanguageCode2NameMap } from '@/utils/search'

// https://app.quicktype.io/?l=ts

// --------------------------------------------------------------------------

export interface InitData {
  languages: LanguageCode2NameMap
  resources: Resource[]
  weblichtLanguages: string[]
}

export interface Resource {
  endpointInstitution: EndpointInstitution
  endpoint: Endpoint
  handle: string
  numberOfRecords: null
  languages: string[]
  landingPage: null | string
  title: string
  description: null | string
  institution: string
  searchCapabilities: SearchCapability[]
  availableDataViews: AvailableDataView[] | null
  availableLayers: AvailableLayer[] | null
  subResources: Resource[]
  id: string
  searchCapabilitiesResolved: SearchCapability[]
}

export interface Endpoint {
  url: string
  protocol: ProtocolVersion
  searchCapabilities: SearchCapability[]
}

export interface EndpointInstitution {
  name: string
  link: string
  endpoints: Endpoint[]
}

export interface AvailableDataView {
  identifier: AvailableDataViewIdentifier
  mimeType: MIMEType
  deliveryPolicy: DeliveryPolicy
}

export interface AvailableLayer {
  identifier: string
  resultId: string
  layerType: LayerType
  encoding: Encoding
  qualifier: null | string
  altValueInfo: null
  altValueInfoURI: null
}

export type SearchCapability = 'BASIC_SEARCH' | 'ADVANCED_SEARCH' | 'LEX_SEARCH'
export type ProtocolVersion = 'VERSION_2' | 'VERSION_1' | 'LEGACY'

export type Encoding = 'VALUE' | 'EMPTY'
export type DeliveryPolicy = 'SEND_BY_DEFAULT' | 'NEED_TO_REQUEST'
export type MIMEType =
  | 'application/x-clarin-fcs-hits+xml'
  | 'application/x-clarin-fcs-adv+xml'
  | 'application/x-cmdi+xml'
  | 'application/x-clarin-fcs-kwic+xml'
  | 'application/x-clarin-fcs-lex+xml'
export type LayerType =
  | 'text'
  | 'lemma'
  | 'pos'
  | 'orth'
  | 'norm'
  | 'phonetic'
  | 'word' // TODO: 'word' non-standard/legacy layer type?
  | 'entity'
export type AvailableDataViewIdentifier = 'hits' | 'adv' | 'cmdi' | 'kwic' | 'lex' | string

// --------------------------------------------------------------------------

export async function getInitData(axios: AxiosInstance) {
  const response = await axios.get('init')
  console.debug('[getInitData]', response)
  return response.data as InitData

  // TODO: mock
  // return { languages: [], resources: [], weblichtLanguages: [] }
}

// --------------------------------------------------------------------------

export interface Statistics {
  'Last Scan': StatisticsSection
  'Recent Searches': StatisticsSection
}

export interface StatisticsSection {
  institutions: { [institutionName: string]: { [endpointUrl: string]: InstitutionEndpointInfo } }
  date: number
  timeout: number
  isScan: boolean
}

export interface InstitutionEndpointInfo {
  version: ProtocolVersion
  searchCapabilities: SearchCapability[]
  rootResources: string[]
  maxConcurrentRequests: number
  diagnostics: Diagnostics
  errors: Errors
  maxQueueTime: number
  avgQueueTime: number
  avgExecutionTime: number
  maxExecutionTime: number
  numberOfRequests: number
}

export interface Diagnostics {
  [reason: string]: DiagnosticInfo
}
export interface Errors {
  [reason: string]: ErrorInfo
}

export interface DiagnosticInfo {
  diagnostic: Diagnostic
  context: string
  counter: number
}
export interface Diagnostic {
  uri: string
  message: string
  diagnostic: null | string
}

export interface ErrorInfo {
  exception: Exception
  context: string
  counter: number
}
export interface Exception {
  klass: string
  message: string
  cause: null | string
}

// --------------------------------------------------------------------------

export async function getStatisticsData(axios: AxiosInstance) {
  const response = await axios.get('statistics')
  console.debug('[getStatisticsData]', response)
  return response.data as Statistics

  // TODO: mock
  // return {
  //   'Last Scan': { institutions: {}, date: 0, timeout: 0, isScan: true },
  //   'Recent Searches': { institutions: {}, date: 0, timeout: 0, isScan: false },
  // }
}

// --------------------------------------------------------------------------

export interface PostSearchData {
  query: string
  queryType: string
  language: string
  numberOfResults: string
  resourceIds: string[]
}

export interface PostSearchMoreResultsData {
  resourceId: string
  numberOfResults: number
}

// --------------------------------------------------------------------------

export async function postSearch(axios: AxiosInstance, searchParams: PostSearchData) {
  const response = await axios.post('search', searchParams, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })
  console.debug('[postSearch]', searchParams, response)
  return response.data as string // UUID with searchID
}

export async function postSearchMoreResults(
  axios: AxiosInstance,
  searchID: string,
  searchParams: PostSearchMoreResultsData
) {
  const response = await axios.post(`search/${searchID}`, searchParams, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })
  console.debug('[postSearchMoreResults]', { searchID, searchParams }, response)
  return response.data as string // UUID with searchID
}

// --------------------------------------------------------------------------

export interface SearchResults {
  inProgress: number
  results: ResourceSearchResult[]
}

export interface SearchResultsMetaOnly {
  inProgress: number
  results: ResourceSearchResultMetaOnly[]
}

export interface ResourceSearchResult {
  resource: Resource
  inProgress: boolean
  nextRecordPosition: number
  numberOfRecords: number
  exception: Exception | null
  diagnostics: Diagnostic[]
  kwics: Kwic[]
  advancedLayers: Array<AdvancedLayer[]>
  hasAdvResults: boolean
}

export interface ResourceSearchResultMetaOnly {
  resourceHandle: string
  endpointUrl: string
  inProgress: boolean
  nextRecordPosition: number
  numberOfRecords: number
  numberOfRecordsLoaded: number
  exception: Exception | null
  diagnostics: Diagnostic[]
  id: string
  hasAdvResults: boolean
}

export interface BaseResultHit {
  pid: string
  reference: string | null
  language: string | null
}

export interface Kwic extends BaseResultHit {
  fragments: Fragment[]
  left: string
  keyword: string
  right: string
}

export interface AdvancedLayer extends BaseResultHit {
  spans: Fragment[]
}

export interface Fragment {
  text: string
  hit: boolean
}

// --------------------------------------------------------------------------

export async function getSearchResults(axios: AxiosInstance, searchID: string) {
  if (!searchID) throw new Error('Invalid "searchID" parameter!')

  const response = await axios.get(`search/${searchID}`)
  console.debug('[getSearchResults]', { searchID }, response)
  return response.data as SearchResults
}

export async function getSearchResultsMetaOnly(axios: AxiosInstance, searchID: string) {
  if (!searchID) throw new Error('Invalid "searchID" parameter!')

  const response = await axios.get(`search/${searchID}/metaonly`)
  console.debug('[getSearchResultsMetaOnly]', { searchID }, response)
  return response.data as SearchResultsMetaOnly
}

export async function getSearchResultsMetaOnlyForResource(
  axios: AxiosInstance,
  searchID: string,
  resourceID: string
) {
  if (!searchID) throw new Error('Invalid "searchID" parameter!')
  if (!resourceID) throw new Error('Invalid "resourceID" parameter!')

  const response = await axios.get(
    `search/${searchID}/metaonly?resourceId=${encodeURIComponent(resourceID)}`
  )
  console.debug('[getSearchResultsMetaOnlyForResource]', { searchID, resourceID }, response)

  const results = (response.data as SearchResultsMetaOnly).results.filter(
    (result) => result.id === resourceID
  )
  if (results.length === 0)
    throw new Error(
      `Results (meta) for resource not found! (searchId: ${searchID}, resourceId: ${resourceID})`
    )

  return results[0]
}

export async function getSearchResultDetails(
  axios: AxiosInstance,
  searchID: string,
  resourceID: string
) {
  if (!searchID) throw new Error('Invalid "searchID" parameter!')
  if (!resourceID) throw new Error('Invalid "resourceID" parameter!')

  const response = await axios.get(
    `search/${searchID}?resourceId=${encodeURIComponent(resourceID)}`
  )
  console.debug('[getSearchResultDetails]', { searchID, resourceID }, response)

  const results = (response.data as SearchResults).results.filter(
    (result) => result.resource.id === resourceID
  )
  if (results.length === 0)
    throw new Error(
      `Results for resource not found! (searchId: ${searchID}, resourceId: ${resourceID})`
    )

  return results[0]
}
