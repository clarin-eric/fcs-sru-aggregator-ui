// https://app.quicktype.io/?l=ts

export interface Endpoint {
  url: string
  protocol: Protocol
  searchCapabilities: SearchCapability[]
}

export interface EndpointInstitution {
  name: string
  link: string
  endpoints: Endpoint[]
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

  // will be populated on initialization of Resources
  visible?: boolean
  selected?: boolean
  expanded?: boolean
  priority?: number
  index?: number
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
export type Encoding = 'VALUE' | 'EMPTY'
export type DeliveryPolicy = 'SEND_BY_DEFAULT' | 'NEED_TO_REQUEST'
export type MIMEType =
  | 'application/x-clarin-fcs-hits+xml'
  | 'application/x-clarin-fcs-adv+xml'
  | 'application/x-cmdi+xml'
  | 'application/x-clarin-fcs-kwic+xml'
  | 'application/x-clarin-fcs-lex+xml'
export type Protocol = 'VERSION_2' | 'VERSION_1' | 'LEGACY'
export type LayerType =
  | 'text'
  | 'lemma'
  | 'pos'
  | 'orth'
  | 'norm'
  | 'phonetic'
  | 'word' // ?
  | 'entity'
export type AvailableDataViewIdentifier = 'hits' | 'adv' | 'cmdi' | 'kwic' | 'lex' | string

// --------------------------------------------------------------------------

const multipleLanguageCode = 'mul' // TODO

class Resources {
  resources: Resource[]

  constructor(resources: Resource[]) {
    this.resources = resources
  }

  prepare() {
    const sortFn = function (x: Resource, y: Resource) {
      const r = x.institution.localeCompare(y.institution)
      if (r !== 0) {
        return r
      }
      return x.title.toLowerCase().localeCompare(y.title.toLowerCase())
    }

    this.recurse((resource: Resource) => {
      resource.subResources.sort(sortFn)
    })
    this.resources.sort(sortFn)

    this.recurse((resource: Resource, index: number) => {
      resource.visible = true // visible in the resource view
      resource.selected = false // not selected in the resource view, assign later
      resource.expanded = false // not expanded in the resource view
      resource.priority = 1 // used for ordering search results in resource view
      resource.index = index // original order, used for stable sort
    })
  }

  recurseResources(
    resources: Resource[],
    fn:
      | ((resource: Resource, index: number) => boolean | void)
      | ((resource: Resource) => boolean | void)
  ) {
    const recfn = (resource: Resource, index: number) => {
      if (false === fn(resource, index)) {
        // no recursion
      } else {
        resource.subResources.forEach(recfn)
      }
    }
    resources.forEach(recfn)
  }

  recurseResource(resource: Resource, fn: (resource: Resource) => boolean | void) {
    if (false === fn(resource)) {
      // no recursion
    } else {
      this.recurseResources(resource.subResources, fn)
    }
  }

  recurse(
    fn:
      | ((resource: Resource, index: number) => boolean | void)
      | ((resource: Resource) => boolean | void)
  ) {
    this.recurseResources(this.resources, fn)
  }

  getLanguageCodes() {
    const languages: { [key: string]: boolean } = {}
    this.recurse(function (resource: Resource) {
      resource.languages.forEach(function (language) {
        languages[language] = true
      })
      return true
    })
    return languages
  }

  isResourceVisible(resource: Resource, queryTypeId: string, languageCode: string): boolean {
    // check search capabilities (ignore version, just check caps)
    if (
      queryTypeId === 'fcs' &&
      resource.endpoint.searchCapabilities.indexOf('ADVANCED_SEARCH') === -1
    ) {
      return false
    }
    // yes for any language
    if (languageCode === multipleLanguageCode) {
      return true
    }
    // yes if the resource is in only that language
    if (
      resource.languages &&
      resource.languages.length === 1 &&
      resource.languages[0] === languageCode
    ) {
      return true
    }

    // ? yes if the resource also contains that language
    if (resource.languages && resource.languages.indexOf(languageCode) >= 0) {
      return true
    }

    // ? yes if the resource has no language
    // if (!resource.languages || resource.languages.length === 0) {
    // 	return true;
    // }
    return false
  }

  setVisibility(queryTypeId: string, languageCode: string) {
    // top level
    this.resources.forEach((resource: Resource) => {
      resource.visible = this.isResourceVisible(resource, queryTypeId, languageCode)
      this.recurseResources(resource.subResources, (c: Resource) => {
        c.visible = resource.visible
      })
    })
  }

  setAggregationContext(endpoints2handles: { [key: string]: string[] }) {
    const selectSubTree = (select: boolean, resource: Resource) => {
      resource.selected = select
      this.recurseResources(resource.subResources, (c: Resource) => {
        c.selected = resource.selected
      })
    }

    this.resources.forEach(selectSubTree.bind(this, false)) // TODO: check this with arrow function

    const handlesNotFound: string[] = []
    const resourcesToSelect: Resource[] = []
    Object.entries(endpoints2handles).forEach((endp) => {
      const endpoint = endp[0]
      const handles = endp[1]
      console.debug('setAggregationContext: endpoint', endpoint)
      console.debug('setAggregationContext: handles', handles)
      handles.forEach((handle: string) => {
        let found = false
        this.recurse((resource: Resource) => {
          if (resource.handle === handle) {
            found = true
            resourcesToSelect.push(resource)
          }
        })
        if (!found) {
          console.warn('Handle not found in resources', handle)
          handlesNotFound.push(handle)
        }
      })
    })

    resourcesToSelect.forEach(selectSubTree.bind(this, true))
    return { selected: resourcesToSelect, unavailable: handlesNotFound }
  }

  getSelectedIds() {
    const ids: string[] = []
    this.recurse(function (resource: Resource) {
      if (resource.visible && resource.selected) {
        ids.push(resource.id)
        //return false; // top-most resource in tree, don't delve deeper
        // TODO: But subresources are also selectable on their own?...
      }
      return true
    })

    // console.debug("ids: ", ids.length, {ids:ids});
    return ids
  }

  getSelectedMessage() {
    const selected = this.getSelectedIds().length
    if (this.resources.length === selected) {
      return `All available resources (${selected})`
    } else if (selected === 1) {
      return '1 selected resource'
    }
    return `${selected} selected resources`
  }
}

export default Resources
