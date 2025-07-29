import { type HighlightRanges } from '@nozbe/microfuzz'
import { useFuzzySearchList } from '@nozbe/microfuzz/react'

import { type Resource } from '@/utils/api'
import { flattenResources, getBestFromMultilingualValuesTryByLanguage } from '@/utils/resources'

export type ResourceSearchFields = 'title' | 'institution' | 'description'
export type FuzzyMatchesByField = Map<ResourceSearchFields, HighlightRanges | null>

export default function useFuzzySearchListWithHierarchy(
  filter: string,
  resources: Resource[],
  locale: string,
  fields?: ResourceSearchFields[]
) {
  // flatten nested list to allow fuzzy search everywhere
  const flattenedResources = flattenResources(resources)

  fields ??= ['title', 'institution', 'description']

  // fuzzy reduce search results
  const filteredResources = useFuzzySearchList({
    list: flattenedResources,
    // TODO: only search in "resource" mode for now
    // queryText: viewResourcesGrouping === 'resource' ? filter : '',
    queryText: filter,
    getText: (item) => {
      const strings = []
      if (fields.includes('title')) {
        strings.push(getBestFromMultilingualValuesTryByLanguage(item.title, locale))
      }
      if (fields.includes('institution')) {
        strings.push(getBestFromMultilingualValuesTryByLanguage(item.institution, locale))
      }
      if (fields.includes('description')) {
        strings.push(getBestFromMultilingualValuesTryByLanguage(item.description, locale))
      }
      return strings
    },
    // structure matches for better access?
    mapResultItem: ({ item, score, matches }) => {
      // map array to map
      const matchesByField = new Map<ResourceSearchFields, HighlightRanges | null>()
      let fieldIdx = 0
      if (fields.includes('title')) matchesByField.set('title', matches[fieldIdx++])
      if (fields.includes('institution')) matchesByField.set('institution', matches[fieldIdx++])
      if (fields.includes('description')) matchesByField.set('description', matches[fieldIdx++])

      return { resource: item, matches: matchesByField, score }
    },
  })
  // console.debug('filtered resources', filter, filteredResources)

  // TODO: does this improve anything (since we debounce the input?)
  // if (filter === '') {
  //   return {
  //     resources: resources,
  //     matches: undefined,
  //     scores: undefined,
  //   }
  // }

  // all matches for highlighting
  const filteredResourcesHighlights: Map<string, FuzzyMatchesByField> = filteredResources.reduce(
    (map, { resource, matches }) => (map.set(resource.id, matches), map),
    new Map()
  )
  // all scores (to be augmented with missing parents for nested children)
  const filteredResourcesScores: Map<string, number> = filteredResources.reduce(
    (map, { resource, score }) => map.set(resource.id, score),
    new Map()
  )

  // find parents that are filtered out by useFuzzySearchList to get back the hierarchy
  const resourceIDsOfParentsToAdd = new Set()

  // children (nested), we need to generate the missing parents
  filteredResources
    .filter(({ resource }) => resource.rootResourceId !== null)
    .forEach(({ resource, score }) => {
      const rootScore = filteredResourcesScores.get(resource.rootResourceId!)
      if (rootScore === undefined) {
        // if unknown, add score and add parent to to-be-added list
        resourceIDsOfParentsToAdd.add(resource.rootResourceId)
        filteredResourcesScores.set(resource.rootResourceId!, score)
      } else if (score < rootScore) {
        // if known but with smaller score, update score to rank higher
        filteredResourcesScores.set(resource.rootResourceId!, score)
      }
    })

  // to-be-added parents for children with results
  const filteredResourcesParents = resources
    .filter((resource) => resourceIDsOfParentsToAdd.has(resource.id))
    .map((resource) => ({ resource, score: filteredResourcesScores.get(resource.id) }))

  // default results (not nested/children)
  const filteredResourcesRoots = filteredResources.filter(
    ({ resource }) => !resource.rootResourceId
  )

  // combined list of results; minus highlighted children; plus roots of highlighted children
  const mergedFilteredResources = [...filteredResourcesRoots, ...filteredResourcesParents]
    .toSorted(({ score: aScore }, { score: bScore }) =>
      aScore === bScore ? 0 : aScore === undefined ? 1 : bScore === undefined ? -1 : aScore - bScore
    )
    .map(({ resource }) => resource)

  return {
    resources: mergedFilteredResources,
    matches: filteredResourcesHighlights,
    scores: filteredResourcesScores,
  }
}
