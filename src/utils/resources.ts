import type { Resource as ResourceRaw } from 'fcs-sru-aggregator-api-adapter-typescript'

import LocaleStore from '@/stores/locale'
import type { Resource } from '@/utils/api'
import { QueryTypeID } from '@/utils/constants'
import type { ResourceSelectionModalViewOptionSorting } from '@/utils/search'
import { MULTIPLE_LANGUAGE_CODE } from '@/utils/search'

// --------------------------------------------------------------------------

export function fromApi(resources: ResourceRaw[]) {
  const locale = LocaleStore.getState().locale

  const prepareFn = (resource: ResourceRaw, rootResource: ResourceRaw | null = null): Resource => {
    return {
      // copy original
      ...resource,
      // override and apply to sub-resources
      subResources: resource.subResources.map((subResource) =>
        prepareFn(subResource, rootResource ?? resource)
      ),
      // apply a rootResourceId (pointing to the root element of any nested child)
      rootResourceId: rootResource?.id ?? null,
    } satisfies Resource
  }
  const convertedResources = resources.map((resource) => prepareFn(resource, null))

  const sortFn = function (x: Resource, y: Resource) {
    const xInstitution = getBestFromMultilingualValuesTryByLanguage(x.institution, locale) ?? ''
    const yInstitution = getBestFromMultilingualValuesTryByLanguage(y.institution, locale) ?? ''
    const r = xInstitution.localeCompare(yInstitution)
    if (r !== 0) {
      return r
    }

    const xTitle = getBestFromMultilingualValuesTryByLanguage(x.title, locale) ?? ''
    const yTitle = getBestFromMultilingualValuesTryByLanguage(y.title, locale) ?? ''
    return xTitle.toLowerCase().localeCompare(yTitle.toLowerCase())
  }
  recurseResources(convertedResources, (resource: Resource) => {
    resource.subResources.sort(sortFn)
  })
  convertedResources.sort(sortFn)

  return convertedResources
}

