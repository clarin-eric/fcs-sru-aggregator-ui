import { useContext } from 'react'
import { matchRoutes, UNSAFE_RouteContext, useLocation } from 'react-router'

// --------------------------------------------------------------------------

/**
 * Returns the `react-router` route match or `null` if no matching routes.
 *
 * NOTE: uses the {@link UNSAFE_RouteContext} interface to access defined routes!
 *
 * @see {@link useLocation}
 * @see {@link matchRoutes}
 * @category Hooks
 */
export default function useRouteMatch() {
  const routeContext = useContext(UNSAFE_RouteContext)
  const location = useLocation()

  const routes = routeContext.matches.map((m) => m.route)
  const routeMatch = matchRoutes(routes, location)

  if (routeMatch !== null && routeMatch.length > 0) {
    return routeMatch[0]
  }
  return null
}
