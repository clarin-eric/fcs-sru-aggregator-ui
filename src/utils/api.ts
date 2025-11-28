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