export function evaluateAggregationContext(
  resources: Resource[],
  endpoints2handles: { [key: string]: string[] }
) {
  const selectedResourceIDs: string[] = []
  const handlesNotFound: string[] = []
  const resourcesToSelect: Resource[] = []

  Object.entries(endpoints2handles).forEach(([endpoint, handles]) => {
    console.debug('evaluateAggregationContext:', { endpoint, handles })
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

export function findResourceByFilter(
  resources: Resource[],
  filter: (resource: Resource) => boolean
): Resource | undefined {
  let found: Resource | undefined = undefined

  // NOTE: we use find to abort search if we have found anything
  const findRecFn = (resource: Resource) => {
    if (found !== undefined) return true

    if (filter(resource)) {
      found = resource
      return true
    }

    return resource.subResources.find(findRecFn) !== undefined
  }
  resources.find(findRecFn)

  return found
}

export function getResourceIDs(resources: Resource[]) {
  const resourceIDs: string[] = []
  recurseResources(resources, (resource: Resource) => {
    resourceIDs.push(resource.id)
  })
  return resourceIDs
}

export function getResourceIDsBySplit<T extends string | number | symbol | boolean>(
  resources: Resource[],
  filter: (resource: Resource) => T
): Map<T, string[]> {
  const resourceIDsMap: Map<T, string[]> = new Map()
  recurseResources(resources, (resource: Resource) => {
    const category: T = filter(resource)
    if (!resourceIDsMap.has(category)) resourceIDsMap.set(category, [])
    resourceIDsMap.get(category)!.push(resource.id)
  })
  return resourceIDsMap
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
  const locale = LocaleStore.getState().locale
  const institutions = new Set<string>()

  recurseResources(resources, (resource: Resource) => {
    if (resourceIDs.includes(resource.id)) {
      const institution =
        getBestFromMultilingualValuesTryByLanguage(resource.institution, locale) ?? ''
      institutions.add(institution)
      // return false // top-most resource in tree, don't delve deeper
    }
    return true
  })

  // console.debug('institutions: ', institutions.size, { institutions: institutions })
  return Array.from(institutions)
}

export function getResourceParentIDs(
  resources: Resource[],
  filter: (resource: Resource) => boolean
) {
  const parentIDs: string[] = []

  const recursivelyFind = (resource: Resource): boolean => {
    // check recursively for all children
    const anyChild = resource.subResources.map(recursivelyFind)
    // if for any it is true
    if (anyChild.some(Boolean)) {
      // then add current resource ID as parent for some nested children
      parentIDs.push(resource.id)
      // and return true to get parents of current resource, too
      return true
    }
    // if self is true, then parent should add its ID
    return filter(resource) === true
  }
  resources.forEach(recursivelyFind)

  return parentIDs
}

export function flattenResources(resources: Resource[]) {
  const flattenFn = (resource: Resource): Resource[] => [
    resource,
    ...resource.subResources.map(flattenFn).flat(),
  ]
  return resources.map(flattenFn).flat()
}

// --------------------------------------------------------------------------

export const MULTILINGUAL_VALUE_CHECK_LANGUAGES = ['en', 'eng', 'de', 'deu'] as const

export function getBestFromMultilingualValues(
  values: null | string | { [language: string]: string }
) {
  // checks: if null, return
  if (values === null) {
    return null
  }
  // if not a mapping, then we only have one choice
  if (typeof values === 'string') {
    return values
  }

  // check from list of languages
  for (const language of MULTILINGUAL_VALUE_CHECK_LANGUAGES) {
    if (Object.hasOwn(values, language)) {
      return values[language]
    }
  }

  // otherwise try to use first
  const ownLanguages = Object.getOwnPropertyNames(values)
  if (ownLanguages.length > 0) {
    return values[ownLanguages[0]]
  }

  // if not, it is empty? then null
  return null
}

export function getFromMultilingualValuesByLanguage(
  values: null | string | { [language: string]: string },
  language?: string
) {
  // checks: if null, return
  if (values === null) {
    return null
  }
  // if not a mapping, then we only have one choice
  if (typeof values === 'string') {
    return values
  }

  // otherwise, try to find value for language
  if (language && Object.hasOwn(values, language)) {
    return values[language]
  }

  // if not, return null
  return null
}

export function getBestFromMultilingualValuesTryByLanguage(
  values: null | string | { [language: string]: string },
  language?: string
) {
  // try to guess browser/user language (if not provided)
  if (language === undefined) {
    language = LocaleStore.getState().locale
  }

  const valueByLanguage = getFromMultilingualValuesByLanguage(values, language)
  if (valueByLanguage !== null) return valueByLanguage

  // if not found by language, then try to guess something
  return getBestFromMultilingualValues(values)
}

/** Compute the language that would be used to retrieve a multi-lingual resource information value. */
export function getBestLanguageFromMultilingualValuesTryByLanguage(
  values: null | string | { [language: string]: string },
  language?: string
) {
  // if null, then we have nothing
  if (values === null) return undefined
  // if not a mapping, then we only have one choice
  if (typeof values === 'string') return undefined

  // try to guess browser/user language (if not provided)
  if (language === undefined) {
    language = LocaleStore.getState().locale
  }

  // getFromMultilingualValuesByLanguage(values, language)
  // try to find value for language
  if (language && Object.hasOwn(values, language)) return language

  // getBestFromMultilingualValues(values)
  // check from list of languages
  for (const language of MULTILINGUAL_VALUE_CHECK_LANGUAGES) {
    if (Object.hasOwn(values, language)) return language
  }
  // otherwise try to use first
  const ownLanguages = Object.getOwnPropertyNames(values)
  if (ownLanguages.length > 0) return ownLanguages[0]
  // if not, it is empty? then null (this should not be possible)
  return undefined
}

/**
 * Get languages/locales used in resource meta information.
 * @param resource Resource with meta information (title, description, institution, ...)
 * @param defaultLanguage fallback language if not multilingual information set
 * @returns unique list of languages found for title/description/institution or fallback if no multilingual options
 */
export function getLanguagesFromResourceInfo(resource: ResourceRaw, defaultLanguage = 'en') {
  const languagesForTitle =
    typeof resource.title === 'string' || resource.title === null
      ? [defaultLanguage]
      : Object.getOwnPropertyNames(resource.title)
  const languagesForDescription =
    typeof resource.description === 'string' || resource.description === null
      ? [defaultLanguage]
      : Object.getOwnPropertyNames(resource.description)
  const languagesForInstitution =
    typeof resource.institution === 'string' || resource.institution === null
      ? [defaultLanguage]
      : Object.getOwnPropertyNames(resource.institution)

  // TODO: only collect languages if values differ, else fallback to default?

  const languageForResource = [
    ...languagesForTitle,
    ...languagesForDescription,
    ...languagesForInstitution,
  ]

  // TODO: order by count?
  const languageForResourceUniq = Array.from(new Set(languageForResource))

  return languageForResourceUniq
}

// --------------------------------------------------------------------------

export function isResourceAvailableForQueryType(resource: Resource, queryTypeId: QueryTypeID) {
  // check search capabilities (ignore version, just check caps)
  if (queryTypeId === 'fcs' && !resource.endpoint.searchCapabilities.includes('ADVANCED_SEARCH')) {
    // want 'fcs' but does not have 'ADVANCED_SEARCH' capability
    return false
  }
  if (queryTypeId === 'lex' && !resource.endpoint.searchCapabilities.includes('LEX_SEARCH')) {
    // want 'lex' but does not have 'LEX_SEARCH' capability
    return false
  }
  // 'cql' is required default, so no check
  return true
}

export function isResourceAvailableForLanguage(resource: Resource, languageCode: string) {
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
  'title-up': (a, b) => {
    const locale = LocaleStore.getState().locale

    const aTitle = getBestFromMultilingualValuesTryByLanguage(a.title, locale) ?? ''
    const bTitle = getBestFromMultilingualValuesTryByLanguage(b.title, locale) ?? ''

    return aTitle.localeCompare(bTitle)
  },
  'title-down': (a, b) => {
    const locale = LocaleStore.getState().locale

    const aTitle = getBestFromMultilingualValuesTryByLanguage(a.title, locale) ?? ''
    const bTitle = getBestFromMultilingualValuesTryByLanguage(b.title, locale) ?? ''

    return -aTitle.localeCompare(bTitle)
  },
  'institution-up': (a, b) => {
    const locale = LocaleStore.getState().locale

    const aInstitution = getBestFromMultilingualValuesTryByLanguage(a.institution, locale) ?? ''
    const bInstitution = getBestFromMultilingualValuesTryByLanguage(b.institution, locale) ?? ''
    const aTitle = getBestFromMultilingualValuesTryByLanguage(a.title, locale) ?? ''
    const bTitle = getBestFromMultilingualValuesTryByLanguage(b.title, locale) ?? ''

    const ret = aInstitution.localeCompare(bInstitution)
    return ret !== 0 ? ret : aTitle.localeCompare(bTitle)
  },
  'institution-down': (a, b) => {
    const locale = LocaleStore.getState().locale

    const aInstitution = getBestFromMultilingualValuesTryByLanguage(a.institution, locale) ?? ''
    const bInstitution = getBestFromMultilingualValuesTryByLanguage(b.institution, locale) ?? ''
    const aTitle = getBestFromMultilingualValuesTryByLanguage(a.title, locale) ?? ''
    const bTitle = getBestFromMultilingualValuesTryByLanguage(b.title, locale) ?? ''

    const ret = -aInstitution.localeCompare(bInstitution)
    return ret !== 0 ? ret : aTitle.localeCompare(bTitle)
  },
}

// export function isResourceSelectable(resource: Resource) { return true }
// export function isResourceAvailable(resource: Resource) { return true }
// export function isResourceVisible(resource: Resource) { return true }
// export function selectResource(resource: Resource, selected: boolean, propagate: boolean = true) {}
// export function sortResources(resources: Resource[], criteria: string)
