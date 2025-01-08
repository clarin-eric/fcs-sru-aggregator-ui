import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { type AxiosInstance } from 'axios'
import { useState } from 'react'
import Button from 'react-bootstrap/Button'
import Spinner from 'react-bootstrap/Spinner'

import {
  getSearchResultsMetaOnly,
  postSearchMoreResults,
  type SearchResultsMetaOnly,
} from '@/utils/api'

import './styles.css'

import threeDotsIcon from 'bootstrap-icons/icons/three-dots.svg?raw'

// --------------------------------------------------------------------------
// types

export interface LoadMoreResultsButtonProps {
  axios: AxiosInstance
  searchId: string
  resourceId: string
  numberOfResults: number
}

// --------------------------------------------------------------------------
// component

function LoadMoreResultsButton({
  axios,
  searchId,
  resourceId,
  numberOfResults,
}: LoadMoreResultsButtonProps) {
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
      await queryClient.resetQueries({ queryKey: ['search-results', searchId, resourceId] })
      setIsPolling(true)
    },
  })

  // poll for data ready
  const {
    data: dataPolling,
    isLoading: isLoadingPolling,
    isFetching: isFetchingPolling,
  } = useQuery<SearchResultsMetaOnly>({
    queryKey: ['search-results', searchId, resourceId],
    queryFn: getSearchResultsMetaOnly.bind(null, axios, searchId),
    enabled: isPolling,
    refetchInterval(query) {
      // console.debug('[refetchInterval]', { searchId, resourceId, query })
      if (query.state.data && query.state.data.inProgress > 0) return 1500
      return false
    },
  })
  // console.debug('polling for more results finished?', { dataPolling, isLoadingPolling, isErrorPolling, searchId, resourceId })

  const isLoading = isPendingRequesting || isLoadingPolling || isFetchingPolling
  const isFinished =
    !!dataPolling &&
    // either everything is finished
    (dataPolling.inProgress === 0 ||
      // or the resource we requested more results for is finished
      dataPolling.results.filter(
        (metaResult) => metaResult.id === resourceId && metaResult.inProgress === false
      ).length === 1)
  const showSpinner = isLoading || isPolling

  // console.debug('before render', { isPolling, isLoading, isFinished, searchId, resourceId })
  if (isPolling && isFinished) {
    if (isPolling) {
      // disable polling, wait for next user interaction
      setIsPolling(false)
    }

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
        <Spinner animation="border" />
      ) : (
        <>
          <i dangerouslySetInnerHTML={{ __html: threeDotsIcon }} /> Load more results
        </>
      )}
    </Button>
  )
}

export default LoadMoreResultsButton
