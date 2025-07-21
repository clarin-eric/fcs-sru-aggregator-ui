import { useFuzzySearchList } from '@nozbe/microfuzz/react'
import { type FuzzyMatches } from '@nozbe/microfuzz'

import { type Resource } from '@/utils/api'
import { getBestFromMultilingualValuesTryByLanguage } from '@/utils/resources'

export default function useFuzzySearchListWithHierarchy(
  filter: string,
  resources: Resource[],
  locale: string
) {
  // flatten nested list to allow fuzzy search everywhere
  const flattenFn = (resource: Resource): Resource[] => [
    resource,
    ...resource.subResources.map(flattenFn).flat(),
  ]
  const flattenedResources = resources.map(flattenFn).flat()

  // fuzzy reduce search results
  const filteredResources = useFuzzySearchList({
    list: flattenedResources,
    // TODO: only search in "resource" mode for now
    // queryText: viewResourcesGrouping === 'resource' ? filter : '',
    queryText: filter,
    getText: (item) => [
      getBestFromMultilingualValuesTryByLanguage(item.title, locale),
      getBestFromMultilingualValuesTryByLanguage(item.institution, locale),
      getBestFromMultilingualValuesTryByLanguage(item.description, locale),
      // ...item.languages.map((code) => languageCodeToNameHelper(code, languages)).toSorted(),
    ],
    // structure matches for better access?
    mapResultItem: ({ item, score, matches }) => ({ resource: item, matches, score }),
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
  const filteredResourcesHighlights: Map<string, FuzzyMatches> = filteredResources.reduce(
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
