import { useCallback } from 'react'
import {
  generatePath,
  type NavigateOptions,
  useNavigate as useReactRouterNavigate,
} from 'react-router'

import useKeepSearchParams from './useKeepSearchParams'

// --------------------------------------------------------------------------

/**
 * Returns a `navigate` method to update the browser `location` using a route template path and optional params.
 *
 * @see {@link generatePath}
 * @see {@link navigate} returned hook method to perform navigation (update `location`)
 * @see {@link useReactRouterNavigate|useNavigate} `react-router`'s navigation hook
 * @see {@link useKeepSearchParams} used to persist certain search parameters after navigation
 * @category Hooks
 */
export default function useNavigate() {
  const routerNavigate = useReactRouterNavigate()
  const [search] = useKeepSearchParams()

  /**
   * Do a `location` update using a path and parameters.
   *
   * NOTE: will keep stable search parameters using {@link useKeepSearchParams}!
   *
   * @param originalPath template path
   * @param params parameters for path interpolation
   * @param options options for `react-router`'s {@link useReactRouterNavigate|useNavigate}
   *
   * @see {@link generatePath}
   */
  const navigate = useCallback(
    (
      originalPath: string,
      params?: {
        [key: string]: string | null
      },
      options?: NavigateOptions
      // TODO: add option to ignore stable search params?
    ) => {
      const newPath = generatePath(originalPath, params)
      console.debug('navigate', { newPath, originalPath, params, search, options })
      routerNavigate({ pathname: newPath, search: search }, options)
    },
    [routerNavigate, search]
  )

  return navigate
}
