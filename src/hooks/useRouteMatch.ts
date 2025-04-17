import { useContext } from 'react'
import { matchRoutes, UNSAFE_RouteContext, useLocation } from 'react-router'

// --------------------------------------------------------------------------

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
