import { useCallback, useMemo } from 'react'
import {
  createSearchParams,
  useLocation,
  useNavigate,
  type SetURLSearchParams,
  type URLSearchParamsInit,
} from 'react-router'

export default function useSearchParamsFromHash(): [URLSearchParams, SetURLSearchParams] {
  const routerNavigate = useNavigate()
  const { hash } = useLocation()

  const searchParams = useMemo(() => {
    return new URLSearchParams(hash.substring(1))
  }, [hash])

  const setSearchParams = useCallback(
    (nextInit?: URLSearchParamsInit | ((prev: URLSearchParams) => URLSearchParamsInit)) => {
      const newSearchParams = createSearchParams(
        typeof nextInit === 'function' ? nextInit(new URLSearchParams(searchParams)) : nextInit
      )
      const newHash = !newSearchParams.entries().next().done ? `#${newSearchParams}` : ''

      if (hash !== newHash) {
        routerNavigate({ hash: newHash })
      }
    },
    [searchParams, hash, routerNavigate]
  )
  return [searchParams, setSearchParams]
}
