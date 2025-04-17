import { useContext } from 'react'
import { generatePath, UNSAFE_NavigationContext } from 'react-router'

// --------------------------------------------------------------------------

export default function useRouteGoTo() {
  const { navigator } = useContext(UNSAFE_NavigationContext)

  const doNavigation = (
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
  }

  return doNavigation
}
