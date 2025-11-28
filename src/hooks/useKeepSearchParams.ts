import { useCallback, useMemo } from 'react'
import type { URLSearchParamsInit } from 'react-router'
import { createSearchParams, useSearchParams } from 'react-router'

import { REQ_PARAM_CONSORTIA } from 'fcs-sru-aggregator-api-adapter-typescript'

// --------------------------------------------------------------------------

export const KEEP_PARAMS = [REQ_PARAM_CONSORTIA]

export function makeSearchQuery(params: URLSearchParams) {
  return !params.entries().next().done ? `?${params}` : undefined
}

export function useKeepSearchParamsRaw(): [
  URLSearchParams,
  (extraParams: URLSearchParamsInit) => URLSearchParams
] {
  const [urlSearchParams] = useSearchParams()

  // filter search parameters to those we want to persist
  const params = useMemo(
    () =>
      new URLSearchParams(
        Array.from(urlSearchParams.entries()).filter(([name]) => KEEP_PARAMS.includes(name))
      ),
    [urlSearchParams]
  )

  // getter/compute method to create search query with user supplied extra parameters
  const getNewSearchParams = useCallback(
    (extraParams: URLSearchParamsInit) => {
      const newParams = new URLSearchParams(params)
      createSearchParams(extraParams).forEach((value, key) => newParams.append(key, value))
      return newParams
    },
    [params]
  )

  return [params, getNewSearchParams]
}

export default function useKeepSearchParams(): [
  string | undefined,
  (extraParams: URLSearchParamsInit) => string | undefined
] {
  const [params, getNewSearchParams] = useKeepSearchParamsRaw()

  // most compact search query that uses the persistent parameters
  const searchLink = makeSearchQuery(params)

  // getter/compute method to create search query with user supplied extra parameters
  const getNewSearchLink = useCallback(
    (extraParams: URLSearchParamsInit) => makeSearchQuery(getNewSearchParams(extraParams)),
    [getNewSearchParams]
  )

  return [searchLink, getNewSearchLink]
}
