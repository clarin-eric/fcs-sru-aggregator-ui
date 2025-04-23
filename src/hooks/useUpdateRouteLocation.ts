import { useCallback, useContext } from 'react'
import { generatePath, UNSAFE_NavigationContext } from 'react-router'

// --------------------------------------------------------------------------

/**
 * Returns a `doNavigation` method to update the browser `location` using a route template path and optional params.
 *
 * NOTE: uses the {@link UNSAFE_NavigationContext} interface to access the naviator for `location` updates!
 *
 * @see {@link generatePath}
 * @see {@link doNavigation} returned hook method to update `location`
 * @category Hooks
 */
export default function useUpdateRouteLocation() {
  const { navigator } = useContext(UNSAFE_NavigationContext)

  /**
   * Do a `location` update using a path and parameters.
   *
   * @param originalPath template path
   * @param params paramters for path interpolation
   *
   * @see {@link generatePath}
   */
  const doNavigation = useCallback(
    (
      originalPath: string,
      params?: {
        [key: string]: string | null
      }
    ) => {
      if (!navigator.encodeLocation) return

      // TODO: keep hash/get params?

      const newPath = generatePath(originalPath, params)
      const newLocation = navigator.encodeLocation(newPath)

      navigator.push(newLocation)
    },
    [navigator]
  )

  return doNavigation
}
