import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import Button from 'react-bootstrap/Button'
import Spinner from 'react-bootstrap/Spinner'
import { useTranslation } from 'react-i18next'

import type { ResourceSearchResultMetaOnly } from 'fcs-sru-aggregator-api-adapter-typescript'
import {
  getSearchResultsMetaOnlyForResource,
  postSearchMoreResults,
} from 'fcs-sru-aggregator-api-adapter-typescript'

import { useAxios } from '@/providers/AxiosContext'
// import { useSearchParams } from '@/providers/SearchParamsContext'
// import { trackSiteSearch } from '@/utils/matomo'

import threeDotsIcon from 'bootstrap-icons/icons/three-dots.svg?raw'

import './styles.css'

// --------------------------------------------------------------------------
// types

export interface LoadMoreResultsButtonProps {
  searchId: string
  resourceId: string
  numberOfResults: number
  pollDelay?: number
}

// --------------------------------------------------------------------------
// component

function LoadMoreResultsButton({
  searchId,
  resourceId,
  numberOfResults,
  pollDelay = 1500,
}: LoadMoreResultsButtonProps) {
  const { t } = useTranslation()
  const axios = useAxios()
  const queryClient = useQueryClient()

  const [isPolling, setIsPolling] = useState(false)

  // request more results for one resource
  const {
    isPending: isPendingRequesting,
    mutate,
    reset,
  } = useMutation({
    mutationFn: postSearchMoreResults.bind(null, axios, searchId, { resourceId, numberOfResults }),
    mutationKey: ['search-result-load-more', searchId, resourceId],
    onSuccess: async (data) => {
      // console.debug('[onSuccess]', { searchId, resourceId }, { data, variables, context })

      // console.debug('request more results', { isPolling, searchId, resourceId, searchIdNewButSame: data, isPendingRequesting, isErrorRequesting })
      if (data !== undefined && searchId !== data) {
        console.warn('SearchIDs should be the same?!', {
          searchId,
          searchIdNewButSame: data,
          resourceId,
        })
      }

      // polling (we do here ourselves)
      // TODO: unsure about removeQueries / resetQueries, required to completely clear state
      await queryClient.invalidateQueries({ queryKey: ['search-results', searchId, resourceId] })
      setIsPolling(true)
    },
  })

  // poll for data ready
  pollDelay ??= 1500
  const {
    data: dataPolling,
    isLoading: isLoadingPolling,
    isFetching: isFetchingPolling,
  } = useQuery<ResourceSearchResultMetaOnly>({
    queryKey: ['search-results', searchId, resourceId],
    queryFn: getSearchResultsMetaOnlyForResource.bind(null, axios, searchId, resourceId),
    enabled: isPolling,
    refetchInterval(query) {
      // console.debug('[refetchInterval]', { searchId, resourceId, query })
      if (query.state.data && query.state.data.inProgress) return pollDelay
      return false
    },
  })
  // console.debug('polling for more results finished?', { dataPolling, isLoadingPolling, isErrorPolling, searchId, resourceId })

  const isLoading = isPendingRequesting || isLoadingPolling || isFetchingPolling
  const isFinished = !!dataPolling && !dataPolling.inProgress
  const showSpinner = isLoading || isPolling

  // console.debug('before render', { isPolling, isLoading, isFinished, searchId, resourceId })
  if (isPolling && isFinished) {
    if (isPolling) {
      // disable polling, wait for next user interaction
      setIsPolling(false)
    }

    // matomo tracking stuff
    // if (import.meta.env.FEATURE_TRACKING_MATOMO) {
    //   /* eslint-disable react-hooks/rules-of-hooks */
    //   const { query, queryType } = useSearchParams()  // really unsure about here, maybe more on top?
    //   const numResultsTotal = dataPolling.numberOfRecordsLoaded // TODO: will only contain current search result count
    //   trackSiteSearch(query, queryType, numResultsTotal) // TODO: dimension with resourceID?
    // }

    // console.debug('Invalidate data for refresh ...', { searchId, resourceId, queryKey: ['search-result-details', searchId, resourceId] })
    // details
    queryClient.invalidateQueries({ queryKey: ['search-result-details', searchId, resourceId] })
  }

  async function handleLoadMoreClick() {
    // console.log('[handleLoadMoreClick]', { searchId, resourceId })
    // reset prior state, then trigger web request
    reset()
    mutate()
  }

  return (
    <Button className="more-results-button" disabled={showSpinner} onClick={handleLoadMoreClick}>
      {showSpinner ? (
        <Spinner animation="border" className="d-block" />
      ) : (
        <>
          <i dangerouslySetInnerHTML={{ __html: threeDotsIcon }} />{' '}
          {t('search.results.buttonLoadMore')}
        </>
      )}
    </Button>
  )
}

export default LoadMoreResultsButton
