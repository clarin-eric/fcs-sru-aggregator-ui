import type { AxiosInstance } from 'axios'

import type { LanguageCode2NameMap, LanguageFilterOptions } from '@/utils/search'
import type { DownloadFormats, QueryTypeID } from './constants'

// https://app.quicktype.io/?l=ts

// --------------------------------------------------------------------------

export interface ExtraScopingParams {
  consortia?: string | null
}

export const REQ_PARAM_CONSORTIA = 'x-consortia'

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
  id: string
  numberOfRecords: null
  languages: string[]
  landingPage: null | string
  title: string | { [language: string]: string }
  description: null | string | { [language: string]: string }
  institution: string | { [language: string]: string }
  searchCapabilities: SearchCapability[]
  searchCapabilitiesResolved: SearchCapability[]
  availabilityRestriction: AvailabilityRestriction
  availableDataViews: AvailableDataView[] | null
  availableLayers: AvailableLayer[] | null
  availableLexFields: AvailableLexField[] | null
  subResources: Resource[]
  exampleQueries?: ExampleQuery[]
  // field will be set in resources.ts#fromApi
  rootResourceId: string | null
}

export interface Endpoint {
  url: string
  protocol: ProtocolVersion
  searchCapabilities: SearchCapability[]
}

export interface EndpointInstitution {
  name: string
  link: string
  consortium?: Consortium
  endpoints: Endpoint[]
  sideloaded?: boolean
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
  qualifier?: null | string
  altValueInfo?: null
  altValueInfoURI?: null
}

export interface AvailableLexField {
  id: string
  type: LexFieldType
}

export interface ExampleQuery {
  query: string
  queryType: QueryTypeID
  description: { [language: string]: string }
}

export type Consortium =
  | 'CLARIAH-AT'
  | 'CLARIN-BE'
  | 'CLARIN-D'
  | 'CLARIN-DK'
  | 'CLARIN-IT'
  | 'CLARIN-LV'
  | 'CLARIN-PL'
  | 'LINDAT/CLARIAH-CZ'
  | 'PORTULAN CLARIN'
  | 'SWE-CLARIN'
  | string

export type SearchCapability =
  | 'BASIC_SEARCH'
  | 'ADVANCED_SEARCH'
  | 'LEX_SEARCH'
  | 'AUTHENTICATED_SEARCH'
export type ProtocolVersion = 'VERSION_2' | 'VERSION_1' | 'LEGACY'
export type AvailabilityRestriction = 'NONE' | 'AUTH_ONLY' | 'PERSONAL_IDENTIFIER'

export type Encoding = 'VALUE' | 'EMPTY'
export type DeliveryPolicy = 'SEND_BY_DEFAULT' | 'NEED_TO_REQUEST'
export type MIMEType =
  | 'application/x-clarin-fcs-hits+xml'
  | 'application/x-clarin-fcs-adv+xml'
  | 'application/x-clarin-fcs-lex+xml'
  | 'application/x-clarin-fcs-kwic+xml'
  | 'application/x-cmdi+xml'
export type LayerType =
  | 'text'
  | 'lemma'
  | 'pos'
  | 'orth'
  | 'norm'
  | 'phonetic'
  | 'word' // TODO: 'word' non-standard/legacy layer type?
  | 'entity'
export type LexFieldType =
  | 'entryId'
  | 'lemma'
  | 'translation'
  | 'transcription'
  | 'phonetic'
  | 'definition'
  | 'etymology'
  | 'case'
  | 'number'
  | 'gender'
  | 'pos'
  | 'baseform'
  | 'segmentation'
  | 'sentiment'
  | 'frequency'
  | 'antonym'
  | 'hyponym'
  | 'hypernym'
  | 'meronym'
  | 'holonym'
  | 'synonym'
  | 'related'
  | 'ref'
  | 'senseRef'
  | 'citation'
export type VirtualLexFieldType = 'lang'
export type AvailableDataViewIdentifier = 'hits' | 'adv' | 'cmdi' | 'kwic' | 'lex' | string

// --------------------------------------------------------------------------

export async function getInitData(axios: AxiosInstance, params?: ExtraScopingParams) {
  const urlParams = new URLSearchParams()
  if (params?.consortia !== undefined && params?.consortia !== null) {
    urlParams.set(REQ_PARAM_CONSORTIA, params.consortia)
  }
  const url = 'init' + (urlParams.entries().next().done ? '' : `?${urlParams}`)

  const response = await axios.get(url)
  console.debug('[getInitData]', response)
  return response.data as InitData

  // TODO: mock
  // return { languages: [], resources: [], weblichtLanguages: [] }
}

export async function getResources(axios: AxiosInstance, params?: ExtraScopingParams) {
  const urlParams = new URLSearchParams()
  if (params?.consortia !== undefined && params?.consortia !== null) {
    urlParams.set(REQ_PARAM_CONSORTIA, params.consortia)
  }
  const url = 'resources' + (urlParams.entries().next().done ? '' : `?${urlParams}`)

  const response = await axios.get(url)
  console.debug('[getResources]', response)
  return response.data as Resource[]

  // TODO: mock
  // return [] satisfies Resource[]
}

export async function getLanguages(axios: AxiosInstance, params?: ExtraScopingParams) {
  const urlParams = new URLSearchParams()
  if (params?.consortia !== undefined && params?.consortia !== null) {
    urlParams.set(REQ_PARAM_CONSORTIA, params.consortia)
  }
  const url = 'languages' + (urlParams.entries().next().done ? '' : `?${urlParams}`)

  const response = await axios.get(url)
  console.debug('[getLanguages]', response)
  return response.data as LanguageCode2NameMap

  // TODO: mock
  // return {} satisfies LanguageCode2NameMap
}

