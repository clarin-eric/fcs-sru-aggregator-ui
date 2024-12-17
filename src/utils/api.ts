import { type AxiosInstance } from 'axios'

export async function getInitData(axios: AxiosInstance) {
  const response = await axios.get('init')
  console.debug('[getInitData]', response)
  return response.data

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
  version: Version
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

export type SearchCapability = 'BASIC_SEARCH' | 'ADVANCED_SEARCH'
export type Version = 'VERSION_2' | 'VERSION_1'

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
