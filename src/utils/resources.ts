import { type Resource } from '@/utils/api'
import {
  MULTIPLE_LANGUAGE_CODE,
  type ResourceSelectionModalViewOptionSorting,
} from '@/utils/search'
import { QueryTypeID } from '@/utils/constants'

// --------------------------------------------------------------------------

export function fromApi(resources: Resource[]) {
  const prepareFn = (resource: Resource): Resource => {
    return {
      // copy original
      ...resource,
      // override and apply to sub-resources
      subResources: resource.subResources.map(prepareFn),
    }
  }
  const convertedResources = resources.map(prepareFn)

  const sortFn = function (x: Resource, y: Resource) {
    const r = x.institution.localeCompare(y.institution)
    if (r !== 0) {
      return r
    }
    return x.title.toLowerCase().localeCompare(y.title.toLowerCase())
  }
  recurseResources(convertedResources, (resource: Resource) => {
    resource.subResources.sort(sortFn)
  })
  convertedResources.sort(sortFn)

  return convertedResources
}

export function setAggregationContext(
  resources: Resource[],
  endpoints2handles: { [key: string]: string[] }
) {
  const selectedResourceIDs: string[] = []
  const handlesNotFound: string[] = []
  const resourcesToSelect: Resource[] = []

  Object.entries(endpoints2handles).forEach(([endpoint, handles]) => {
    console.debug('setAggregationContext:', { endpoint, handles })
    handles.forEach((handle: string) => {
      let found = false
      recurseResources(resources, (resource: Resource) => {
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

  recurseResources(resourcesToSelect, (resource: Resource) => {
    selectedResourceIDs.push(resource.id)
  })

  return { selected: selectedResourceIDs, unavailable: handlesNotFound }
}

// --------------------------------------------------------------------------

export function recurseResources(
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

export function recurseResource(resource: Resource, fn: (resource: Resource) => boolean | void) {
  if (false === fn(resource)) {
    // no recursion
  } else {
    recurseResources(resource.subResources, fn)
  }
}

export function getResourceIDs(resources: Resource[]) {
  const resourceIDs: string[] = []
  recurseResources(resources, (resource: Resource) => {
    resourceIDs.push(resource.id)
  })
  return resourceIDs
}

export function getAvailableResourceIDs(
  resources: Resource[],
  queryTypeId: QueryTypeID,
  languageCode: string
) {
  const resourceIDs: string[] = []
  const checkFn = (resource: Resource) =>
    isResourceAvailableDueToSubResource(resource, checkFn) ||
    isResourceAvailable(resource, queryTypeId, languageCode)

  recurseResources(resources, (resource: Resource) => {
    if (checkFn(resource)) {
      resourceIDs.push(resource.id)
    }
  })
  return resourceIDs
}

export function getInstitutions(resources: Resource[], resourceIDs: string[]) {
  const institutions = new Set<string>()

  recurseResources(resources, (resource: Resource) => {
    if (resourceIDs.includes(resource.id)) {
      institutions.add(resource.institution)
      // return false // top-most resource in tree, don't delve deeper
    }
    return true
  })

  // console.debug('institutions: ', institutions.size, { institutions: institutions })
  return Array.from(institutions)
}

// --------------------------------------------------------------------------

function isResourceAvailableForQueryType(resource: Resource, queryTypeId: QueryTypeID) {
  // check search capabilities (ignore version, just check caps)
  if (
    queryTypeId === 'fcs' &&
    resource.endpoint.searchCapabilities.indexOf('ADVANCED_SEARCH') === -1
  ) {
    // want 'fcs' but does not have 'ADVANCED_SEARCH' capability
    return false
  }
  // 'cql' is required default, so no check
  return true
}

function isResourceAvailableForLanguage(resource: Resource, languageCode: string) {
  // yes for any language
  if (languageCode === MULTIPLE_LANGUAGE_CODE) {
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
  // 	 return true
  // }

  return false
}

export function isResourceAvailableDueToSubResource(
  resource: Resource,
  checkFn: (resource: Resource) => boolean
) {
  // if no subresources, then it's not a requirement
  if (!resource.subResources || resource.subResources.length === 0) {
    return false
  }

  // recursively check
  let shouldBeAvailable = false // default false if no descendant says yes
  const recursivelyCheck = (resource: Resource) => {
    if (checkFn?.(resource) === true) {
      shouldBeAvailable = true
      return
    }
    resource.subResources.forEach(recursivelyCheck)
  }
  resource.subResources.forEach(recursivelyCheck)

  return shouldBeAvailable
}

export function isResourceAvailable(
  resource: Resource,
  queryTypeId: QueryTypeID,
  languageCode: string
): boolean {
  if (!isResourceAvailableForQueryType(resource, queryTypeId)) return false
  if (!isResourceAvailableForLanguage(resource, languageCode)) return false
  return true
}

// --------------------------------------------------------------------------

export const SORT_FNS: {
  [key in ResourceSelectionModalViewOptionSorting]: (a: Resource, b: Resource) => number
} = {
  'title-up': (a, b) => a.title.localeCompare(b.title),
  'title-down': (a, b) => -a.title.localeCompare(b.title),
  'institution-up': (a, b) => {
    const ret = a.institution.localeCompare(b.institution)
    return ret !== 0 ? ret : a.title.localeCompare(b.title)
  },
  'institution-down': (a, b) => {
    const ret = -a.institution.localeCompare(b.institution)
    return ret !== 0 ? ret : a.title.localeCompare(b.title)
  },
}

// export function isResourceSelectable(resource: Resource) { return true }
// export function isResourceAvailable(resource: Resource) { return true }
// export function isResourceVisible(resource: Resource) { return true }
// export function selectResource(resource: Resource, selected: boolean, propagate: boolean = true) {}
// export function sortResources(resources: Resource[], criteria: string)
