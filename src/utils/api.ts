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

export type SearchCapability = 'BASIC_SEARCH' | 'ADVANCED_SEARCH'
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
