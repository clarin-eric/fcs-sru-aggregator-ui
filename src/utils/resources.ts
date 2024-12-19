import { type Resource as RawResource } from '@/utils/api'
import { MULTIPLE_LANGUAGE_CODE } from '@/utils/search'

export interface Resource extends RawResource {
  // override with new type?
  subResources: Resource[]
  // will be populated on initialization of Resources
  visible: boolean
  selected: boolean
  expanded: boolean
  priority: number
  index: number
}

// --------------------------------------------------------------------------

class Resources {
  resources: Resource[]
  idToResource: { [id: string]: Resource }
  update: () => void

  constructor(resources: Resource[], updateFn: (resources: Resources) => void) {
    this.resources = resources
    this.update = () => updateFn(this)

    // make a fast lookup table: resource.id -> resource
    this.idToResource = {}
    const makeIdMapFn = (resource: Resource) => {
      this.idToResource[resource.id] = resource
      resource.subResources.forEach(makeIdMapFn)
    }
    this.resources.forEach(makeIdMapFn)
  }

  static fromApi(resources: RawResource[], updateFn: (resources: Resources) => void) {
    const prepareFn = (resource: RawResource): Resource => {
      return {
        // copy original
        ...resource,
        // override and apply to sub-resources
        subResources: resource.subResources.map(prepareFn),
        // the new state fields
        visible: true, // visible in the resource view
        selected: false, // not selected in the resource view, assign later
        expanded: false, // not expanded in the resource view
        priority: 1, // used for ordering search results in resource view
        index: -1, // original order, used for stable sort
      }
    }

    const convertedResources = new Resources(resources.map(prepareFn), updateFn)

    convertedResources.prepare()

    return convertedResources
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

  getById(id: string): Resource | undefined {
    return this.idToResource[id]
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
    // 	return true;
    // }
    return false
  }

  isResourceVisibilityRequiredForChildren(
    resource: Resource,
    checkFn: ((resource: Resource) => boolean) | undefined = undefined
  ): boolean {
    // if self is visible then skip
    if (typeof checkFn === 'function') {
      if (checkFn(resource)) {
        return true
      }
    }
    // else if (resource.visible) return true

    // check all descendants
    let shouldBeVisible = false
    this.recurseResources(resource.subResources, (descendant: Resource) => {
      if (descendant.visible) {
        if (typeof checkFn === 'function') {
          if (checkFn(descendant)) {
            shouldBeVisible = true
            return false
          }
        } else {
          shouldBeVisible = true
          return false // stop recursing
        }
      }
    })

    return shouldBeVisible
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

  getAvailableIds() {
    const ids: string[] = []
    this.recurse(function (resource: Resource) {
      if (resource.visible) {
        ids.push(resource.id)
      }
      return true
    })
    return ids
  }

  getSelectedIds() {
    const ids: string[] = []
    this.recurse(function (resource: Resource) {
      if (resource.visible && resource.selected) {
        ids.push(resource.id)
        // return false // top-most resource in tree, don't delve deeper
        // TODO: But subresources are also selectable on their own?...
      }
      return true
    })

    // console.debug('ids: ', ids.length, { ids: ids })
    return ids
  }

  getSelectedInstitutions() {
    const institutions = new Set<string>()
    this.recurse(function (resource: Resource) {
      if (resource.visible && resource.selected) {
        institutions.add(resource.institution)
        // return false // top-most resource in tree, don't delve deeper
      }
      return true
    })

    // console.debug('institutions: ', institutions.size, { institutions: institutions })
    return Array.from(institutions)
  }

  getSelectedMessage() {
    const selected = this.getSelectedIds().length
    if (selected === 1) {
      return '1 selected resource'
    }
    if (this.resources.length === selected || this.getAvailableIds().length === selected) {
      return `All available resources (${selected})`
    }
    return `${selected} selected resources`
  }
}

export default Resources