export async function getConsortia(axios: AxiosInstance) {
  const url = 'consortia'
  const response = await axios.get(url)
  console.debug('[getConsortia]', response)
  return (response.data as (string | null)[]).filter((consortium) => consortium !== null)
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
  rootResources: string[] | StatisticsResourceInfo[]
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

export interface StatisticsResourceInfo {
  handle: string
  title: string
  valid: boolean
  notes: string[]
}

// --------------------------------------------------------------------------

export async function getStatisticsData(axios: AxiosInstance, params?: ExtraScopingParams) {
  const urlParams = new URLSearchParams()
  if (params?.consortia !== undefined && params?.consortia !== null) {
    urlParams.set(REQ_PARAM_CONSORTIA, params.consortia)
  }
  const url = 'statistics' + (urlParams.entries().next().done ? '' : `?${urlParams}`)

  const response = await axios.get(url)
  console.debug('[getStatisticsData]', response)
  return response.data as Statistics

  // TODO: mock
  // return {
  //   'last-scan': { institutions: {}, date: 0, timeout: 0, isScan: true },
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

export interface ResourceSearchResultMetaOnly {
  id: string
  resourceHandle: string
  endpointUrl: string

  inProgress: boolean
  nextRecordPosition: number
  numberOfRecords: number
  numberOfRecordsLoaded: number

  exception: Exception | null
  diagnostics: Diagnostic[]
  requestUrl?: string | null

  hasAdvResults: boolean
  hasLexResults: boolean
  isLexHits?: boolean
}

export interface ResourceSearchResult {
  id: string
  endpointUrl: string
  resourceHandle: string
  resource: Resource

  inProgress: boolean
  nextRecordPosition: number
  numberOfRecords: number
  numberOfRecordsLoaded: number

  exception: Exception | null
  diagnostics: Diagnostic[]
  requestUrl?: string | null

  isLexHits: boolean
  hasAdvResults: boolean
  hasLexResults: boolean

  records: ResultRecord[]
}

export interface ResultRecord {
  pid: string
  ref: string | null
  lang: string | null

  hits: Kwic
  adv: AdvancedLayer[] | null
  lex: LexEntry | null
}

export interface Kwic {
  fragments: KwicFragment[]
  left: string
  keyword: string
  right: string
}

export interface KwicFragment {
  text: string
  hit: boolean
  hitKind?: string
}

export interface AdvancedLayer {
  id: string
  spans: LayerFragment[]
}

export interface LayerFragment {
  text: string
  hit: boolean
  range?: [number, number]
}

export interface LexEntry {
  fields: LexField[]
  lang: string
  langUri: string
  pid: string
  reference: string | null
}

export interface LexField {
  type: LexFieldType | VirtualLexFieldType // TODO: test API responses
  values: LexValue[]
}

export interface LexValue {
  value: string | null // ?
  xmlId?: string
  xmlLang?: string
  langUri?: string
  preferred?: boolean
  ref?: string
  idRefs?: string[]
  vocabRef?: string
  vocabValueRef?: string
  type?: string
  source?: string
  sourceRef?: string
  date?: string
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

export async function getSearchResults(axios: AxiosInstance, searchID: string) {
  if (!searchID) throw new Error('Invalid "searchID" parameter!')

  const response = await axios.get(`search/${searchID}`)
  console.debug('[getSearchResults]', { searchID }, response)

  if (
    (response.data as SearchResults)?.results?.length > 0 &&
    (response.data as SearchResults).results[0].records === undefined
  ) {
    console.warn(
      "Using legacy FCS SRU Aggregator API with Search Results not in '.records'!",
      { searchID },
      response.data
    )
  }

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

  if (results[0].records === undefined) {
    console.warn(
      "Using legacy FCS SRU Aggregator API with Search Results not in '.records'!",
      { searchID },
      results
    )
  }

  return results[0]
}

// --------------------------------------------------------------------------

// TODO: alternatively to axios use AppStore?
// const apiURL = AppStore.getState().apiURL

export function getURLForDownload(
  axios: AxiosInstance,
  searchID: string,
  resourceID: string,
  format: DownloadFormats,
  language: string,
  languageFilter: LanguageFilterOptions
) {
  const params = new URLSearchParams({
    resourceId: resourceID, // encodeURIComponent
    format: format,
  })
  if (languageFilter === 'byGuess' || languageFilter === 'byMetaAndGuess') {
    params.set('filterLanguage', language)
  }
  const relURL = `search/${searchID}/download?${params.toString()}`
  return axios.getUri({ url: relURL })
}

export function getURLForWeblicht(
  axios: AxiosInstance,
  searchID: string,
  resourceID: string,
  languageForWeblicht: string | null,
  language: string,
  languageFilter: LanguageFilterOptions
) {
  const params = new URLSearchParams({
    resourceId: resourceID, // encodeURIComponent
  })
  if (languageForWeblicht) {
    params.set('filterLanguage', languageForWeblicht)
  } else if (languageFilter === 'byGuess' || languageFilter === 'byMetaAndGuess') {
    params.set('filterLanguage', language)
  }
  const relURL = `search/${searchID}/toWeblicht?${params.toString()}`
  return axios.getUri({ url: relURL })
}
